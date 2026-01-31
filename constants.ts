
import { Article, Category, ProjectInfo, PriceAnalysis } from './types';

export const REGIONS = [
  "Abruzzo", "Basilicata", "Calabria", "Campania", "Emilia-Romagna", 
  "Friuli-Venezia Giulia", "Lazio", "Liguria", "Lombardia", "Marche", 
  "Molise", "Piemonte", "Puglia", "Sardegna", "Sicilia", "Toscana", 
  "Trentino-Alto Adige", "Umbria", "Valle d'Aosta", "Veneto"
];

export const YEARS = ["2025", "2024", "2023", "2022"];

export const COMMON_UNITS = [
    'cad', 'm', 'm²', 'm³', 'kg', 'q', 't', 'h', 'cm', 'mm', 'l', 'a corpo'
];

export const VIVID_COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#10B981", "#06B6D4", 
  "#3B82F6", "#6366F1", "#8B5CF6", "#D946EF", "#EC4899",
  "#DC2626", "#D97706", "#059669", "#0891B2", "#2563EB",
  "#4F46E5", "#7C3AED", "#C026D3", "#DB2777", "#475569"
];

export const WBS_SUGGESTIONS = [
  "Allestimento e Sicurezza Cantiere",
  "Demolizioni e Rimozioni",
  "Scavi e Movimento Terra",
  "Fondazioni e Opere Interrate",
  "Strutture in Elevazione (C.A.)",
  "Strutture Metalliche",
  "Solai e Coperture",
  "Impermeabilizzazioni e Isolamenti",
  "Murature Perimetrali e Tamponamenti",
  "Tramezzature e Divisioni Interne",
  "Intonaci e Finiture Grezze",
  "Sottofondi e Massetti",
  "Pavimenti Interni ed Esterni",
  "Rivestimenti Bagni e Cucine",
  "Lattoneria e Smaltimento Acque",
  "Opere in Pietra e Marmi",
  "Infissi Esterni e Vetrate",
  "Porte e Infissi Interni",
  "Opere in Ferro e Carpenteria Leggera",
  "Ringhiere e Parapetti",
  "Impianto Idrico-Sanitario",
  "Impianto di Riscaldamento e Clima",
  "Impianto Elettrico e Domotico",
  "Impianto di Illuminazione Speciale",
  "Opere da Pittore e Tinteggiature",
  "Controsoffittature e Cartongesso",
  "Sistemazioni Esterne e Verde",
  "Recinzioni e Cancelli",
  "Oneri della Sicurezza (PSC)",
  "Assistenza Muraria Impianti",
  "Pulizia e Collaudo Finale"
];

export const LABOR_CATALOG = [
  { description: "Operaio Specializzato", unit: "h", price: 35.50 },
  { description: "Operaio Qualificato", unit: "h", price: 32.15 },
  { description: "Operaio Comune", unit: "h", price: 28.30 },
  { description: "Capocantiere / Tecnico IV liv.", unit: "h", price: 42.00 },
  { description: "Autista / Meccanico", unit: "h", price: 33.50 }
];

export const EQUIPMENT_CATALOG = [
  { description: "Escavatore cingolato 15-20t", unit: "h", price: 55.00 },
  { description: "Mini-escavatore 1.5t", unit: "h", price: 25.00 },
  { description: "Gru a torre braccio 40-50m", unit: "h", price: 38.00 },
  { description: "Autocarro ribaltabile 10t", unit: "h", price: 32.00 },
  { description: "Pompa per calcestruzzo braccio 24m", unit: "h", price: 110.00 },
  { description: "Ponteggio metallico (Noleggio/Mese)", unit: "mq", price: 1.80 },
  { description: "Betoniera a bicchiere", unit: "h", price: 4.50 },
  { description: "Motocompressore 3000 l/min", unit: "h", price: 12.00 },
  { description: "Trabattello in alluminio h 6m", unit: "h", price: 3.50 }
];

export const MATERIAL_CATALOG = [
  { description: "Calcestruzzo C25/30 XC2 Rck 30", unit: "m³", price: 125.00 },
  { description: "Calcestruzzo C30/37 XC3 Rck 37", unit: "m³", price: 138.00 },
  { description: "Malta cementizia M5 (sacco 25kg)", unit: "cad", price: 4.50 },
  { description: "Acciaio B450C in barre per armatura", unit: "kg", price: 1.15 },
  { description: "Rete elettrosaldata Ø6 10x10", unit: "kg", price: 1.35 },
  { description: "Blocchi laterizio forato sp. 8cm", unit: "m²", price: 12.50 },
  { description: "Blocchi laterizio forato sp. 12cm", unit: "m²", price: 15.80 },
  { description: "Intonaco premiscelato base calce/cem", unit: "kg", price: 0.32 },
  { description: "Pittura lavabile per interni (fustino 14l)", unit: "cad", price: 65.00 },
  { description: "Collante cementizio per pavimenti C2TE", unit: "kg", price: 0.85 },
  { description: "Gres porcellanato standard 30x60", unit: "m²", price: 24.00 },
  { description: "Pannello recinzione mobile 2.00x3.50m", unit: "cad", price: 45.00 },
  { description: "Basamento in calcestruzzo per recinzione", unit: "cad", price: 8.50 }
];

