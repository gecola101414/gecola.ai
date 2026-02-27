import React, { useRef, useEffect, useState } from 'react';
import { Plus, Trash2, Eraser, Move, Lock, Unlock, RotateCcw } from 'lucide-react';
import { Stage, Layer, Image, Rect, Group, Line, Text, Circle } from 'react-konva';
import useImage from 'use-image';
import { cn } from '../lib/utils';
import { AnchorPoint, ErasedPath } from '../types';
import { ANCHOR_TYPES } from '../constants';

interface ScaffoldingOverlayProps {
  imageSrc: string;
  facadeWidth: number; // in meters
  facadeHeight: number; // in meters
  moduleWidth?: number;
  moduleHeight?: number;
  hasShadingNet?: boolean;
  hasNightLights?: boolean;
  anchors: AnchorPoint[];
  erasedPaths?: ErasedPath[];
  onUpdate: (config: { x: number; y: number; width: number; height: number; opacity: number; stageWidth: number; stageHeight: number }) => void;
  onUpdateAnchors: (anchors: AnchorPoint[]) => void;
  onUpdateErasedPaths?: (paths: ErasedPath[]) => void;
  onUpdateShadingNet?: (hasNet: boolean) => void;
  initialConfig?: { x: number; y: number; width: number; height: number; opacity: number; stageWidth: number; stageHeight: number };
}

