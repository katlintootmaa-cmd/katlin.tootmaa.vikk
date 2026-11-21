# Kodutöö – programmeerimisprojekti plaan

## 1. Projekti nimi

**Kuukülv** on eestikeelne külvikalender Androidi ja iOS-i telefonidele.

Valisin iseseisvaks programmeerimisprojektiks Kuukülvi. Senise prototüübi seis ja kontrollide tulemused on kirjas [arenduslogis](logi.md). Järgmine ülevaatus on 26.11.2026.

### Prototüübi käivitamine

```sh
npm ci
npm start
```

Ava Expo QR-kood telefonis, kasutades projektiga ühilduvat Expo Go versiooni. Arvutis saab vaateid proovida käsuga `npm run web`. Veebivaade salvestab päeviku brauserisse ja telefoniteavitusi saab proovida Androidi või iOS-i äpis. Internetiühendust vajavad asulaotsing ja ilmaprognoosi uuendamine.

Kalendris on 2025.–2031. aasta kuufaasid. Külviaknad on Eesti kevadisteks tingimusteks mõeldud ligikaudsed ajavahemikud. Meeldetuletus on vaikimisi välja lülitatud ja sisselülitamisel ajastatakse see plaanitud päevale kella 9.00 Eesti aja järgi.

Arenduskontrollid käivituvad käskudega `npm run typecheck` ja `npm test`.

Codex lisab pärast iga sisulist arendussammu, otsust ja kontrolli automaatselt sissekande faili [`./logi.md`](logi.md). Sissekannete vorm on kirjeldatud [arendusjuhistes](AGENTS.md).

### Prototüübi ülevaatus

1. Ava veebivaade käsuga `npm run web`. Vali kalendris redis ja näiteks mai alguse kuupäev. Päeva vaates näed avamaale külvi akent, kuu seisu ja soovituse allikaid.
2. Ava külvipäevik, lisa tänaseks külviplaan ja märgi see tehtuks. Laadi leht uuesti ja vaata, kas kirje püsis alles vaates „Tehtud külvid“.
3. Vali avavaates „Aiapäev“ asula ja vaata tänast ilma ning seitsme päeva prognoosi. Ava vaade „Hooldus“, vali tomat ja proovi potitaime väetamisaja arvutust.

## 2. Eesmärk

Kuukülv aitab koduaednikul leida, mida ja millal Eesti kasvutingimustes külvata. Kasutaja näeb, milliseid taimi saab praegu avamaale külvata või ette kasvatada ning millised päevad on külviperioodi sees kuufaasi järgi soovitatud. Kuusoovitused on märgitud pärimuslikuna. Kohalik ilmaprognoos aitab valida avamaale külvamiseks sobiva päeva. Kasutaja saab külvitegevuse kalendrisse lisada, tellida meeldetuletuse ja kirja panna, mida ta tegelikult külvas.

## 3. Sihtgrupp

Rakendus on mõeldud Eesti koduaednikele, kes kasvatavad köögivilju aias, rõdul või kasvuhoones. See aitab nii algajal, kes otsib sobivat külviaega, kui ka kogenud aednikul, kes soovib külve kuufaaside järgi ajastada.

## 4. Funktsionaalsus

