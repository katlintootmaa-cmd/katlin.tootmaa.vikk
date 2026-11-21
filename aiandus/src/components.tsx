import { useEffect, useState, type ReactNode } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Linking, Modal, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { CROPS, METHOD, formatDay, nextWindow, validDay, type Crop, type Day } from './calendar';
import type { Entry } from './journal';
import { remindersAvailable } from './reminders';
import { color, s } from './theme';
import { searchPlaces, weatherLabel, type ForecastDay, type Place } from './weather';

export type Icon = keyof typeof Ionicons.glyphMap;
export function Button({ title, onPress, icon, primary, subtle, disabled }: {
  title: string; onPress: () => void; icon?: Icon; primary?: boolean; subtle?: boolean; disabled?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={title} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [s.button, primary && s.primary, subtle && s.subtle, (pressed || disabled) && s.disabled]}>
    {icon && <Ionicons name={icon} size={18} color={primary ? color.white : color.green} />}
    <Text style={[s.buttonText, primary && s.primaryText]}>{title}</Text>
  </Pressable>;
}

export function IconButton({ label, icon, onPress, light }: { label: string; icon: Icon; onPress: () => void; light?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
    style={({ pressed }) => [s.iconButton, pressed && s.disabled]}>
    <Ionicons name={icon} size={22} color={light ? color.white : color.text} />
  </Pressable>;
}

export function Choice<T extends string>({ value, options, onChange }: {
  value: T; options: ReadonlyArray<readonly [T, string]>; onChange: (value: T) => void;
}) {
  return <View style={s.wrap}>{options.map(([id, label]) => (
    <Pressable key={id} accessibilityRole="button" accessibilityState={{ selected: value === id }}
      onPress={() => onChange(id)} style={[s.button, value === id && s.selected]}>
      <Text style={s.buttonText}>{label}</Text>
    </Pressable>
  ))}</View>;
}

export function Source({ url, title }: { url: string; title: string }) {
  return <Text accessibilityRole="link" style={s.link} onPress={() => { void Linking.openURL(url).catch(() => undefined); }}>{title}</Text>;
}

export function weatherIcon(code: number | null | undefined): Icon {
  const label = weatherLabel(code);
  if (label === 'Selge') return 'sunny-outline';
  if (label === 'Lumi') return 'snow-outline';
  if (label === 'Äike') return 'thunderstorm-outline';
  if (label === 'Sajune') return 'rainy-outline';
  return 'cloud-outline';
}

export const degrees = (value: number | null | undefined) => value == null ? '–' : `${Math.round(value)}°`;

export function WeatherDay({ weather }: { weather: ForecastDay }) {
  return <View style={s.stack}>
    <View style={s.row}>
      <Ionicons name={weatherIcon(weather.code)} size={21} color={color.green} />
      <Text style={[s.strong, s.grow]}>{weatherLabel(weather.code)} · {degrees(weather.low)} / {degrees(weather.high)}</Text>
    </View>
    <Text style={s.small}>Sademed {weather.rain ?? '–'} mm · tuul kuni {weather.wind ?? '–'} km/h</Text>
    {weather.frost && <View style={s.wrap}><Text style={[s.badge, s.warning]}>Võimalik öökülm</Text></View>}
  </View>;
}

function Sheet({ title, close, children }: { title: string; close: () => void; children: ReactNode }) {
  return <Modal animationType="fade" transparent onRequestClose={close}>
    <View style={s.overlay}>
      <View style={s.modal} accessibilityViewIsModal>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.modalContent}>
          <View style={s.between}>
            <Text accessibilityRole="header" style={[s.subheading, s.grow]}>{title}</Text>
            <IconButton label="Sulge" icon="close" onPress={close} />
          </View>
          {children}
        </ScrollView>
      </View>
    </View>
  </Modal>;
}

export function PlacePicker({ place, select, close }: { place: Place; select: (place: Place) => void; close: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const name = query.trim();
    setResults([]);
    setStatus('');
    if (name.length < 2) return;
    const request = new AbortController();
    let active = true;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const debounce = setTimeout(async () => {
      setStatus('Otsin asulaid…');
      timeout = setTimeout(() => request.abort(), 10_000);
      try {
        const matches = await searchPlaces(name, request.signal);
        if (!active) return;
        setResults(matches);
        setStatus(matches.length ? '' : 'Sobivaid asulaid ei leitud.');
      } catch {
        if (active) setStatus('Otsing ei õnnestunud. Kontrolli internetiühendust.');
      } finally {
        clearTimeout(timeout);
      }
    }, 250);
    return () => { active = false; request.abort(); clearTimeout(debounce); clearTimeout(timeout); };
  }, [query]);

  return <Sheet title="Vali ilma asukoht" close={close}>
    <Text style={s.small}>Praegune asula · {place.name}</Text>
    <TextInput accessibilityLabel="Eesti asula nimi" style={s.field} value={query} onChangeText={setQuery} placeholder="Näiteks Tartu" placeholderTextColor={color.muted} />
    {!!status && <Text accessibilityLiveRegion="polite" style={s.small}>{status}</Text>}
    {results.map((result) => <Button key={result.id} title={[result.name, result.region].filter(Boolean).join(' · ')} icon="location-outline" onPress={() => select(result)} />)}
  </Sheet>;
}

