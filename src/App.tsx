/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';

interface DataItem {
  Tariffa: string;
  DesEstesa: string;
  UnMisura: string;
  Prezzo1: string;
  IncMDO: string;
}

export default function App() {
  const [originalData, setOriginalData] = useState<DataItem[]>([]);
  const [extractedData, setExtractedData] = useState<DataItem[]>([]);
  const [filterKeywords, setFilterKeywords] = useState<string>('');
  const [jsonOutput, setJsonOutput] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractData = (text: string) => {
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
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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
      return;
    }

    let keywords = filterKeywords.toLowerCase().split(' ').filter(word => word.length > 0);

    // Determine which keywords are actually present in any of the descriptions
    const relevantKeywords = keywords.filter(keyword =>
      originalData.some(item => item.DesEstesa.toLowerCase().includes(keyword))
    );

    // If no relevant keywords, show all data if filterKeywords is empty, otherwise show nothing
    if (relevantKeywords.length === 0) {
      setExtractedData(filterKeywords ? [] : originalData);
      return;
    }

    const scoredData = originalData.map(item => {
      let score = 0;
      const description = item.DesEstesa.toLowerCase();
      relevantKeywords.forEach(keyword => {
        if (description.includes(keyword)) {
          score++;
        }
      });
      return { ...item, score };
    });

    const filteredAndSorted = scoredData
      .filter(item => item.score === relevantKeywords.length) // Filter by all relevant keywords
      .sort((a, b) => b.score - a.score); // Sort by the number of matched keywords

    setExtractedData(filteredAndSorted);
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
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Data Extractor</h1>

      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <textarea
            id="filter-input"
            className="flex-1 h-48 p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Inserisci parole chiave per filtrare (es. 'Tariffa A', 'Descrizione B')..."
            value={filterKeywords}
            onChange={(e) => setFilterKeywords(e.target.value)}
          ></textarea>
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
          >
            Applica Filtro
          </button>
        </div>

        {extractedData.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Extracted Data Table ({extractedData.length} items)</h2>
            <div className="overflow-x-auto max-h-96 relative border border-gray-200 rounded-lg">
              <table className="min-w-full bg-white">
                <thead className="sticky top-0 bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <tr>
                    <th className="py-3 px-6 text-left">Tariffa</th>
                    <th className="py-3 px-6 text-left">Descrizione Estesa</th>
                    <th className="py-3 px-6 text-left">Unità di Misura</th>
                    <th className="py-3 px-6 text-left">Prezzo</th>
                    <th className="py-3 px-6 text-left">Incidenza Manodopera</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                  {extractedData.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                      <td className="py-3 px-6 text-left whitespace-nowrap">{item.Tariffa}</td>
                      <td className="py-3 px-6 text-left">{item.DesEstesa}</td>
                      <td className="py-3 px-6 text-left">{item.UnMisura}</td>
                      <td className="py-3 px-6 text-left">{item.Prezzo1}</td>
                      <td className="py-3 px-6 text-left">{item.IncMDO}</td>
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