export const ScaffoldingOverlay: React.FC<ScaffoldingOverlayProps> = ({
  imageSrc,
  facadeWidth,
  facadeHeight,
  moduleWidth = 1.80,
  moduleHeight = 2.00,
  hasShadingNet = false,
  hasNightLights = false,
  anchors,
  erasedPaths,
  onUpdate,
  onUpdateAnchors,
  onUpdateErasedPaths,
  onUpdateShadingNet,
  initialConfig
}) => {
  const [img] = useImage(imageSrc);
  const stageRef = useRef<any>(null);
  const [selectedAnchorType, setSelectedAnchorType] = useState(ANCHOR_TYPES[0]);
  
  const [stageDimensions, setStageDimensions] = useState({ 
    width: 800, 
    height: 600 
  });
  const [zoom, setZoom] = useState(1);
  const [tool, setTool] = useState<'move' | 'eraser' | 'anchor'>('move');
  const [isLocked, setIsLocked] = useState(false);
  const [isAnchorsLocked, setIsAnchorsLocked] = useState(false);
  const [localErasedPaths, setLocalErasedPaths] = useState<ErasedPath[]>(erasedPaths || []);
  const isDrawing = useRef(false);
  
  // Recommended anchors calculation: approx 1 every 18-20sqm for shielded scaffolding
  const recommendedAnchors = Math.ceil((facadeWidth * facadeHeight) / 18);
  
  // Scaffolding module standards (in meters)
  const MODULE_WIDTH = moduleWidth;
  const MODULE_HEIGHT = moduleHeight;

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

  const addAnchor = () => {
    const newAnchor: AnchorPoint = {
      id: Math.random().toString(36).substr(2, 9),
      x: config.width / 2,
      y: config.height / 2,
      type: selectedAnchorType
    };
    onUpdateAnchors([...anchors, newAnchor]);
  };

  const updateAnchorPosition = (id: string, x: number, y: number) => {
    const updatedAnchors = anchors.map(a => a.id === id ? { ...a, x, y } : a);
    onUpdateAnchors(updatedAnchors);
  };

  const removeAnchor = (id: string) => {
    onUpdateAnchors(anchors.filter(a => a.id !== id));
  };

  const renderScaffoldingStructure = () => {
    const elements = [];
    const SCAFF_COLOR = "#ef4444"; // Red color
    const STEEL_COLOR = "#94a3b8"; // Gray for platforms/toeboards
    const LADDER_COLOR = "#3b82f6"; // Blue for ladders
    
    // Calculate number of modules based on facade dimensions
    const numCols = Math.max(1, Math.ceil(facadeWidth / MODULE_WIDTH));
    const numRows = Math.max(1, Math.ceil(facadeHeight / MODULE_HEIGHT));
    
    const colWidth = config.width / numCols;
    const rowHeight = config.height / numRows;

    // Shading Net (Rete Oscurante)
    if (hasShadingNet) {
      elements.push(
        <Rect
          key="shading-net"
          width={config.width}
          height={config.height}
          fill="rgba(15, 23, 42, 0.4)"
          stroke="rgba(15, 23, 42, 0.6)"
          strokeWidth={1}
        />
      );
    }

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
          <Rect x={-8} y={0} width={16} height={3} fill={SCAFF_COLOR} />
          <Rect x={-2} y={-10} width={4} height={10} fill={SCAFF_COLOR} />
        </Group>
      );

      // Enhanced Terminal Parts (Montanti di sommità)
      if (c < numCols) {
        elements.push(
          <Group key={`term-${c}`} x={x} y={-rowHeight * 0.4}>
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

      // Platforms (Impalcato) - Gray
      if (r > 0 && r <= numRows) {
        elements.push(
          <Rect
            key={`plat-${r}`}
            x={0}
            y={y - 4}
            width={config.width}
            height={4}
            fill={STEEL_COLOR}
            stroke={STEEL_COLOR}
            strokeWidth={0.5}
          />
        );
      }

      // Toeboards (Fermapiedi) - Gray
      // Skip at the very bottom (near the feet/base plates)
      if (r > 0 && r < numRows) {
        elements.push(
          <Rect
            key={`toe-${r}`}
            x={0}
            y={y - 12}
            width={config.width}
            height={8}
            fill={STEEL_COLOR}
            opacity={0.8}
            stroke="#64748b"
            strokeWidth={0.5}
          />
        );
      }

      // Guardrails (Corrimano) - 2 bars
      if (r < numRows) {
        elements.push(
          <Line
            key={`guard1-${r}`}
            points={[0, r * rowHeight + rowHeight * 0.4, config.width, r * rowHeight + rowHeight * 0.4]}
            stroke={SCAFF_COLOR}
            strokeWidth={1.5}
          />
        );
        elements.push(
          <Line
            key={`guard2-${r}`}
            points={[0, r * rowHeight + rowHeight * 0.7, config.width, r * rowHeight + rowHeight * 0.7]}
            stroke={SCAFF_COLOR}
            strokeWidth={1.5}
          />
        );
      }

      // Diagonals in ALL sections
      if (r < numRows) {
        for (let c = 0; c < numCols; c++) {
          const isEven = (r + c) % 2 === 0;
          elements.push(
            <Line
              key={`diag-${r}-${c}`}
              points={isEven 
                ? [c * colWidth, r * rowHeight, (c + 1) * colWidth, (r + 1) * rowHeight]
                : [(c + 1) * colWidth, r * rowHeight, c * colWidth, (r + 1) * rowHeight]
              }
              stroke={SCAFF_COLOR}
              strokeWidth={1.2}
              opacity={0.5}
            />
          );

          // Ladders (Scalette) - Blue, steeper diagonal with hatch (botola)
          // Skip top level (r=0) as per user request
          const ladderCol = r % numCols;
          if (r > 0 && c === ladderCol && r < numRows) {
            elements.push(
              <Group key={`ladder-${r}-${c}`} x={c * colWidth} y={r * rowHeight}>
                {/* Hatch (Botola) - A line slightly raised above the platform */}
                <Line 
                  points={[colWidth * 0.2, 0, colWidth * 0.8, 0]} 
                  stroke={LADDER_COLOR} 
                  strokeWidth={3} 
                />
                <Line 
                  points={[colWidth * 0.2, -2, colWidth * 0.2, 0]} 
                  stroke={LADDER_COLOR} 
                  strokeWidth={2} 
                />
                
                {/* Steeper Diagonal Ladder */}
                <Line 
                  points={[colWidth * 0.3, 0, colWidth * 0.7, rowHeight]} 
                  stroke={LADDER_COLOR} 
                  strokeWidth={2.5} 
                />
                <Line 
                  points={[colWidth * 0.5, 0, colWidth * 0.9, rowHeight]} 
                  stroke={LADDER_COLOR} 
                  strokeWidth={2.5} 
                />
                
                {/* Rungs (Pioli) */}
                {[...Array(6)].map((_, i) => {
                  const progress = (i + 1) / 7;
                  const xStart = colWidth * 0.3 + (colWidth * 0.4 * progress);
                  const xEnd = colWidth * 0.5 + (colWidth * 0.4 * progress);
                  const yPos = progress * rowHeight;
                  return (
                    <Line 
                      key={i} 
                      points={[xStart, yPos, xEnd, yPos]} 
                      stroke={LADDER_COLOR} 
                      strokeWidth={1.5} 
                    />
                  );
                })}
              </Group>
            );
          }
        }
      }

      // Night Lights (Luci Notturne) - Now at the FIRST level (bottom)
      if (hasNightLights && r === numRows) {
        for (let c = 0; c <= numCols; c++) {
          elements.push(
            <Circle
              key={`light-${c}`}
              x={c * colWidth}
              y={0}
              radius={4}
              fill="#fbbf24"
              shadowBlur={10}
              shadowColor="#fbbf24"
              opacity={0.8}
            />
          );
        }
      }
    }

    return elements;
  };

  const handleMouseDown = (e: any) => {
    if (tool !== 'eraser') return;
    isDrawing.current = true;
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    
    const x = pointerPos.x;
    const y = pointerPos.y;

    const newPath: ErasedPath = {
      points: [x, y],
      strokeWidth: 20 / zoom
    };
    const updatedPaths = [...localErasedPaths, newPath];
    setLocalErasedPaths(updatedPaths);
    if (onUpdateErasedPaths) onUpdateErasedPaths(updatedPaths);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current || tool !== 'eraser') return;
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    const x = pointerPos.x;
    const y = pointerPos.y;

    const lastPath = localErasedPaths[localErasedPaths.length - 1];
    const newPoints = lastPath.points.concat([x, y]);
    const updatedPaths = localErasedPaths.slice(0, -1).concat([{ ...lastPath, points: newPoints }]);
    setLocalErasedPaths(updatedPaths);
  };

  const handleMouseUp = () => {
    if (isDrawing.current) {
      isDrawing.current = false;
      if (onUpdateErasedPaths) onUpdateErasedPaths(localErasedPaths);
    }
  };

  const clearEraser = () => {
    setLocalErasedPaths([]);
    if (onUpdateErasedPaths) onUpdateErasedPaths([]);
  };

  return (
    <div className="space-y-4 w-full">
      <div className="bg-zinc-900 p-3 rounded-t-xl flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Sovrapposizione Tecnica in Scala (ROSSO)</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsLocked(!isLocked)}
            className={cn(
              "flex items-center gap-2 text-[10px] px-3 py-1.5 rounded border transition-all uppercase font-bold",
              isLocked 
                ? "bg-amber-500/20 text-amber-500 border-amber-500/50" 
                : "bg-white/10 text-white border-white/10 hover:bg-white/20"
            )}
            title={isLocked ? "Sblocca per spostare il ponteggio" : "Blocca posizione ponteggio"}
          >
            {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
            {isLocked ? "Ponteggio Bloccato" : "Ponteggio Libero"}
          </button>
          <button 
            onClick={() => setIsAnchorsLocked(!isAnchorsLocked)}
            className={cn(
              "flex items-center gap-2 text-[10px] px-3 py-1.5 rounded border transition-all uppercase font-bold",
              isAnchorsLocked 
                ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/50" 
                : "bg-white/10 text-white border-white/10 hover:bg-white/20"
            )}
            title={isAnchorsLocked ? "Sblocca per spostare gli ancoraggi" : "Blocca posizione ancoraggi"}
          >
            {isAnchorsLocked ? <Lock size={12} /> : <Unlock size={12} />}
            {isAnchorsLocked ? "Ancoraggi Bloccati" : "Ancoraggi Liberi"}
          </button>
          <button 
            onClick={resetScaffolding}
            className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded border border-white/10 transition-colors uppercase font-bold flex items-center gap-2"
          >
            <RotateCcw size={12} />
            Ripristina
          </button>
        </div>
      </div>
      
      <div className="border border-zinc-200 rounded-b-xl overflow-hidden bg-zinc-100 shadow-2xl relative">
        {/* Tool Sidebar */}
        <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
          <button 
            onClick={() => setTool('move')}
            className={cn(
              "p-3 rounded-xl shadow-lg transition-all border",
              tool === 'move' ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-400 border-zinc-200 hover:bg-zinc-50"
            )}
            title="Sposta Ponteggio"
          >
            <Move size={20} />
          </button>
          <button 
            onClick={() => setTool('eraser')}
            className={cn(
              "p-3 rounded-xl shadow-lg transition-all border",
              tool === 'eraser' ? "bg-red-600 text-white border-red-600" : "bg-white text-zinc-400 border-zinc-200 hover:bg-zinc-50"
            )}
            title="Gomma (Cancella parti della foto)"
          >
            <Eraser size={20} />
          </button>
          {tool === 'eraser' && localErasedPaths.length > 0 && (
            <button 
              onClick={clearEraser}
              className="p-3 rounded-xl shadow-lg bg-white text-red-500 border border-zinc-200 hover:bg-red-50"
              title="Ripristina Foto"
            >
              <RotateCcw size={20} />
            </button>
          )}
        </div>

        <div 
          className="overflow-auto max-h-[700px] flex justify-center bg-zinc-200/50"
          style={{ cursor: tool === 'eraser' ? 'crosshair' : (zoom > 1 ? 'grab' : 'default') }}
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
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseUp}
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
                {/* Eraser Paths */}
                {localErasedPaths.map((path, i) => (
                  <Line
                    key={i}
                    points={path.points}
                    stroke="white"
                    strokeWidth={path.strokeWidth}
                    tension={0.5}
                    lineCap="round"
                    lineJoin="round"
                    globalCompositeOperation="destination-out"
                  />
                ))}
              </Layer>
              <Layer>
                <Group
                  x={config.x}
                  y={config.y}
                  draggable={!isLocked && tool === 'move'}
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

                  {/* Anchor Points */}
                  {anchors.map((anchor, index) => (
                    <Group
                      key={anchor.id}
                      x={anchor.x}
                      y={anchor.y}
                      draggable={!isAnchorsLocked && tool === 'move'}
                      onDragStart={(e) => {
                        e.cancelBubble = true;
                      }}
                      onDragMove={(e) => {
                        e.cancelBubble = true;
                        // For better performance, we don't update state here
                        // but we constrain the visual position
                        const x = Math.max(0, Math.min(e.target.x(), config.width));
                        const y = Math.max(0, Math.min(e.target.y(), config.height));
                        e.target.x(x);
                        e.target.y(y);
                      }}
                      onDragEnd={(e) => {
                        e.cancelBubble = true;
                        updateAnchorPosition(anchor.id, e.target.x(), e.target.y());
                      }}
                      onDblClick={() => !isAnchorsLocked && removeAnchor(anchor.id)}
                      onDblTap={() => !isAnchorsLocked && removeAnchor(anchor.id)}
                    >
                      <Circle
                        radius={12}
                        fill="#10b981"
                        stroke="white"
                        strokeWidth={2}
                        shadowBlur={5}
                      />
                      <Text
                        text={(index + 1).toString()}
                        x={index + 1 >= 10 ? -7 : -4}
                        y={-6}
                        fontSize={12}
                        fill="white"
                        fontStyle="bold"
                      />
                    </Group>
                  ))}
                  
                  {/* Scale Handle */}
                  {!isLocked && tool === 'move' && (
                    <Group
                      x={config.width}
                      y={config.height}
                      draggable
                      onDragMove={(e) => {
                        const node = e.target;
                        const handleMargin = 15;
                        let newWidth = Math.max(40, node.x());
                        let newHeight = Math.max(40, node.y());
                        
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
                      <Line points={[-8, 8, 8, -8]} stroke="white" strokeWidth={2.5} />
                      <Line points={[3, 8, 8, 8, 8, 3]} stroke="white" strokeWidth={2.5} />
                      <Line points={[-3, -8, -8, -8, -8, -3]} stroke="white" strokeWidth={2.5} />
                    </Group>
                  )}
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

          <div className="flex justify-between items-center pt-4 border-t border-zinc-100">
            <div className="space-y-1">
              <p className="text-[10px] text-zinc-400 uppercase font-bold">Gestione Ancoraggi (D.Lgs 81/08)</p>
              <p className="text-xs text-zinc-600 font-medium">
                Consigliati: <span className="font-bold text-zinc-900">{recommendedAnchors}</span> | 
                Posizionati: <span className="font-bold text-emerald-600">{anchors.length}</span>
              </p>
              <p className="text-[9px] text-zinc-400 italic">Doppio click sull'ancoraggio per rimuoverlo.</p>
            </div>
            <div className="flex items-center gap-4">
              <select 
                value={selectedAnchorType}
                onChange={(e) => setSelectedAnchorType(e.target.value)}
                className="text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-zinc-900"
              >
                {ANCHOR_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <button 
                onClick={addAnchor}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all"
              >
                <Plus size={14} />
                AGGIUNGI ANCORAGGIO
              </button>
              <button 
                onClick={() => onUpdateShadingNet && onUpdateShadingNet(!hasShadingNet)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border-2",
                  hasShadingNet 
                    ? "bg-zinc-900 text-white border-zinc-900" 
                    : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-200"
                )}
              >
                <Eraser size={14} className={hasShadingNet ? "text-white" : "text-zinc-400"} />
                RETE PROTEZIONE
              </button>
            </div>
          </div>
          
          {anchors.length > 0 && (
            <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100">
              <p className="text-[10px] text-zinc-400 uppercase font-black mb-3 tracking-widest">Legenda Ancoraggi Posizionati</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {anchors.map((anchor, index) => (
                  <div key={anchor.id} className="flex items-center gap-3 bg-white p-2 rounded-lg border border-zinc-200 shadow-sm">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-black text-white shadow-sm">
                      {index + 1}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-zinc-900 leading-tight">{anchor.type}</span>
                      <span className="text-[8px] text-zinc-400 font-mono">ID: {anchor.id.slice(0, 4)}</span>
                    </div>
                    <button 
                      onClick={() => removeAnchor(anchor.id)} 
                      className="ml-auto p-1 text-zinc-300 hover:text-red-500 transition-colors"
                      title="Rimuovi"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ScaffoldingOverlay component end
