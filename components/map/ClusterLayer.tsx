"use client";

import { Layers } from "lucide-react";

interface ClusterLayerProps {
  count: number;
  onZoomIn: () => void;
}

export function ClusterLayer({ count, onZoomIn }: ClusterLayerProps) {
  const clusters = [
    { name: "광진구", count: 18, x: 65, y: 53 },
    { name: "노원구", count: 32, x: 74, y: 24 },
    { name: "용산구", count: 21, x: 49, y: 57 },
    { name: "강남구", count: 45, x: 60, y: 68 },
    { name: "영등포구", count: 27, x: 35, y: 62 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none">
      {clusters.map((c) => (
        <button
          key={c.name}
          onClick={onZoomIn}
          style={{ left: `${c.x}%`, top: `${c.y}%` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600/90 text-white font-bold text-xs shadow-lg shadow-blue-500/30 hover:scale-110 hover:bg-blue-500 transition-all cursor-pointer border border-blue-400/40"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>
            {c.name} {c.count}
          </span>
        </button>
      ))}
    </div>
  );
}
