
import { X, Save, Folder, Tag, Palette, Check, Info, ListFilter, LayoutGrid, Sparkles } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { Category } from '../types';
import { VIVID_COLORS, WBS_SUGGESTIONS } from '../constants';

interface CategoryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, isSuper: boolean, color: string) => void;
  initialData?: Category | null;
  nextWbsCode?: string;
  proposedColors?: string[];
  forcedIsSuper?: boolean;
}

const CategoryEditModal: React.FC<CategoryEditModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  nextWbsCode, 
  proposedColors,
  forcedIsSuper 
}) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');

  const isSuperMode = forcedIsSuper !== undefined ? forcedIsSuper : (initialData?.isSuperCategory || false);

  const displayColors = useMemo(() => {
    if (proposedColors && proposedColors.length === 5) return proposedColors;
    return [...VIVID_COLORS].sort(() => 0.5 - Math.random()).slice(0, 5);
  }, [proposedColors, isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setSelectedColor(initialData.color || '#3B82F6');
      } else {
        setName('');
        setSelectedColor(isSuperMode ? displayColors[0] : '#475569');
      }
    }
  }, [isOpen, initialData, displayColors, isSuperMode]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name, isSuperMode, isSuperMode ? selectedColor : '');
      onClose();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setName(suggestion);
  };

  const displayCode = initialData ? initialData.code : nextWbsCode;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.4)] w-full max-w-4xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col md:flex-row h-auto max-h-[90vh]">
        
        {/* LATO SINISTRO: Teoria e Iconografia */}
        <div className={`w-full md:w-80 p-8 flex flex-col transition-colors duration-700 text-white ${isSuperMode ? 'bg-indigo-600' : 'bg-slate-800'}`}>
          <div className="mb-8">
             <div className="bg-white/20 p-4 rounded-[1.5rem] w-fit mb-4 shadow-inner">
                {isSuperMode ? <Folder className="w-10 h-10" /> : <LayoutGrid className="w-10 h-10" />}
             </div>
             <h2 className="text-2xl font-black uppercase tracking-tighter leading-tight">
                {isSuperMode ? 'Super Categoria' : 'Work Breakdown Structure'}
             </h2>
             <div className="h-1 w-12 bg-white/40 rounded-full mt-2"></div>
          </div>

          <div className="space-y-6 flex-1">
             <div className="bg-white/10 p-5 rounded-2xl border border-white/5">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-2 flex items-center gap-2">
                  <Info className="w-3 h-3" /> Metodo WBS
                </h4>
                <p className="text-[11px] font-medium leading-relaxed opacity-90 italic">
                  "La scomposizione analitica del progetto in elementi atomici (Work Packages). È la base per definire costi, tempi e responsabilità in modo professionale."
                </p>
             </div>

             <div className="hidden md:block">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-3">Gerarchia Attiva</h4>
                <div className="flex flex-col gap-2 pl-2">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                      <span className="text-[10px] font-bold opacity-60">Livello 1: Raccoglitore</span>
                   </div>
                   <div className="flex items-center gap-3 ml-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                      <span className="text-[10px] font-bold opacity-40">Livello 2: Capitolo (WBS)</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-[9px] font-black uppercase tracking-widest opacity-40 text-center">
            Engine by Ing. Domenico Gimondo
          </div>
        </div>

        {/* LATO DESTRO: Input e Catalogo */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
          
          <div className="px-8 py-6 flex justify-between items-center border-b border-slate-100 bg-white">
              <div>
                <h3 className="font-black uppercase text-xs tracking-widest text-slate-400 mb-1">
                  Configurazione {isSuperMode ? 'Super-Nodo' : 'Foglia di Lavoro'}
                </h3>
                <p className="text-slate-800 text-lg font-black tracking-tighter">
                   Codice Identificativo: <span className="text-indigo-600 font-mono">{displayCode}</span>
                </p>
              </div>
              <button onClick={onClose} className="hover:bg-slate-100 p-2 rounded-2xl transition-all">
                <X className="w-6 h-6 text-slate-400" />
              </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
            
            {/* Input Nome */}
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">
                Designazione {isSuperMode ? 'Contenitore' : 'Capitolo'}
              </label>
              <div className="relative group">
                <Tag className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-[1.5rem] pl-14 pr-6 py-5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-black text-slate-700 bg-white transition-all text-sm placeholder:font-normal"
                  placeholder={isSuperMode ? "Es: OPERE STRUTTURALI" : "Scegli sotto o scrivi..."}
                  autoFocus
                />
              </div>
            </div>

            {/* Catalogo Rapido: Solo per WBS Standard */}
            {!isSuperMode && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center justify-between ml-1">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                     <ListFilter className="w-3 h-3" /> Catalogo Suggerimenti Professionali
                   </label>
                   <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">{WBS_SUGGESTIONS.length} Voci</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-200/30 p-4 rounded-[1.5rem] border border-slate-200/50">
                  {WBS_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`text-left px-3 py-2 rounded-xl text-[10px] font-bold border transition-all truncate hover:scale-[1.02] active:scale-[0.98] ${name === suggestion ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-300 hover:text-indigo-600'}`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selettore Colore: Solo per Super Categorie */}
            {isSuperMode && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest flex items-center gap-2">
                  <Palette className="w-3 h-3" /> Personalizzazione Colore Vivid
                </label>
                <div className="flex justify-between items-center gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                  {displayColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-14 h-14 rounded-full border-[6px] transition-all transform hover:scale-110 active:scale-90 flex items-center justify-center shadow-lg ${selectedColor === color ? 'border-slate-800 scale-110 ring-4 ring-slate-100' : 'border-white hover:border-slate-200'}`}
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === color && <Check className="w-6 h-6 text-white drop-shadow-lg" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>

          {/* Footer Azioni */}
          <div className="p-8 bg-white border-t border-slate-100 flex justify-end gap-4 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors tracking-[0.2em]"
            >
              Annulla
            </button>
            <button
              onClick={handleSubmit}
              disabled={!name.trim()}
              className={`px-12 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl flex items-center gap-3 transform transition-all active:scale-95 disabled:opacity-50 text-white ${isSuperMode ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-slate-800 hover:bg-slate-900 shadow-slate-200'}`}
            >
              <Save className="w-5 h-5" />
              {initialData ? 'Applica' : 'Inserisci'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryEditModal;
