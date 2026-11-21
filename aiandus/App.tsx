import { useCallback, useEffect, useRef, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Crypto from 'expo-crypto';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, AppState, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { CareView } from './src/CareView';
import {
  CROPS, METHOD, PHASE_NAMES, TIME_ZONE, TRADITION, USNO, changeMonth, formatDay, inSeason, localDay,
  lunarPeriod, monthGrid, moonEvent, nextSuggestedDay, nextWindow, recommended, sowingWindow, tallinnTime, type Crop, type Day, type Method,
} from './src/calendar';
import { Button, Choice, EntryEditor, IconButton, PlacePicker, Source, WeatherDay, degrees, weatherIcon, type EditorRequest, type Icon } from './src/components';
import type { Entry } from './src/journal';
import { enableReminders, syncReminders } from './src/reminders';
import { read, write } from './src/storage';
import { color, s } from './src/theme';
import { useWeather } from './src/useWeather';
import { DEFAULT_PLACE, WEATHER_SOURCE, weatherLabel, type Place } from './src/weather';

const tabs = [
  { id: 'today', name: 'Täna', icon: 'sunny-outline' },
  { id: 'calendar', name: 'Kalender', icon: 'calendar-outline' },
  { id: 'care', name: 'Hooldus', icon: 'leaf-outline' },
  { id: 'journal', name: 'Päevik', icon: 'book-outline' },
] as const;
type Tab = typeof tabs[number]['id'];
const journalTabs = [{ id: 'done', name: 'Tehtud külvid' }, { id: 'planned', name: 'Külviplaanid' }] as const;
const moonGlyph: Record<string, string> = { 'New Moon': '○', 'First Quarter': '◑', 'Full Moon': '●', 'Last Quarter': '◐' };
const fullDate: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };

function WeatherCard({ place, currentDay, selectDay, choosePlace, weather }: {
  place: Place; currentDay: Day; selectDay: (day: Day) => void; choosePlace: () => void; weather: ReturnType<typeof useWeather>;
}) {
  const { forecast, error, loading, refresh } = weather;
  const weatherToday = forecast?.days.find(({ day }) => day === currentDay);
  const days = forecast?.days.filter(({ day }) => day >= currentDay) ?? [];
  const loadedTime = forecast && new Intl.DateTimeFormat('et-EE', {
    timeZone: TIME_ZONE, day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  }).format(new Date(forecast.loadedAt));
  return <View style={s.hero}>
    <View pointerEvents="none" style={s.orbit} /><View pointerEvents="none" style={s.orbitInner} />
    <View style={s.between}>
      <Pressable style={[s.row, { minHeight: 44 }]} onPress={choosePlace} accessibilityRole="button" accessibilityLabel={`Muuda ilma asukohta, ${place.name}`}>
        <Ionicons name="location-outline" size={18} color={color.leaf} />
        <Text style={[s.strong, s.white]}>{place.name}</Text>
        <Ionicons name="chevron-down" size={15} color={color.leaf} />
      </Pressable>
      <IconButton label="Uuenda ilmaprognoosi" icon="refresh-outline" light onPress={refresh} />
    </View>
    {weatherToday ? <View style={s.between}>
      <View style={[s.grow, s.stack]}>
        <Text style={s.temperature}>{degrees(error ? weatherToday.high : forecast?.temperature ?? weatherToday.high)}</Text>
        <Text style={[s.small, s.onGreen]}>{error ? 'Prognoositud maksimum' : weatherLabel(forecast?.code ?? weatherToday.code)}</Text>
      </View>
      <Ionicons name={weatherIcon(forecast?.code ?? weatherToday.code)} size={58} color={color.leaf} />
    </View> : <View style={s.stack}>
      <Text style={[s.subheading, s.white]}>Kohalik ilm</Text>
      <Text accessibilityLiveRegion="polite" style={[s.small, s.onGreen]}>
        {loading ? 'Laadin ilmaprognoosi…' : 'Tänase päeva prognoos pole saadaval.'}
      </Text>
    </View>}
    {days.length > 0 && <View style={s.forecastStrip}>{days.map(({ day, high, code }) => (
      <Pressable key={day} accessibilityRole="button" accessibilityLabel={`${formatDay(day)}, ${weatherLabel(code)}, ${degrees(high)}`}
        onPress={() => selectDay(day)} style={[s.forecastCell, day === currentDay && s.forecastSelected]}>
        <Text style={[s.small, s.onGreen]}>{formatDay(day, { weekday: 'narrow' })}</Text>
        <Ionicons name={weatherIcon(code)} size={17} color={color.white} />
        <Text style={[s.small, s.white]}>{degrees(high)}</Text>
      </Pressable>
    ))}</View>}
    {!!loadedTime && days.length > 0 && <Text style={[s.small, s.onGreen]}>{error ? 'Viimati laaditud prognoos' : 'Laaditud'} · {loadedTime}</Text>}
  </View>;
}

