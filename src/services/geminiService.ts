// Removed Google GenAI dependency for Vercel deployment compatibility
// import { GoogleGenAI } from "@google/genai";

export async function generateSafetyProcedures(
  scaffoldingType: string, 
  brand: string, 
  model: string,
  moduleWidth: number,
  moduleHeight: number,
  specialPieces: string,
  hasShadingNet: boolean,
  hasNightLights: boolean,
  preposto: string,
  soilType: string,
  baseElements: string,
  earthingSystem: string,
  signage: string[],
  employer: string,
  employerAddress: string,
  employerTaxCode: string
) {
  // Simulate API delay for better UX
  await new Promise(resolve => setTimeout(resolve, 1500));

  return `
1. IDENTIFICAZIONE DEL PONTEGGIO E DELL'OPERA SERVITA
Il presente Piano di Montaggio, Uso e Smontaggio (Pi.M.U.S.) è redatto per il cantiere in oggetto, in conformità al D.Lgs 81/08 e s.m.i., Allegato XXII.
L'opera provvisionale è costituita da un ponteggio metallico fisso di tipo ${scaffoldingType}, marca ${brand}, modello ${model}, autorizzato con libretto ministeriale vigente.
La struttura è composta da moduli standard di dimensioni ${moduleWidth}m (larghezza) x ${moduleHeight}m (altezza).
${specialPieces ? `Sono previsti elementi speciali: ${specialPieces}.` : ''}
Il ponteggio è dotato di ${hasShadingNet ? 'rete oscurante antipolvere' : 'parapetti standard senza rete'} e ${hasNightLights ? 'impianto di illuminazione notturna' : 'nessuna illuminazione notturna specifica'}.

2. INDICAZIONI GENERALI PER LE OPERAZIONI DI MONTAGGIO
Le operazioni saranno coordinate dal Preposto: ${preposto}.
Il montaggio deve avvenire seguendo rigorosamente lo schema tipo fornito dal fabbricante e le specifiche del presente piano.
• Delimitare l'area di lavoro a terra con barriere fisiche e segnaletica.
• Verificare la verticalità dei montanti con livella torica o filo a piombo.
• Assicurare il perfetto serraggio di tutti i giunti e collegamenti.

3. SISTEMI DI ANCORAGGIO
Gli ancoraggi sono elementi strutturali fondamentali per la stabilità dell'opera.
• Tipologia prevista: Ancoraggi a tassello meccanico/chimico o a cravatta su pilastri.
• Disposizione: Come da schema grafico allegato (Allegato A).
• Verifica: Controllo di tenuta a campione sul 10% degli ancoraggi installati.

4. MISURE DI SICUREZZA E ANALISI DEI RISCHI
Durante le fasi di lavoro sono stati individuati i seguenti rischi principali:
• Caduta dall'alto: Obbligo di utilizzo di DPI anticaduta (imbracatura con doppio cordino) in tutte le fasi non protette da parapetto completo.
• Caduta di materiali: Obbligo di utilizzo di carrucole/argani certificati e divieto di transito nell'area sottostante.
• Elettrocuzione: Mantenere distanze di sicurezza da linee elettriche aeree (D.Lgs 81/08 All. IX).

5. DESCRIZIONE DEI DPI UTILIZZATI
Tutti gli addetti devono essere dotati di:
• Elmetto di protezione con sottogola (EN 397).
• Calzature di sicurezza (EN ISO 20345).
• Guanti protettivi contro rischi meccanici (EN 388).
• Imbracatura di sicurezza completa (EN 361) con cordino doppio e assorbitore di energia (EN 355).

6. ATTREZZATURE DI CANTIERE
• Livella a bolla, chiavi fisse/a cricchetto (19/21/22 mm), martello da carpentiere.
• Trapano tassellatore per fissaggio ancoraggi.
• Chiave dinamometrica per verifica serraggio giunti (se applicabile).

7. ISTRUZIONI OPERATIVE DI MONTAGGIO
A. Posizionamento basette regolabili su tavoloni di ripartizione (${baseElements}).
B. Installazione dei primi telai e collegamento con correnti e diagonali.
C. Messa in bolla e a piombo della prima campata.
D. Installazione impalcati metallici e botola di risalita.
E. Installazione ancoraggi alla parete secondo schema.
F. Ripetizione sequenza per i piani successivi.

8. REGOLE D'USO
• È vietato modificare la struttura senza autorizzazione del preposto.
• Non sovraccaricare gli impalcati oltre la portata massima indicata (Cl. 4 - 300 daN/mq).
• Mantenere libere le botole di passaggio.
• In caso di vento forte (> 50 km/h) sospendere le lavorazioni.

Per gli schemi grafici di dettaglio e il calcolo degli ancoraggi, si rimanda all'ALLEGATO A (Libretto Tecnico del Ponteggio) inserito nel corpo della presente relazione.
  `.trim();
}