export type EditorRequest = {
  kind: Entry['kind']; cropId: string; day: Day; entry?: Entry; completing?: boolean;
};

export function EntryEditor({ request, today, close, save }: {
  request: EditorRequest; today: Day; close: () => void; save: (entry: Omit<Entry, 'id'>, id?: string) => Promise<void>;
}) {
  const existing = request.entry;
  const [crop, setCrop] = useState<Crop>(CROPS.find(({ id }) => id === request.cropId) ?? CROPS[0]);
  const [day, setDay] = useState(request.day);
  const [end, setEnd] = useState(request.kind === 'planned' ? existing?.end ?? '' : '');
  const [variety, setVariety] = useState(existing?.variety ?? '');
  const [note, setNote] = useState(existing?.note ?? '');
  const [reminder, setReminder] = useState(request.kind === 'planned' && !!existing?.reminder);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const isPlan = request.kind === 'planned';
  const window = nextWindow(crop, validDay(day) && day > today ? day : today);

  async function submit() {
    const actualDay = day.trim();
    const lastDay = end.trim();
    if (!validDay(actualDay) || (lastDay && (!validDay(lastDay) || lastDay < actualDay))) {
      setError('Sisesta kehtivad kuupäevad kujul AAAA-KK-PP. Lõpupäev peab olema alguspäeval või hiljem.');
      return;
    }
    if (!isPlan && actualDay > today) {
      setError('Tegelik külvikuupäev saab olla täna või varem.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await save({
        kind: request.kind, cropId: crop.id, day: actualDay, end: isPlan ? lastDay || undefined : undefined,
        variety: variety.trim() || undefined, note: note.trim(), reminder: isPlan && reminder,
        plannedDay: request.completing ? existing?.day : existing?.plannedDay,
      }, existing?.id);
    } catch {
      setError('Kirjet ei õnnestunud salvestada. Proovi uuesti.');
      setSaving(false);
    }
  }

  return <Sheet title={isPlan ? 'Planeeri külv' : 'Märgi külvatuks'} close={close}>
    <Choice value={crop.id} options={CROPS.map(({ id, name }) => [id, name] as const)} onChange={(id) => setCrop(CROPS.find((item) => item.id === id) ?? crop)} />
    <Text style={s.small}>{METHOD[crop.method]}</Text>
    <View style={s.stack}>
      <Text style={s.strong}>Sort (valikuline)</Text>
      <TextInput accessibilityLabel="Sort" style={s.field} value={variety} onChangeText={setVariety}
        placeholder="Sordi nimi" placeholderTextColor={color.muted} maxLength={100} />
    </View>
    {isPlan && <Button icon="calendar-outline" title={`Vali külviperiood · ${formatDay(window.start)} – ${formatDay(window.end)}`}
      onPress={() => { setDay(window.start); setEnd(window.end); }} />}
    <View style={s.stack}>
      <Text style={s.strong}>{isPlan ? 'Külvipäev või perioodi algus' : 'Tegelik külvikuupäev'}</Text>
      <TextInput accessibilityLabel={isPlan ? 'Külvipäev või perioodi algus' : 'Tegelik külvikuupäev'} style={s.field} value={day}
        onChangeText={setDay} placeholder="AAAA-KK-PP" placeholderTextColor={color.muted} autoCapitalize="none" maxLength={10} />
    </View>
    {isPlan && <View style={s.stack}>
      <Text style={s.strong}>Perioodi lõpp (valikuline)</Text>
      <TextInput accessibilityLabel="Perioodi lõpp" style={s.field} value={end} onChangeText={setEnd}
        placeholder="AAAA-KK-PP" placeholderTextColor={color.muted} autoCapitalize="none" maxLength={10} />
    </View>}
    <View style={s.stack}>
      <Text style={s.strong}>Täpsustused (valikuline)</Text>
      <TextInput accessibilityLabel="Täpsustused" style={s.field} value={note} onChangeText={setNote}
        placeholder="Näiteks seemnete arv või külvikoht" placeholderTextColor={color.muted} multiline maxLength={400} />
    </View>
    {isPlan && remindersAvailable && <View style={s.between}>
      <Text style={[s.body, s.grow]}>Meeldetuletus kell 9 Eesti aja järgi</Text>
      <Switch accessibilityLabel="Külvimeeldetuletus" value={reminder} onValueChange={setReminder} trackColor={{ true: color.green }} />
    </View>}
    {isPlan && !remindersAvailable && <Text style={s.small}>Telefonimeeldetuletus on saadaval mobiiliäpis.</Text>}
    {!!error && <Text accessibilityLiveRegion="polite" style={s.error}>{error}</Text>}
    <Button title="Salvesta" primary disabled={saving} onPress={() => { void submit(); }} />
  </Sheet>;
}