function CropRow({ crop, detail, onPress }: { crop: Crop; detail: string; onPress: () => void }) {
  return <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [s.item, pressed && s.disabled]}>
    <View style={s.thumb}><Text style={s.emoji}>{crop.icon}</Text></View>
    <View style={s.grow}>
      <Text style={s.strong}>{crop.name}</Text>
      <Text style={s.small}>{detail}</Text>
    </View>
    <Ionicons name="chevron-forward-outline" size={18} color={color.muted} />
  </Pressable>;
}

function Month({ day, crop, entries, select }: { day: Day; crop: Crop; entries: Entry[]; select: (day: Day) => void }) {
  return <View style={s.card}>
    <View style={s.between}>
      <IconButton label="Eelmine kuu" icon="chevron-back" onPress={() => select(changeMonth(day, -1))} />
      <Text accessibilityRole="header" style={[s.strong, { textAlign: 'center', flexShrink: 1 }]}>{formatDay(day, { month: 'long', year: 'numeric' })}</Text>
      <IconButton label="Järgmine kuu" icon="chevron-forward" onPress={() => select(changeMonth(day, 1))} />
    </View>
    <View style={s.grid}>
      {['E', 'T', 'K', 'N', 'R', 'L', 'P'].map((label) => <Text key={label} style={[s.small, { width: '14.285%', textAlign: 'center', marginBottom: 4 }]}>{label}</Text>)}
      {monthGrid(day).map((date) => {
        const otherMonth = date.slice(0, 7) !== day.slice(0, 7);
        const event = moonEvent(date);
        const suggested = recommended(crop, date);
        const activities = entries.filter((entry) => entry.day <= date && (entry.end ?? entry.day) >= date);
        const mark = [event && moonGlyph[event.phase], suggested && '✦', activities.length > 0 && '•'].filter(Boolean).join(' ');
        const label = [formatDay(date, fullDate), event && PHASE_NAMES[event.phase], suggested && 'kuu järgi soovitatud',
          activities.length > 0 && `${activities.length} külvikirjet`].filter(Boolean).join(', ');
        return <Pressable key={date} accessibilityRole="button" accessibilityLabel={label}
          accessibilityState={{ selected: date === day }} onPress={() => select(date)}
          style={[s.dateCell, otherMonth && s.dateOther, suggested && s.dateRecommended, date === day && s.dateSelected]}>
          <Text style={[s.dayNumber, date === day && s.white]}>{Number(date.slice(8))}</Text>
          {!!mark && <Text style={[s.dayMark, date === day && s.white]}>{mark}</Text>}
        </Pressable>;
      })}
    </View>
    <View style={s.wrap}>
      <Text style={s.badge}>✦ Kuu järgi soovitatud</Text>
      <Text style={s.small}>○ ◑ ● ◐ Kuufaas · • Külvikirje</Text>
    </View>
  </View>;
}

