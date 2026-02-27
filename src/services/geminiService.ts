import { GoogleGenAI } from "@google/genai";

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
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Genera una sezione professionale per un documento Pi.M.U.S. (Piano di Montaggio, Uso e Smontaggio) in italiano, conforme al D.Lgs 81/08, seguendo rigorosamente la struttura di un modello professionale.
    
    Dati del Progetto:
    - Ponteggio: ${scaffoldingType}, Marca: ${brand}, Modello: ${model}.
    - Dimensioni Modulo: ${moduleWidth}m (larghezza) x ${moduleHeight}m (altezza).
    - Componenti speciali: ${specialPieces || 'Nessuna specifica'}.
    - Dotazioni: ${hasShadingNet ? 'Rete oscurante' : 'Nessuna rete'}, ${hasNightLights ? 'Luci notturne' : 'Nessuna luce'}.
    - Preposto: ${preposto}.
    - Datore di Lavoro: ${employer}, Sede: ${employerAddress}, CF/PIVA: ${employerTaxCode}.
    
    Specifiche Tecniche:
    - Terreno: ${soilType}
    - Ripartizione carichi: ${baseElements}
    - Messa a terra: ${earthingSystem}
    - Segnaletica: ${signage.join(', ')}
    
    STRUTTURA DEL DOCUMENTO RICHIESTA (Sii estremamente dettagliato):
    
    1. IDENTIFICAZIONE DEL PONTEGGIO E DELL'OPERA SERVITA
       - Descrizione generale dell'opera e del contesto.
       - Dati tecnici del ponteggio (modello, autorizzazione ministeriale, proprietà).
       - Descrizione fisica (impalcati, stilate, distanze dal muro).
    
    2. INDICAZIONI GENERALI PER LE OPERAZIONI DI MONTAGGIO, TRASFORMAZIONE E SMONTAGGIO
       - Allestimento cantiere.
       - Modalità e regole generali di montaggio (tracciamento, prima campata, verticalità).
       - Verifica e controllo del piano di appoggio (stabilità, compattazione).
    
    3. SISTEMI DI ANCORAGGIO (Descrizione tecnica approfondita)
       - Realizzazione ancoraggi a cravatta, a tassello, a vitone e ad anello.
       - Criteri di scelta e posizionamento.
    
    4. MISURE DI SICUREZZA DA ADOTTARE (Analisi dei rischi)
       - Caduta materiale dall'alto, caduta di persone, meteo avverso.
       - Movimentazione manuale dei carichi, effetto pendolo, linee elettriche.
       - Sospensione inerte del lavoratore (patologia dell'imbracatura).
    
    5. DESCRIZIONE DEI DPI E DPC UTILIZZATI
       - Linee vita, connettori, cordini, cinture, imbracature, guanti, scarpe, elmetti.
       - Modalità di uso e manutenzione.
    
    6. ATTREZZATURE DI CANTIERE
       - Argano elettrico, chiavi, martelli, trapani, livella, chiave dinamometrica.
    
    7. ISTRUZIONI OPERATIVE PASSO-PASSO (Montaggio e Smontaggio)
       - Sequenza logica (Step A, B, C...) per montaggio e smontaggio impalcati.
    
    8. REGOLE DA APPLICARE DURANTE L'USO DEL PONTEGGIO
       - Accesso, deposito materiali, trasformazioni non autorizzate.
    
    IMPORTANTE: 
    - NON usare asterischi (*) o cancelletti (#). 
    - Per gli elenchi, usa il carattere pallino (•).
    - Usa titoli in MAIUSCOLO.
    - Includi la frase: "Per gli schemi grafici di dettaglio e il calcolo degli ancoraggi, si rimanda all'ALLEGATO A (Libretto Tecnico del Ponteggio) inserito nel corpo della presente relazione."
    - Il tono deve essere tecnico, autorevole e il contenuto deve essere LUNGO ed ESAUSTIVO (almeno 2000 parole).`,
  });

  return response.text;
}
