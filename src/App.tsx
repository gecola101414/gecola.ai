/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';
import { 
  FileText, 
  Building2, 
  MapPin, 
  Construction, 
  Image as ImageIcon, 
  Eye, 
  Download,
  Plus,
  Camera,
  Trash2,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Upload,
  Save,
  FolderOpen,
  FileDown,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { PiMUSData, FacadeInfo, AnchorPoint, SiteInfo, PlanMarker } from './types';
import { generateSafetyProcedures } from './services/geminiService';
import { BasePlateDiagram, GuardrailDiagram, AnchorDiagram, EarthingDiagram } from './components/ScaffoldingDiagrams';
import { ScaffoldingOverlay } from './components/ScaffoldingOverlay';
import { SitePlanOverlay } from './components/SitePlanOverlay';
import { SOIL_TYPES, BASE_ELEMENTS, EARTHING_SYSTEMS } from './constants';

// --- Components ---

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick,
  completed 
}: { 
  icon: any, 
  label: string, 
  active: boolean, 
  onClick: () => void,
  completed?: boolean
}) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 border-r-2",
      active 
        ? "bg-zinc-900 text-white border-white" 
        : "text-zinc-500 border-transparent hover:bg-zinc-100 hover:text-zinc-900"
    )}
  >
    <Icon size={18} className={active ? "text-white" : "text-zinc-400"} />
    <span className="flex-1 text-left">{label}</span>
    {completed && !active && <CheckCircle2 size={14} className="text-emerald-500" />}
  </button>
);

