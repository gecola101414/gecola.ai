import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PiMUSData } from '../types';

export const generateNativePiMUSPdf = async (data: PiMUSData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  // Helper functions
  const drawHeader = (title: string, pageNum: number) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100);
    doc.text(`Pi.M.U.S. - ${data.site.address || 'Progetto'}`, margin, 15);
    doc.text(`Pag. ${pageNum}`, pageWidth - margin, 15, { align: 'right' });
    doc.setDrawColor(200);
    doc.line(margin, 18, pageWidth - margin, 18);
    
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text(title, margin, 30);
  };

  // PAGE 1: COVER
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(data.company.name || 'NOME IMPRESA', margin, 40);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(data.company.address || '', margin, 50);
  doc.text(`P.IVA: ${data.company.vat || ''}`, margin, 55);
  doc.text(`TEL: ${data.company.phone || ''}`, margin, 60);

  doc.setFontSize(40);
  doc.setFont('helvetica', 'bold');
  doc.text('Pi.M.U.S.', pageWidth / 2, 120, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Piano di Montaggio, Uso e Smontaggio', pageWidth / 2, 135, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100);
  doc.text('Conforme al D.Lgs 81/2008 e s.m.i. - Allegato XXII', pageWidth / 2, 145, { align: 'center' });

  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(margin, 160, pageWidth - margin, 160);

  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CANTIERE:', margin, 180);
  doc.setFont('helvetica', 'normal');
  doc.text(data.site.address || 'Non specificato', margin, 190);

  doc.setFont('helvetica', 'bold');
  doc.text('COMMITTENTE:', margin, 210);
  doc.setFont('helvetica', 'normal');
  doc.text(data.site.client || 'Non specificato', margin, 220);

  doc.setFontSize(10);
  doc.text(`Data: ${new Date().toLocaleDateString('it-IT')}`, margin, 270);

  // PAGE 2: INDEX
  doc.addPage();
  drawHeader('Sommario / Indice', 2);
  
  const indexItems = [
    { title: "1. Identificazione dei Soggetti", page: "4" },
    { title: "2. Identificazione del Ponteggio", page: "4" },
    { title: "3. Pianta di Cantiere e Inquadramento", page: "3" },
    { title: "4. ALLEGATO A: Libretto Tecnico e Schemi", page: "5" },
    { title: "5. Procedure Operative e Sicurezza", page: "6" },
    { title: "Appendice A: Verifiche degli Elementi", page: "Ultima" },
  ];

  let y = 50;
  indexItems.forEach(item => {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(item.title, margin, y);
    doc.text(`pag. ${item.page}`, pageWidth - margin, y, { align: 'right' });
    doc.setDrawColor(200);
    doc.setLineDashPattern([1, 2], 0);
    doc.line(margin + doc.getTextWidth(item.title) + 5, y - 1, pageWidth - margin - 20, y - 1);
    doc.setLineDashPattern([], 0);
    y += 15;
  });

  // PAGE 3: SITE PLAN
  doc.addPage();
  drawHeader('3. Pianta di Cantiere e Inquadramento Facciate', 3);
  
  if (data.site.sitePlan) {
    try {
      const imgProps = doc.getImageProperties(data.site.sitePlan);
      const imgW = pageWidth - 2 * margin;
      const imgH = (imgProps.height * imgW) / imgProps.width;
      
      doc.addImage(data.site.sitePlan, 'JPEG', margin, 50, imgW, imgH, undefined, 'FAST');
      
      (data.site.planMarkers || []).forEach(marker => {
        const mx = margin + (marker.x / 800) * imgW;
        const my = 50 + (marker.y / 600) * imgH;
        
        doc.setFillColor(0, 0, 0);
        doc.circle(mx, my, 4, 'F');
        doc.setFontSize(10);
        doc.setTextColor(255);
        doc.text(marker.label.toString(), mx, my + 1, { align: 'center', baseline: 'middle' });
        doc.setTextColor(0);
      });
    } catch (e) {
      console.error("Error adding site plan image", e);
      doc.setFontSize(10);
      doc.text("Errore nel caricamento della pianta di cantiere.", margin, 50);
    }
  } else {
    doc.setFontSize(10);
    doc.text("Nessuna pianta caricata.", margin, 50);
  }

  // PAGE 4: ADMINISTRATIVE
  doc.addPage();
  drawHeader('1. Identificazione dei Soggetti', 4);
  
  y = 45;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('1.1 Redattore del PiMUS', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.site.manager || "NON SPECIFICATO", margin, y + 6);
  
  y += 20;
  doc.setFont('helvetica', 'bold');
  doc.text('1.2 Datore di Lavoro (Ditta Esecutrice)', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`Ragione Sociale: ${data.site.employer || data.company.name}`, margin, y + 6);
  doc.text(`Codice Fiscale / P.IVA: ${data.site.employerTaxCode || data.company.vat}`, margin, y + 12);
  doc.text(`Sede Legale: ${data.site.employerAddress || data.company.address}`, margin, y + 18);

  y += 30;
  doc.setFont('helvetica', 'bold');
  doc.text('1.3 Squadra Addetta alle Operazioni', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`Preposto al Montaggio: ${data.scaffolding.preposto || "NON SPECIFICATO"}`, margin, y + 6);
  doc.text('Lavoratori Addetti:', margin, y + 12);
  data.team.filter(m => m).forEach((member, i) => {
    doc.text(`- ${member}`, margin + 5, y + 18 + (i * 6));
  });

  y += 30 + (data.team.filter(m => m).length * 6);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Identificazione del Ponteggio', margin, y);
  
  y += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tipologia Sistema: ${data.scaffolding.type}`, margin, y);
  doc.text(`Marca e Modello: ${data.scaffolding.brand} ${data.scaffolding.model}`, margin, y + 6);
  doc.text(`Dimensioni Modulo: ${data.scaffolding.moduleWidth}m (L) x ${data.scaffolding.moduleHeight}m (H)`, margin, y + 12);
  doc.text(`Altezza Massima: ${data.scaffolding.maxHeight} m`, margin, y + 18);
  doc.text(`Messa a Terra: ${data.scaffolding.earthingSystem}`, margin, y + 24);
  
  let dotazioni = [];
  if (data.scaffolding.hasShadingNet) dotazioni.push("Rete oscurante");
  if (data.scaffolding.hasNightLights) dotazioni.push("Luci notturne");
  doc.text(`Dotazioni Speciali: ${dotazioni.join(', ') || 'Nessuna'}`, margin, y + 30);

  // PAGE 5: ALLEGATO A (SCHEMI)
  let pageNum = 5;
  data.scaffolding.facades.forEach((facade, index) => {
    doc.addPage();
    drawHeader(`ALLEGATO A: Schema Facciata ${facade.name}`, pageNum++);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Dimensioni: ${facade.width}m x ${facade.height}m`, margin, 40);

    if (facade.photo && facade.overlayConfig) {
      try {
        const imgW = pageWidth - 2 * margin;
        const imgH = (facade.overlayConfig.stageHeight / facade.overlayConfig.stageWidth) * imgW;
        
        doc.addImage(facade.photo, 'JPEG', margin, 50, imgW, imgH, undefined, 'FAST');
        
        // Draw Scaffolding Grid
        const scaleX = imgW / facade.overlayConfig.stageWidth;
        const scaleY = imgH / facade.overlayConfig.stageHeight;
        
        const startX = margin + facade.overlayConfig.x * scaleX;
        const startY = 50 + facade.overlayConfig.y * scaleY;
        const gridW = facade.overlayConfig.width * scaleX;
        const gridH = facade.overlayConfig.height * scaleY;

        doc.setDrawColor(239, 68, 68); // Red
        doc.setLineWidth(0.5);

        const numCols = Math.ceil(facade.width / data.scaffolding.moduleWidth);
        const numRows = Math.ceil(facade.height / data.scaffolding.moduleHeight);
        const colWidth = gridW / numCols;
        const rowHeight = gridH / numRows;

        // Verticals
        for (let c = 0; c <= numCols; c++) {
          const x = startX + c * colWidth;
          doc.line(x, startY, x, startY + gridH);
        }

        // Horizontals
        for (let r = 0; r <= numRows; r++) {
          const y = startY + r * rowHeight;
          doc.line(startX, y, startX + gridW, y);
        }

        // Anchors
        facade.anchors.forEach((anchor, i) => {
          const ax = startX + (anchor.x / facade.overlayConfig!.width) * gridW;
          const ay = startY + (anchor.y / facade.overlayConfig!.height) * gridH;
          
          doc.setFillColor(16, 185, 129); // Emerald
          doc.circle(ax, ay, 3, 'F');
          doc.setTextColor(255);
          doc.setFontSize(8);
          doc.text((i + 1).toString(), ax, ay + 1, { align: 'center', baseline: 'middle' });
        });
        
        doc.setTextColor(0);

      } catch (e) {
        console.error("Error drawing facade", e);
      }
    } else {
      doc.text("Nessuna foto o schema disponibile per questa facciata.", margin, 50);
    }
  });

  // PAGE 6: SAFETY PROCEDURES
  doc.addPage();
  drawHeader('4. Procedure Operative e Misure di Sicurezza', pageNum++);
  
  // Parse HTML to plain text for jsPDF
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = data.safetyProcedures || '';
  
  let textY = 40;
  
  const processHtmlContent = (html: string) => {
    const parser = new DOMParser();
    const docHtml = parser.parseFromString(html, 'text/html');
    
    Array.from(docHtml.body.children).forEach(node => {
      if (textY > pageHeight - margin - 20) {
        doc.addPage();
        drawHeader('4. Procedure Operative e Misure di Sicurezza (Continua)', pageNum++);
        textY = 40;
      }

      if (node.tagName === 'H3') {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        const text = node.textContent?.trim() || '';
        const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
        doc.text(lines, margin, textY);
        textY += lines.length * 6 + 4;
      } else if (node.tagName === 'P') {
        // Handle paragraphs with potential bold text and line breaks
        const htmlContent = node.innerHTML || '';
        const parts = htmlContent.split(/<br\s*\/?>/i);
        
        parts.forEach(part => {
          const cleanText = part.replace(/<[^>]*>?/gm, '').trim();
          if (cleanText) {
            if (part.includes('<strong>') || part.includes('<b>')) {
               doc.setFont('helvetica', 'bold');
            } else {
               doc.setFont('helvetica', 'normal');
            }
            doc.setFontSize(10);
            const lines = doc.splitTextToSize(cleanText, pageWidth - 2 * margin);
            
            if (textY + lines.length * 5 > pageHeight - margin - 10) {
              doc.addPage();
              drawHeader('4. Procedure Operative e Misure di Sicurezza (Continua)', pageNum++);
              textY = 40;
            }
            
            doc.text(lines, margin, textY, { align: 'justify', maxWidth: pageWidth - 2 * margin });
            textY += lines.length * 5 + 2;
          }
        });
        textY += 4; // Paragraph spacing
      }
    });
  };

  processHtmlContent(data.safetyProcedures || '');

  // PAGE 7: CHECKLIST
  doc.addPage();
  drawHeader('Appendice A: Verifiche degli Elementi', pageNum++);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('Verifiche da effettuare prima del montaggio (Allegato XIX D.Lgs 81/08)', margin, 40);
  
  const tableData = [
    ['Generale', 'Controllo esistenza libretto ministeriale', 'OK'],
    ['Telaio', 'Controllo marchio e stato di conservazione', 'OK'],
    ['Correnti/Diagonali', 'Controllo linearità e attacchi', 'OK'],
    ['Impalcati', 'Controllo orizzontalità e dispositivi blocco', 'OK'],
    ['Basette', 'Controllo filettatura e stelo', 'OK'],
    ['Ancoraggi', 'Controllo efficienza e serraggio', 'OK'],
  ];

  autoTable(doc, {
    startY: 50,
    head: [['Elemento', 'Tipo di Verifica', 'Esito']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [244, 244, 245], textColor: [0, 0, 0], fontStyle: 'bold' },
    columnStyles: {
      0: { fontStyle: 'bold' },
      2: { textColor: [16, 185, 129], fontStyle: 'bold', halign: 'center' }
    },
    margin: { left: margin, right: margin }
  });

  // Signatures
  const ty = (doc as any).lastAutoTable.finalY + 30;
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.text('Firma del Preposto', margin, ty);
  doc.text('Firma Datore di Lavoro', margin + 90, ty);
  
  doc.setFont('helvetica', 'normal');
  doc.text(data.scaffolding.preposto || "NON SPECIFICATO", margin, ty + 20);
  doc.text(data.site.employer || data.company.name || "NON SPECIFICATO", margin + 90, ty + 20);

  // Output
  window.open(URL.createObjectURL(doc.output('blob')), '_blank');
};
