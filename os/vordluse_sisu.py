# Kasutab vormista_too.py dokumendi- ja viitefunktsioone.
used_sources = set()
table_sources = set()
original_cite = cite
def cite(i):
    used_sources.add(i)
    table_sources.add(i)
    return ''

def make_table(rows):
    table = doc.add_table(rows=0, cols=3)
    table.style = 'Table Grid'
    table.autofit = False
    for column, width in zip(table.columns, [3.5, 6.5, 6.5]):
        column.width = Cm(width)
    for index, row in enumerate(rows):
        cells = table.add_row().cells
        for cell, content, width in zip(cells, row, [3.5, 6.5, 6.5]):
            cell.width = Cm(width)
            cell.text = re.sub(r'^\d+\.\s*', '', content).strip() if cell == cells[0] else content.strip()
            for paragraph in cell.paragraphs:
                paragraph.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
                paragraph.paragraph_format.space_after = Pt(3)
                if index == 0:
                    for run in paragraph.runs:
                        run.bold = True
        properties = table.rows[-1]._tr.get_or_add_trPr()
        properties.append(OxmlElement('w:cantSplit'))
        if index == 0:
            properties.append(OxmlElement('w:tblHeader'))
    source_note = p('Tabeli allikad: ')
    source_note.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
    groups = {}
    for source_id in sorted(table_sources):
        source = refs[source_id]
        groups.setdefault(source['org'], source)
    for index, (org, source) in enumerate(groups.items()):
        if index:
            source_note.add_run('; ')
        hyperlink(source_note, org+' – dokumentatsioon', source['url'])
    source_note.add_run('. Allikate üldine loend on töö lõpus.')
    table_sources.clear()
    return table

h('Võrreldavad süsteemid')
p('Tabel 1. Võrreldavad operatsioonisüsteemid')
make_table([
    ['Näitaja', 'Linuxi distributsioon', 'Windows 11'],
    ['Nimi', 'CachyOS Desktop Edition', 'Windows 11 Home'],
    ['Versioon', 'Jooksev väljalase: kindlat püsivat versiooninumbrit ei ole. Süsteemi uuendatakse pidevalt. Andmeid vaadati 18.10.2026. '+cite(2), '25H2. '+cite(3)],
    ['Töölauakeskkond', 'KDE Plasma. '+cite(1), 'Windowsi töölaud.'],
])

