# Numbriarvamismäng

Buniga terminalis töötav mäng. Arvuti valib igas voorus juhusliku numbri vahemikus 1–10.
Paku numbreid, kuni leiad õige. Iga vale pakkumise järel ütleb mäng, kas õige
number on suurem või väiksem. Väljumiseks kirjuta `q`.

Mäng küsib mängija nime. Alguses on skoor 10 ning iga vale pakkumine võtab 1
punkti maha. Õige vastus skoori ei muuda. Võidab suurema skooriga mängija:
10 on parem kui 9 ja 9 on parem kui 8. Vigased sisestused skoori ei muuda.
Skoor võib langeda alla nulli. Varasemad tulemused teisendatakse samale skaalale.
Pärast õiget vastust saab vastata `jah`, et uuesti mängida, või `ei`, et lõpetada.
Lõpetatud voorude punktid liituvad jooksva mängukorra koguskooriks.
Iga mängija parim koguskoor salvestatakse mängu kõrval faili `edetabel.json` ja
edetabel kuvatakse mängu lõpus. Tulemused säilivad ka pärast terminali sulgemist.
Pooleli jäetud vooru punkte ei lisata. Varasemate lõpetatud voorude tulemused säilivad.

Käivita hoidla juurkaustast PowerShellis:

```powershell
bun run "Sissejuhatus programmeerimisse/numbrimang/index.ts"
```
