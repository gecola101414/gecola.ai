/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { PiMUSData, FacadeInfo } from './types';
import { generateSafetyProcedures } from './services/geminiService';
import { BasePlateDiagram, GuardrailDiagram, AnchorDiagram } from './components/ScaffoldingDiagrams';
import { ScaffoldingOverlay } from './components/ScaffoldingOverlay';

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
  const [data, setData] = useState<PiMUSData>({
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    company: { name: '', address: '', vat: '', phone: '', email: '' },
    site: { address: '', client: '', manager: '', startDate: '' },
    scaffolding: { type: 'Telai prefabbricati', brand: '', model: '', maxHeight: 0, facades: [] },
    safetyProcedures: ''
  });

  const updateCompany = (field: string, value: string) => {
    setData(prev => ({ ...prev, company: { ...prev.company, [field]: value } }));
  };

  const updateSite = (field: string, value: string) => {
    setData(prev => ({ ...prev, site: { ...prev.site, [field]: value } }));
  };

  const updateScaffolding = (field: string, value: any) => {
    setData(prev => ({ ...prev, scaffolding: { ...prev.scaffolding, [field]: value } }));
  };

  const addFacade = () => {
    const newFacade: FacadeInfo = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Facciata ${data.scaffolding.facades.length + 1}`,
      width: 0,
      height: 0
    };
    setData(prev => ({
      ...prev,
      scaffolding: {
        ...prev.scaffolding,
        facades: [...prev.scaffolding.facades, newFacade]
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
        data.scaffolding.model
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
          <div className="mt-8 px-4">
            <div className="h-px bg-zinc-100 mb-4" />
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
                    <label className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">Preposto al Montaggio</label>
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
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-all"
                  >
                    <Download size={16} /> Scarica PDF
                  </button>
                </div>

                <div id="pimus-document" className="bg-white shadow-2xl rounded-sm p-12 min-h-[1122px] text-zinc-800 print:shadow-none print:p-0">
                  {/* Header */}
                  <div className="border-b-4 border-zinc-900 pb-8 mb-12 flex justify-between items-start">
                    <div>
                      <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Pi.M.U.S.</h1>
                      <p className="text-zinc-500 font-medium">Piano di Montaggio, Uso e Smontaggio</p>
                      <p className="text-xs text-zinc-400 mt-1">D.Lgs 81/08 - Allegato XXII</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{data.company.name || "NOME IMPRESA"}</p>
                      <p className="text-xs text-zinc-500">{data.company.address}</p>
                      <p className="text-xs text-zinc-500">P.IVA: {data.company.vat}</p>
                    </div>
                  </div>

                  {/* Site Info Grid */}
                  <div className="grid grid-cols-2 gap-12 mb-12">
                    <section>
                      <h3 className="text-[10px] uppercase font-black text-zinc-400 tracking-widest mb-4 border-b border-zinc-100 pb-1">Dati Cantiere</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-zinc-400">Ubicazione</p>
                          <p className="text-sm font-semibold">{data.site.address || "Non specificato"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-zinc-400">Committente</p>
                          <p className="text-sm font-semibold">{data.site.client || "Non specificato"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-zinc-400">Inizio Lavori</p>
                          <p className="text-sm font-semibold">{data.site.startDate || "Non specificato"}</p>
                        </div>
                      </div>
                    </section>
                    <section>
                      <h3 className="text-[10px] uppercase font-black text-zinc-400 tracking-widest mb-4 border-b border-zinc-100 pb-1">Specifiche Tecniche</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-zinc-400">Sistema</p>
                          <p className="text-sm font-semibold">{data.scaffolding.type}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-zinc-400">Marca e Modello</p>
                          <p className="text-sm font-semibold">{data.scaffolding.brand} {data.scaffolding.model}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-zinc-400">Altezza Max</p>
                          <p className="text-sm font-semibold">{data.scaffolding.maxHeight} m</p>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* Safety Procedures (AI Generated) */}
                  <section className="mb-12">
                    <h3 className="text-[10px] uppercase font-black text-zinc-400 tracking-widest mb-4 border-b border-zinc-100 pb-1">Procedure di Sicurezza</h3>
                    <div className="prose prose-sm max-w-none text-zinc-700 leading-relaxed">
                      {data.safetyProcedures ? (
                        <div dangerouslySetInnerHTML={{ __html: data.safetyProcedures.replace(/\n/g, '<br/>') }} />
                      ) : (
                        <p className="italic text-zinc-400">Generazione procedure in corso...</p>
                      )}
                    </div>
                  </section>

                  {/* Illustrative Diagrams */}
                  <section className="mb-12">
                    <h3 className="text-[10px] uppercase font-black text-zinc-400 tracking-widest mb-4 border-b border-zinc-100 pb-1">Schemi Illustrativi Componenti</h3>
                    <div className="grid grid-cols-3 gap-8">
                      <div className="flex flex-col items-center text-center p-4 border border-zinc-100 rounded">
                        <BasePlateDiagram />
                        <p className="text-[10px] font-bold mt-2 uppercase">Basetta Regolabile</p>
                        <p className="text-[8px] text-zinc-400 mt-1">Appoggio a terra con regolazione millimetrica</p>
                      </div>
                      <div className="flex flex-col items-center text-center p-4 border border-zinc-100 rounded">
                        <GuardrailDiagram />
                        <p className="text-[10px] font-bold mt-2 uppercase">Parapetto di Sicurezza</p>
                        <p className="text-[8px] text-zinc-400 mt-1">Protezione contro le cadute dall'alto</p>
                      </div>
                      <div className="flex flex-col items-center text-center p-4 border border-zinc-100 rounded">
                        <AnchorDiagram />
                        <p className="text-[10px] font-bold mt-2 uppercase">Ancoraggio a Muro</p>
                        <p className="text-[8px] text-zinc-400 mt-1">Fissaggio strutturale alla facciata</p>
                      </div>
                    </div>
                  </section>

                  {/* Facades and Photos */}
                  <section className="page-break-before">
                    <h3 className="text-[10px] uppercase font-black text-zinc-400 tracking-widest mb-6 border-b border-zinc-100 pb-1">Rilievi e Schemi di Montaggio</h3>
                    <div className="space-y-12">
                      {data.scaffolding.facades.map((facade) => (
                        <div key={facade.id} className="space-y-4">
                          <div className="flex justify-between items-end border-l-4 border-zinc-900 pl-4">
                            <h4 className="text-xl font-bold">{facade.name}</h4>
                            <p className="text-sm text-zinc-500">Dimensioni: {facade.width}m x {facade.height}m</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <p className="text-[10px] uppercase font-bold text-zinc-400">Stato Attuale</p>
                              <div 
                                className="bg-zinc-50 rounded border border-zinc-100 overflow-hidden"
                                style={{ 
                                  aspectRatio: facade.overlayConfig 
                                    ? `${facade.overlayConfig.stageWidth} / ${facade.overlayConfig.stageHeight}` 
                                    : '16/9' 
                                }}
                              >
                                {facade.photo ? (
                                  <img src={facade.photo} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-zinc-300">Nessuna foto</div>
                                )}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <p className="text-[10px] uppercase font-bold text-zinc-400">Schema Sviluppo Ponteggio</p>
                              <div 
                                className="bg-zinc-50 rounded border border-zinc-100 overflow-hidden relative"
                                style={{ 
                                  aspectRatio: facade.overlayConfig 
                                    ? `${facade.overlayConfig.stageWidth} / ${facade.overlayConfig.stageHeight}` 
                                    : '16/9' 
                                }}
                              >
                                {facade.photo ? (
                                  <>
                                    <img src={facade.photo} className="w-full h-full object-cover" />
                                    {facade.overlayConfig && (
                                      <div 
                                        style={{
                                          position: 'absolute',
                                          left: `${(facade.overlayConfig.x / facade.overlayConfig.stageWidth) * 100}%`,
                                          top: `${(facade.overlayConfig.y / facade.overlayConfig.stageHeight) * 100}%`,
                                          width: `${(facade.overlayConfig.width / facade.overlayConfig.stageWidth) * 100}%`,
                                          height: `${(facade.overlayConfig.height / facade.overlayConfig.stageHeight) * 100}%`,
                                          border: '1px solid #ef4444',
                                          backgroundColor: `rgba(239, 68, 68, ${facade.overlayConfig.opacity * 0.1})`,
                                          opacity: facade.overlayConfig.opacity,
                                          display: 'flex',
                                          flexDirection: 'column'
                                        }}
                                      >
                                        {/* Scaffolding Grid Simulation for PDF (RED) */}
                                        <div className="w-full h-full relative overflow-hidden">
                                          {/* Terminal Part Simulation */}
                                          <div className="absolute -top-[8%] left-0 w-full h-[8%] border-x border-red-500 border-t border-red-500 opacity-60" />
                                          
                                          {/* Grid */}
                                          <div 
                                            className="w-full h-full"
                                            style={{
                                              backgroundImage: `
                                                linear-gradient(to right, #ef4444 1.5px, transparent 1.5px),
                                                linear-gradient(to bottom, #ef4444 1.5px, transparent 1.5px)
                                              `,
                                              backgroundSize: `${100 / Math.ceil(facade.width / 1.8)}% ${100 / Math.ceil(facade.height / 2.0)}%`
                                            }}
                                          />
                                          
                                          {/* Toeboards simulation (RED) */}
                                          {[...Array(Math.ceil(facade.height / 2.0))].map((_, i) => (
                                            <div 
                                              key={i}
                                              className="absolute w-full bg-red-500/20 border-t border-red-500"
                                              style={{
                                                height: '4px',
                                                top: `${((i + 1) * (100 / Math.ceil(facade.height / 2.0)))}%`,
                                                transform: 'translateY(-4px)'
                                              }}
                                            />
                                          ))}

                                          {/* Base plates simulation (RED) */}
                                          <div className="absolute bottom-0 w-full flex justify-between px-[2%]">
                                            {[...Array(Math.ceil(facade.width / 1.8) + 1)].map((_, i) => (
                                              <div key={i} className="w-3 h-1 bg-red-500" />
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-zinc-300">Nessuno schema</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Allegato A Section */}
                  <section className="page-break-before">
                    <div className="border-4 border-zinc-900 p-8 text-center mb-12">
                      <h2 className="text-5xl font-black uppercase mb-4">Allegato A</h2>
                      <p className="text-xl font-bold">SCHEMI DI MONTAGGIO E SPECIFICHE TECNICHE DI DETTAGLIO</p>
                    </div>
                    <div className="bg-zinc-50 border border-zinc-200 p-12 rounded-lg text-center">
                      <Construction size={64} className="mx-auto text-zinc-300 mb-6" />
                      <p className="text-zinc-600 max-w-lg mx-auto leading-relaxed">
                        In questa sezione vengono richiamati gli schemi di montaggio specifici forniti dal fabbricante ({data.scaffolding.brand}). 
                        Le procedure qui contenute integrano quanto descritto nella relazione tecnica e costituiscono parte integrante del presente Pi.M.U.S.
                      </p>
                      <div className="mt-12 grid grid-cols-2 gap-8 text-left">
                        <div className="p-6 bg-white border border-zinc-100 rounded shadow-sm">
                          <h4 className="font-bold text-sm mb-2 uppercase tracking-tight">Sequenza Operativa</h4>
                          <p className="text-xs text-zinc-500">Dettaglio passo-passo del posizionamento elementi strutturali, correnti e diagonali.</p>
                        </div>
                        <div className="p-6 bg-white border border-zinc-100 rounded shadow-sm">
                          <h4 className="font-bold text-sm mb-2 uppercase tracking-tight">Distanziamenti</h4>
                          <p className="text-xs text-zinc-500">Quote di montaggio, interassi e tolleranze ammesse dal libretto ministeriale.</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Footer */}
                  <div className="mt-20 pt-8 border-t border-zinc-100 flex justify-between items-end">
                    <div className="text-[10px] text-zinc-400">
                      <p>Documento generato il {new Date(data.createdAt).toLocaleDateString()}</p>
                      <p>ID Documento: {data.id}</p>
                    </div>
                    <div className="flex gap-12">
                      <div className="text-center">
                        <div className="w-32 h-px bg-zinc-200 mb-2" />
                        <p className="text-[9px] uppercase font-bold text-zinc-400">Firma del Preposto</p>
                      </div>
                      <div className="text-center">
                        <div className="w-32 h-px bg-zinc-200 mb-2" />
                        <p className="text-[9px] uppercase font-bold text-zinc-400">Timbro Impresa</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Global CSS for printing */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          aside { display: none !important; }
          main { padding: 0 !important; overflow: visible !important; background: white !important; }
          .max-w-4xl { max-width: none !important; }
          #pimus-document { box-shadow: none !important; border: none !important; padding: 0 !important; }
          .page-break-before { page-break-before: always; }
          button { display: none !important; }
        }
      `}} />
    </div>
  );
}