export default function App() {
  const [activeStep, setActiveStep] = useState<'company' | 'site' | 'scaffolding' | 'facades' | 'preview'>('company');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [data, setData] = useState<PiMUSData>({
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    company: { name: '', address: '', vat: '', phone: '', email: '' },
    site: { address: '', client: '', manager: '', startDate: '', employer: '', employerAddress: '', employerTaxCode: '', sitePlan: '' },
    team: [''],
    scaffolding: { 
      type: 'Telai prefabbricati', 
      brand: '', 
      model: '', 
      maxHeight: 0, 
      moduleWidth: 1.80,
      moduleHeight: 2.00,
      specialPieces: '',
      hasShadingNet: false,
      hasNightLights: true,
      preposto: '',
      facades: [],
      soilType: 'Terreno compatto/Asfalto',
      baseElements: 'Basette regolabili e tavoloni in legno S10',
      earthingSystem: 'Collegamento a terra tramite picchetti in rame',
      signage: ['Cartello di cantiere', 'Segnaletica di divieto', 'Luci notturne']
    },
    safetyProcedures: ''
  });

  const updateCompany = (field: string, value: string) => {
    setData(prev => ({ ...prev, company: { ...prev.company, [field]: value } }));
  };

  const updateSite = (field: keyof SiteInfo, value: any) => {
    setData(prev => ({ ...prev, site: { ...prev.site, [field]: value } }));
  };

  const handleUpdatePlanMarkers = (markers: PlanMarker[]) => {
    setData(prev => {
      const currentFacades = prev.scaffolding.facades;
      const newFacades = [...currentFacades];
      
      // Ensure each marker has a facadeId and the facade exists
      const updatedMarkers = markers.map((marker, index) => {
        let facadeId = marker.facadeId;
        if (!facadeId || !newFacades.find(f => f.id === facadeId)) {
          facadeId = Math.random().toString(36).substr(2, 9);
          newFacades.push({
            id: facadeId,
            name: `Facciata ${marker.label || index + 1}`,
            width: 0,
            height: 0,
            anchors: [],
            erasedPaths: []
          });
        }
        return { ...marker, facadeId };
      });

      // Remove facades that no longer have a corresponding marker
      const markerFacadeIds = updatedMarkers.map(m => m.facadeId);
      const filteredFacades = newFacades.filter(f => markerFacadeIds.includes(f.id));

      return {
        ...prev,
        site: { ...prev.site, planMarkers: updatedMarkers },
        scaffolding: { ...prev.scaffolding, facades: filteredFacades }
      };
    });
  };

  const handleSaveProject = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PiMUS_${data.site.address || 'Progetto'}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const loadedData = JSON.parse(event.target?.result as string);
          setData(loadedData);
        } catch (err) {
          alert("Errore nel caricamento del file. Assicurati che sia un file JSON valido di PiMUS Pro.");
        }
      };
      reader.readAsText(file);
    }
  };

  const updateScaffolding = (field: string, value: any) => {
    setData(prev => ({ ...prev, scaffolding: { ...prev.scaffolding, [field]: value } }));
  };

  const addFacade = () => {
    const newFacade: FacadeInfo = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Facciata ${data.scaffolding.facades.length + 1}`,
      width: 0,
      height: 0,
      anchors: [],
      erasedPaths: []
    };
    setData(prev => ({
      ...prev,
      scaffolding: {
        ...prev.scaffolding,
        facades: [...prev.scaffolding.facades, newFacade]
      }
    }));
  };

  const updateFacadeAnchors = (facadeId: string, anchors: AnchorPoint[]) => {
    setData(prev => ({
      ...prev,
      scaffolding: {
        ...prev.scaffolding,
        facades: prev.scaffolding.facades.map(f => 
          f.id === facadeId ? { ...f, anchors } : f
        )
      }
    }));
  };

  const removeFacade = (id: string) => {
    setData(prev => ({
      ...prev,
      scaffolding: {
        ...prev.scaffolding,
        facades: prev.scaffolding.facades.filter(f => f.id !== id)
      }
    }));
  };

  const updateFacade = (id: string, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      scaffolding: {
        ...prev.scaffolding,
        facades: prev.scaffolding.facades.map(f => f.id === id ? { ...f, [field]: value } : f)
      }
    }));
  };

  const handleGenerateProcedures = async () => {
    setIsGenerating(true);
    try {
      const procedures = await generateSafetyProcedures(
        data.scaffolding.type,
        data.scaffolding.brand,
        data.scaffolding.model,
        data.scaffolding.moduleWidth,
        data.scaffolding.moduleHeight,
        data.scaffolding.specialPieces,
        data.scaffolding.hasShadingNet,
        data.scaffolding.hasNightLights,
        data.scaffolding.preposto,
        data.scaffolding.soilType,
        data.scaffolding.baseElements,
        data.scaffolding.earthingSystem,
        data.scaffolding.signage || [],
        data.site.employer,
        data.site.employerAddress,
        data.site.employerTaxCode
      );
      // Clean up markdown artifacts but preserve bullet points (•)
      const cleanProcedures = (procedures || '')
        .replace(/\*/g, '')
        .replace(/#/g, '')
        .replace(/^- /gm, '• ') // Convert markdown dashes to dots if any
        .trim();
      
      setData(prev => ({ ...prev, safetyProcedures: cleanProcedures }));
      setActiveStep('preview');
    } catch (error) {
      console.error("Error generating procedures:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('pimus-document');
    if (!element) {
      alert("Documento non trovato");
      return;
    }

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(el => el.outerHTML)
      .join('\n');

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("ATTENZIONE: Il browser ha bloccato l'apertura del documento. Per scaricare il PDF, consenti i popup per questo sito (clicca sull'icona in alto a destra nella barra degli indirizzi) e riprova.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>PiMUS_${data.site.address || 'Progetto'}</title>
          ${styles}
          <style>
            @media print {
              @page { 
                margin: 15mm; 
                size: A4 portrait; 
              }
              body { 
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important; 
                margin: 0; 
                background: white; 
                padding-bottom: 15mm !important; /* Spazio per il piè di pagina */
              }
              #pimus-document { 
                box-shadow: none !important; 
                width: 100% !important; 
                max-width: 100% !important;
                margin: 0 !important; 
                padding: 0 !important;
              }
              
              /* Rimuove altezze fisse e padding che causano pagine bianche */
              .min-h-\\[1123px\\] { min-height: auto !important; height: auto !important; }
              .p-16 { padding: 0 !important; }
              
              /* Nasconde i piè di pagina hardcoded dell'anteprima */
              .absolute.bottom-16 { display: none !important; }
              
              /* Previene il taglio a metà di immagini, tabelle e blocchi */
              .page-break-before { page-break-before: always !important; }
              h1, h2, h3, h4, h5, h6 { page-break-after: avoid !important; break-after: avoid !important; }
              img, svg, canvas, .avoid-break, .bg-zinc-50, .border, table, tr, td, th, .facade-container { 
                page-break-inside: avoid !important; 
                break-inside: avoid !important; 
              }
              p, li, .safety-content p { 
                orphans: 4; 
                widows: 4; 
                page-break-inside: auto !important;
                break-inside: auto !important;
              }
              
              /* Piè di pagina fisso su ogni pagina stampata */
              .print-footer {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                height: 10mm;
                font-size: 8pt;
                color: #666;
                border-top: 1px solid #ccc;
                padding-top: 2mm;
                display: flex !important;
                justify-content: space-between;
                background: white;
                z-index: 1000;
                font-family: 'Inter', sans-serif;
                text-transform: uppercase;
                font-weight: bold;
              }
            }
            @media screen {
              .print-footer { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${element.outerHTML}
          <div class="print-footer">
            <span>Pi.M.U.S. - Cantiere: ${data.site.address || 'Non specificato'}</span>
            <span>Committente: ${data.site.client || 'Non specificato'}</span>
            <span>Data: ${new Date().toLocaleDateString('it-IT')}</span>
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
              }, 800);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const isStepComplete = (step: string) => {
    switch(step) {
      case 'company': return !!data.company.name && !!data.company.vat;
      case 'site': return !!data.site.address && !!data.site.client;
      case 'scaffolding': return !!data.scaffolding.brand && !!data.scaffolding.model;
      case 'facades': return data.scaffolding.facades.length > 0;
      default: return false;
    }
  };

  return (
    <div className="flex h-screen bg-zinc-50 font-sans text-zinc-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col">
        <div className="p-6 border-b border-zinc-100">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <Construction className="text-white" size={18} />
            </div>
            <h1 className="font-bold text-lg tracking-tight">PiMUS Pro</h1>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">Technical Scaffolding Manager</p>
        </div>

        <nav className="flex-1 py-4">
          <SidebarItem 
            icon={Building2} 
            label="Dati Impresa" 
            active={activeStep === 'company'} 
            onClick={() => setActiveStep('company')}
            completed={isStepComplete('company')}
          />
          <SidebarItem 
            icon={MapPin} 
            label="Dati Cantiere" 
            active={activeStep === 'site'} 
            onClick={() => setActiveStep('site')}
            completed={isStepComplete('site')}
          />
          <SidebarItem 
            icon={Construction} 
            label="Specifiche Ponteggio" 
            active={activeStep === 'scaffolding'} 
            onClick={() => setActiveStep('scaffolding')}
            completed={isStepComplete('scaffolding')}
          />
          <SidebarItem 
            icon={ImageIcon} 
            label="Facciate e Rilievi" 
            active={activeStep === 'facades'} 
            onClick={() => setActiveStep('facades')}
            completed={isStepComplete('facades')}
          />
          <div className="mt-8 px-4 space-y-2">
            <div className="h-px bg-zinc-100 mb-4" />
            <button
              onClick={handleSaveProject}
              className="w-full flex items-center gap-3 px-4 py-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-all text-sm font-medium"
            >
              <Save size={18} /> Salva Progetto
            </button>
            <label className="w-full flex items-center gap-3 px-4 py-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-all text-sm font-medium cursor-pointer">
              <FolderOpen size={18} /> Carica Progetto
              <input type="file" accept=".json" onChange={handleLoadProject} className="hidden" />
            </label>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloadingPdf}
              className="w-full flex items-center gap-3 px-4 py-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-wait"
            >
              {isDownloadingPdf ? <Loader2 className="animate-spin" size={18} /> : <FileDown size={18} />}
              {isDownloadingPdf ? "Generazione PDF..." : "Scarica PDF Relazione"}
            </button>
            <div className="h-px bg-zinc-100 my-4" />
            <SidebarItem 
              icon={Eye} 
              label="Anteprima PiMUS" 
              active={activeStep === 'preview'} 
              onClick={() => setActiveStep('preview')}
            />
          </div>
        </nav>

        <div className="p-4 bg-zinc-50 border-t border-zinc-200">
          <button 
            disabled={isGenerating || !isStepComplete('scaffolding')}
            onClick={handleGenerateProcedures}
            className="w-full bg-zinc-900 text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
            Genera Documento
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {activeStep === 'company' && (
              <motion.div
                key="company"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-1">Dati dell'Impresa</h2>
                  <p className="text-zinc-500 text-sm">Inserisci le informazioni legali dell'impresa esecutrice.</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">Ragione Sociale</label>
                    <input 
                      type="text" 
                      value={data.company.name}
                      onChange={(e) => updateCompany('name', e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                      placeholder="Esempio: Costruzioni S.r.l."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">Partita IVA / CF</label>
                    <input 
                      type="text" 
                      value={data.company.vat}
                      onChange={(e) => updateCompany('vat', e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">Sede Legale</label>
                    <input 
                      type="text" 
                      value={data.company.address}
                      onChange={(e) => updateCompany('address', e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">Telefono</label>
                    <input 
                      type="text" 
                      value={data.company.phone}
                      onChange={(e) => updateCompany('phone', e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">Email / PEC</label>
                    <input 
                      type="email" 
                      value={data.company.email}
                      onChange={(e) => updateCompany('email', e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="pt-8 border-t border-zinc-100">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-bold tracking-tight">Squadra di Lavoro e Preposto</h3>
                      <p className="text-zinc-500 text-xs">Indica il preposto e i lavoratori addetti al montaggio/smontaggio.</p>
                    </div>
                    <button 
                      onClick={() => setData(prev => ({ ...prev, team: [...prev.team, ''] }))}
                      className="flex items-center gap-2 text-xs font-bold text-zinc-900 hover:text-zinc-600 transition-colors"
                    >
                      <Plus size={14} />
                      AGGIUNGI ADDETTO
                    </button>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-xs font-bold text-zinc-900 mb-2 uppercase tracking-wider">Preposto al Montaggio</label>
                    <input 
                      type="text" 
                      value={data.scaffolding.preposto || ''}
                      onChange={(e) => setData(prev => ({ 
                        ...prev, 
                        scaffolding: { ...prev.scaffolding, preposto: e.target.value } 
                      }))}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-zinc-900 outline-none"
                      placeholder="Nome e Cognome del Preposto"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {data.team.map((member, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input 
                          type="text" 
                          value={member}
                          onChange={(e) => {
                            const newTeam = [...data.team];
                            newTeam[idx] = e.target.value;
                            setData(prev => ({ ...prev, team: newTeam }));
                          }}
                          className="flex-1 bg-white border border-zinc-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-zinc-900 outline-none"
                          placeholder={`Nome Addetto ${idx + 1}`}
                        />
                        <button 
                          onClick={() => setData(prev => ({ ...prev, team: prev.team.filter((_, i) => i !== idx) }))}
                          className="text-zinc-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end">
                  <button onClick={() => setActiveStep('site')} className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-zinc-800 transition-all">
                    Prossimo <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {activeStep === 'site' && (
              <motion.div
                key="site"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-1">Dati del Cantiere</h2>
                  <p className="text-zinc-500 text-sm">Specifica l'ubicazione e i responsabili dei lavori.</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">Indirizzo Cantiere</label>
                    <input 
                      type="text" 
                      value={data.site.address}
                      onChange={(e) => updateSite('address', e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">Committente</label>
                    <input 
                      type="text" 
                      value={data.site.client}
                      onChange={(e) => updateSite('client', e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">Redattore del PiMUS</label>
                    <input 
                      type="text" 
                      value={data.site.manager}
                      onChange={(e) => updateSite('manager', e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">Data Inizio Lavori</label>
                    <input 
                      type="date" 
                      value={data.site.startDate}
                      onChange={(e) => updateSite('startDate', e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="col-span-2 pt-4 border-t border-zinc-100">
                    <h3 className="text-sm font-bold mb-4">Identificazione Datore di Lavoro (Esecutore)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">Nominativo / Ragione Sociale</label>
                        <input 
                          type="text" 
                          value={data.site.employer}
                          onChange={(e) => updateSite('employer', e.target.value)}
                          className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">Codice Fiscale / P.IVA</label>
                        <input 
                          type="text" 
                          value={data.site.employerTaxCode}
                          onChange={(e) => updateSite('employerTaxCode', e.target.value)}
                          className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <label className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">Indirizzo Sede Legale</label>
                        <input 
                          type="text" 
                          value={data.site.employerAddress}
                          onChange={(e) => updateSite('employerAddress', e.target.value)}
                          className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                        />
                      </div>
                      <div className="col-span-2 space-y-4 pt-4 border-t border-zinc-100">
                        <label className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">Pianta di Cantiere (Inquadramento Facciate)</label>
                        <div className="space-y-4">
                          {!data.site.sitePlan ? (
                            <div className="flex items-center gap-4">
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      updateSite('sitePlan', reader.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="hidden"
                                id="site-plan-upload"
                              />
                              <label 
                                htmlFor="site-plan-upload"
                                className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-dashed border-zinc-200 rounded-xl p-8 cursor-pointer hover:border-zinc-900 transition-all"
                              >
                                <Upload size={24} className="text-zinc-400" />
                                <span className="text-sm font-medium text-zinc-600">
                                  Carica Pianta di Cantiere (Immagine)
                                </span>
                              </label>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <p className="text-xs text-zinc-500 italic">Posiziona le frecce per indicare le facciate sulla pianta</p>
                                <button 
                                  onClick={() => updateSite('sitePlan', undefined)}
                                  className="text-[10px] font-bold text-red-500 uppercase hover:underline"
                                >
                                  Rimuovi Pianta
                                </button>
                              </div>
                              <SitePlanOverlay 
                                image={data.site.sitePlan}
                                markers={data.site.planMarkers || []}
                                facades={data.scaffolding.facades}
                                onUpdateMarkers={handleUpdatePlanMarkers}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <button onClick={() => setActiveStep('company')} className="text-zinc-500 font-medium hover:text-zinc-900 transition-all">Indietro</button>
                  <button onClick={() => setActiveStep('scaffolding')} className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-zinc-800 transition-all">
                    Prossimo <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {activeStep === 'scaffolding' && (
              <motion.div
                key="scaffolding"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-1">Specifiche Tecniche</h2>
                  <p className="text-zinc-500 text-sm">Dettagli del sistema di ponteggio utilizzato.</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">Tipologia</label>
                    <select 
                      value={data.scaffolding.type}
                      onChange={(e) => updateScaffolding('type', e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                    >
                      <option>Telai prefabbricati</option>
                      <option>Tubo e giunto</option>
                      <option>Multidirezionale</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">Marca</label>
                    <input 
                      type="text" 
                      value={data.scaffolding.brand}
                      onChange={(e) => updateScaffolding('brand', e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                      placeholder="Esempio: Pilosio, Marcegaglia"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">Modello</label>
                    <input 
                      type="text" 
                      value={data.scaffolding.model}
                      onChange={(e) => updateScaffolding('model', e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">Altezza Massima (m)</label>
                    <input 
                      type="number" 
                      value={data.scaffolding.maxHeight}
                      onChange={(e) => updateScaffolding('maxHeight', parseFloat(e.target.value))}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">Larghezza Modulo (m)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={data.scaffolding.moduleWidth}
                      onChange={(e) => updateScaffolding('moduleWidth', parseFloat(e.target.value))}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">Altezza Modulo (m)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={data.scaffolding.moduleHeight}
                      onChange={(e) => updateScaffolding('moduleHeight', parseFloat(e.target.value))}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">Mezze Misure / Pezzi Speciali</label>
                    <textarea 
                      value={data.scaffolding.specialPieces}
                      onChange={(e) => updateScaffolding('specialPieces', e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all h-20"
                      placeholder="Descrivi eventuali componenti speciali o mezze misure utilizzate..."
                    />
                  </div>
                  <div className="col-span-2 space-y-4">
                    <label className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">Dotazioni di Sicurezza Aggiuntive</label>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => updateScaffolding('hasShadingNet', !data.scaffolding.hasShadingNet)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all font-bold text-xs",
                          data.scaffolding.hasShadingNet 
                            ? "bg-zinc-900 text-white border-zinc-900" 
                            : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-200"
                        )}
                      >
                        RETE OSCURANTE
                      </button>
                      <button 
                        onClick={() => updateScaffolding('hasNightLights', !data.scaffolding.hasNightLights)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all font-bold text-xs",
                          data.scaffolding.hasNightLights 
                            ? "bg-amber-500 text-white border-amber-500" 
                            : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-200"
                        )}
                      >
                        LUCI NOTTURNE
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-zinc-100 space-y-6">
                  <h3 className="text-lg font-bold tracking-tight">Dettagli D.Lgs 81/08 (Specifiche di Progetto)</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">Qualità del Terreno</label>
                      <select 
                        value={data.scaffolding.soilType}
                        onChange={(e) => updateScaffolding('soilType', e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-zinc-900 outline-none"
                      >
                        {SOIL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">Elementi di Base</label>
                      <select 
                        value={data.scaffolding.baseElements}
                        onChange={(e) => updateScaffolding('baseElements', e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-zinc-900 outline-none"
                      >
                        {BASE_ELEMENTS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">Sistema di Messa a Terra</label>
                      <select 
                        value={data.scaffolding.earthingSystem}
                        onChange={(e) => updateScaffolding('earthingSystem', e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-zinc-900 outline-none"
                      >
                        {EARTHING_SYSTEMS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">Segnaletica e Cartellonistica</label>
                      <div className="flex flex-wrap gap-2">
                        {['Cartello di cantiere', 'Segnaletica di divieto', 'Luci notturne', 'Nastro segnaletico', 'Segnali di obbligo'].map(item => (
                          <button
                            key={item}
                            onClick={() => {
                              const current = data.scaffolding.signage || [];
                              const next = current.includes(item) 
                                ? current.filter(i => i !== item)
                                : [...current, item];
                              updateScaffolding('signage', next);
                            }}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border",
                              data.scaffolding.signage?.includes(item)
                                ? "bg-zinc-900 text-white border-zinc-900"
                                : "bg-white text-zinc-400 border-zinc-200 hover:border-zinc-400"
                            )}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <button onClick={() => setActiveStep('site')} className="text-zinc-500 font-medium hover:text-zinc-900 transition-all">Indietro</button>
                  <button onClick={() => setActiveStep('facades')} className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-zinc-800 transition-all">
                    Prossimo <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {activeStep === 'facades' && (
              <motion.div
                key="facades"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-1">Facciate e Rilievi</h2>
                    <p className="text-zinc-500 text-sm">Gestisci le facciate dell'edificio e carica le foto.</p>
                  </div>
                  <button 
                    onClick={addFacade}
                    className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-all"
                  >
                    <Plus size={16} /> Aggiungi Facciata
                  </button>
                </div>

                <div className="space-y-8">
                  {data.scaffolding.facades.map((facade, index) => (
                    <div key={facade.id} className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm space-y-8">
                      <div className="flex justify-between items-center border-b border-zinc-100 pb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white font-black text-sm">
                            {index + 1}
                          </div>
                          <input 
                            type="text" 
                            value={facade.name}
                            onChange={(e) => updateFacade(facade.id, 'name', e.target.value)}
                            className="text-xl font-black bg-transparent border-none focus:ring-0 p-0 w-64 tracking-tight"
                          />
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-3 bg-zinc-50 px-4 py-2 rounded-xl border border-zinc-100">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Larghezza</span>
                            <input 
                              type="number" 
                              value={facade.width}
                              onChange={(e) => updateFacade(facade.id, 'width', parseFloat(e.target.value))}
                              className="w-16 bg-transparent text-sm font-black focus:outline-none"
                            />
                            <span className="text-[10px] font-black text-zinc-400 uppercase">m</span>
                          </div>
                          <div className="flex items-center gap-3 bg-zinc-50 px-4 py-2 rounded-xl border border-zinc-100">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Altezza</span>
                            <input 
                              type="number" 
                              value={facade.height}
                              onChange={(e) => updateFacade(facade.id, 'height', parseFloat(e.target.value))}
                              className="w-16 bg-transparent text-sm font-black focus:outline-none"
                            />
                            <span className="text-[10px] font-black text-zinc-400 uppercase">m</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Ancoraggi Consigliati</span>
                            <span className="text-sm font-black text-emerald-600">{Math.ceil((facade.width * facade.height) / 18)}</span>
                          </div>
                          <button 
                            onClick={() => removeFacade(facade.id)}
                            className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">Progettazione Sovrapposizione Ponteggio</label>
                          {!facade.photo && (
                            <div className="relative">
                              <button className="flex items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-xl text-xs font-black hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200">
                                <Camera size={16} />
                                CARICA FOTO PROSPETTO
                              </button>
                              <input 
                                type="file" 
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => updateFacade(facade.id, 'photo', reader.result as string);
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </div>
                          )}
                          {facade.photo && (
                            <button 
                              onClick={() => updateFacade(facade.id, 'photo', undefined)}
                              className="text-[10px] font-black text-red-500 uppercase hover:underline tracking-widest"
                            >
                              Elimina e Cambia Foto
                            </button>
                          )}
                        </div>

                        {facade.photo ? (
                          <div className="flex justify-center">
                            <ScaffoldingOverlay 
                              imageSrc={facade.photo}
                              facadeWidth={facade.width}
                              facadeHeight={facade.height}
                              moduleWidth={data.scaffolding.moduleWidth}
                              moduleHeight={data.scaffolding.moduleHeight}
                              hasShadingNet={data.scaffolding.hasShadingNet}
                              hasNightLights={data.scaffolding.hasNightLights}
                              anchors={facade.anchors || []}
                              erasedPaths={facade.erasedPaths}
                              onUpdateAnchors={(anchors) => updateFacadeAnchors(facade.id, anchors)}
                              onUpdateErasedPaths={(paths) => updateFacade(facade.id, 'erasedPaths', paths)}
                              onUpdateShadingNet={(hasNet) => updateScaffolding('hasShadingNet', hasNet)}
                              initialConfig={facade.overlayConfig}
                              onUpdate={(config) => updateFacade(facade.id, 'overlayConfig', config)}
                            />
                          </div>
                        ) : (
                          <div className="h-[450px] bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-3xl flex flex-col items-center justify-center gap-4 text-zinc-400">
                            <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center">
                              <ImageIcon size={40} className="opacity-20" />
                            </div>
                            <div className="text-center space-y-1">
                              <p className="text-sm font-black text-zinc-500 uppercase tracking-tight">Nessuna foto caricata</p>
                              <p className="text-xs text-zinc-400">Carica la foto della facciata per iniziare la progettazione in scala</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {data.scaffolding.facades.length === 0 && (
                    <div className="text-center py-20 bg-white border border-dashed border-zinc-200 rounded-2xl">
                      <ImageIcon size={48} className="mx-auto text-zinc-200 mb-4" />
                      <p className="text-zinc-500 font-medium">Nessuna facciata aggiunta</p>
                      <p className="text-zinc-400 text-sm">Inizia aggiungendo la prima facciata del cantiere.</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-8">
                  <button onClick={() => setActiveStep('scaffolding')} className="text-zinc-500 font-medium hover:text-zinc-900 transition-all">Indietro</button>
                  <button 
                    disabled={data.scaffolding.facades.length === 0}
                    onClick={handleGenerateProcedures} 
                    className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-zinc-800 disabled:opacity-50 transition-all"
                  >
                    {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
                    Genera Documento
                  </button>
                </div>
              </motion.div>
            )}

            {activeStep === 'preview' && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-1">Anteprima Documento</h2>
                    <p className="text-zinc-500 text-sm">Controlla il PiMUS prima di scaricare il PDF.</p>
                  </div>
                  <button 
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-all"
                  >
                    <Download size={16} />
                    Stampa / Salva PDF
                  </button>
                </div>

                <div id="pimus-document" className="bg-white rounded-sm text-zinc-800 print:p-0 font-sans mx-auto" style={{ width: '794px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                  {/* PAGE 1: COVER */}
                  <div className="p-16 min-h-[1123px] flex flex-col justify-between border-b border-zinc-100 relative">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-lg font-black tracking-tighter">{data.company.name || "NOME IMPRESA"}</p>
                        <p className="text-[10px] text-zinc-500 uppercase">{data.company.address}</p>
                        <p className="text-[10px] text-zinc-500 uppercase">P.IVA: {data.company.vat}</p>
                        <p className="text-[10px] text-zinc-500 uppercase">TEL: {data.company.phone}</p>
                      </div>
                      <div className="w-24 h-24 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-center text-[10px] text-zinc-300 font-bold uppercase text-center p-2">
                        Logo Aziendale
                      </div>
                    </div>

                    <div className="space-y-12 py-20">
                      <div className="border-y-4 border-zinc-900 py-12 text-center">
                        <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">Pi.M.U.S.</h1>
                        <p className="text-xl font-bold text-zinc-600 uppercase tracking-widest">Piano di Montaggio, Uso e Smontaggio</p>
                        <p className="text-sm text-zinc-400 mt-4 font-medium italic">Conforme al D.Lgs 81/2008 e s.m.i. - Allegato XXII</p>
                      </div>

                      <div className="max-w-2xl mx-auto space-y-8">
                        <div className="bg-zinc-50 p-8 rounded-2xl border border-zinc-100">
                          <p className="text-[10px] uppercase font-black text-zinc-400 mb-4 tracking-widest text-center">Oggetto dell'Opera</p>
                          <p className="text-2xl font-bold text-center uppercase leading-tight">
                            PONTEGGIO METALLICO FISSO PER LAVORI DI MANUTENZIONE PRESSO:
                          </p>
                          <p className="text-xl font-black text-center mt-4 text-zinc-900">
                            {data.site.address || "INDIRIZZO NON SPECIFICATO"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-end border-t border-zinc-100 pt-8">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-zinc-400">Data Documento</p>
                        <p className="text-sm font-bold">{new Date().toLocaleDateString('it-IT')}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-[10px] uppercase font-bold text-zinc-400">Committente</p>
                        <p className="text-sm font-bold uppercase">{data.site.client || "NON SPECIFICATO"}</p>
                      </div>
                    </div>
                  </div>

                  {/* PAGE 2: INDICE */}
                  <div className="p-16 min-h-[1123px] space-y-12 page-break-before relative">
                    <h2 className="text-3xl font-black uppercase border-b-4 border-zinc-900 pb-4 mb-12">Sommario / Indice</h2>
                    <div className="space-y-6">
                      {[
                        { title: "1. Identificazione dei Soggetti", page: "4" },
                        { title: "2. Identificazione del Ponteggio", page: "4" },
                        { title: "3. Pianta di Cantiere e Inquadramento", page: "3" },
                        { title: "4. ALLEGATO A: Libretto Tecnico e Schemi", page: "5" },
                        { title: "5. Procedure Operative e Sicurezza", page: "6+" },
                        { title: "Appendice A: Verifiche degli Elementi", page: "Fine" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-end gap-4">
                          <span className="text-lg font-bold text-zinc-900 whitespace-nowrap">{item.title}</span>
                          <div className="flex-1 border-b-2 border-dotted border-zinc-200 mb-1.5" />
                          <span className="text-lg font-black text-zinc-400">pag. {item.page}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="absolute bottom-16 left-16 right-16 flex justify-between items-center text-[10px] text-zinc-400 font-bold uppercase border-t border-zinc-100 pt-4">
                      <span>PiMUS - {data.site.address}</span>
                      <span>Pagina 2</span>
                    </div>
                  </div>

                  {/* PAGE 3: PIANTA DI CANTIERE */}
                  <div className="p-16 min-h-[1123px] space-y-8 page-break-before relative">
                    <h2 className="text-xl font-black uppercase border-b-2 border-zinc-900 pb-2 mb-8">3. Pianta di Cantiere e Inquadramento Facciate</h2>
                    <p className="text-sm text-zinc-600 leading-relaxed mb-8">
                      La presente sezione illustra l'inquadramento planimetrico dell'area di cantiere con l'indicazione numerica delle facciate oggetto di intervento e trattate nel dettaglio nell'Allegato A.
                    </p>
                    
                    <div className="bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200 min-h-[500px] flex items-center justify-center overflow-hidden relative">
                      {data.site.sitePlan ? (
                        <div className="relative w-full h-full">
                          <img src={data.site.sitePlan} className="w-full h-full object-contain" />
                          {/* Render Plan Markers (Arrows) */}
                          {(data.site.planMarkers || []).map((marker) => (
                            <div 
                              key={marker.id}
                              className="absolute"
                              style={{
                                left: `${(marker.x / 800) * 100}%`, // Assuming 800 is the base width from SitePlanOverlay
                                top: `${(marker.y / 600) * 100}%`,  // Assuming 600 is the base height
                                transform: `translate(-50%, -50%) rotate(${marker.rotation}deg)`,
                              }}
                            >
                              <div className="relative" style={{ width: '50px', height: '24px' }}>
                                <svg width="50" height="24" viewBox="0 0 50 24" className="absolute top-0 left-0">
                                  <line x1="0" y1="12" x2="40" y2="12" stroke="#18181b" strokeWidth="4" />
                                  <polygon points="40,4 50,12 40,20" fill="#18181b" />
                                </svg>
                                <div 
                                  className="absolute w-6 h-6 bg-zinc-900 rounded-full flex items-center justify-center text-[10px] text-white font-black"
                                  style={{ 
                                    left: '-12px', 
                                    top: '0',
                                    transform: `rotate(${-marker.rotation}deg)` 
                                  }}
                                >
                                  {marker.label}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center space-y-4 p-12">
                          <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto">
                            <Upload className="text-zinc-300" />
                          </div>
                          <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest">Nessuna Pianta Caricata</p>
                          <p className="text-[10px] text-zinc-300">Carica la pianta nel modulo "Dati Cantiere"</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-8 p-6 bg-zinc-900 text-white rounded-xl">
                      <p className="text-[10px] uppercase font-black mb-4 tracking-widest text-zinc-400">Elenco Facciate Trattate</p>
                      <div className="grid grid-cols-2 gap-4">
                        {data.scaffolding.facades.map((f, i) => (
                          <div key={f.id} className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded flex items-center justify-center text-xs font-black" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>{i + 1}</span>
                            <span className="text-xs font-bold uppercase">{f.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="absolute bottom-16 left-16 right-16 flex justify-between items-center text-[10px] text-zinc-400 font-bold uppercase border-t border-zinc-100 pt-4">
                      <span>PiMUS - {data.site.address}</span>
                      <span>Pagina 3</span>
                    </div>
                  </div>

                  {/* PAGE 4: ADMINISTRATIVE */}
                  <div className="p-16 min-h-[1123px] space-y-12 page-break-before relative">
                    <section>
                      <h2 className="text-xl font-black uppercase border-b-2 border-zinc-900 pb-2 mb-8">1. Identificazione dei Soggetti</h2>
                      <div className="grid grid-cols-1 gap-8">
                        <div className="bg-zinc-50 p-6 rounded-xl border border-zinc-100">
                          <p className="text-[10px] uppercase font-black text-zinc-400 mb-3">1.1 Redattore del PiMUS</p>
                          <p className="text-sm font-bold">{data.site.manager || "NON SPECIFICATO"}</p>
                          <p className="text-xs text-zinc-500 mt-1">Incaricato dalla ditta esecutrice</p>
                        </div>

                        <div className="bg-zinc-50 p-6 rounded-xl border border-zinc-100">
                          <p className="text-[10px] uppercase font-black text-zinc-400 mb-3">1.2 Datore di Lavoro (Ditta Esecutrice)</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase">Ragione Sociale</p>
                              <p className="text-sm font-bold uppercase">{data.site.employer || data.company.name}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase">Codice Fiscale / P.IVA</p>
                              <p className="text-sm font-bold">{data.site.employerTaxCode || data.company.vat}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-[10px] font-bold text-zinc-400 uppercase">Sede Legale</p>
                              <p className="text-sm font-bold uppercase">{data.site.employerAddress || data.company.address}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-zinc-50 p-6 rounded-xl border border-zinc-100">
                          <p className="text-[10px] uppercase font-black text-zinc-400 mb-3">1.3 Squadra Addetta alle Operazioni</p>
                          <div className="space-y-4">
                            <div className="border-b border-zinc-200 pb-3">
                              <p className="text-[10px] font-bold text-zinc-400 uppercase">Preposto al Montaggio</p>
                              <p className="text-sm font-black text-emerald-700 uppercase">{data.scaffolding.preposto || "NON SPECIFICATO"}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase">Lavoratori Addetti</p>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {data.team.filter(m => m).map((member, i) => (
                                  <div key={i} className="text-xs font-bold text-zinc-700 flex items-center gap-2">
                                    <span className="w-4 h-4 bg-zinc-200 rounded-full flex items-center justify-center text-[8px]">{i+1}</span>
                                    {member}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h2 className="text-xl font-black uppercase border-b-2 border-zinc-900 pb-2 mb-8">2. Identificazione del Ponteggio</h2>
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase">Tipologia Sistema</p>
                            <p className="text-sm font-bold uppercase">{data.scaffolding.type}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase">Marca e Modello</p>
                            <p className="text-sm font-bold uppercase">{data.scaffolding.brand} {data.scaffolding.model}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase">Dimensioni Modulo</p>
                            <p className="text-sm font-bold">{data.scaffolding.moduleWidth}m (L) x {data.scaffolding.moduleHeight}m (H)</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase">Altezza Massima</p>
                            <p className="text-sm font-bold">{data.scaffolding.maxHeight} m</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase">Messa a Terra</p>
                            <p className="text-xs font-medium">{data.scaffolding.earthingSystem}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase">Dotazioni Speciali</p>
                            <div className="flex gap-2 mt-1">
                              {data.scaffolding.hasShadingNet && <span className="text-[8px] bg-zinc-900 text-white px-2 py-0.5 rounded font-black">RETE</span>}
                              {data.scaffolding.hasNightLights && <span className="text-[8px] bg-amber-500 text-white px-2 py-0.5 rounded font-black">LUCI</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <div className="absolute bottom-16 left-16 right-16 flex justify-between items-center text-[10px] text-zinc-400 font-bold uppercase border-t border-zinc-100 pt-4">
                      <span>PiMUS - {data.site.address}</span>
                      <span>Pagina 4</span>
                    </div>
                  </div>

                  {/* PAGE 5: ALLEGATO A (SCHEMI TECNICI) */}
                  <div className="p-16 min-h-[1123px] space-y-8 page-break-before relative">
                    <h2 className="text-xl font-black uppercase border-b-2 border-zinc-900 pb-2 mb-4 text-center">ALLEGATO A: Libretto Tecnico e Schemi di Montaggio</h2>
                    <p className="text-xs text-zinc-500 text-center italic mb-8">Rappresentazione grafica in scala del ponteggio e posizionamento ancoraggi</p>
                    
                    <div className="space-y-12">
                      {data.scaffolding.facades.map((facade) => (
                        <div key={facade.id} className="space-y-4">
                          <div className="flex justify-between items-end border-l-4 border-zinc-900 pl-4">
                            <h4 className="text-xl font-bold uppercase">{facade.name}</h4>
                            <p className="text-xs text-zinc-500 font-mono">DIM: {facade.width}m x {facade.height}m</p>
                          </div>
                          
                          <div 
                            className="bg-zinc-50 rounded-2xl border border-zinc-100 overflow-hidden relative"
                            style={{ 
                              aspectRatio: facade.overlayConfig 
                                ? `${facade.overlayConfig.stageWidth} / ${facade.overlayConfig.stageHeight}` 
                                : '16/9' 
                            }}
                          >
                            {facade.photo && facade.overlayConfig ? (
                              <>
                                <img src={facade.photo} className="w-full h-full object-contain" />
                                {facade.erasedPaths?.map((path, i) => (
                                  <svg 
                                    key={i} 
                                    className="absolute inset-0 w-full h-full pointer-events-none" 
                                    viewBox={`0 0 ${facade.overlayConfig?.stageWidth || 800} ${facade.overlayConfig?.stageHeight || 600}`}
                                    preserveAspectRatio="none"
                                  >
                                    <polyline
                                      points={path.points.join(',')}
                                      fill="none"
                                      stroke="white"
                                      strokeWidth={path.strokeWidth}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                ))}
                                <div 
                                  style={{
                                    position: 'absolute',
                                    left: `${(facade.overlayConfig.x / facade.overlayConfig.stageWidth) * 100}%`,
                                    top: `${(facade.overlayConfig.y / facade.overlayConfig.stageHeight) * 100}%`,
                                    width: `${(facade.overlayConfig.width / facade.overlayConfig.stageWidth) * 100}%`,
                                    height: `${(facade.overlayConfig.height / facade.overlayConfig.stageHeight) * 100}%`,
                                  }}
                                >
                                  {/* Shading Net Simulation */}
                                  {data.scaffolding.hasShadingNet && (
                                    <div className="absolute inset-0 z-0" style={{ backgroundColor: 'rgba(24, 24, 27, 0.3)' }} />
                                  )}

                                  {/* SVG Scaffolding Structure (Vector for PDF) */}
                                  <svg 
                                    className="absolute inset-0 w-full h-full overflow-visible"
                                    viewBox={`0 0 ${facade.overlayConfig.width} ${facade.overlayConfig.height}`}
                                    preserveAspectRatio="none"
                                  >
                                    {/* Dimensions */}
                                    <g stroke="#000" strokeWidth="1.5">
                                      {/* Width Dimension (Top) */}
                                      <line x1="0" y1="-30" x2={facade.overlayConfig.width} y2="-30" />
                                      <line x1="0" y1="-30" x2="8" y2="-34" />
                                      <line x1="0" y1="-30" x2="8" y2="-26" />
                                      <line x1={facade.overlayConfig.width} y1="-30" x2={facade.overlayConfig.width - 8} y2="-34" />
                                      <line x1={facade.overlayConfig.width} y1="-30" x2={facade.overlayConfig.width - 8} y2="-26" />
                                      <line x1="0" y1="-35" x2="0" y2="-25" />
                                      <line x1={facade.overlayConfig.width} y1="-35" x2={facade.overlayConfig.width} y2="-25" />
                                      <text x={facade.overlayConfig.width / 2} y="-35" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#000" stroke="none">{facade.width.toFixed(2)}m</text>

                                      {/* Height Dimension (Left) */}
                                      <line x1="-30" y1="0" x2="-30" y2={facade.overlayConfig.height} />
                                      <line x1="-30" y1="0" x2="-34" y2="8" />
                                      <line x1="-30" y1="0" x2="-26" y2="8" />
                                      <line x1="-30" y1={facade.overlayConfig.height} x2="-34" y2={facade.overlayConfig.height - 8} />
                                      <line x1="-30" y1={facade.overlayConfig.height} x2="-26" y2={facade.overlayConfig.height - 8} />
                                      <line x1="-35" y1="0" x2="-25" y2="0" />
                                      <line x1="-35" y1={facade.overlayConfig.height} x2="-25" y2={facade.overlayConfig.height} />
                                      <text x="-35" y={facade.overlayConfig.height / 2} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#000" stroke="none" transform={`rotate(-90, -35, ${facade.overlayConfig.height / 2})`}>{facade.height.toFixed(2)}m</text>
                                    </g>

                                    {/* Scaffolding Grid */}
                                    {(() => {
                                      const numCols = Math.ceil(facade.width / data.scaffolding.moduleWidth);
                                      const numRows = Math.ceil(facade.height / data.scaffolding.moduleHeight);
                                      const colWidth = facade.overlayConfig.width / numCols;
                                      const rowHeight = facade.overlayConfig.height / numRows;
                                      const elements = [];

                                      // Vertical Frames & Base Plates
                                      for (let c = 0; c <= numCols; c++) {
                                        const x = c * colWidth;
                                        // Vertical Frame
                                        elements.push(<line key={`v-${c}`} x1={x} y1="0" x2={x} y2={facade.overlayConfig.height} stroke="#ef4444" strokeWidth="2" />);
                                        // Base Plate (Piedino)
                                        elements.push(<rect key={`bp-${c}`} x={x - 6} y={facade.overlayConfig.height - 2} width="12" height="4" fill="#ef4444" />);
                                      }

                                      // Horizontal Elements
                                      for (let r = 0; r <= numRows; r++) {
                                        const y = r * rowHeight;
                                        
                                        // Ledger (Corrente)
                                        elements.push(<line key={`h-${r}`} x1="0" y1={y} x2={facade.overlayConfig.width} y2={y} stroke="#ef4444" strokeWidth="2" />);

                                        if (r > 0 && r < numRows) {
                                          // Platform (Impalcato)
                                          elements.push(<rect key={`p-${r}`} x="0" y={y - 4} width={facade.overlayConfig.width} height="4" fill="#94a3b8" />);
                                          // Toeboard (Fermapiede)
                                          elements.push(<rect key={`t-${r}`} x="0" y={y - 12} width={facade.overlayConfig.width} height="8" fill="rgba(100, 116, 139, 0.8)" />);
                                        }

                                        if (r < numRows) {
                                          // Guardrails (Parapetti)
                                          elements.push(<line key={`g1-${r}`} x1="0" y1={y + rowHeight * 0.4} x2={facade.overlayConfig.width} y2={y + rowHeight * 0.4} stroke="rgba(239, 68, 68, 0.8)" strokeWidth="1" />);
                                          elements.push(<line key={`g2-${r}`} x1="0" y1={y + rowHeight * 0.7} x2={facade.overlayConfig.width} y2={y + rowHeight * 0.7} stroke="rgba(239, 68, 68, 0.8)" strokeWidth="1" />);

                                          // Diagonals & Ladders
                                          for (let c = 0; c < numCols; c++) {
                                            const x = c * colWidth;
                                            // Diagonal
                                            elements.push(<line key={`d-${r}-${c}`} x1={x} y1={y} x2={x + colWidth} y2={y + rowHeight} stroke="rgba(239, 68, 68, 0.4)" strokeWidth="1" />);
                                            
                                            // Ladder (every other column, alternating)
                                            if (r > 0 && c === (r % 2 === 0 ? 1 : numCols > 2 ? 2 : 0)) {
                                              elements.push(
                                                <g key={`l-${r}-${c}`}>
                                                  <line x1={x + colWidth * 0.2} y1={y} x2={x + colWidth * 0.4} y2={y + rowHeight} stroke="rgba(59, 130, 246, 0.6)" strokeWidth="2" />
                                                  <line x1={x + colWidth * 0.4} y1={y} x2={x + colWidth * 0.6} y2={y + rowHeight} stroke="rgba(59, 130, 246, 0.6)" strokeWidth="2" />
                                                </g>
                                              );
                                            }
                                          }
                                        }
                                      }

                                      // Night Lights (at the first toeboard level)
                                      if (data.scaffolding.hasNightLights) {
                                        const firstLevelY = (numRows - 1) * rowHeight;
                                        [0, numCols].forEach(c => {
                                          const x = c * colWidth;
                                          elements.push(
                                            <circle key={`nl-${c}`} cx={x} cy={firstLevelY - 12} r="4" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
                                          );
                                        });
                                      }

                                      return elements;
                                    })()}
                                  </svg>

                                  {/* Anchors (GREEN) */}
                                  {(facade.anchors || []).map((anchor, index) => (
                                    <div 
                                      key={anchor.id}
                                      className="absolute w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[9px] text-white font-black z-10"
                                      style={{
                                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
                                        left: `${(anchor.x / facade.overlayConfig!.width) * 100}%`,
                                        top: `${(anchor.y / facade.overlayConfig!.height) * 100}%`,
                                        transform: 'translate(-50%, -50%)'
                                      }}
                                    >
                                      {index + 1}
                                    </div>
                                  ))}
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-300 min-h-[400px]">Nessuno schema</div>
                            )}
                          </div>
                          
                          {facade.anchors.length > 0 && (
                            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                              <p className="text-[10px] uppercase font-black text-zinc-400 mb-2 tracking-widest">Legenda Ancoraggi {facade.name}</p>
                              <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                                {facade.anchors.map((anchor, index) => (
                                  <div key={anchor.id} className="flex items-center gap-2 text-[9px]">
                                    <span className="font-black text-emerald-600">{index + 1}.</span>
                                    <span className="text-zinc-700 font-bold uppercase">{anchor.type}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="absolute bottom-16 left-16 right-16 flex justify-between items-center text-[10px] text-zinc-400 font-bold uppercase border-t border-zinc-100 pt-4">
                      <span>PiMUS - {data.site.address}</span>
                      <span>Pagina 5</span>
                    </div>
                  </div>

                  {/* PAGE 6+: SAFETY PROCEDURES */}
                  <div className="p-16 min-h-[1123px] space-y-8 page-break-before relative">
                    <h2 className="text-xl font-black uppercase border-b-2 border-zinc-900 pb-2 mb-8">4. Procedure Operative e Misure di Sicurezza</h2>
                    <div className="max-w-none text-zinc-900 leading-relaxed text-justify">
                      {data.safetyProcedures ? (
                        <div 
                          className="safety-content"
                          dangerouslySetInnerHTML={{ __html: data.safetyProcedures }} 
                        />
                      ) : (
                        <p className="italic text-zinc-400">Generazione procedure in corso...</p>
                      )}
                    </div>

                    <div className="absolute bottom-16 left-16 right-16 flex justify-between items-center text-[10px] text-zinc-400 font-bold uppercase border-t border-zinc-100 pt-4">
                      <span>PiMUS - {data.site.address}</span>
                      <span>Pagina 6</span>
                    </div>
                  </div>

                  {/* FINAL PAGE: APPENDICE A (CHECKLIST) */}
                  <div className="p-16 min-h-[1123px] space-y-8 page-break-before relative">
                    <h2 className="text-xl font-black uppercase border-b-2 border-zinc-900 pb-2 mb-8">Appendice A: Verifiche degli Elementi</h2>
                    <div className="space-y-6">
                      <p className="text-xs text-zinc-500 italic">Verifiche da effettuare prima del montaggio (Allegato XIX D.Lgs 81/08)</p>
                      <table className="w-full border-collapse border border-zinc-200 text-[10px]">
                        <thead>
                          <tr className="bg-zinc-100">
                            <th className="border border-zinc-200 p-2 text-left uppercase">Elemento</th>
                            <th className="border border-zinc-200 p-2 text-left uppercase">Tipo di Verifica</th>
                            <th className="border border-zinc-200 p-2 text-left uppercase">Esito</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            ['Generale', 'Controllo esistenza libretto ministeriale', 'OK'],
                            ['Telaio', 'Controllo marchio e stato di conservazione', 'OK'],
                            ['Correnti/Diagonali', 'Controllo linearità e attacchi', 'OK'],
                            ['Impalcati', 'Controllo orizzontalità e dispositivi blocco', 'OK'],
                            ['Basette', 'Controllo filettatura e stelo', 'OK'],
                            ['Ancoraggi', 'Controllo efficienza e serraggio', 'OK'],
                          ].map(([el, ver, es], i) => (
                            <tr key={i}>
                              <td className="border border-zinc-200 p-2 font-bold uppercase">{el}</td>
                              <td className="border border-zinc-200 p-2">{ver}</td>
                              <td className="border border-zinc-200 p-2 text-center font-black text-emerald-600">{es}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="grid grid-cols-2 gap-12 pt-20">
                      <div className="space-y-8">
                        <div className="border-b border-zinc-300 pb-12">
                          <p className="text-[10px] uppercase font-bold text-zinc-400 mb-1">Firma del Preposto</p>
                        </div>
                        <p className="text-[10px] font-bold uppercase">{data.scaffolding.preposto || "NON SPECIFICATO"}</p>
                      </div>
                      <div className="space-y-8">
                        <div className="border-b border-zinc-300 pb-12">
                          <p className="text-[10px] uppercase font-bold text-zinc-400 mb-1">Firma Datore di Lavoro</p>
                        </div>
                        <p className="text-[10px] font-bold uppercase">{data.site.employer || data.company.name}</p>
                      </div>
                    </div>

                    <div className="absolute bottom-16 left-16 right-16 flex justify-between items-center text-[10px] text-zinc-400 font-bold uppercase border-t border-zinc-100 pt-4">
                      <span>PiMUS - {data.site.address}</span>
                      <span>Fine Relazione</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Global CSS for printing and PDF generation */}
      <style dangerouslySetInnerHTML={{ __html: `
        .page-break-before { page-break-before: always; }
        @media print {
          aside { display: none !important; }
          main { padding: 0 !important; overflow: visible !important; background: white !important; }
          .max-w-4xl { max-width: none !important; }
          #pimus-document { box-shadow: none !important; border: none !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; }
          button { display: none !important; }
          body { background: white !important; }
          #root > div { height: auto !important; overflow: visible !important; }
        }
      `}} />
    </div>
  );
}
