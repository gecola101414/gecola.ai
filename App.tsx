
import { 
  Plus, Trash2, Calculator, FolderOpen, XCircle, ArrowRight, Settings, 
  PlusCircle, MinusCircle, HelpCircle, Sparkles, AlignLeft, Link as LinkIcon, 
  Undo2, Redo2, PenLine, Lock, Unlock, Lightbulb, LightbulbOff, Edit2, 
  GripVertical, Sigma, Save, Loader2, FileText, ChevronDown, TestTubes, 
  Search, Coins, ArrowRightLeft, Copy, LogOut, Award, User, Maximize2, 
  Minimize2, GripHorizontal, ArrowLeft, Headset, CopyPlus, Paintbrush, 
  Grid3X3, MousePointerClick, Layers, ExternalLink, FileSpreadsheet, ShieldAlert, HardHat,
  Zap, CornerRightDown, ListFilter, EyeOff, ChevronRight, Folder, FolderPlus, Tag, AlertTriangle, Link2Off,
  ShieldCheck, RefreshCw, FilePlus2, Magnet, MoreVertical, LayoutList, List, Database, Info, ChevronUp,
  Calendar, Cloud
} from 'lucide-react';
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { ref, set, onValue, off, get } from 'firebase/database';
import { auth, db } from './firebase';
import Login from './components/Login';
import { CATEGORIES, INITIAL_ARTICLES, PROJECT_INFO, INITIAL_ANALYSES, SOA_CATEGORIES, VIVID_COLORS } from './constants';
import { Article, Totals, ProjectInfo, Measurement, Category, PriceAnalysis } from './types';
import Summary from './components/Summary';
import ScheduleView from './components/ScheduleView';
import ProjectSettingsModal from './components/ProjectSettingsModal';
import LinkArticleModal from './components/LinkArticleModal';
import ArticleEditModal from './components/ArticleEditModal';
import CategoryEditModal from './components/CategoryEditModal';
import SaveProjectModal from './components/SaveProjectModal';
import AnalysisEditorModal from './components/AnalysisEditorModal';
import ImportAnalysisModal from './components/ImportAnalysisModal';
import WbsImportOptionsModal, { WbsActionMode } from './components/WbsImportOptionsModal';
import HelpManualModal from './components/HelpManualModal';
import RebarCalculatorModal from './components/RebarCalculatorModal';
import PaintingCalculatorModal from './components/PaintingCalculatorModal';
import BulkGeneratorModal from './components/BulkGeneratorModal';
import { parseDroppedContent, parseVoiceMeasurement, generateBulkItems } from './services/geminiService';
import { generateComputoMetricPdf, generateComputoSicurezzaPdf, generateElencoPrezziPdf, generateManodoperaPdf, generateAnalisiPrezziPdf } from './services/pdfGenerator';
import { generateComputoExcel } from './services/excelGenerator';

// Added missing types to fix compiler errors
type ViewMode = 'COMPUTO' | 'RIEPILOGO' | 'CRONOPROGRAMMA' | 'ANALISI';

interface ArticleGroupProps {
  article: Article;
  index: number;
  allArticles: Article[];
  isPrintMode: boolean;
  isCategoryLocked?: boolean;
  isSurveyorGuardActive?: boolean;
  projectSettings: ProjectInfo;
  lastMovedItemId: string | null;
  onUpdateArticle: (id: string, field: keyof Article, value: any) => void;
  onEditArticleDetails?: (article: Article) => void;
  onDeleteArticle?: (id: string) => void;
  onAddMeasurement: (articleId: string) => void;
  onAddSubtotal?: (articleId: string) => void;
  onUpdateMeasurement: (articleId: string, measurementId: string, field: keyof Measurement, value: any) => void;
  onDeleteMeasurement: (articleId: string, measurementId: string) => void;
  onOpenLinkModal?: (articleId: string) => void;
  onScrollToArticle: (id: string) => void;
  onReorderMeasurements?: (articleId: string, measurements: Measurement[]) => void;
  onArticleDragStart?: (e: React.DragEvent, id: string) => void;
  onArticleDrop?: (e: React.DragEvent, id: string) => void;
  onArticleDragEnd?: () => void;
  lastAddedMeasurementId?: string | null;
  onColumnFocus?: (col: string | null) => void;
  onViewAnalysis?: (analysisId: string) => void;
  onInsertExternalArticle?: (text: string) => void;
  onToggleArticleLock: (id: string) => void;
  onOpenRebarCalculator?: (articleId: string) => void;
  onOpenPaintingCalculator?: (articleId: string) => void;
  onToggleVoiceAutomation?: (articleId: string) => void;
  onToggleSmartRepeat?: (articleId: string) => void;
  voiceAutomationActiveId?: string | null;
  smartRepeatActiveId?: string | null;
}