function AppContent() {
  const [today, setToday] = useState(localDay);
  const [tab, setTab] = useState<Tab>('today');
  const [journalKind, setJournalKind] = useState<Entry['kind']>('done');
  const [day, setDay] = useState(today);
  const [crop, setCrop] = useState(CROPS[0]);
  const [method, setMethod] = useState<Method | 'all'>('all');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');
  const [place, setPlace] = useState<Place>();
  const [choosingPlace, setChoosingPlace] = useState(false);
  const [editor, setEditor] = useState<EditorRequest>();
  const [deleting, setDeleting] = useState<string>();
  const saving = useRef(false);
  const latestEntries = useRef<Entry[]>([]);
  const reminderQueue = useRef<Promise<void>>(Promise.resolve());
  const weather = useWeather(place);

  const sync = useCallback(() => {
    const next = reminderQueue.current.catch(() => undefined).then(() => syncReminders(latestEntries.current));
    reminderQueue.current = next;
    return next;
  }, []);

  useEffect(() => {
    let active = true;
    void read<Entry[]>('journal').then((journal) => {
      if (!active) return;
      latestEntries.current = journal ?? [];
      setEntries(latestEntries.current);
      setReady(true);
      void sync().catch(() => undefined);
    }).catch(() => { if (active) setNotice('Külvipäevikut ei õnnestunud avada. Proovi äpp uuesti käivitada.'); });
    void read<Place>('place').catch(() => null).then((saved) => { if (active) setPlace(saved ?? DEFAULT_PLACE); });
    return () => { active = false; };
  }, [sync]);

  useEffect(() => {
    const update = () => setToday(localDay());
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      update();
      if (ready) void sync().catch(() => undefined);
    });
    const timer = setInterval(update, 60_000);
    return () => { subscription.remove(); clearInterval(timer); };
  }, [ready, sync]);

  function openDay(date: Day, selectedCrop?: Crop) {
    if (selectedCrop) setCrop(selectedCrop);
    setDay(date);
    setTab('calendar');
  }

  function selectJournalKind(kind: Entry['kind']) {
    setDeleting(undefined);
    setJournalKind(kind);
  }

  function openJournal(kind: Entry['kind'] = 'done') {
    selectJournalKind(kind);
    setTab('journal');
  }

  async function persistJournal(next: Entry[]) {
    await write('journal', next);
    latestEntries.current = next;
    setEntries(next);
  }

  async function saveEntry(value: Omit<Entry, 'id'>, existingId?: string) {
    if (!ready || saving.current) throw new Error('Journal is busy');
    saving.current = true;
    try {
      let message = value.kind === 'done' ? 'Külv salvestatud.' : 'Külviplaan salvestatud.';
      if (value.reminder) {
        if (tallinnTime(value.day, 9).getTime() <= Date.now()) {
          value = { ...value, reminder: false };
          message = 'Plaan salvestatud. Meeldetuletuse kellaaeg on möödunud.';
        } else {
          const allowed = await enableReminders().catch(() => false);
          if (!allowed) {
            value = { ...value, reminder: false };
            message = 'Plaan salvestatud. Teavitus pole aktiivne.';
          }
        }
      }
      const entry: Entry = { ...value, id: existingId ?? Crypto.randomUUID() };
      await persistJournal([...latestEntries.current.filter(({ id }) => id !== entry.id), entry]);
      await sync().catch(() => { message = 'Kirje salvestatud. Meeldetuletuste uuendamine ebaõnnestus.'; });
      setNotice(message);
      setEditor(undefined);
      openJournal(entry.kind);
    } finally {
      saving.current = false;
    }
  }

  async function deleteEntry(id: string) {
    if (saving.current) return;
    saving.current = true;
    try {
      await persistJournal(latestEntries.current.filter((entry) => entry.id !== id));
      setDeleting(undefined);
      let message = 'Kirje kustutatud.';
      await sync().catch(() => { message = 'Kirje kustutatud. Meeldetuletust ei õnnestunud tühistada.'; });
      setNotice(message);
    } catch {
      setNotice('Kirje kustutamine ebaõnnestus. Proovi uuesti.');
    } finally {
      saving.current = false;
    }
  }

  const filtered = CROPS.filter((item) => method === 'all' || item.method === method);
  const activeCrops = filtered.filter((item) => inSeason(item, today));
  const cropsForDay = filtered.filter((item) => inSeason(item, day));
  const upcoming = filtered.map((item) => ({ crop: item, start: nextWindow(item, today).start }))
    .sort((a, b) => a.start.localeCompare(b.start));
  const selectedWeather = weather.forecast?.days.find((item) => item.day === day && day >= today);
  const phase = moonEvent(day);
  const period = lunarPeriod(day);
  const cropWindow = sowingWindow(crop, day.slice(0, 4));
  const upcomingWindow = nextWindow(crop, day);
  const suggestion = nextSuggestedDay(crop, day);
  const dayEntries = entries.filter((entry) => entry.day <= day && (entry.end ?? entry.day) >= day);
  const journalEntries = entries.filter((entry) => entry.kind === journalKind)
    .sort((a, b) => journalKind === 'planned' ? a.day.localeCompare(b.day) : b.day.localeCompare(a.day));

  return <SafeAreaView style={s.safe}>
    <View style={s.shell}>
      <View style={s.header}>
        <View style={s.row}>
          <View style={s.logo}><Ionicons name="leaf-outline" size={20} color={color.leaf} /></View>
          <Text accessibilityRole="header" style={s.wordmark}>Kuukülv</Text>
        </View>
        <Text style={[s.small, { textAlign: 'right', flexShrink: 1 }]}>{formatDay(today, { weekday: 'short', day: 'numeric', month: 'short' })}</Text>
      </View>
      <ScrollView key={tab === 'journal' ? journalKind : tab} contentContainerStyle={s.page} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {!!notice && <View style={[s.card, s.between]}>
          <Text accessibilityLiveRegion="polite" style={[s.body, s.grow]}>{notice}</Text>
          <IconButton label="Sulge teade" icon="close" onPress={() => setNotice('')} />
        </View>}
        {tab === 'today' && <>
          <View style={s.stack}>
            <Text accessibilityRole="header" style={s.heading}>Aiapäev</Text>
            <Text style={s.small}>{formatDay(today, fullDate)}</Text>
          </View>
          {place ? <WeatherCard place={place} currentDay={today} selectDay={openDay} choosePlace={() => setChoosingPlace(true)} weather={weather} /> : <ActivityIndicator color={color.green} />}
          <View style={s.section}>
            <Text accessibilityRole="header" style={s.subheading}>Mida täna külvata?</Text>
            <Choice value={method} options={[['all', 'Kõik'], ['outdoor', 'Avamaale'], ['indoors', 'Ettekasvatus']]} onChange={setMethod} />
            {activeCrops.length ? <View style={s.card}>{activeCrops.map((item) => <CropRow key={item.id} crop={item}
              detail={`${METHOD[item.method]}${recommended(item, today) ? ' · kuu järgi soovitatud' : ''}`} onPress={() => openDay(today, item)} />)}</View>
              : <Text style={s.small}>Täna pole valitud taimede külvihooaeg.</Text>}
            {activeCrops.length === 0 && <>
              <Text accessibilityRole="header" style={s.subheading}>Järgmised külvid</Text>
              <View style={s.card}>{upcoming.slice(0, 3).map(({ crop: item, start }) => <CropRow key={item.id} crop={item}
                detail={`${formatDay(start, { day: 'numeric', month: 'short', year: 'numeric' })} · ${METHOD[item.method]}`} onPress={() => openDay(start, item)} />)}</View>
            </>}
          </View>
          <Source url={WEATHER_SOURCE} title="Ilmaandmed: Open-Meteo" />
        </>}
        {tab === 'calendar' && <>
          <View style={s.between}>
            <Text accessibilityRole="header" style={[s.heading, s.grow]}>Külvikalender</Text>
            <Button title="Täna" onPress={() => setDay(today)} />
          </View>
          <Choice value={crop.id} options={CROPS.map(({ id, name }) => [id, name] as const)} onChange={(id) => setCrop(CROPS.find((item) => item.id === id) ?? crop)} />
          <Month day={day} crop={crop} entries={entries} select={setDay} />
          <View style={s.card}>
            <Text accessibilityRole="header" style={s.subheading}>{formatDay(day, { day: 'numeric', month: 'long' })} · {crop.name}</Text>
            <Text style={s.small}>{METHOD[crop.method]} · {formatDay(cropWindow.start)} – {formatDay(cropWindow.end)}</Text>
            <Text style={s.body}>{crop.advice}</Text>
            {phase && <Text style={s.strong}>{moonGlyph[phase.phase]} {PHASE_NAMES[phase.phase]}</Text>}
            <Text style={s.small}>{period ? `Keskpäeval ${period === 'waxing' ? 'kasvav' : 'kahanev'} kuu.` : 'Selle päeva kuufaasiandmed puuduvad.'}</Text>
            {recommended(crop, day) ? <View style={s.wrap}><Text style={s.badge}>Pärimuslik külvisoovitus</Text></View>
              : suggestion ? <Button title={`Järgmine kuu järgi · ${formatDay(suggestion)}`} subtle onPress={() => setDay(suggestion)} />
              : <Text style={s.small}>Selles külviperioodis pole alates valitud päevast kuusoovitust.</Text>}
            {day > cropWindow.end && <Button title={`Järgmine külviperiood · ${formatDay(upcomingWindow.start, { day: 'numeric', month: 'short', year: 'numeric' })}`} onPress={() => setDay(upcomingWindow.start)} />}
            <View style={s.wrap}><Source title="Külviaja allikas" url={crop.source} /><Source title="Kuufaaside andmed" url={USNO} /><Source title="Külvipärimus" url={TRADITION} /></View>
            <Button title="Hooldus sellel päeval" icon="leaf-outline" onPress={() => setTab('care')} />
          </View>
          <View style={s.card}>
            <Text accessibilityRole="header" style={s.subheading}>Ilm{place ? ` · ${place.name}` : ''}</Text>
            {selectedWeather ? <WeatherDay weather={selectedWeather} /> : <Text style={s.small}>{weather.loading ? 'Laadin prognoosi…' : 'Selle päeva prognoos pole saadaval.'}</Text>}
            {selectedWeather && weather.error && <Text style={s.small}>Viimati laaditud prognoos</Text>}
          </View>
          <View style={s.wrap}>
            <Button title="Lisa külviplaan" icon="add-outline" primary disabled={!ready} onPress={() => setEditor({ kind: 'planned', cropId: crop.id, day })} />
            <Button title="Märgi külvatuks" icon="checkmark-outline" disabled={!ready || day > today} onPress={() => setEditor({ kind: 'done', cropId: crop.id, day })} />
          </View>
          <View style={s.card}>
            <Text accessibilityRole="header" style={s.subheading}>Mida sel päeval külvata?</Text>
            <Choice value={method} options={[['all', 'Kõik'], ['outdoor', 'Avamaale'], ['indoors', 'Ettekasvatus']]} onChange={setMethod} />
            {cropsForDay.length ? cropsForDay.map((item) => <CropRow key={item.id} crop={item}
              detail={`${METHOD[item.method]}${recommended(item, day) ? ' · kuu järgi soovitatud' : ''}`} onPress={() => setCrop(item)} />)
              : <Text style={s.small}>Valitud taimede külviperioodid sellele päevale ei jää.</Text>}
          </View>
          {!!dayEntries.length && <View style={s.card}>
            <Text accessibilityRole="header" style={s.subheading}>Selle päeva kirjed</Text>
            {dayEntries.map((entry) => <Text key={entry.id} style={s.body}>
              {[CROPS.find((item) => item.id === entry.cropId)?.name, entry.variety, entry.kind === 'done' ? 'Külvatud' : 'Plaanis'].filter(Boolean).join(' · ')}
            </Text>)}
            <Button title="Ava päevik" onPress={() => openJournal(dayEntries.some(({ kind }) => kind === 'done') ? 'done' : 'planned')} />
          </View>}
        </>}
        {tab === 'care' && <CareView crop={crop} setCrop={setCrop} day={day} today={today} selectDay={setDay} openCalendar={() => setTab('calendar')} />}
        {tab === 'journal' && <>
          <Text accessibilityRole="header" style={s.heading}>Külvipäevik</Text>
          <View accessibilityRole="tablist" accessibilityLabel="Külvipäeviku vaated" style={s.wrap}>
            {journalTabs.map(({ id, name }) => <Pressable key={id} accessibilityRole="tab" aria-selected={journalKind === id}
              onPress={() => selectJournalKind(id)} style={[s.button, journalKind === id && s.selected]}>
              <Text style={s.buttonText}>{name}</Text>
            </Pressable>)}
          </View>
          <View style={s.wrap}>
            <Button title="Uus külvikanne" icon="add-outline" primary disabled={!ready} onPress={() => setEditor({ kind: 'done', cropId: crop.id, day: today })} />
            <Button title="Planeeri külv" icon="calendar-outline" disabled={!ready} onPress={() => setEditor({ kind: 'planned', cropId: crop.id, day: today })} />
          </View>
          {ready && !journalEntries.length && <Text style={s.small}>{journalKind === 'done' ? 'Tehtud külve veel pole.' : 'Külviplaane veel pole.'}</Text>}
          {journalEntries.map((entry) => {
            const plant = CROPS.find((item) => item.id === entry.cropId);
            if (!plant) return null;
            return <View key={entry.id} style={s.card}>
              <View style={s.item}>
                <View style={s.thumb}><Text style={s.emoji}>{plant.icon}</Text></View>
                <View style={s.grow}>
                  <Text style={s.strong}>{plant.name} · {METHOD[plant.method]}</Text>
                  {!!entry.variety && <Text style={s.small}>Sort · {entry.variety}</Text>}
                  <Text style={s.small}>{formatDay(entry.day, { day: 'numeric', month: 'long', year: 'numeric' })}{entry.end ? ` – ${formatDay(entry.end)}` : ''}</Text>
                </View>
              </View>
              {entry.plannedDay && <Text style={s.small}>Algne plaan · {formatDay(entry.plannedDay)}</Text>}
              {!!entry.note && <Text style={s.body}>{entry.note}</Text>}
              {entry.reminder && <Text style={s.small}>{tallinnTime(entry.day, 9).getTime() > Date.now() ? 'Meeldetuletus kell 9 Eesti aja järgi' : 'Meeldetuletuse aeg möödunud'}</Text>}
              {deleting === entry.id ? <View style={s.wrap}>
                <Button title="Kinnita kustutamine" primary onPress={() => { void deleteEntry(entry.id); }} />
                <Button title="Loobu" onPress={() => setDeleting(undefined)} />
              </View> : <View style={s.wrap}>
                {entry.kind === 'planned' && <Button title="Märgi külvatuks" icon="checkmark-outline" subtle onPress={() => setEditor({ kind: 'done', cropId: plant.id, day: today, entry, completing: true })} />}
                <Button title="Muuda" onPress={() => setEditor({ kind: entry.kind, cropId: plant.id, day: entry.day, entry })} />
                <Button title="Kustuta" onPress={() => setDeleting(entry.id)} />
              </View>}
            </View>;
          })}
        </>}
      </ScrollView>
      <View style={s.nav}>
        {tabs.map(({ id, name, icon }) => <Pressable key={id} accessibilityRole="tab" accessibilityState={{ selected: tab === id }}
          onPress={() => id === 'journal' ? openJournal() : setTab(id)} style={s.navItem}>
          <View style={[s.navIcon, tab === id && s.navActive]}><Ionicons name={icon as Icon} size={20} color={color.green} /></View>
          <Text style={[s.navText, tab === id && s.navTextActive]}>{name}</Text>
        </Pressable>)}
      </View>
      {editor && <EntryEditor request={editor} today={today} close={() => setEditor(undefined)} save={saveEntry} />}
      {place && choosingPlace && <PlacePicker place={place} close={() => setChoosingPlace(false)} select={(selected) => {
        setPlace(selected);
        setChoosingPlace(false);
        void write('place', selected).catch(() => setNotice('Asukohta ei õnnestunud püsivalt salvestada.'));
      }} />}
    </View>
  </SafeAreaView>;
}

export default function App() {
  return <SafeAreaProvider><StatusBar style="dark" /><AppContent /></SafeAreaProvider>;
}