export const REBAR_WEIGHTS = [
  { diameter: 6, weight: 0.222 }, { diameter: 8, weight: 0.395 }, { diameter: 10, weight: 0.617 },
  { diameter: 12, weight: 0.888 }, { diameter: 14, weight: 1.208 }, { diameter: 16, weight: 1.578 },
  { diameter: 18, weight: 1.998 }, { diameter: 20, weight: 2.466 }, { diameter: 22, weight: 2.984 },
  { diameter: 24, weight: 3.551 }, { diameter: 26, weight: 4.168 }, { diameter: 28, weight: 4.834 },
  { diameter: 30, weight: 5.549 }, { diameter: 32, weight: 6.313 }
];

export const SOA_CATEGORIES = [
    { code: 'OG1', desc: 'Edifici civili e industriali' },
    { code: 'OG2', desc: 'Restauro e manutenzione beni immobili' },
    { code: 'OG3', desc: 'Strade, autostrade, ponti, viadotti' },
    { code: 'OS1', desc: 'Lavori in terra' },
    { code: 'OS3', desc: 'Impianti idrico-sanitario, cucine, lavanderie' },
    { code: 'OS6', desc: 'Finiture di opere generali in materiali lignei, plastici, metallici e vetrosi' },
    { code: 'OS7', desc: 'Finiture di opere generali di natura edile e tecnica' },
    { code: 'OS28', desc: 'Impianti termici e di condizionamento' },
    { code: 'OS30', desc: 'Impianti interni elettrici, telefonici, radiotelefonici e televisivi' }
];

export const PROJECT_INFO: ProjectInfo = {
  title: 'Nuovo Progetto Edile Professionale',
  client: 'Nome Committente',
  designer: 'Ing. Domenico Gimondo',
  location: 'Località Cantiere',
  date: new Date().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }),
  priceList: 'Prezzario Regionale 2025', 
  region: 'Lombardia',
  year: '2025',
  vatRate: 10,
  safetyRate: 3.5,
  fontSizeTitle: 28,
  fontSizeClient: 15,
  fontSizeTotals: 22,
  tariffColumnWidth: 135,
  fontSizeMeasurements: 12,
  fontSizeWbsSidebar: 14,
};

export const CATEGORIES: Category[] = [
  // 6 WBS SIGNIFICATIVE LAVORI
  { code: 'WBS.01', name: 'Apprestamenti e Impianto di Cantiere', isEnabled: true, isLocked: false, type: 'work' },
  { code: 'WBS.02', name: 'Demolizioni, Rimozioni e Scavi', isEnabled: true, isLocked: false, type: 'work' },
  { code: 'WBS.03', name: 'Opere Murarie, Tramezzi e Sottofondi', isEnabled: true, isLocked: false, type: 'work' },
  { code: 'WBS.04', name: 'Impianti Idrico-Termici, Clima e Gas', isEnabled: true, isLocked: false, type: 'work' },
  { code: 'WBS.05', name: 'Impianti Elettrici, Domotici e Speciali', isEnabled: true, isLocked: false, type: 'work' },
  { code: 'WBS.06', name: 'Finiture Interne, Esterne e Serramenti', isEnabled: true, isLocked: false, type: 'work' },
  
  // 5 WBS SIGNIFICATIVE SICUREZZA (PSC)
  { code: 'S.01', name: 'PSC - Recinzioni, Accessi e Segnaletica', isEnabled: true, isLocked: false, type: 'safety' },
  { code: 'S.02', name: 'PSC - Protezioni Collettive (Ponteggi, Parapetti)', isEnabled: true, isLocked: false, type: 'safety' },
  { code: 'S.03', name: 'PSC - Apprestamenti Igienico-Assistenziali', isEnabled: true, isLocked: false, type: 'safety' },
  { code: 'S.04', name: 'PSC - Impianti di Cantiere e Messa a Terra', isEnabled: true, isLocked: false, type: 'safety' },
  { code: 'S.05', name: 'PSC - Misure Preventive e Primo Soccorso', isEnabled: true, isLocked: false, type: 'safety' },
];

export const INITIAL_ARTICLES: Article[] = [];

export const INITIAL_ANALYSES: PriceAnalysis[] = [];