const MIME_ARTICLE = 'application/gecola-article';
const MIME_MEASUREMENT = 'application/gecola-measurement';
const MIME_ANALYSIS_ROW = 'application/gecola-analysis-row';
const MIME_ANALYSIS_DRAG = 'application/gecola-analysis-data';

// --- SISTEMA AUDIO ---
let globalAudioCtx: AudioContext | null = null;

const playUISound = (type: 'confirm' | 'move' | 'newline' | 'toggle' | 'cycle') => {
    try {
        if (!globalAudioCtx) globalAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (globalAudioCtx.state === 'suspended') globalAudioCtx.resume();
        const masterGain = globalAudioCtx.createGain();
        masterGain.connect(globalAudioCtx.destination);
        masterGain.gain.setValueAtTime(0, globalAudioCtx.currentTime);
        if (type === 'confirm') {
            masterGain.gain.linearRampToValueAtTime(0.08, globalAudioCtx.currentTime + 0.005);
            const osc = globalAudioCtx.createOscillator();
            osc.frequency.setValueAtTime(880, globalAudioCtx.currentTime); 
            osc.connect(masterGain); osc.start();
            masterGain.gain.exponentialRampToValueAtTime(0.0001, globalAudioCtx.currentTime + 0.2);
            osc.stop(globalAudioCtx.currentTime + 0.2);
        } else if (type === 'move') {
            masterGain.gain.linearRampToValueAtTime(0.06, globalAudioCtx.currentTime + 0.005);
            const osc = globalAudioCtx.createOscillator();
            osc.frequency.setValueAtTime(660, globalAudioCtx.currentTime); 
            osc.connect(masterGain); osc.start();
            masterGain.gain.exponentialRampToValueAtTime(0.0001, globalAudioCtx.currentTime + 0.08);
            osc.stop(globalAudioCtx.currentTime + 0.08);
        } else if (type === 'toggle' || type === 'cycle') {
            masterGain.gain.linearRampToValueAtTime(0.05, globalAudioCtx.currentTime + 0.005);
            const osc = globalAudioCtx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(type === 'cycle' ? 660 : 440, globalAudioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(type === 'cycle' ? 990 : 880, globalAudioCtx.currentTime + 0.1);
            osc.connect(masterGain); osc.start();
            masterGain.gain.exponentialRampToValueAtTime(0.0001, globalAudioCtx.currentTime + 0.15);
            osc.stop(globalAudioCtx.currentTime + 0.15);
        } else if (type === 'newline') {
            masterGain.gain.linearRampToValueAtTime(0.12, globalAudioCtx.currentTime + 0.005);
            const freqs = [523.25, 659.25, 783.99]; 
            freqs.forEach((f, i) => {
                const osc = globalAudioCtx!.createOscillator();
                osc.frequency.setValueAtTime(f, globalAudioCtx!.currentTime + (i * 0.08));
                osc.connect(masterGain); osc.start(globalAudioCtx!.currentTime + (i * 0.08));
                osc.stop(globalAudioCtx!.currentTime + 0.4);
            });
            masterGain.gain.exponentialRampToValueAtTime(0.0001, globalAudioCtx.currentTime + 0.5);
        }
    } catch (e) { console.warn("Audio feedback disabled:", e); }
};

const formatCurrency = (val: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(val);
const formatResult = (val: number | undefined | null) => (val || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const getWbsNumber = (code: string) => {
    const match = code.match(/WBS\.(\d+)/) || code.match(/S\.(\d+)/);
    return match ? parseInt(match[1], 10) : code;
};
const roundTwoDecimals = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;
const getRank = (unit: string) => {
  const u = unit.toLowerCase().replace(/\s/g, '');
  if (u.includes('m3') || u.includes('mc')) return 3;
  if (u.includes('m2') || u.includes('mq')) return 2;
  if (u === 'm' || u === 'ml') return 1;
  return 0;
};

const calculateRowValueWithContext = (m: Measurement, targetUnit: string, linkedValue: number = 0, sourceUnit: string = ''): number => {
  if (m.type === 'subtotal') return 0;
  const hasLocalDimensions = m.length !== undefined || m.width !== undefined || m.height !== undefined;
  const hasMultiplier = m.multiplier !== undefined;
  if (!hasLocalDimensions && !hasMultiplier && !m.linkedArticleId) return 0;
  const mult = hasMultiplier ? m.multiplier! : (hasLocalDimensions || m.linkedArticleId ? 1 : 0);
  const sign = m.type === 'deduction' ? -1 : 1;
  if (m.linkedArticleId && sourceUnit) {
    const sRank = getRank(sourceUnit);
    let localFactor = 1;
    if (sRank < 1) localFactor *= (m.length || 1);
    if (sRank < 2) localFactor *= (m.width || 1);
    if (sRank < 3) localFactor *= (m.height || 1);
    return linkedValue * localFactor * mult * sign;
  }
  const l = m.length === undefined ? 1 : m.length;
  const w = m.width === undefined ? 1 : m.width;
  const h = m.height === undefined ? 1 : m.height;
  const base = hasLocalDimensions ? (l * w * h) : 0;
  return ((!hasLocalDimensions && mult !== 0) ? 1 : base) * mult * sign;
};

const resolveArticleQuantity = (articleId: string, allArticlesMap: Map<string, Article>, visited: Set<string> = new Set()): number => {
  if (visited.has(articleId)) return 0;
  visited.add(articleId);
  const article = allArticlesMap.get(articleId);
  if (!article) return 0;
  return article.measurements.reduce((sum, m) => {
    let rowVal = 0;
    if (m.linkedArticleId) {
       const sourceQty = resolveArticleQuantity(m.linkedArticleId, allArticlesMap, new Set(visited));
       const sourceArt = allArticlesMap.get(m.linkedArticleId);
       const finalSourceVal = m.linkedType === 'amount' && sourceArt ? (sourceQty * sourceArt.unitPrice) : sourceQty;
       rowVal = calculateRowValueWithContext(m, article.unit, finalSourceVal, sourceArt?.unit || '');
    } else { rowVal = calculateRowValueWithContext(m, article.unit); }
    return sum + rowVal;
  }, 0);
};

const recalculateAllArticles = (articles: Article[]): Article[] => {
  const articleMap = new Map(articles.map(a => [a.id, a]));
  return articles.map(art => ({ ...art, quantity: resolveArticleQuantity(art.id, articleMap) }));
};

const TableHeader: React.FC<{ activeColumn: string | null; tariffWidth?: number }> = ({ activeColumn, tariffWidth }) => (
  <thead className="bg-[#f8f9fa] border-b-2 border-black text-[9px] uppercase font-black text-gray-800 sticky top-0 z-10 shadow-md">
    <tr>
      <th className="py-2.5 px-1 text-center w-[30px] border-r border-gray-300">N..</th>
      <th className="py-2.5 px-1 text-left border-r border-gray-300" style={{ width: tariffWidth ? `${tariffWidth}px` : '135px' }}>Tariffa</th>
      <th className={`py-2.5 px-1 text-left min-w-[280px] border-r border-gray-300 ${activeColumn === 'desc' ? 'bg-blue-50' : ''}`}>Designazione dei Lavori</th>
      <th className="py-2.5 px-1 text-center w-[40px] border-r border-gray-300">Par.Ug.</th>
      <th className="py-2.5 px-1 text-center w-[50px] border-r border-gray-300">Lung..</th>
      <th className="py-2.5 px-1 text-center w-[50px] border-r border-gray-300">Larg.</th>
      <th className="py-2.5 px-1 text-center w-[50px] border-r border-gray-300">H/Peso</th>
      <th className="py-2.5 px-1 text-center w-[65px] border-r border-gray-300 bg-gray-100">Quantità</th>
      <th className="py-2.5 px-1 text-right w-[75px] border-r border-gray-300">Prezzo €</th>
      <th className="py-2.5 px-1 text-right w-[85px] border-r border-gray-300">Importo €</th>
      <th className="py-2.5 px-1 text-right w-[75px] border-r border-gray-300">M.O. €</th>
    </tr>
  </thead>
);

const ArticleGroup: React.FC<ArticleGroupProps> = (props) => {
   const { article, index, allArticles, isPrintMode, isCategoryLocked, isSurveyorGuardActive, projectSettings, lastMovedItemId, onUpdateArticle, onEditArticleDetails, onDeleteArticle, onAddMeasurement, onAddSubtotal, onUpdateMeasurement, onDeleteMeasurement, onOpenLinkModal, onScrollToArticle, onReorderMeasurements, onArticleDragStart, onArticleDrop, onArticleDragEnd, lastAddedMeasurementId, onColumnFocus, onViewAnalysis, onInsertExternalArticle, onToggleArticleLock, onOpenRebarCalculator, onOpenPaintingCalculator, onToggleVoiceAutomation, onToggleSmartRepeat, voiceAutomationActiveId, smartRepeatActiveId } = props;
   const [measurementDragOverId, setMeasurementDragOverId] = useState<string | null>(null);
   const [isArticleDragOver, setIsArticleDragOver] = useState(false);
   const [articleDropPosition, setArticleDropPosition] = useState<'top' | 'bottom' | null>(null);
   const tbodyRef = useRef<HTMLTableSectionElement>(null);
   const isArticleLocked = article.isLocked || false;
   const areControlsDisabled = isCategoryLocked || isArticleLocked;
   const isSafetyCategory = article.categoryCode.startsWith('S.');
   const displayMode = article.displayMode || 0;
   const isIndustrialMode = displayMode === 2;
   const isConciseMode = displayMode === 1;

   const processedMeasurements = article.measurements.map(m => {
        let val = 0;
        if (m.type !== 'subtotal') {
            if (m.linkedArticleId) {
                const linkedArt = allArticles.find(a => a.id === m.linkedArticleId);
                if (linkedArt) {
                    const baseVal = m.linkedType === 'amount' ? (linkedArt.quantity * linkedArt.unitPrice) : linkedArt.quantity;
                    val = calculateRowValueWithContext(m, article.unit, baseVal, linkedArt.unit);
                }
            } else { val = calculateRowValueWithContext(m, article.unit); }
        }
        return { ...m, calculatedValue: val };
   });

   let runningPartialSum = 0;
   const finalMeasurements = processedMeasurements.map(m => {
       let displayValue = 0;
       if (m.type === 'subtotal') { displayValue = runningPartialSum; runningPartialSum = 0; }
       else { displayValue = m.calculatedValue; runningPartialSum += m.calculatedValue; }
       return { ...m, displayValue };
   });

   return (
      <tbody 
        ref={tbodyRef} id={`article-${article.id}`} 
        style={{ scrollMarginTop: '60px' }}
        className={`bg-white border-b border-gray-400 relative transition-all ${isArticleLocked ? 'bg-gray-50/50' : ''} ${isArticleDragOver ? 'ring-2 ring-blue-500 shadow-xl' : ''} ${lastMovedItemId === article.id ? 'highlight-move' : ''}`}
      >
         <tr 
            className={`align-top transition-all ${!isPrintMode ? 'cursor-pointer hover:bg-slate-50' : ''} ${isIndustrialMode ? 'bg-slate-100 border-l-4 border-indigo-600' : ''}`}
            onClick={() => !isCategoryLocked && onUpdateArticle(article.id, 'displayMode', (displayMode + 1) % 3)}
         >
            <td className="text-center py-2 text-xs font-bold border-r border-gray-200 font-mono text-gray-500">{getWbsNumber(article.categoryCode)}.{index + 1}</td>
            <td className="p-1 border-r border-gray-200 align-top" style={{ width: projectSettings.tariffColumnWidth ? `${projectSettings.tariffColumnWidth}px` : '135px' }}>
                <textarea readOnly value={article.code} className={`font-mono font-bold text-xs w-full bg-transparent border-none px-1 resize-none overflow-hidden leading-tight ${isIndustrialMode ? 'text-indigo-800' : ''}`} rows={1} />
            </td>
            <td className="p-1 border-r border-gray-200">
                <p className={`leading-relaxed font-serif text-justify px-0.5 whitespace-pre-wrap text-sm ${isIndustrialMode ? 'line-clamp-1 italic font-bold' : isConciseMode ? 'line-clamp-2' : ''} ${isSafetyCategory ? 'text-orange-600' : 'text-blue-700'}`}>{article.description}</p>
            </td>
            <td className="border-r border-gray-200 p-1 text-center align-top">
                {!isPrintMode && !isCategoryLocked && (
                    <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); onToggleArticleLock(article.id); }} className="text-gray-400 hover:text-blue-500">{isArticleLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}</button>
                    </div>
                )}
            </td>
            <td colSpan={7} className="border-r border-gray-200"></td>
         </tr>
         {!isArticleLocked && !isIndustrialMode && finalMeasurements.map((m, idx) => (
             <tr key={m.id} className={`group/row transition-all text-xs ${m.type === 'subtotal' ? 'bg-yellow-50 font-bold' : 'bg-white'}`}>
                <td className="border-r border-gray-200"></td>
                <td className="border-r border-gray-200 text-center align-middle">
                    <button onClick={() => onDeleteMeasurement(article.id, m.id)} className="opacity-0 group-hover/row:opacity-100 text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </td>
                <td className="pl-3 pr-1 py-1 border-r border-gray-200 relative flex items-center gap-2">
                    {m.type === 'subtotal' ? <div className="italic text-gray-600 text-right w-full">Sommano parziale</div> : (
                        <input value={m.description} onChange={(e) => onUpdateMeasurement(article.id, m.id, 'description', e.target.value)} className="w-full bg-transparent border-none p-0 outline-none" placeholder="Descrizione misura..." />
                    )}
                </td>
                <td className="border-r border-gray-200 p-0 bg-gray-50">
                    <input type="number" value={m.multiplier || ''} onChange={(e) => onUpdateMeasurement(article.id, m.id, 'multiplier', parseFloat(e.target.value))} className="w-full text-center bg-transparent border-none focus:bg-white" />
                </td>
                <td className="border-r border-gray-200 p-0 bg-gray-50">
                    <input type="number" value={m.length || ''} onChange={(e) => onUpdateMeasurement(article.id, m.id, 'length', parseFloat(e.target.value))} className="w-full text-center bg-transparent border-none focus:bg-white" />
                </td>
                <td className="border-r border-gray-200 p-0 bg-gray-50">
                    <input type="number" value={m.width || ''} onChange={(e) => onUpdateMeasurement(article.id, m.id, 'width', parseFloat(e.target.value))} className="w-full text-center bg-transparent border-none focus:bg-white" />
                </td>
                <td className="border-r border-gray-200 p-0 bg-gray-50">
                    <input type="number" value={m.height || ''} onChange={(e) => onUpdateMeasurement(article.id, m.id, 'height', parseFloat(e.target.value))} className="w-full text-center bg-transparent border-none focus:bg-white" />
                </td>
                <td className="border-r border-gray-200 text-right font-mono pr-1 text-gray-600">{formatResult(m.displayValue)}</td>
                <td colSpan={3} className="border-r border-gray-200"></td>
             </tr>
         ))}
         <tr className={`font-bold text-xs border-t ${isIndustrialMode ? 'bg-slate-100' : 'bg-white'}`}>
             <td className="border-r border-gray-200"></td><td className="border-r border-gray-200"></td>
             <td className="px-2 py-3 text-left border-r flex items-center gap-3">
                {!isPrintMode && !isIndustrialMode && !isArticleLocked && (
                   <button onClick={() => onAddMeasurement(article.id)} className="w-6 h-6 rounded-full flex items-center justify-center text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white transition-all"><Plus className="w-4 h-4" /></button>
                )}
                <span className="uppercase text-[10px] ml-auto font-black italic text-gray-400">Sommano {article.unit}</span>
             </td>
             <td colSpan={4} className="border-r border-gray-200"></td>
             <td className="text-right pr-1 font-mono border-r font-black bg-gray-50">{formatResult(article.quantity)}</td>
             <td className="border-r text-right pr-1 font-mono">{formatResult(article.unitPrice)}</td>
             <td className="border-r text-right pr-1 font-mono font-black text-blue-900">{formatResult(article.quantity * article.unitPrice)}</td>
             <td className="border-r text-right pr-1 font-mono text-gray-400 italic">{(article.laborRate).toFixed(1)}%</td>
         </tr>
         <tr className="h-6"><td colSpan={11}></td></tr>
      </tbody>
   );
};

