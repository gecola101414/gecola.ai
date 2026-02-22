import { useState, useCallback, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { PriceListItem } from './types';

export default function App() {
  const [isDragging, setIsDragging] = useState(false);
  const [convertedData, setConvertedData] = useState<PriceListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [priceFilterType, setPriceFilterType] = useState<'above' | 'below'>('above');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiFiltering, setIsAiFiltering] = useState(false);
  const [aiFilteredIndices, setAiFilteredIndices] = useState<number[] | null>(null);

  const processFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const fileContent = e.target?.result as string;

        if (fileContent.includes('progid="PriMus.Document.XPWE"') || fileContent.includes('<PweDocumento>')) {
          // XML Parsing Logic
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(fileContent, "text/xml");

          const parserError = xmlDoc.querySelector("parsererror");
          if (parserError) {
            throw new Error("Failed to parse XML. The file may be corrupted or not well-formed.");
          }

          // Try multiple common item tags
          let itemNodes = xmlDoc.querySelectorAll('Lavorazione');
          if (itemNodes.length === 0) itemNodes = xmlDoc.querySelectorAll('ArticoloDiElenco');
          if (itemNodes.length === 0) itemNodes = xmlDoc.querySelectorAll('PweEPItem');
          if (itemNodes.length === 0) itemNodes = xmlDoc.querySelectorAll('EPItem');
          if (itemNodes.length === 0) itemNodes = xmlDoc.querySelectorAll('Articolo');

          if (itemNodes.length === 0) {
              throw new Error("Could not find price list items (Lavorazione, PweEPItem, etc.) in the XML file.");
          }

          const categories: { [key: string]: string } = {};
          const capitoliNodes = xmlDoc.querySelectorAll('DGCapitoliItem, PweDGCapitoliItem, CategoriaItem');
          capitoliNodes.forEach(node => {
              const code = node.querySelector('Codice, ID')?.textContent;
              const desc = node.querySelector('DesSintetica, Descrizione, DesEstesa')?.textContent;
              if (code && desc) {
                  categories[code] = desc;
              }
          });
          
          const items: PriceListItem[] = Array.from(itemNodes).map(node => {
            const getTagContent = (tagNames: string[]) => {
              for (const tag of tagNames) {
                const el = node.querySelector(tag);
                if (el && el.textContent) return el.textContent;
              }
              return '';
            };
            
            return {
              codice: getTagContent(['Articolo', 'Numero', 'Codice', 'CodiceArticolo', 'ID']),
              descrizione: getTagContent(['Descrizione', 'DesEstesa', 'DesSintetica', 'Testo']),
              unita_misura: getTagContent(['UnMisura', 'UM', 'UnitaMisura', 'Unita']),
              prezzo: parseFloat(getTagContent(['Prezzo1', 'Prezzo', 'PrezzoUnitario', 'Valore']).replace(',', '.')),
              incidenza_mdo: parseFloat(getTagContent(['IncMDO', 'ManoOpera', 'MDO']).replace(',', '.')) || 0,
              categoria: categories[getTagContent(['Capitolo', 'IDCapitolo', 'IDCategoria'])] || 'N/A',
            };
          });
          setConvertedData(items);
        } else {
          // Plain Text Parsing Logic
          const lines = fileContent.split(/\r?\n/);
          const items: PriceListItem[] = [];
          const lineRegex = /^([\w\.\-\/]+)\s+(.+?)\s+([a-zA-Z\d\/\.\u00B2\u00B3]+)\s+([\d\.,]+)$/;

          const parsePrice = (str: string) => {
            const lastComma = str.lastIndexOf(',');
            const lastDot = str.lastIndexOf('.');
            if (lastComma > lastDot) {
              return parseFloat(str.replace(/\./g, '').replace(',', '.'));
            } else {
              return parseFloat(str.replace(/,/g, ''));
            }
          };

          for (const line of lines) {
              const trimmedLine = line.trim();
              if (!trimmedLine) continue;

              const match = trimmedLine.match(lineRegex);
              if (match) {
                  const [, codice, descrizione, unita_misura, prezzoStr] = match;
                  const prezzo = parsePrice(prezzoStr);
                  if (!isNaN(prezzo)) {
                    items.push({
                        codice,
                        descrizione: descrizione.trim(),
                        unita_misura,
                        prezzo,
                        incidenza_mdo: 0,
                        categoria: 'N/A',
                    });
                  }
              }
          }

          if (items.length === 0) {
              throw new Error("Could not extract any items from the text file.");
          }
          setConvertedData(items);
        }

        setError(null);
        setAiFilteredIndices(null);
      } catch (err) {
        setError((err as Error).message || 'Failed to parse file.');
        console.error(err);
      }
    };
    reader.onerror = () => {
      setError('Failed to read the file.');
    };
    reader.readAsText(file, 'ISO-8859-1');
  };

  const handleAiFilter = async () => {
    if (!aiPrompt || convertedData.length === 0) return;
    
    setIsAiFiltering(true);
    setError(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      // We send a sample of items to help the AI understand the context, 
      // but for filtering we'll ask it to return keywords or a logic.
      // For simplicity in this demo, we'll ask it to return the indices of matching items from the first 200 items.
      const itemsToAnalyze = convertedData.slice(0, 200).map((item, idx) => ({
        id: idx,
        desc: item.descrizione
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Given the following list of construction price items and the user request "${aiPrompt}", return a JSON array of the "id" values for items that match the request.
        Items: ${JSON.stringify(itemsToAnalyze)}`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const result = JSON.parse(response.text || "[]");
      if (Array.isArray(result)) {
        setAiFilteredIndices(result);
      }
    } catch (err) {
      console.error("AI Filtering error:", err);
      setError("AI filtering failed. Please try a simpler prompt.");
    } finally {
      setIsAiFiltering(false);
    }
  };

  const filteredData = useMemo(() => {
    let data = convertedData;

    if (aiFilteredIndices !== null) {
      data = data.filter((_, idx) => aiFilteredIndices.includes(idx));
    }

    if (searchTerm) {
      data = data.filter(item => item.descrizione.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (priceFilter) {
      const price = parseFloat(priceFilter);
      if (!isNaN(price)) {
        if (priceFilterType === 'above') {
          data = data.filter(item => item.prezzo > price);
        } else {
          data = data.filter(item => item.prezzo < price);
        }
      }
    }

    return data;
  }, [convertedData, searchTerm, priceFilter, priceFilterType, aiFilteredIndices]);

  const handleClear = () => {
    setConvertedData([]);
    setSearchTerm('');
    setPriceFilter('');
    setPriceFilterType('above');
    setAiPrompt('');
    setAiFilteredIndices(null);
    setError(null);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleDownloadJSON = () => {
    const dataStr = JSON.stringify(convertedData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'price_list.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-800 font-sans overflow-hidden">
      <header className="bg-white shadow-sm flex-shrink-0">
        <div className="max-w-full mx-auto py-3 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Price List Analyzer</h1>
          <div className="flex gap-2">
            {convertedData.length > 0 && (
              <>
                <button 
                  onClick={handleDownloadJSON}
                  className="px-3 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 transition-colors"
                >
                  Download JSON
                </button>
                <button 
                  onClick={handleClear}
                  className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                >
                  Clear
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className={`flex-grow overflow-hidden flex flex-col p-4 ${convertedData.length === 0 ? 'justify-center items-center' : ''}`}>
        {convertedData.length === 0 ? (
          <div 
            id="dropzone"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`w-full max-w-2xl border-2 border-dashed rounded-xl p-16 text-center transition-all duration-300 ${
              isDragging ? 'border-indigo-600 bg-indigo-50 scale-105' : 'border-gray-300 bg-white hover:border-gray-400'
            }`}>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept="*"
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload" className="cursor-pointer block">
              <div className="mb-4 flex justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-700">Drag & drop your price list here</p>
              <p className="text-sm text-gray-500 mt-2">Supports PriMus XML, usBIM, and plain text files</p>
              <button type="button" className="mt-6 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 shadow-md transition-all">
                Select File
              </button>
            </label>
          </div>
        ) : (
          <div className="flex flex-col h-full gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-shrink-0">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
                <div className="lg:col-span-2">
                  <label htmlFor="aiPrompt" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">AI Smart Filter (e.g. "opere in cemento armato")</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      id="aiPrompt"
                      value={aiPrompt}
                      onChange={e => setAiPrompt(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAiFilter()}
                      className="flex-grow px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      placeholder="Ask AI to filter items..."
                    />
                    <button 
                      onClick={handleAiFilter}
                      disabled={isAiFiltering}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        isAiFiltering ? 'bg-gray-200 text-gray-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {isAiFiltering ? 'Filtering...' : 'Apply AI'}
                    </button>
                    {aiFilteredIndices && (
                      <button 
                        onClick={() => setAiFilteredIndices(null)}
                        className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Reset AI
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label htmlFor="search" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Search Description</label>
                  <input 
                    type="text" 
                    id="search"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    placeholder="Keywords..."
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-grow">
                    <label htmlFor="priceFilter" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Price</label>
                    <input 
                      type="number" 
                      id="priceFilter"
                      value={priceFilter}
                      onChange={e => setPriceFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      placeholder="Value"
                    />
                  </div>
                  <div className="w-24">
                    <label htmlFor="priceFilterType" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Type</label>
                    <select 
                      id="priceFilterType"
                      value={priceFilterType}
                      onChange={e => setPriceFilterType(e.target.value as 'above' | 'below')}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm appearance-none"
                    >
                      <option value="above">Above</option>
                      <option value="below">Below</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-grow overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
              <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-sm font-bold text-gray-600 uppercase tracking-widest">
                  Results: <span className="text-indigo-600">{filteredData.length}</span> items
                </h2>
                {aiFilteredIndices && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase">AI Filter Active</span>}
              </div>
              <div className="flex-grow overflow-auto">
                <table className="w-full text-left border-collapse table-fixed">
                  <thead className="sticky top-0 bg-white z-10 shadow-sm">
                    <tr>
                      <th className="w-24 px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider border-b">Codice</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider border-b">Descrizione</th>
                      <th className="w-20 px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider border-b">U.M.</th>
                      <th className="w-24 px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider border-b text-right">Prezzo</th>
                      <th className="w-24 px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider border-b text-right">Inc. MDO %</th>
                      <th className="w-32 px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider border-b">Categoria</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredData.map((item, index) => (
                      <tr key={index} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="px-4 py-2 text-xs font-mono text-gray-500 truncate">{item.codice}</td>
                        <td className="px-4 py-2 text-xs text-gray-700 leading-relaxed font-medium">
                          <div className="line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                            {item.descrizione}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-500 font-bold">{item.unita_misura}</td>
                        <td className="px-4 py-2 text-xs text-gray-900 font-bold text-right">€ {item.prezzo.toFixed(2)}</td>
                        <td className="px-4 py-2 text-xs text-indigo-600 font-bold text-right">{item.incidenza_mdo.toFixed(2)}%</td>
                        <td className="px-4 py-2 text-[10px] text-gray-400 uppercase font-bold truncate">{item.categoria || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="fixed bottom-4 right-4 max-w-md bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-lg animate-slide-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="ml-auto pl-3">
                <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
