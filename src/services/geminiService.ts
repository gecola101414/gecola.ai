import { GoogleGenAI } from "@google/genai";

export async function generateSafetyProcedures(scaffoldingType: string, brand: string, model: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Genera una sezione professionale per un documento Pi.M.U.S. (Piano di Montaggio, Uso e Smontaggio) in italiano. 
    Il ponteggio è di tipo: ${scaffoldingType}, Marca: ${brand}, Modello: ${model}.
    
    IMPORTANTE: 
    - NON usare asterischi (*) per elenchi o grassetti. 
    - Per gli elenchi puntati, usa esclusivamente il carattere pallino (•) all'inizio di ogni riga.
    - Usa titoli chiari in maiuscolo per le sezioni.
    - Includi esplicitamente una frase che indichi: "Per il sistema di montaggio approfondito e le specifiche tecniche di dettaglio, si rimanda all'ALLEGATO A del presente documento."
    
    Includi:
    1. Descrizione generale del sistema.
    2. Procedure di montaggio in sicurezza.
    3. Dispositivi di Protezione Individuale (DPI) necessari.
    4. Verifiche da effettuare prima dell'uso.
    
    Usa un tono tecnico, autorevole e professionale.`,
  });

  return response.text;
}
