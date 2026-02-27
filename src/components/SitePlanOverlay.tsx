import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Arrow, Text, Group, Transformer, Circle } from 'react-konva';
import useImage from 'use-image';
import { PlanMarker } from '../types';
import { Trash2, Plus } from 'lucide-react';

interface SitePlanOverlayProps {
  image: string;
  markers: PlanMarker[];
  facades: { id: string; name: string }[];
  onUpdateMarkers: (markers: PlanMarker[]) => void;
}

export const SitePlanOverlay: React.FC<SitePlanOverlayProps> = ({
  image,
  markers,
  facades,
  onUpdateMarkers,
}) => {
  const [img] = useImage(image);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const stageRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect();
      const height = (width * 3) / 4;
      setDimensions({ width, height });
    }
  }, []);

  useEffect(() => {
    if (selectedId && trRef.current) {
      const node = stageRef.current.findOne('#' + selectedId);
      if (node) {
        trRef.current.nodes([node]);
        trRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedId]);

  const handleAddMarker = () => {
    const newMarker: PlanMarker = {
      id: Math.random().toString(36).substr(2, 9),
      x: dimensions.width / 2,
      y: dimensions.height / 2,
      rotation: 0,
      facadeId: facades[0]?.id || '',
      label: (markers.length + 1).toString(),
    };
    onUpdateMarkers([...markers, newMarker]);
    setSelectedId(newMarker.id);
  };

  const handleRemoveMarker = (id: string) => {
    onUpdateMarkers(markers.filter((m) => m.id !== id));
    setSelectedId(null);
  };

  const handleDragEnd = (id: string, e: any) => {
    const newMarkers = markers.map((m) => {
      if (m.id === id) {
        return {
          ...m,
          x: e.target.x(),
          y: e.target.y(),
        };
      }
      return m;
    });
    onUpdateMarkers(newMarkers);
  };

  const handleTransformEnd = (id: string, e: any) => {
    const node = e.target;
    const newMarkers = markers.map((m) => {
      if (m.id === id) {
        return {
          ...m,
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
        };
      }
      return m;
    });
    onUpdateMarkers(newMarkers);
  };

  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.name() === 'background-image';
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={handleAddMarker}
            className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-all"
          >
            <Plus size={16} /> Aggiungi Indicatore Facciata
          </button>
        </div>
        {selectedId && (
          <div className="flex items-center gap-4 bg-zinc-100 px-4 py-2 rounded-lg">
            <select
              className="bg-transparent text-sm font-bold outline-none"
              value={markers.find((m) => m.id === selectedId)?.facadeId}
              onChange={(e) => {
                const newMarkers = markers.map((m) => {
                  if (m.id === selectedId) {
                    return { ...m, facadeId: e.target.value };
                  }
                  return m;
                });
                onUpdateMarkers(newMarkers);
              }}
            >
              <option value="">Seleziona Facciata</option>
              {facades.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => handleRemoveMarker(selectedId)}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        className="bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200 overflow-hidden relative cursor-crosshair"
        style={{ height: dimensions.height }}
      >
        <Stage
          width={dimensions.width}
          height={dimensions.height}
          onMouseDown={checkDeselect}
          onTouchStart={checkDeselect}
          ref={stageRef}
        >
          <Layer>
            {img && (
              <KonvaImage
                image={img}
                width={dimensions.width}
                height={dimensions.height}
                name="background-image"
                listening={true}
              />
            )}
            {markers.map((marker) => (
              <Group
                key={marker.id}
                id={marker.id}
                x={marker.x}
                y={marker.y}
                rotation={marker.rotation}
                draggable
                onDragEnd={(e) => handleDragEnd(marker.id, e)}
                onTransformEnd={(e) => handleTransformEnd(marker.id, e)}
                onClick={() => setSelectedId(marker.id)}
                onTap={() => setSelectedId(marker.id)}
              >
                {/* Arrow pointing towards the facade */}
                <Arrow
                  points={[0, 0, 40, 0]}
                  pointerLength={10}
                  pointerWidth={10}
                  fill="#18181b"
                  stroke="#18181b"
                  strokeWidth={4}
                />
                {/* Numbered label */}
                <Group x={0} y={0} rotation={-marker.rotation}>
                  <Circle
                    radius={12}
                    fill="#18181b"
                    stroke="white"
                    strokeWidth={2}
                  />
                  <Text
                    text={marker.label}
                    fontSize={12}
                    fontStyle="bold"
                    fill="white"
                    x={-6}
                    y={-6}
                    width={12}
                    align="center"
                    verticalAlign="middle"
                  />
                </Group>
              </Group>
            ))}
            {selectedId && (
              <Transformer
                ref={trRef}
                rotateEnabled={true}
                resizeEnabled={false}
                borderStroke="#3b82f6"
                anchorStroke="#3b82f6"
              />
            )}
          </Layer>
        </Stage>
      </div>
      <p className="text-[10px] text-zinc-400 uppercase font-bold text-center">
        Trascina le frecce per posizionarle e ruotale per indicare la direzione della facciata
      </p>
    </div>
  );
};
