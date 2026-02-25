import React from 'react';

export const BasePlateDiagram = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-900">
    {/* Ground line */}
    <line x1="10" y1="110" x2="110" y2="110" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
    {/* Base plate */}
    <rect x="30" y="100" width="60" height="6" fill="currentColor" />
    <rect x="35" y="98" width="50" height="2" fill="currentColor" opacity="0.6" />
    {/* Threaded rod */}
    <rect x="56" y="40" width="8" height="60" fill="currentColor" />
    {/* Thread details */}
    {[...Array(10)].map((_, i) => (
      <line key={i} x1="56" y1={45 + i * 5} x2="64" y2={43 + i * 5} stroke="white" strokeWidth="0.5" />
    ))}
    {/* Adjustment nut */}
    <rect x="45" y="75" width="30" height="8" rx="2" fill="currentColor" />
    <circle cx="60" cy="79" r="2" fill="white" />
    {/* Tube start */}
    <rect x="52" y="20" width="16" height="20" fill="currentColor" opacity="0.4" />
    <line x1="52" y1="40" x2="68" y2="40" stroke="currentColor" strokeWidth="1" />
  </svg>
);

export const GuardrailDiagram = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-900">
    {/* Vertical posts */}
    <rect x="20" y="10" width="6" height="100" fill="currentColor" />
    <rect x="94" y="10" width="6" height="100" fill="currentColor" />
    {/* Top rail */}
    <rect x="26" y="25" width="68" height="4" fill="currentColor" />
    {/* Mid rail */}
    <rect x="26" y="55" width="68" height="4" fill="currentColor" />
    {/* Toeboard */}
    <rect x="26" y="95" width="68" height="12" fill="currentColor" opacity="0.2" />
    <rect x="26" y="95" width="68" height="2" fill="currentColor" />
    {/* Connections */}
    <circle cx="23" cy="27" r="4" fill="currentColor" />
    <circle cx="97" cy="27" r="4" fill="currentColor" />
    <circle cx="23" cy="57" r="4" fill="currentColor" />
    <circle cx="97" cy="57" r="4" fill="currentColor" />
  </svg>
);

export const AnchorDiagram = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-900">
    {/* Wall section */}
    <rect x="80" y="10" width="30" height="100" fill="currentColor" opacity="0.1" />
    <line x1="80" y1="10" x2="80" y2="110" stroke="currentColor" strokeWidth="1" />
    {/* Scaffolding tube */}
    <rect x="10" y="30" width="6" height="60" fill="currentColor" />
    {/* Anchor rod */}
    <rect x="16" y="55" width="74" height="4" fill="currentColor" />
    {/* Coupler */}
    <rect x="12" y="52" width="12" height="10" rx="2" fill="currentColor" />
    {/* Wall plug/eyelet */}
    <circle cx="90" cy="57" r="6" stroke="currentColor" strokeWidth="2" />
    <path d="M80 57H84" stroke="currentColor" strokeWidth="2" />
    {/* Technical labels indicator */}
    <line x1="40" y1="50" x2="40" y2="40" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
    <text x="30" y="35" fontSize="6" fill="currentColor" className="font-mono">TUBE D.48</text>
  </svg>
);
