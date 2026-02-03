
import { Article, Category, ProjectInfo, Measurement } from '../types';

const formatNumber = (val: number | undefined) => {
  if (val === undefined || val === null || val === 0) return '';
  return val.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const generateComputoExcel = (projectInfo: ProjectInfo, categories: Category[], articles: Article[]) => {
  const fileName = `${projectInfo.title.replace(/\s+/g, '_')}_Computo.xls`;

  // Stili CSS per Excel (HTML format "Old School")
  const style = `
    <style>
      .header { background-color: #2c3e50; color: #ffffff; font-weight: bold; border: 0.5pt solid #000; }
      .wbs-row { background-color: #f1f5f9; font-weight: bold; border: 0.5pt solid #000; }
      .art-row { font-weight: bold; border: 0.5pt solid #000; }
      .meas-row { color: #475569; font-style: italic; border: 0.5pt solid #cbd5e1; }
      .num { mso-number-format:"\\#\\,\\#\\#0\\.00"; text-align: right; border: 0.5pt solid #cbd5e1; }
      .total-row { font-weight: bold; border-top: 1.5pt solid #000; background-color: #f8fafc; }
      .money { mso-number-format:"\\#\\,\\#\\#0\\.00"; text-align: right; color: #1e40af; font-weight: bold; border: 0.5pt solid #cbd5e1; }
      td { border: 0.5pt solid #cbd5e1; vertical-align: top; }
    </style>
  `;

  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8" />${style}</head>
    <body>
      <table>
        <tr><th colspan="10" style="font-size: 16pt; font-weight: bold;">COMPUTO METRICO ESTIMATIVO</th></tr>
        <tr><th colspan="10" style="text-align: left;">Progetto: ${projectInfo.title}</th></tr>
        <tr><th colspan="10" style="text-align: left;">Committente: ${projectInfo.client}</th></tr>
        <tr><th colspan="10" style="text-align: left;">Listino: ${projectInfo.region} ${projectInfo.year}</th></tr>
        <tr><td colspan="10"></td></tr>
        <tr class="header">
          <th>N.ORD</th>
          <th>TARIFFA</th>
          <th>DESIGNAZIONE DEI LAVORI</th>
          <th>PAR.UG.</th>
          <th>LUNG.</th>
          <th>LARG.</th>
          <th>H/PESO</th>
          <th>QUANTITÀ</th>
          <th>UNITARIO</th>
          <th>TOTALE</th>
        </tr>
  `;

  categories.forEach(cat => {
    if (cat.isEnabled === false) return;
    const catArticles = articles.filter(a => a.categoryCode === cat.code);
    if (catArticles.length === 0) return;

    // Riga WBS
    html += `
      <tr class="wbs-row">
        <td colspan="10" style="height: 25pt; vertical-align: middle; font-size: 11pt;">${cat.code} - ${cat.name.toUpperCase()}</td>
      </tr>
    `;

    catArticles.forEach((art, artIdx) => {
      const wbsNum = cat.code.replace(/[^0-9]/g, '');
      const artNum = `${parseInt(wbsNum) || '0'}.${artIdx + 1}`;

      // Riga Articolo
      html += `
        <tr class="art-row">
          <td style="text-align: center;">${artNum}</td>
          <td>${art.code}</td>
          <td>${art.description}</td>
          <td colspan="4"></td>
          <td></td>
          <td class="num">${formatNumber(art.unitPrice)}</td>
          <td></td>
        </tr>
      `;

      // Righe Misure
      art.measurements.forEach(m => {
        const sign = m.type === 'deduction' ? -1 : 1;
        let rowVal = 0;
        if (m.type !== 'subtotal') {
            const mult = m.multiplier === undefined ? 1 : m.multiplier;
            const l = m.length || 1;
            const w = m.width || 1;
            const h = m.height || 1;
            const hasLocalData = m.length || m.width || m.height;
            const base = hasLocalData ? (l * w * h) : 0;
            const effectiveBase = (!hasLocalData && mult !== 0) ? 1 : base;
            rowVal = effectiveBase * mult * sign;
        }

        html += `
          <tr class="meas-row">
            <td></td>
            <td></td>
            <td style="${m.type === 'deduction' ? 'color: red;' : ''}">${m.type === 'subtotal' ? 'Sommano parziale' : m.description}</td>
            <td class="num">${formatNumber(m.multiplier)}</td>
            <td class="num">${formatNumber(m.length)}</td>
            <td class="num">${formatNumber(m.width)}</td>
            <td class="num">${formatNumber(m.height)}</td>
            <td class="num">${formatNumber(rowVal)}</td>
            <td></td>
            <td></td>
          </tr>
        `;
      });

      // Totale Articolo
      html += `
        <tr class="total-row">
          <td colspan="2"></td>
          <td style="text-align: right; padding-right: 5pt;">SOMMANO ${art.unit.toUpperCase()}</td>
          <td colspan="4"></td>
          <td class="num" style="font-weight: bold;">${formatNumber(art.quantity)}</td>
          <td class="num">${formatNumber(art.unitPrice)}</td>
          <td class="money">${formatNumber(art.quantity * art.unitPrice)}</td>
        </tr>
        <tr><td colspan="10" style="border: none; height: 10pt;"></td></tr>
      `;
    });
  });

  html += `
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
