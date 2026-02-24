/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import HighlightedInput from './components/HighlightedInput';

interface DataItem {
  Tariffa: string;
  DesEstesa: string;
  UnMisura: string;
  Prezzo1: string;
  IncMDO: string;
}

export default function App() {
  const highlightColor = '#FFFF00'; // Define highlight color here
  const [originalData, setOriginalData] = useState<DataItem[]>([]);
  const [extractedData, setExtractedData] = useState<DataItem[]>([]);
  const [filterKeywords, setFilterKeywords] = useState<string>('');
  const [jsonOutput, setJsonOutput] = useState<string>('');
  const [matchedKeywords, setMatchedKeywords] = useState<{
    word: string;
    color: string;
  }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const italianStopWords = [
    'il', 'lo', 'la', 'i', 'gli', 'le', // definite articles
    'un', 'uno', 'una', // indefinite articles
    'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra', // prepositions
    'e', 'o', 'ma', 'se', 'perché', 'quindi', 'cioè', // conjunctions
    'che', 'chi', 'cosa', 'dove', 'quando', 'come', 'quale', // interrogative/relative pronouns
    'non', 'si', 'ci', 'ne', // common adverbs/particles
    'io', 'tu', 'lui', 'lei', 'noi', 'voi', 'loro', // personal pronouns
    'mio', 'tuo', 'suo', 'nostro', 'vostro', 'loro', // possessive adjectives
    'questo', 'quello', 'ogni', 'alcuni', 'molti', 'tutti', // demonstrative/indefinite adjectives
    'è', 'sono', 'ha', 'hanno', 'ho', 'hai', 'siamo', 'siete', // forms of 'essere' and 'avere'
    'del', 'della', 'dei', 'degli', 'delle', // articulated prepositions
    'al', 'alla', 'ai', 'agli', 'alle', // articulated prepositions
    'dal', 'dalla', 'dai', 'dagli', 'dalle', // articulated prepositions
    'nel', 'nella', 'nei', 'negli', 'nelle', // articulated prepositions
    'col', 'colla', 'coi', 'cogli', 'colle', // articulated prepositions
    'sul', 'sulla', 'sui', 'sugli', 'sulle', // articulated prepositions
  ];

  const extractData = (text: string) => {
    setIsLoading(true);
    const data: DataItem[] = [];
    const regex = /<Tariffa>(.*?)<\/Tariffa>.*?<DesEstesa>(.*?)<\/DesEstesa>.*?<UnMisura>(.*?)<\/UnMisura>.*?<Prezzo1>(.*?)<\/Prezzo1>.*?<IncMDO>(.*?)<\/IncMDO>/gs;
    let match;

    while ((match = regex.exec(text)) !== null) {
      data.push({
        Tariffa: match[1].trim(),
        DesEstesa: match[2].trim(),
        UnMisura: match[3].trim(),
        Prezzo1: match[4].trim(),
        IncMDO: match[5].trim(),
      });
    }

    setOriginalData(data);
    setExtractedData(data);
    setJsonOutput(JSON.stringify(data, null, 2));
    setIsLoading(false);
  };

  const pluralizeItalian = (word: string): string[] => {
    const lowerWord = word.toLowerCase();
    // Simple pluralization rules for common Italian endings
    if (lowerWord.endsWith('o')) return [word, lowerWord.slice(0, -1) + 'i'];
    if (lowerWord.endsWith('e')) return [word, lowerWord.slice(0, -1) + 'i'];
    if (lowerWord.endsWith('a')) return [word, lowerWord.slice(0, -1) + 'e'];
    if (lowerWord.endsWith('co')) return [word, lowerWord.slice(0, -2) + 'chi'];
    if (lowerWord.endsWith('go')) return [word, lowerWord.slice(0, -2) + 'ghi'];
    if (lowerWord.endsWith('ca')) return [word, lowerWord.slice(0, -2) + 'che'];
    if (lowerWord.endsWith('ga')) return [word, lowerWord.slice(0, -2) + 'ghe'];
    // Words ending in -i, -ie, or consonants often don't change or have irregular plurals
    if (lowerWord.endsWith('i')) return [word];
    // Default: return original word and assume it might be its own plural or an irregular one
    return [word];
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        extractData(content);
      };
      reader.readAsText(file);
    }
  };

  const applyFilter = () => {
    if (!filterKeywords) {
      setExtractedData(originalData);
      setMatchedKeywords([]);
      return;
    }

    const inputKeywords = filterKeywords.toLowerCase().split(' ').filter(word => word.length > 0);
    const allKeywordForms = new Set<string>();
    const filteredInputKeywords = inputKeywords.filter(word => !italianStopWords.includes(word));

    filteredInputKeywords.forEach(keyword => {
      pluralizeItalian(keyword).forEach(form => allKeywordForms.add(form));
    });


    const currentMatchedKeywords: { word: string; color: string }[] = [];

    const dataToFilter = filterKeywords.split(' ').length > 1 ? extractedData : originalData;

    const scoredData = dataToFilter.map(item => {
      const description = item.DesEstesa.toLowerCase();
      let score = 0;
      const itemMatchedWords: string[] = [];

      allKeywordForms.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        if (regex.test(description)) {
          score++;
          itemMatchedWords.push(keyword);
        }
      });
      return { ...item, score, itemMatchedWords };
    });

    const filteredAndSorted = scoredData
      .filter(item => item.itemMatchedWords.length === filteredInputKeywords.length) // Filter only if all keywords are present in a single entry
      .sort((a, b) => b.score - a.score); // Sort by the number of matched keywords

    // Collect matched keywords for highlighting from the filtered data
    filteredAndSorted.forEach(item => {
      item.itemMatchedWords.forEach(matchedWord => {
        if (!currentMatchedKeywords.some(mk => mk.word === matchedWord)) {
          currentMatchedKeywords.push({
            word: matchedWord,
            color: highlightColor,
          });
        }
      });
    });

    if (filteredAndSorted.length > 0 || filterKeywords.split(' ').length === 0) {
      setMatchedKeywords(currentMatchedKeywords);
      setExtractedData(filteredAndSorted);
    } else {
      // If no results for the new keyword, revert to previous extractedData and matchedKeywords
      // This means the state remains unchanged, effectively preserving the previous filter.
      console.log("No results for new keyword, preserving previous filter.");
    }
  };

  const highlightText = (text: string) => {
    if (matchedKeywords.length === 0) return text;

    let highlightedText: (string | JSX.Element)[] = [text];

    matchedKeywords.forEach(({ word, color }) => {
      const newHighlightedText: (string | JSX.Element)[] = [];
      const regex = new RegExp(`(\\b${word}\\b)`, 'gi');

      highlightedText.forEach(segment => {
        if (typeof segment === 'string') {
          const parts = segment.split(regex);
          for (let i = 0; i < parts.length; i++) {
            if (i % 2 === 1) {
              newHighlightedText.push(
                <span key={`${word}-${i}`} style={{ backgroundColor: color, borderRadius: '3px', padding: '1px 3px' }}>
                  {parts[i]}
                </span>
              );
            } else {
              newHighlightedText.push(parts[i]);
            }
          }
        } else {
          newHighlightedText.push(segment);
        }
      });
      highlightedText = newHighlightedText;
    });

    return <>{highlightedText}</>;
  };

  const resetFilter = () => {
    setFilterKeywords('');
    setExtractedData(originalData);
    setMatchedKeywords([]);
  };

  const downloadJson = () => {
    const blob = new Blob([jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 w-full max-w-full">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Data Extractor</h1>

      <div className="w-full bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <HighlightedInput
            id="filter-input"
            className="flex-1 h-48 p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Inserisci parole chiave per filtrare (es. 'Tariffa A', 'Descrizione B')..."
            value={filterKeywords}
            onChange={setFilterKeywords}
            matchedKeywords={matchedKeywords}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".txt,.xml"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Carica File
          </button>
          <button
            onClick={applyFilter}
            className="w-full sm:w-auto bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isLoading}
          >
            Applica Filtro
          </button>
          <button
            onClick={resetFilter}
            className="w-full sm:w-auto bg-gray-500 text-white py-3 px-6 rounded-md hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            disabled={isLoading}
          >
            Azzera Filtro
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Elaborazione dati...</span>
          </div>
        )}

        {!isLoading && extractedData.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Extracted Data Table ({extractedData.length} items)</h2>
            <div className="overflow-x-auto max-h-96 relative border border-gray-200 rounded-lg">
              <table className="min-w-full bg-white">
                <thead className="sticky top-0 bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <tr>
                    <th className="py-3 px-6 text-left w-[8%]">Tariffa</th>
                    <th className="py-3 px-6 text-left w-[60%]">Descrizione Estesa</th>
                    <th className="py-3 px-6 text-left w-[7%]">Unità di Misura</th>
                    <th className="py-3 px-6 text-left w-[12.5%]">Prezzo</th>
                    <th className="py-3 px-6 text-left w-[12.5%]">Incidenza Manodopera</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                  {extractedData.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                      <td className="py-3 px-6 text-left w-[8%] whitespace-nowrap">{item.Tariffa}</td>
                      <td className="py-3 px-6 text-justify w-[60%] whitespace-normal break-words">{highlightText(item.DesEstesa)}</td>
                      <td className="py-3 px-6 text-left w-[7%] whitespace-nowrap">{item.UnMisura}</td>
                      <td className="py-3 px-6 text-left w-[12.5%] whitespace-nowrap">{item.Prezzo1}</td>
                      <td className="py-3 px-6 text-left w-[12.5%] whitespace-nowrap">{item.IncMDO}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={downloadJson}
              className="mt-4 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Download JSON
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
