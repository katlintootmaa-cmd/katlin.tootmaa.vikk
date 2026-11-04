from pathlib import Path
from bs4 import BeautifulSoup
from docx import Document
from docx.shared import Cm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
import re
import os

ROOT = Path(__file__).parent
soup = BeautifulSoup((ROOT/'operatsioonisusteemide-vordlus.html').read_text(encoding='utf-8'), 'html.parser')
doc = Document()
sec = doc.sections[0]
sec.page_width, sec.page_height = Cm(21), Cm(29.7)
sec.left_margin, sec.right_margin = Cm(3), Cm(1.5)
sec.top_margin = sec.bottom_margin = Cm(2.5)
sec.different_first_page_header_footer = True
normal = doc.styles['Normal']
normal.font.name, normal.font.size = 'Times New Roman', Pt(12)
normal.paragraph_format.line_spacing = 1.5
normal.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
normal.paragraph_format.space_after = Pt(6)
for name,size in [('Heading 1',16),('Heading 2',14)]:
    s = doc.styles[name]
    s.font.name, s.font.size, s.font.bold = 'Times New Roman', Pt(size), True
    s.font.italic = name == 'Heading 2'
    s.font.color.rgb = RGBColor(0,0,0)
    s.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
    s.paragraph_format.space_before = s.paragraph_format.space_after = Pt(12)
    s.paragraph_format.keep_with_next = True
    if name == 'Heading 1': s.paragraph_format.page_break_before = False
footer = sec.footer.paragraphs[0]
footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
field = OxmlElement('w:fldSimple'); field.set(qn('w:instr'),'PAGE'); footer._p.append(field)

sources = []
orgs = {1:'CachyOS',2:'CachyOS',3:'Microsoft',4:'CachyOS',5:'Microsoft',6:'Microsoft',7:'The Linux Kernel',8:'KDE',9:'Microsoft',10:'Microsoft',11:'CachyOS',12:'Microsoft',13:'CachyOS',14:'CachyOS',15:'CachyOS',16:'Windows Latest'}
for i,li in enumerate(soup.select('ol.sources > li'),1):
    a=li.find('a'); title=a.get_text().replace('CachyOS ?','CachyOS –').replace('Windows Latest ?','Windows Latest –').replace('t??lauapildi','töölauapildi')
    title=re.sub(r'^(CachyOS|Microsoft Learn|Microsoft Support|Linux Kernel Documentation|KDE UserBase|CachyOS GitHub):\s*','',title)
    if i==5: a['href']='https://www.microsoft.com/en-us/windows/windows-11-specifications'; title='Windows 11 Specs and System Requirements'
    if i==8: a['href']='https://docs.kde.org/stable_kf6/en/plasma-desktop/plasma-desktop/krunner.html'; title='KRunner'
    if i==16: title='Microsoft confirms Windows 11 25H2 is now available for everyone'
    sources.append(dict(org=orgs[i], title=title.rstrip('.'), url=a['href'], year='2025' if i in [4,16] else '2026' if i==2 else 's.a.', id=i))
extra=[('Microsoft','Windows Package Manager','https://learn.microsoft.com/en-us/windows/package-manager/',17),('Microsoft','Windows Security','https://support.microsoft.com/en-us/windows/windows-security-2ae0363d-0ada-c064-8b56-6a39afb6a963',18),('Microsoft','Multiple desktops in Windows','https://support.microsoft.com/en-us/windows/multiple-desktops-in-windows-5e6ba650-a5c5-fa40-794b-c26f5e2a394b',19),('Microsoft','Windows Terminal','https://github.com/microsoft/terminal',20)]
for org,title,url,i in extra:
    if i==18: title='Virus and Threat Protection in the Windows Security App'; url='https://support.microsoft.com/en-us/windows/security/threat-malware-protection/virus-and-threat-protection-in-the-windows-security-app.'
    if i==19: title='Configure Multiple Desktops in Windows'; url='https://support.microsoft.com/en-us/windows/experience/configure-multiple-desktops-in-windows'
    sources.append(dict(org=org,title=title,url=url,year='s.a.',id=i))
for org in sorted(set(s['org'] for s in sources)):
    group=sorted([s for s in sources if s['org']==org],key=lambda s:s['title'].lower())
    for year in set(s['year'] for s in group):
        same=[s for s in group if s['year']==year]
        for j,s in enumerate(same): s['label']=s['year']+('-'+chr(97+j) if len(same)>1 else '')
refs={s['id']:s for s in sources}
def cite(i):
    s=refs[i]; return f"({s['org']}, {s['label']})"
def text(node):
    node=BeautifulSoup(str(node),'html.parser')
    for a in node.find_all('a'):
        m=re.fullmatch(r'\[(\d+)\]',a.get_text())
        if m: a.replace_with(cite(int(m.group(1))))
    return node.get_text(' ',strip=True).replace('08.10.2026','18.10.2026')
def p(t,bold=False):
    x=doc.add_paragraph(); x.add_run(t).bold=bold; return x
def h(t,l=1): return doc.add_heading(t,l)
def hyperlink(par,t,url):
    part=par.part; rid=part.relate_to(url,'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink',is_external=True)
    a=OxmlElement('w:hyperlink'); a.set(qn('r:id'),rid)
    r=OxmlElement('w:r'); props=OxmlElement('w:rPr'); color=OxmlElement('w:color'); color.set(qn('w:val'),'0563C1'); props.append(color)
    underline=OxmlElement('w:u'); underline.set(qn('w:val'),'single'); props.append(underline); r.append(props)
    tx=OxmlElement('w:t'); tx.text=t; r.append(tx); a.append(r); par._p.append(a)

h('CachyOS-i ja Windows 11 võrdlus')
p('Kätlin Tootmaa | TAK26')
p('Juhendaja: Priit Paap')
p('Viljandi Kutseõppekeskus | 18.10.2026')
exec(compile((ROOT/'vordluse_sisu.py').read_text(encoding='utf-8'), str(ROOT/'vordluse_sisu.py'), 'exec'))
doc.add_page_break()
h('Kasutatud allikad')
p('Allikaid kasutati 18.10.2026. Töölauapiltide täpsed allikad on märgitud piltide alla.')
source_groups = [
    ('CachyOS – ametlik dokumentatsioon süsteemi, nõuete, töölaua ja tarkvara kohta.', [('Why CachyOS?', 2), ('Preparation steps', 4)]),
    ('KDE – töölaua ja rakenduste kasutamise dokumentatsioon.', [('KRunner', 8)]),
    ('Microsoft – Windows 11 nõuded, versioonid ja kasutusjuhendid.', [('Windows 11 Specs and System Requirements', 5), ('Windows 11 – release information', 3), ('Snap Your Windows', 12)]),
    ('Linuxi tuuma dokumentatsioon – lähtekood ja litsents.', [('Linux kernel licensing rules', 7)]),
]
for description, links in source_groups:
    x = p(description)
    x.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
    x.paragraph_format.keep_with_next = True
    for title, source_id in links:
        x = p(title+': ')
        x.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
        hyperlink(x, refs[source_id]['url'], refs[source_id]['url'])
doc.core_properties.title='CachyOS-i ja Windows 11 võrdlus'
doc.core_properties.author='Kätlin Tootmaa'
doc.core_properties.subject='Operatsioonisüsteemide võrdlus – TAK26'
doc.save(ROOT/(os.environ.get('OS_DOCUMENT_STEM', 'operatsioonisusteemide-vordlus')+'.docx'))
print('DOCX valmis')