1. **Vaata, mida külvata.** Vaade „Mida praegu külvata?“ näitab taimi, mille külviperiood on täna või valitud kuupäeval avatud. Esimesse versiooni plaanin lisada redise, porgandi, herne, aedsalati, tomati ja kurgi.
2. **Vali külviviis.** Filtreeri soovitusi avamaale külvi või ettekasvatuse järgi. Tomati ja kurgi puhul saab vaadata ettekasvatuseks mõeldud külviperioode.
3. **Vaata külviperioodi.** Kalender kuvab algus- ja lõpukuupäeva ning vajaduse korral märkuse mulla temperatuuri või öökülmaohu kohta.
4. **Vaata kuufaase.** Kalender märgib noorkuu, esimese veerandi, täiskuu ja viimase veerandi kuupäeva Eesti aja järgi.
5. **Leia järgmine kuufaasi järgi soovitatud külvipäev.** Rakendus tõstab sobivad päevad külviperioodis esile. Päeva avamisel näeb kasutaja kuufaasi ja soovituse põhjendust.
6. **Lisa külv kalendrisse.** Salvesta valitud taime külvitegevus kuupäeva või terve külviperioodina äpi kalendrisse.
7. **Saa külvimeeldetuletus.** Lülita kalendrikirje juures meeldetuletus sisse. Telefon teavitab valitud külviperioodi alguspäeval või ühele päevale planeeritud külvi kuupäeval.
8. **Pea külvipäevikut.** Märgi planeeritud tegevus tehtuks või lisa külv tagantjärele. Vaates „Tehtud külvid“ on kõik tehtud kirjed kuupäeva järgi, uuemad ees. Külviplaanid on eraldi vaates. Kirjele saab lisada sordi ja vabas vormis täpsustused, näiteks seemnete arvu või külvikoha, ning seda hiljem muuta või kustutada.
9. **Kasuta külvikalendrit võrguühenduseta.** Vaata külviperioode ja kuusoovitusi andmetega kaetud päevadel ning lisa külvi- ja päevikukirjeid ka internetita.
10. **Vaata kohalikku ilmaprognoosi.** Vali Eesti asula nime järgi. Kalendris näed tänast ilma ja seitsme päeva prognoosi koos õhutemperatuuri, sademete ja tuulega. Võimalikust öökülmast annab päeva vaates märku prognoosil põhinev märkus.
11. **Vaata taimehooldust külvist saagini.** Vali taim ja loe, millal väetada ning mida jälgida kasvuperioodi eri etappides. Potitomati ja potikurgi puhul saab viimase väetamise järgi arvutada järgmise võimaliku ajavahemiku.
12. **Vaata aiatöid kuu järgi.** Kontrolli seitsme päeva kaupa, millised päevad sobivad pärimuse järgi tomati ladva eemaldamiseks, harvendamiseks, rohimiseks või ümberistutamiseks. Tomati puhul näitab äpp ka seda, millise kasvukujuga taimel ja mis kasvufaasis ladva eemaldamist kaaluda.

## 5. Tehnoloogiad

