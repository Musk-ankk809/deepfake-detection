import React from 'react';
import { motion } from 'framer-motion';

const DynamicBackground = ({ isScanning = false }) => {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-[#020202]">
      {/* 1. The Digital Grid Layer */}
      <motion.div 
        className="absolute inset-0 opacity-[0.2]"
        animate={{
          opacity: isScanning ? 0.4 : 0.2,
        }}
        transition={{ duration: 0.5 }}
        style={{
          backgroundImage: `linear-gradient(#1e293b 1.5px, transparent 1.5px), 
                            linear-gradient(90deg, #1e293b 1.5px, transparent 1.5px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* 2. Slow Moving Atmospheric Glow */}
      <motion.div
        animate={{
          x: ['-10%', '110%'],
          y: ['-10%', '110%'],
          scale: isScanning ? [1, 1.2, 1] : 1,
        }}
        transition={{ 
          x: { duration: 20, repeat: Infinity, ease: "linear" },
          y: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute w-[800px] h-[800px] rounded-full bg-blue-900/10 blur-[150px]"
      />

      {/* 3. Additional Scanning Pulse Effect */}
      {isScanning && (
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.05) 0%, transparent 70%)'
          }}
        />
      )}

      {/* 4. Animated Scan Lines */}
      {isScanning && (
        <motion.div
          animate={{
            y: ['-100%', '100%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-0 w-full h-[2px] bg-gradient-to-b from-transparent via-blue-500/20 to-transparent"
        />
      )}
    </div>
  );
};

export default DynamicBackground;