h('Operatsioonisüsteemide võrdlus')
p('Tabel 2. CachyOS-i ja Windows 11 võrdlus')
make_table([
    ['Võrdluspunkt', 'CachyOS ja KDE Plasma', 'Windows 11 Home 25H2'],
    ['1. Väljalase ja uuendusmudel',
     'CachyOS kasutab jooksvat väljalaset. See tähendab, et süsteem ja programmid saavad pidevalt uuendusi. Uut süsteemi ei pea iga suurema versiooni järel uuesti paigaldama. Andmete vaatamise kuupäev: 18.10.2026. '+cite(2),
     '25H2 tuli välja 30.09.2025. Windows saab turva- ja kvaliteediuuendusi ning eraldi suuremaid funktsiooniuuendusi. '+cite(3)],
    ['2. Ressursinõuded: minimaalsed',
     'RAM: 3 GB. Salvestusruum: 30 GB. Vaja on stabiilset internetiühendust, sest paigaldus toimub veebi kaudu. Ametlik nõueteleht ei nimeta minimaalset protsessori taktsagedust ega tuumade arvu. Kasutusel on x86-64 protsessorid. '+cite(4),
     'Protsessor: ühilduv 64-bitine, vähemalt 1 GHz ja kaks tuuma. RAM: 4 GB. Salvestusruum: 64 GB. Lisaks on vaja TPM 2.0, UEFI-d ja Secure Booti võimekust, DirectX 12 graafikat WDDM 2.0 draiveriga ning üle 9-tollist 720p ekraani, millel on 8 bitti värvikanali kohta. Home’i esmane seadistamine vajab internetti ja Microsofti kontot. '+cite(5)],
    ['Ressursinõuded: soovitatavad',
     'Protsessor: x86-64-v3 toega. RAM: 8 GB. Salvestusruum: 50 GB SSD-l või NVMe-kettal. Internet: vähemalt 50 Mbit/s. Graafika näited on NVIDIA GTX 950 või uuem, AMD GCN 1.0 või uuem ning Intel HD Graphics või Arc. Need on CachyOS-i üldised soovitused. '+cite(4),
     'Ametlikul nõuetelehel pole eraldi üldisi soovitatavaid protsessori-, RAM-i ega salvestusruumi nõudeid avaldatud. Miinimumnõuded ei ole soovitatavad nõuded. '+cite(5)],
    ['3. Otstarve',
     'Sobib igapäevaseks kasutamiseks, õppimiseks, programmeerimiseks ja mängimiseks. CachyOS-i arendajad pööravad tähelepanu jõudlusele. '+cite(2),
     'Sobib kodukasutuseks, õppimiseks, veebis käimiseks, meelelahutuseks ja mängimiseks. Vajalikud programmid peavad valitud seadmega ühilduma.'],
    ['4. Toetatavad arhitektuurid',
     'x86-64. Pakette optimeeritakse muu hulgas x86-64-v3, x86-64-v4 ja Zen4+ protsessoritele. Need on sama arhitektuuri eri võimalused. '+cite(2),
     'x64 ehk x86-64 ja ARM64. Seade peab vastama Windows 11 nõuetele. 32-bitist x86 väljaannet ei ole. '+cite(3)],
    ['5. Tuuma tüüp',
     'Linuxi monoliitne tuum, millele saab lisada mooduleid. CachyOS kasutab kohandatud Linuxi tuuma. '+cite(2),
     'Windows NT hübriidtuum. '+cite(6)],
    ['6. Lähtekood',
     'Linuxi tuum ja KDE Plasma on avatud lähtekoodiga. Linuxi tuuma põhilitsents on GPL-2.0-only. Mõni draiver või püsivara võib olla suletud lähtekoodiga. '+cite(7),
     'Windowsi põhikomponentide lähtekood on suletud. Osa eraldi rakendusi on siiski avatud lähtekoodiga, näiteks Windows Terminal. '+cite(20)],
    ['7. Kasutajaliides: rakendused ja failid',
     'Rakendusi avatakse rakenduste menüüst või otsitakse KRunneriga. KRunneriga avatakse ka dokumente ja käivitatakse käske. Faile ja kaustu hallatakse Dolphiniga, millel on vahekaardid ja jagatud vaade. Failipuu algab juurest /. '+cite(8),
     'Rakendusi avatakse Start-menüüst või otsitakse Windows Searchiga. Faile ja kaustu hallatakse File Exploreriga, millel on samuti vahekaardid. Kettad on tähistatud tähtedega, näiteks C:. '+cite(9)],
    ['Kasutajaliides: seaded ja kohandamine',
     'Seadeid muudetakse System Settingsis. Kohandatakse taustapilti, teemasid, paneelide asukohta ja töölauavidinaid. Sarnasus Windowsiga on menüü, tegumiriba ja kaustadega failihaldus. Erinevus on vabam töölaua kohandamine ning Dolphini ja Linuxi failipuu kasutamine. '+cite(1),
     'Seadeid muudetakse Settingsis, osa vanemaid valikuid on Control Panelis. Kohandatakse taustapilti, värve ja teemasid ning Start-nupu joondust. Tegumiriba paigutuse valikuid on vähem kui KDE-s. Teine erinevus on File Explorer ja kettatähtede kasutamine. '+cite(10)],
    ['8. Kolm peamist võimalust',
     '1) Optimeeritud pakettide ja tuumaga kasutatakse sobiva protsessori võimalusi. '+cite(2)+'\n2) KDE paneelide, vidinate ja virtuaalsete töölaudadega kohandatakse töökeskkonda. '+cite(1)+'\n3) Steami ja Protoniga mängitakse paljusid Linuxi ning Windowsi mänge. Need paigaldatakse vajadusel juurde ja kõik mängud ei tööta. '+cite(11),
     '1) Snap-paigutustega paigutatakse mitu akent kiiresti kõrvuti. '+cite(12)+'\n2) Virtuaalsete töölaudadega hoitakse näiteks koolitöö ja vaba aja aknad eraldi. '+cite(19)+'\n3) Windows Security ja Microsoft Defenderiga kaitstakse arvutit pahavara eest. '+cite(18)],
    ['9. Kaasasolevad rakendused',
     'KDE valikuga paigaldatavate rakenduste näited:\nDolphin – failide haldamine.\nKate – teksti ja koodi kirjutamine.\nSpectacle – ekraanipiltide tegemine.\nGwenview – piltide vaatamine.\nKonsole – terminalikäskude kasutamine.\nKoosseis sõltub paigaldaja valikutest. LibreOffice ja Steam on lisaks paigaldatavate programmide näited. '+cite(13),
     'File Explorer – failide haldamine.\nNotepad – lihtteksti kirjutamine.\nSnipping Tool – ekraanipiltide tegemine.\nPhotos – fotode vaatamine.\nMicrosoft Edge – veebis käimine.\nRakenduste komplekt võib seadme ja piirkonna järgi erineda. Microsoft 365 töölauarakendused ja Steam tuleb vajadusel lisaks paigaldada.'],
    ['10. Tarkvara paigaldamine ja uuendamine',
     'Programme paigaldatakse CachyOS-i ja Archi hoidlatest paketihalduriga pacman. Käsuga sudo pacman -Syu uuendatakse nii süsteemi kui ka hoidlate programme. AUR-is on kogukonna pakendusskriptid; see pole ametlik binaarpakettide hoidla. Neid skripte kontrollitakse enne kasutamist. '+cite(14),
     'Programme paigaldatakse Microsoft Store’ist või tootja veebilehelt EXE- või MSI-paigaldajana. Kasutatakse ka wingetit. Windows Update’i kaudu uuendatakse süsteemi ja osa draivereid. Store’i rakendusi uuendatakse Store’i kaudu, teistel programmidel on sageli oma uuendaja. '+cite(17)],
])
p('Minimaalsed ja soovitatavad nõuded on erinevad. Ainult nende arvude põhjal ei saa öelda, kumb süsteem on mingis ülesandes kiirem.')

h('Töölaua pildid')
for index, name, source_id, label in [
    (1, 'cachyos-desktop.png', 15, 'CachyOS KDE Plasma – pildi allikas'),
    (2, 'windows11-desktop.jpg', 16, 'Windows 11 25H2 – pildi allikas'),
]:
    if index == 2:
        doc.add_page_break()
    picture = doc.add_paragraph()
    picture.paragraph_format.keep_with_next = True
    picture.add_run().add_picture(str(ROOT/name), width=Cm(16.5))
    source = p('Pildi allikas: ')
    source.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
    hyperlink(source, refs[source_id]['org'], refs[source_id]['url'])
    used_sources.add(source_id)

sources = [source for source in sources if source['id'] in used_sources]
