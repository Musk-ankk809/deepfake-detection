import React, { useEffect, useState } from 'react';
import { Terminal, Cpu, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const Console = ({ title, logs, isProcessing, icon: Icon }) => {
  return (
    <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-64">
      <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-blue-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">{title}</span>
        </div>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
        </div>
      </div>
      
      <div className="p-4 font-mono text-[11px] space-y-2 overflow-y-auto scrollbar-hide">
        {logs.map((log, i) => (
          <motion.div 
            initial={{ opacity: 0, x: -5 }} 
            animate={{ opacity: 1, x: 0 }} 
            key={i} 
            className="flex gap-2"
          >
            <span className="text-blue-500/50">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
            <span className={log.includes('FAIL') ? 'text-red-400' : log.includes('SUCCESS') ? 'text-green-400' : 'text-slate-300'}>
              {log}
            </span>
          </motion.div>
        ))}
        {isProcessing && (
          <motion.div 
            animate={{ opacity: [0, 1, 0] }} 
            transition={{ repeat: Infinity, duration: 1 }}
            className="w-2 h-4 bg-blue-500 inline-block ml-1"
          />
        )}
      </div>
    </div>
  );
};

export default Console;