| Tehnoloogia | Kasutus projektis |
| --- | --- |
| TypeScript | Rakenduse loogika, andmetüübid ja külvisoovituste arvutus. |
| React Native ja Expo | Mobiilivaated ja arendus ühise koodibaasiga Androidile ja iOS-ile. |
| JSON | Rakendusega kaasas olevad kultuuride külviperioodid, allikaviited ja kuufaaside andmed. |
| SQLite (`expo-sqlite`) | Plaanide, külvipäeviku ja viimati laaditud ilmaprognoosi salvestamine telefonis. [Expo SQLite dokumentatsioon](https://docs.expo.dev/versions/latest/sdk/sqlite/). |
| `expo-notifications` | Telefonis ajastatavad külvimeeldetuletused. [Expo teavituste dokumentatsioon](https://docs.expo.dev/versions/latest/sdk/notifications/). |
| Git ja GitHub | Versioonihaldus ning projekti plaani hoidmine failis `README.md`. |
| US Naval Observatory andmed | Nelja peamise kuufaasi ajahetkede allikas. [USNO kuufaaside andmed](https://aa.usno.navy.mil/data/MoonPhases). |
| Open-Meteo | Asulaotsing ja ilmaprognoos. Kooliprojektis kasutame mitteärilist ligipääsu. [Prognoosi API](https://open-meteo.com/en/docs) · [Asulaotsingu API](https://open-meteo.com/en/docs/geocoding-api) · [Kasutustingimused](https://open-meteo.com/en/pricing). |

## 6. Teostusplaan

1. Visanda vaated „Mida praegu külvata?“, kalender ja külvipäevik. Käi läbi kaks näidet. Tomati ettekasvataja tellib meeldetuletuse ja märgib hiljem tegeliku külvikuupäeva. Avamaale redist külvav kasutaja vaatab enne kuupäeva valimist oma asula ilmaprognoosi.
2. Kontrolli kuue kultuuri külviaegu Eesti kasvatusjuhenditest ning koosta allikaviidetega algandmestik. Lisa kuufaaside andmed ja määra nende kaetud periood.
3. Loo Expo projekt ning ehita taimede nimekiri koos külviviisi filtriga ja kalendrivaade.
4. Lisa külvisoovituste arvutus, päeva põhjendus ja teated puuduva kuufaasi või puuduva soovituse korral.
5. Lisa külvitegevuste planeerimine, kohalikud meeldetuletused ja külvipäevik.
6. Ühenda asulaotsing ja ilmaprognoos Open-Meteoga. Lisa ennustuse kuvamine kalendris, viimase uuenduse kellaaeg ja salvestatud prognoosi kuvamine võrguvea korral.
7. Lisa kuue taime hooldusjuhised, potitaime väetamisvahe arvutus ja seitsme päeva kuuvaade aiatööde jaoks.
8. Testi külviakna piire, kuufaasi vahetumist ja Eesti ajavööndit. Proovi Androidil ja iOS-il meeldetuletuste ajastamist ja tühistamist, külvipäeviku kasutamist lennurežiimis ning ilmaprognoosi uuendamist ja asula vahetamist.
9. Paranda testimisel leitud vead ning lisa README-sse äpi käivitamise juhis.

## 7. Valmisoleku kriteeriumid

- Äpp käivitub Androidil ja iOS-il ning põhivaated on eestikeelsed.
- Kõigi kuue kultuuri jaoks saab valida vähemalt ühe külviviisi ja näha allikaviitega külviperioodi. Valitud kuupäeva soovitused vastavad külviviisi filtrile ning tomatit ja kurki saab vaadata ettekasvatuse filtriga.
- Kalendri nelja peamise kuufaasi kuupäevad ühtivad kontrollnäidetes USNO aega Eesti ajavööndisse teisendades saadud kuupäevadega.
- Iga esile tõstetud päev jääb valitud külviperioodi ja vastab kuufaasi reeglile. Päeva detailvaade selgitab, miks päev sobib, ja märgib soovituse pärimuslikuna.
- Kasutaja saab külviperioodi kalendrisse lisada. Teavitusloa korral saabub üks meeldetuletus valitud perioodi alguspäeval. Kuupäeva muutmisel ajastatakse teavitus ümber ja kirje kustutamisel see tühistatakse. Loast keeldumisel jääb plaan kalendrisse ning äpp näitab, et teavitus pole aktiivne.
- Kasutaja saab külvipäevikusse lisada tegeliku külvikuupäeva, mis võib erineda plaanitud kuupäevast. Külviplaani tehtuks märkimisel kanduvad sordiväli ja täpsustused päevikusse ning neid saab muuta. Tehtud kirje on kalendris äratuntav ja jääb alles pärast äpi taaskäivitamist.
- Lennurežiimis saab valida kultuuri, vaadata kalendrit, avada kaetud päeva põhjenduse ja teha päevikukande. Kui kuufaasiandmed puuduvad, jääb külviperiood nähtavale ja äpp kuvab selle kohta selge teate.
- Kui kasutaja valib asula, kuvab äpp seitsme päeva prognoosi selle asula kohta Eesti aja järgi. Kasutaja näeb, millal äpp ilmaandmed viimati laadis, ning saab neid käsitsi uuendada. Võrguvea korral näitab äpp valitud asula ja kuupäeva kohta salvestatud ilmaandmeid märkega „Viimati laaditud prognoos“. Kui selle päeva andmed puuduvad, kuvatakse sellekohane teade. Külvikalender ja päevik töötavad edasi.
- Kuue taime juures on allikaviidetega hooldusjuhised külvist saagini. Potitomati ja potikurgi kalkulaator kuvab valitud kuupäevast 10–14 päeva kaugusele jääva vahemiku.
- Tomati ladva eemaldamise juhis arvestab kasvukuju ja viljakobarate arengut. Kuu järgi esile tõstetud päevad kannavad pärimusliku soovituse märget.
- README-s on juhis, mille järgi saab teine inimene projekti käivitada.

## Arenduse märkmed

### Külvikalendri tööpõhimõte

1. Kuva allikaga põhjendatud külviaken valitud kultuuri ja külviviisi jaoks. Hoia avamaale külv ja ettekasvatus omaette valikutena seal, kus allikas neid toetab. Näita asjakohaseid mulla temperatuuri ja öökülma märkusi.
2. Tõsta külviaknas esile kuufaasiga sobivad kalendripäevad. Esimese versiooni pärimusreegel seob maapealse saagiga kultuurid kasvava kuuga ja maa-aluse saagiga kultuurid kahaneva kuuga. Üleminekupäeva määramiseks kasutab äpp oma kokkulepet ja kontrollib kuufaasi kell 12.00 Eesti ajas. Kasvav periood algab noorkuu täpsel hetkel ja lõpeb täiskuu hetkel. Kahanev periood algab täiskuu täpsel hetkel ja lõpeb järgmise noorkuu hetkel. Piirihetk kuulub algavasse perioodi. [Pärimusreegli allikas](https://www.almanac.com/planting-by-the-moon).
3. Näita põhjendust, näiteks „Kuu järgi soovitatud külvipäev. Päev jääb külviaknasse ja kuu on kasvav.“ Lisa lühike selgitus, et kuu järgi külvamine on pärimus. Teaduskirjanduse ülevaade ei leidnud usaldusväärset alust kuufaaside järgi külvamisele saagi parandamiseks. [Mayoral jt, 2020](https://doi.org/10.3390/agronomy10070955).
4. Hoia faasihetked UTC-s ja kuva need ajavööndis `Europe/Tallinn`. Kuva terve külviaken koos algus- ja lõpupäevaga ka siis, kui faasiandmed katavad ainult osa sellest. Anna kuusoovitusi kaetud päevadele ja märgi ülejäänud päevadel andmete puudumine. Päev on kaetud, kui selle kohalik keskpäev jääb teadaolevasse järjestikuste noor- ja täiskuu vahemikku. Kui kogu külviaken on kaetud ja ükski päev ei sobi, ütle, et sel perioodil kuu järgi soovitatud päevi ei ole. [USNO kuufaaside andmestik](https://aa.usno.navy.mil/data/MoonPhases).

### Isiklik külvikalender

- Kasuta äpi enda kalendrit. Kuva külvisoovitused, plaanitud tegevused ja tehtud külvid eri tekstisiltidega.
- Küsi teavitusluba siis, kui kasutaja meeldetuletuse sisse lülitab. Ajasta teavitus telefonis ja tühista ootel meeldetuletus, kui tegevus märgitakse tehtuks. Kui kuupäev on möödunud, kuva plaan kalendris ning lase kasutajal vajaduse korral valida uus kuupäev.
- Salvesta külvipäeviku kuupäev kasutaja valitud kalendripäevana. Plaani tehtuks märkimisel paku vaikimisi tänast kuupäeva ja luba seda enne salvestamist muuta.

### Ilmaprognoos

- Salvesta valitud asula ja selle koordinaadid. Küsi prognoosi äpi avamisel ja esiplaanile naasmisel siis, kui viimasest edukast laadimisest on möödunud vähemalt tund, ning asula vahetamisel või käsitsi uuendamisel. Seo salvestatud prognoos asula ja kuupäevadega.
- Kuva võimalik öökülm siis, kui kohaliku öö tunniprognoos näitab õhutemperatuuri 0 °C või alla selle. See on kohalikul prognoosil põhinev märkus. Külviaken ja kuufaasi soovitus jäävad kalendris nähtavale ka siis, kui valitud kuupäev jääb prognoosiperioodist välja.

### Taimehooldus

- Väetamine sõltub taime kasvufaasist, mulla viljakusest, kasvukohast ja valitud väetise pakendijuhisest. Potitaime kalkulaator on mõeldud juba väetatavale taimele. [Maaelu Teadmuskeskuse tomatijuhis](https://metk.agri.ee/uudised/tomatid-vajavad-tahelepanu-ja-hoolt) · [RHS-i tomatijuhis](https://www.rhs.org.uk/vegetables/tomatoes/grow-your-own) · [RHS-i kurgijuhis](https://www.rhs.org.uk/vegetables/cucumbers/grow-your-own).
- Kuuvaade rakendab pärimuslikku kärpimise reeglit tomati ladva eemaldamisele. See soovitus eeldab, et taim on tööks valmis. Sama kuuvaade seob harvendamise ja rohimise kahaneva kuuga ning ümberistutamise kasvava kuuga. [Kuuaianduse pärimus](https://www.almanac.com/farming-moon) · [Teaduskirjanduse ülevaade](https://doi.org/10.3390/agronomy10070955).

### Agendid

| Agent | Tulemus |
| --- | --- |
| `toode_ja_kasutuskogemus` | Mobiilivaated, eestikeelsed tekstid ja vastuvõtukriteeriumid. |
| `kuukalender_ja_aiandus` | Allikatega kultuuriandmed, faasireeglid ja arvutuse kontrollnäited. |
| `mobiiliarendus` | Töötav mobiiliäpp ja kohapeal käivitatavad kontrollid. |
| `kvaliteedikontroll` | Sõltumatu ülevaatus koos kordamise sammude ja testitulemustega. |

Ava `aiandus` Codexis töökaustana ning nimeta vestluses roll, kellele soovid ülesande anda. Käsurealt saab töökausta valida näiteks käsuga `codex -C aiandus` kaustas `VIKK`. [Codexi juhend projekti agentidele](https://learn.chatgpt.com/docs/agent-configuration/subagents#custom-agents).

> Loo `aiandus` kausta esimene Androidi ja iOS-i prototüüp. Kaasa `toode_ja_kasutuskogemus` põhivaadete kavandamiseks, `kuukalender_ja_aiandus` külviakende ja faasireeglite kontrolliks ning `mobiiliarendus` rakenduse ehitamiseks. Lase `kvaliteedikontroll` agendil valmis külvikalender üle vaadata.
