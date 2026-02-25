import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image, Rect, Group, Line, Text } from 'react-konva';
import useImage from 'use-image';

interface ScaffoldingOverlayProps {
  imageSrc: string;
  facadeWidth: number; // in meters
  facadeHeight: number; // in meters
  onUpdate: (config: { x: number; y: number; width: number; height: number; opacity: number; stageWidth: number; stageHeight: number }) => void;
  initialConfig?: { x: number; y: number; width: number; height: number; opacity: number; stageWidth: number; stageHeight: number };
}

export const ScaffoldingOverlay: React.FC<ScaffoldingOverlayProps> = ({
  imageSrc,
  facadeWidth,
  facadeHeight,
  onUpdate,
  initialConfig
}) => {
  const [img] = useImage(imageSrc);
  const stageRef = useRef<any>(null);
  
  const [stageDimensions, setStageDimensions] = useState({ 
    width: 800, 
    height: 600 
  });
  const [zoom, setZoom] = useState(1);
  
  // Scaffolding module standards (in meters)
  const MODULE_WIDTH = 1.80;
  const MODULE_HEIGHT = 2.00;

  const [config, setConfig] = useState(initialConfig || {
    x: 50,
    y: 50,
    width: 200, // Smaller initial width
    height: 150, // Smaller initial height
    opacity: 0.8,
    stageWidth: 800,
    stageHeight: 600
  });

  useEffect(() => {
    if (img && !initialConfig) {
      const aspectRatio = img.height / img.width;
      const newHeight = 800 * aspectRatio;
      setStageDimensions({ width: 800, height: newHeight });
      
      // Center a small scaffolding on first load
      const initialWidth = 200;
      const initialHeight = 150;
      const updatedConfig = { 
        ...config, 
        x: (800 - initialWidth) / 2,
        y: (newHeight - initialHeight) / 2,
        width: initialWidth,
        height: initialHeight,
        stageHeight: newHeight, 
        stageWidth: 800 
      };
      setConfig(updatedConfig);
      onUpdate(updatedConfig);
    } else if (img) {
      const aspectRatio = img.height / img.width;
      const newHeight = 800 * aspectRatio;
      setStageDimensions({ width: 800, height: newHeight });
    }
  }, [img]);

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
  }, [initialConfig]);

  const handleDragMove = (e: any) => {
    const node = e.target;
    const x = node.x();
    const y = node.y();
    
    // Strict constraints to keep it inside the photo, with margin for the handle
    const handleMargin = 15;
    const constrainedX = Math.max(0, Math.min(x, stageDimensions.width - config.width - handleMargin));
    const constrainedY = Math.max(0, Math.min(y, stageDimensions.height - config.height - handleMargin));
    
    node.x(constrainedX);
    node.y(constrainedY);
  };

  const handleDragEnd = (e: any) => {
    const newConfig = {
      ...config,
      x: e.target.x(),
      y: e.target.y()
    };
    setConfig(newConfig);
    onUpdate(newConfig);
  };

  const resetScaffolding = () => {
    const initialWidth = 150;
    const initialHeight = 120;
    const newConfig = {
      ...config,
      x: (stageDimensions.width - initialWidth) / 2,
      y: (stageDimensions.height - initialHeight) / 2,
      width: initialWidth,
      height: initialHeight,
    };
    setConfig(newConfig);
    onUpdate(newConfig);
  };

  const handleTransformEnd = (e: any) => {
    const node = e.target;
    const newConfig = {
      ...config,
      x: node.x(),
      y: node.y(),
      width: node.width() * node.scaleX(),
      height: node.height() * node.scaleY()
    };
    node.scaleX(1);
    node.scaleY(1);
    setConfig(newConfig);
    onUpdate(newConfig);
  };

  const renderScaffoldingStructure = () => {
    const elements = [];
    const SCAFF_COLOR = "#ef4444"; // Red color as requested
    
    // Calculate number of modules based on facade dimensions
    const numCols = Math.max(1, Math.ceil(facadeWidth / MODULE_WIDTH));
    const numRows = Math.max(1, Math.ceil(facadeHeight / MODULE_HEIGHT));
    
    const colWidth = config.width / numCols;
    const rowHeight = config.height / numRows;

    for (let c = 0; c <= numCols; c++) {
      const x = c * colWidth;
      
      // Vertical Frames (Montanti)
      elements.push(
        <Line
          key={`v-${c}`}
          points={[x, 0, x, config.height]}
          stroke={SCAFF_COLOR}
          strokeWidth={2.5}
        />
      );

      // Improved Base Plates (Piedritti / Basette)
      elements.push(
        <Group key={`base-${c}`} x={x} y={config.height}>
          {/* Base plate horizontal part */}
          <Rect x={-8} y={0} width={16} height={3} fill={SCAFF_COLOR} />
          {/* Base plate vertical adjustment part */}
          <Rect x={-2} y={-10} width={4} height={10} fill={SCAFF_COLOR} />
        </Group>
      );

      // Enhanced Terminal Parts (Montanti di sommità)
      if (c < numCols) {
        elements.push(
          <Group key={`term-${c}`} x={x} y={-rowHeight * 0.4}>
             {/* Terminal frame extensions */}
             <Line points={[0, 0, 0, rowHeight * 0.4]} stroke={SCAFF_COLOR} strokeWidth={2.5} />
             <Line points={[colWidth, 0, colWidth, rowHeight * 0.4]} stroke={SCAFF_COLOR} strokeWidth={2.5} />
             
             {/* Top guardrails (Parapetti di sommità) */}
             <Line points={[0, 5, colWidth, 5]} stroke={SCAFF_COLOR} strokeWidth={1.5} />
             <Line points={[0, 15, colWidth, 15]} stroke={SCAFF_COLOR} strokeWidth={1.5} />
             
             {/* Top diagonal for terminal part */}
             <Line points={[0, rowHeight * 0.4, colWidth, 5]} stroke={SCAFF_COLOR} strokeWidth={1} opacity={0.4} />
          </Group>
        );
      }
    }

    for (let r = 0; r <= numRows; r++) {
      const y = r * rowHeight;
      
      // Horizontal Ledgers (Correnti)
      elements.push(
        <Line
          key={`h-${r}`}
          points={[0, y, config.width, y]}
          stroke={SCAFF_COLOR}
          strokeWidth={2}
        />
      );

      // Toeboards (Fermapiedi) - only on working levels
      if (r > 0) {
        elements.push(
          <Rect
            key={`toe-${r}`}
            x={0}
            y={y - 8}
            width={config.width}
            height={8}
            fill={SCAFF_COLOR}
            opacity={0.3}
            stroke={SCAFF_COLOR}
            strokeWidth={0.5}
          />
        );
      }

      // Diagonals
      if (r < numRows) {
        for (let c = 0; c < numCols; c += 2) {
          elements.push(
            <Line
              key={`diag-${r}-${c}`}
              points={[c * colWidth, r * rowHeight, (c + 1) * colWidth, (r + 1) * rowHeight]}
              stroke={SCAFF_COLOR}
              strokeWidth={1.2}
              opacity={0.5}
            />
          );
        }
      }
    }

    return elements;
  };

  return (
    <div className="space-y-4 w-full">
      <div className="bg-zinc-900 p-3 rounded-t-xl flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Sovrapposizione Tecnica in Scala (ROSSO)</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={resetScaffolding}
            className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded border border-white/10 transition-colors uppercase font-bold"
          >
            Ripristina Posizione
          </button>
          <div className="text-[10px] text-zinc-500 font-mono">
            PROSPETTO: {facadeWidth}m x {facadeHeight}m | CONFIGURAZIONE: {Math.ceil(facadeWidth / MODULE_WIDTH)}x{Math.ceil(facadeHeight / MODULE_HEIGHT)} MODULI
          </div>
        </div>
      </div>
      
      <div className="border border-zinc-200 rounded-b-xl overflow-hidden bg-zinc-100 shadow-2xl relative">
        <div 
          className="overflow-auto max-h-[700px] flex justify-center bg-zinc-200/50"
          style={{ cursor: zoom > 1 ? 'grab' : 'default' }}
        >
          <div style={{ 
            transform: `scale(${zoom})`, 
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease-out',
            width: stageDimensions.width,
            height: stageDimensions.height
          }}>
            <Stage 
              width={stageDimensions.width} 
              height={stageDimensions.height} 
              ref={stageRef}
            >
              <Layer>
                {img && (
                  <Image
                    image={img}
                    width={stageDimensions.width}
                    height={stageDimensions.height}
                    opacity={1}
                  />
                )}
                <Group
                  x={config.x}
                  y={config.y}
                  draggable
                  onDragMove={handleDragMove}
                  onDragEnd={handleDragEnd}
                >
                  <Rect
                    width={config.width}
                    height={config.height}
                    fill="rgba(239, 68, 68, 0.05)"
                    stroke="#ef4444"
                    strokeWidth={1}
                    dash={[5, 5]}
                  />
                  
                  <Group opacity={config.opacity}>
                    {renderScaffoldingStructure()}
                  </Group>
                  
                  {/* Scale Handle */}
                  <Group
                    x={config.width}
                    y={config.height}
                    draggable
                    onDragMove={(e) => {
                      const node = e.target;
                      const handleMargin = 15;
                      // Local coordinates relative to parent Group
                      let newWidth = Math.max(40, node.x());
                      let newHeight = Math.max(40, node.y());
                      
                      // Constrain width/height so it doesn't go off stage
                      if (config.x + newWidth + handleMargin > stageDimensions.width) {
                        newWidth = stageDimensions.width - config.x - handleMargin;
                      }
                      if (config.y + newHeight + handleMargin > stageDimensions.height) {
                        newHeight = stageDimensions.height - config.y - handleMargin;
                      }

                      setConfig({ ...config, width: newWidth, height: newHeight });
                      node.x(newWidth);
                      node.y(newHeight);
                    }}
                    onDragEnd={() => onUpdate(config)}
                  >
                    <Rect
                      x={-15}
                      y={-15}
                      width={30}
                      height={30}
                      fill="#ef4444"
                      cornerRadius={6}
                      shadowBlur={10}
                      shadowOpacity={0.4}
                    />
                    {/* Scale icon lines */}
                    <Line points={[-8, 8, 8, -8]} stroke="white" strokeWidth={2.5} />
                    <Line points={[3, 8, 8, 8, 8, 3]} stroke="white" strokeWidth={2.5} />
                    <Line points={[-3, -8, -8, -8, -8, -3]} stroke="white" strokeWidth={2.5} />
                  </Group>
                </Group>
              </Layer>
            </Stage>
          </div>
        </div>
        
        <div className="p-5 bg-white border-t border-zinc-200 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-[10px] text-zinc-400 uppercase font-bold">Strumenti di Precisione</p>
              <p className="text-xs text-zinc-600 font-medium">Usa lo zoom per dettagli. Trascina il ponteggio rosso per allinearlo.</p>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3 bg-zinc-50 p-2 px-4 rounded-xl border border-zinc-100">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">Zoom Foto</label>
                <input 
                  type="range" 
                  min="1" 
                  max="2.5" 
                  step="0.1" 
                  value={zoom} 
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-24 h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                />
                <span className="text-[10px] font-mono font-bold text-zinc-500 w-8">{Math.round(zoom * 100)}%</span>
              </div>
              
              <div className="flex items-center gap-3 bg-zinc-50 p-2 px-4 rounded-xl border border-zinc-100">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">Opacità</label>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1" 
                  step="0.1" 
                  value={config.opacity} 
                  onChange={(e) => {
                    const newOpacity = parseFloat(e.target.value);
                    setConfig({ ...config, opacity: newOpacity });
                    onUpdate({ ...config, opacity: newOpacity });
                  }}
                  className="w-24 h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ScaffoldingOverlay component end