const App: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | 'visitor' | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>(PROJECT_INFO);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [articles, setArticles] = useState<Article[]>([]);
  const [analyses, setAnalyses] = useState<PriceAnalysis[]>([]);
  const [selectedCategoryCode, setSelectedCategoryCode] = useState<string>(CATEGORIES[0].code);
  const [currentFileHandle, setCurrentFileHandle] = useState<any>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastMovedItemId, setLastMovedItemId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('COMPUTO');
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => { setUser(u as FirebaseUser); setAuthLoading(false); });
    const unsubNet = onValue(ref(db!, ".info/connected"), (s) => setIsOnline(s.val() === true));
    return () => { unsubAuth(); unsubNet(); };
  }, []);

  // RIPRISTINO CLOUD (Patto di Ferro: apre l'ultimo lavoro da qualsiasi computer)
  useEffect(() => {
    if (!user || user === 'visitor') return;
    const fetchCloud = async () => {
        setIsCloudLoading(true);
        try {
            const snap = await get(ref(db!, `cloudProjects/${user.uid}/lastActive`));
            if (snap.exists()) {
                const d = snap.val().gecolaData;
                setProjectInfo(d.projectInfo); setCategories(d.categories); setAnalyses(d.analyses || []);
                setArticles(recalculateAllArticles(d.articles));
                playUISound('confirm');
            }
        } finally { setIsCloudLoading(false); }
    };
    fetchCloud();
  }, [user]);

  const handleSmartSave = async (silent = false) => {
    if (isCloudLoading || !user || user === 'visitor') return;
    if (silent) setIsAutoSaving(true);
    const data = { gecolaData: { projectInfo, categories, articles, analyses }, updatedAt: new Date().toISOString() };
    try {
        await set(ref(db!, `cloudProjects/${user.uid}/lastActive`), data);
        if (currentFileHandle) {
            const writable = await currentFileHandle.createWritable();
            await writable.write(JSON.stringify(data, null, 2));
            await writable.close();
        }
    } finally { if (silent) setTimeout(() => setIsAutoSaving(false), 800); }
  };

  useEffect(() => {
    if (isCloudLoading) return;
    const t = setTimeout(() => handleSmartSave(true), 3000);
    return () => clearTimeout(t);
  }, [articles, categories, projectInfo, analyses]);

  const handleScrollToArticle = (id: string) => {
    const art = articles.find(a => a.id === id);
    if (!art) return;
    if (selectedCategoryCode !== art.categoryCode) setSelectedCategoryCode(art.categoryCode);
    setTimeout(() => {
        const el = document.getElementById(`article-${id}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setLastMovedItemId(id);
            setTimeout(() => setLastMovedItemId(null), 3000);
        }
    }, 300);
  };

  const updateState = (newArticles: Article[], newCats = categories, newAn = analyses) => {
      const recomputed = recalculateAllArticles(newArticles);
      setArticles(recomputed); setCategories(newCats); setAnalyses(newAn);
  };

  const activeArticles = useMemo(() => articles.filter(a => a.categoryCode === selectedCategoryCode), [articles, selectedCategoryCode]);
  const totals = useMemo(() => {
    const work = articles.filter(a => categories.find(c => c.code === a.categoryCode)?.type !== 'safety').reduce((s, a) => s + (a.quantity * a.unitPrice), 0);
    const labor = articles.reduce((s, a) => s + (a.quantity * a.unitPrice * (a.laborRate/100)), 0);
    const taxable = work * (1 + projectInfo.safetyRate/100);
    return { totalWorks: work, totalLabor: labor, grandTotal: taxable * (1 + projectInfo.vatRate/100) } as Totals;
  }, [articles, categories, projectInfo]);

  if (authLoading || isCloudLoading) return <div className="h-screen bg-slate-900 flex flex-col items-center justify-center text-white"><Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" /><p className="font-black uppercase tracking-widest text-xs">Sincronizzazione Cloud...</p></div>;
  if (!user) return <Login onVisitorLogin={() => setUser('visitor')} />;

  return (
    <div className="h-screen flex flex-col bg-[#2c3e50] font-sans overflow-hidden text-slate-800">
      <div className="h-14 bg-[#2c3e50] border-b border-slate-600 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
              <Calculator className="w-6 h-6 text-orange-500" />
              <span className="text-white font-black uppercase italic tracking-tighter">{projectInfo.title}</span>
              {isOnline && <Cloud className={`w-4 h-4 ${isAutoSaving ? 'text-green-400 animate-pulse' : 'text-green-600'}`} />}
          </div>
          <div className="flex items-center gap-4">
              <button onClick={() => setIsSettingsModalOpen(true)} className="text-slate-300 hover:text-white"><Settings className="w-5 h-5" /></button>
              <button onClick={() => signOut(auth!)} className="text-red-400 hover:text-white"><LogOut className="w-5 h-5" /></button>
          </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
          <div className="w-72 bg-slate-200 border-r border-slate-300 overflow-y-auto scrollbar-hide p-3 space-y-2">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Capitoli WBS</div>
              {categories.map(c => (
                  <button key={c.code} onClick={() => setSelectedCategoryCode(c.code)} className={`w-full text-left p-3 rounded-xl border transition-all ${selectedCategoryCode === c.code ? 'bg-amber-50 border-amber-500 shadow-md font-black text-amber-900' : 'bg-white border-slate-100 text-slate-600'}`}>
                      <div className="text-[8px] font-mono opacity-50">{c.code}</div>
                      <div className="text-[10px] uppercase truncate">{c.name}</div>
                  </button>
              ))}
          </div>
          <div className="flex-1 flex flex-col bg-white overflow-y-auto scroll-smooth custom-scrollbar relative">
              <div className="p-8 min-h-full flex flex-col">
                  <table className="w-full text-left border-collapse table-fixed bg-white">
                      <TableHeader activeColumn={activeColumn} tariffWidth={projectInfo.tariffColumnWidth} />
                      {activeArticles.map((a, i) => (
                          <ArticleGroup key={a.id} article={a} index={i} allArticles={articles} isPrintMode={false} projectSettings={projectInfo} lastMovedItemId={lastMovedItemId} onUpdateArticle={(id, f, v) => updateState(articles.map(x => x.id === id ? {...x, [f]: v} : x))} onUpdateMeasurement={(aid, mid, f, v) => updateState(articles.map(x => x.id === aid ? {...x, measurements: x.measurements.map(m => m.id === mid ? {...m, [f]: v} : m)} : x))} onDeleteMeasurement={(aid, mid) => updateState(articles.map(x => x.id === aid ? {...x, measurements: x.measurements.filter(m => m.id !== mid)} : x))} onAddMeasurement={(aid) => { const nid = Math.random().toString(36).substr(2,9); updateState(articles.map(x => x.id === aid ? {...x, measurements: [...x.measurements, {id: nid, description: '', type: 'positive'}]} : x)) }} onToggleArticleLock={(id) => updateState(articles.map(x => x.id === id ? {...x, isLocked: !x.isLocked} : x))} onScrollToArticle={handleScrollToArticle} />
                      ))}
                  </table>
                  {/* SPAZIO DI RESPIRO (Patto di Ferro) */}
                  <div className="h-[60vh] shrink-0 pointer-events-none flex flex-col items-center justify-start pt-10">
                      <div className="w-px h-20 bg-gradient-to-b from-slate-200 to-transparent"></div>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mt-4">Fine del Rotolo</span>
                  </div>
              </div>
              {/* BOTTONE AGGIUNTA RAPIDA IA */}
              <button 
                onClick={async () => {
                    const desc = prompt("Cosa vuoi aggiungere?");
                    if (!desc) return;
                    const nid = Math.random().toString(36).substr(2,9);
                    const newArt: Article = { id: nid, categoryCode: selectedCategoryCode, code: 'NP.01', description: desc, unit: 'cad', unitPrice: 0, laborRate: 0, measurements: [{id: Math.random().toString(36).substr(2,9), description: 'Voce generata', type: 'positive', multiplier: 1}], quantity: 0 };
                    updateState([...articles, newArt]);
                    handleScrollToArticle(nid); // FOCUS PROTAGONISTA
                }}
                className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 transition-all hover:scale-110 active:scale-95 z-50 group"
              >
                  <Sparkles className="w-6 h-6" />
                  <span className="absolute right-full mr-4 bg-slate-800 text-white text-[10px] font-black px-3 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">Aggiungi con IA</span>
              </button>
          </div>
      </div>
      <ProjectSettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} info={projectInfo} onSave={setProjectInfo} />
    </div>
  );
};
export default App;
