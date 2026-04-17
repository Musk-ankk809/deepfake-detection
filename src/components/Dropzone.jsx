import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dropzone = ({ onImageUpload, onReset }) => {
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
        onImageUpload(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setPreview(null);
    if (onReset) {
      onReset();
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div
      onClick={!preview ? onButtonClick : undefined}
      className={`relative min-h-[450px] w-full flex flex-col items-center justify-center border-2 border-dashed rounded-3xl transition-all duration-300 cursor-pointer overflow-hidden ${
        isDragging ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 bg-slate-900/20 hover:border-blue-500/30'
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFile(e.dataTransfer.files[0]);
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => handleFile(e.target.files[0])}
      />

      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center text-slate-400"
          >
            <Upload size={48} className="mb-4 text-blue-500" />
            <p className="text-lg font-semibold text-white">Click or Drop Evidence for Deepfake Analysis</p>
            <p className="text-sm">High-Resolution JPEG, PNG, or TIF</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="relative w-full h-full p-6 flex items-center justify-center cursor-default"
            onClick={(e) => e.stopPropagation()} // Prevents re-opening dialog when clicking the image
          >
            <img
              src={preview}
              alt="Forensic Preview"
              className="max-h-[350px] max-w-[90%] w-auto h-auto rounded-lg shadow-2xl border border-slate-800 object-contain"
            />

            <motion.div
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.8)] z-10"
            />

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              className="absolute top-4 right-4 bg-red-500/20 text-red-400 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all"
            >
              Reset
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropzone;