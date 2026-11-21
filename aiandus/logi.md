# Kuukülvi arenduslogi

## 2026-11-21

- Kinnitasin iseseisvaks projektiks Kuukülvi ja panin kirja olemasoleva prototüübi seisu. Kalendris on kuue kultuuri külviaknad, kuufaasid ja põhjendatud külvisoovitused. Prototüübis on külviplaanid, külvipäevik, kohalik ilmaprognoos, hooldusjuhised ja telefoni meeldetuletuste loogika.
- Lisasin faili `AGENTS.md` automaatse tegevuslogi nõude. Sidusin logi `README.md`-ga ning kirjutasin kolm katsetussammu 26.11.2026 ülevaatuseks.
- `npm run typecheck` läbis tüübikontrolli. `npm test` läbis kõik kaheksa testi, mis hõlmavad kalendrit, kuufaase, hooldussoovitusi, asulaotsingut ja ilmaprognoosi. `npm exec -- expo export --platform web` lõi veebijärgu kausta `dist`.
- Androidi ja iOS-i seadmekatsed on veel tegemata. Telefonis vajavad kontrolli meeldetuletuse lubamine, muutmine ja tühistamine ning päeviku kasutamine lennurežiimis.
