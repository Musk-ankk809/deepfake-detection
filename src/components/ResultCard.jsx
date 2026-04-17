import React from 'react';

const ResultCard = ({ title, percentage, status, color }) => {
  // Map technical status to user-friendly labels
  const getLabel = (status) => {
    switch (status) {
      case "AUTHENTIC": return "AUTHENTIC";
      case "TAMPERED": return "TAMPERED";
      case "SYNTHETIC": return "SYNTHETIC";
      case "NO_FACE_DETECTED": return "NO_FACE_DETECTED";
      default: return "ANALYZING...";
    }
  };

  const isSafe = status === "AUTHENTIC";

  return (
    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">{title}</h3>

      {/* Percentage Text */}
      <div className="text-4xl font-black italic mb-2" style={{ color: color }}>
        {percentage}%
      </div>
      
      {/* Dynamic Label */}
      <div
        className={`text-[10px] font-bold px-3 py-1 rounded-full inline-block border ${
          isSafe
            ? 'text-green-500 border-green-500/30 bg-green-500/10'
            : 'text-red-500 border-red-500/30 bg-red-500/10'
        }`}
      >
        {getLabel(status)}
      </div>
    </div>
  );
};

export default ResultCard;