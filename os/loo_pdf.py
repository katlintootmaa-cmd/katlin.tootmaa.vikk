from pathlib import Path
import os
from io import BytesIO
from xml.sax.saxutils import escape
from docx import Document
from docx.oxml.ns import qn
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.lib.units import cm
from reportlab.lib.pagesizes import A4
from reportlab.platypus import BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, PageBreak, Image, Table, TableStyle
from reportlab.platypus.tableofcontents import TableOfContents
from PIL import Image as PILImage
import fitz

root=Path(__file__).parent
stem=os.environ.get('OS_DOCUMENT_STEM', 'operatsioonisusteemide-vordlus')
for name,file in [('TNR','times.ttf'),('TNR-B','timesbd.ttf'),('TNR-I','timesi.ttf'),('TNR-BI','timesbi.ttf')]:
    pdfmetrics.registerFont(TTFont(name,'C:/Windows/Fonts/'+file))
pdfmetrics.registerFontFamily('TNR',normal='TNR',bold='TNR-B',italic='TNR-I',boldItalic='TNR-BI')
body=ParagraphStyle('body',fontName='TNR',fontSize=12,leading=18,alignment=TA_JUSTIFY,spaceAfter=6)
left=ParagraphStyle('left',parent=body,alignment=TA_LEFT)
title=ParagraphStyle('title',parent=body,fontSize=16,leading=24,alignment=TA_CENTER)
title_right=ParagraphStyle('title_right',parent=title,alignment=TA_RIGHT)
h1=ParagraphStyle('H1',parent=body,fontName='TNR-B',fontSize=16,leading=24,spaceAfter=18,alignment=TA_LEFT,keepWithNext=True)
h2=ParagraphStyle('H2',parent=body,fontName='TNR-BI',fontSize=14,leading=21,spaceBefore=12,spaceAfter=12,alignment=TA_LEFT,keepWithNext=True)
toc=TableOfContents()
toc.levelStyles=[ParagraphStyle('toc1',parent=left,spaceBefore=8),ParagraphStyle('toc2',parent=left,leftIndent=16,firstLineIndent=0,fontSize=12,spaceBefore=3)]
class PDF(BaseDocTemplate):
    def afterFlowable(self,f):
        if isinstance(f,Paragraph) and f.style.name in ['H1','H2']:
            text=f.getPlainText()
            if text=='SISUKORD': return
            level=0 if f.style.name=='H1' else 1
            key='h'+str(self.seq.nextf('heading'))
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(text,key,level,False)
            self.notify('TOCEntry',(level,text,self.page,key))
def page(c,d):
    if d.page>1:
        c.setFont('TNR',12); c.drawCentredString(A4[0]/2,1.25*cm,str(d.page))
pdf=PDF(str(root/(stem+'.pdf')),pagesize=A4,leftMargin=3*cm,rightMargin=1.5*cm,topMargin=2.5*cm,bottomMargin=2.5*cm,title='CachyOS-i ja Windows 11 võrdlus',author='Kätlin Tootmaa')
pdf.addPageTemplates(PageTemplate(id='main',frames=[Frame(3*cm,2.5*cm,16.5*cm,24.7*cm,leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0)],onPage=page))
doc=Document(root/(stem+'.docx'))
story=[]
def rich(el):
    out=''
    for child in el:
        if child.tag==qn('w:r'):
            t=''.join(escape(x.text or '') if x.tag==qn('w:t') else '<br/>' if x.tag==qn('w:br') and x.get(qn('w:type'))!='page' else '' for x in child.iter())
            rp=child.find(qn('w:rPr'))
            if rp is not None:
                b=rp.find(qn('w:b')); it=rp.find(qn('w:i'))
                if b is not None and b.get(qn('w:val'),'1') not in ['0','false','off']: t='<b>'+t+'</b>'
                if it is not None and it.get(qn('w:val'),'1') not in ['0','false','off']: t='<i>'+t+'</i>'
            out+=t
        elif child.tag==qn('w:hyperlink'):
            rid=child.get(qn('r:id')); url=doc.part.rels[rid].target_ref
            label=''.join(x.text or '' for x in child.iter(qn('w:t')))
            out+='<link href="'+escape(url,{'"':'&quot;'})+'" color="#0563C1"><u>'+escape(label)+'</u></link>'
    return out
in_cover=False
for el in doc.element.body:
    if el.tag==qn('w:tbl'):
        rows=[]
        for tr in el.findall(qn('w:tr')):
            rows.append([Paragraph('<br/>'.join(rich(p) for p in tc.findall(qn('w:p'))),left) for tc in tr.findall(qn('w:tc'))])
        t=Table(rows,colWidths=[3.5*cm,6.5*cm,6.5*cm],repeatRows=1,hAlign='LEFT')
        t.setStyle(TableStyle([('GRID',(0,0),(-1,-1),.5,'black'),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),5),('RIGHTPADDING',(0,0),(-1,-1),5),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]))
        story.extend([t,Spacer(1,12)]); continue
    if el.tag!=qn('w:p'): continue
    pp=el.find(qn('w:pPr')); style=''
    if pp is not None:
        ps=pp.find(qn('w:pStyle')); style=ps.get(qn('w:val')) if ps is not None else ''
    if style=='Heading1':
        in_cover=False; story.append(Paragraph(rich(el),h1)); continue
    if style=='Heading2': story.append(Paragraph(rich(el),h2)); continue
    if el.find('.//'+qn('w:fldSimple')) is not None: story.append(toc); continue
    breaks=el.findall('.//'+qn('w:br'))
    if any(b.get(qn('w:type'))=='page' for b in breaks): story.append(PageBreak()); continue
    blip=el.find('.//{http://schemas.openxmlformats.org/drawingml/2006/main}blip')
    if blip is not None:
        rid=blip.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed')
        data=doc.part.related_parts[rid].blob; im=PILImage.open(BytesIO(data)); w=16.5*cm
        picture=Image(BytesIO(data),width=w,height=w*im.height/im.width); picture.keepWithNext=True
        story.append(picture); continue
    t=rich(el)
    if not t:
        after=pp.find(qn('w:spacing')) if pp is not None else None
        amount=int(after.get(qn('w:after'),'120'))/20 if after is not None else 12
        story.append(Spacer(1,amount)); continue
    sty=title if in_cover else left if 'Loetud aadressil:' in t or t.startswith('Allikas:') else body
    if pp is not None:
        alignment=pp.find(qn('w:jc'))
        if alignment is not None and alignment.get(qn('w:val'))=='right': sty=title_right
        elif alignment is not None and alignment.get(qn('w:val'))=='left': sty=left
    story.append(Paragraph(t,sty))
pdf.multiBuild(story)
r=fitz.open(root/(stem+'.pdf'))
print('Lehekülgi:',len(r))
for i,page in enumerate(r):
    tx=page.get_text()
    print(i+1,len(tx),len(page.get_links()),tx[:85].replace('\n',' | '))
    for block in page.get_text('blocks'):
        x0,y0,x1,y1=block[:4]
        assert x0>=3*cm-2 and x1<=A4[0]-1.5*cm+2,(i+1,block)
    page.get_pixmap(matrix=fitz.Matrix(.9,.9)).save(root/f'kontroll-{i+1:02d}.png')
(root/'pdf-tekst.txt').write_text('\n'.join(p.get_text() for p in r),encoding='utf-8')
