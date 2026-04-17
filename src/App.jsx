import React, { useState } from 'react';
import axios from 'axios';
import { ShieldAlert, Activity, Zap, Cpu, BarChart3, CheckCircle, AlertTriangle, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Dropzone from './components/Dropzone';
import Console from './components/Console';
import DynamicBackground from './components/DynamicBackground';
import ResultCard from './components/ResultCard';

function App() {
  const [file, setFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [model1Logs, setModel1Logs] = useState([]);
  const [model2Logs, setModel2Logs] = useState([]);
  const [model3Logs, setModel3Logs] = useState([]);
  const [scores, setScores] = useState({ model1: 0, model2: 0, model3: 0 });
  const [verdict, setVerdict] = useState("");
  const [explanation, setExplanation] = useState("");

  const startAnalysis = async (uploadedFile) => {
    setFile(uploadedFile);
    setScanning(true);
    setShowResults(false);
    setExplanation(""); // CRITICAL: Clear the old text so the user knows a NEW analysis started

    // Initial Boot-up
    setModel1Logs(["[BOOT] M1_HYBRID_CORE ONLINE", "[INFO] DEVICE: CUDA_ENABLED"]);
    setModel2Logs(["[BOOT] M2_SYNTHETIC_CORE ONLINE", "[INFO] LOADED: VERIDOC_V2_PTH"]);
    setModel3Logs(["[BOOT] M3_FACE_MASTER ONLINE", "[INFO] ENGINE: TENSORFLOW_2.x"]);

    // --- FAKE-REAL LOG SEQUENCING ---
    const runLogs = (logs, setter) => {
      logs.forEach((log, i) => {
        setTimeout(() => setter(prev => [...prev, log]), i * 500);
      });
    };

    runLogs([
      "STEP 1: ACCESSING RESNET-50...",
      "STEP 2: EXTRACTING 2048 FEATURES...",
      "STEP 3: COMPUTING FFT ENERGY...",
      "STEP 4: CALCULATING LAPLACIAN...",
      "STEP 5: MEASURING NOISE VAR...",
      "STEP 6: FUSING 2051 VECTOR...",
      "STEP 7: SCALING DATA..."
    ], setModel1Logs);

    runLogs([
      "BRANCH A: RGB TEXTURE SCAN...",
      "BRANCH B: FFT SPECTRAL SCAN...",
      "LAYER: EXTRACTING SPATIAL DNA...",
      "LAYER: COMPUTING FREQ SPIKES...",
      "FUSION: CONCATENATING 544 BITS...",
      "DROPOUT: REGULARIZING TENSORS...",
      "SIGMOID: FINALIZING OUTPUT..."
    ], setModel2Logs);

    runLogs([
      "INITIALIZING MTCNN DETECTOR...",
      "SCANNING FOR FACIAL GEOMETRY...",
      "MTCNN: HUMAN FACE DETECTED...",
      "SECURITY: BOUNCER CONFIRMED...",
      "CROP: 299x299 NORMALIZATION...",
      "INFERENCE: MASTER_MODEL_H5...",
      "RESULT: CALCULATING SCORE..."
    ], setModel3Logs);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      // 1. The API Call
      const response = await axios.post('http://127.0.0.1:8000/analyze', formData);

      // 2. Wait for the scanning animation to finish (4 seconds)
      setTimeout(() => {
        // 3. Capture EVERYTHING from the backend
        setScores({
          model1: response.data.model_1.confidence,
          model2: response.data.model_2.confidence,
          model3: response.data.model_3.confidence,
          // Statuses for ResultCard colors
          model1Status: response.data.model_1.status,
          model2Status: response.data.model_2.status,
          model3Status: response.data.model_3.status
        });
        // 4. Set the Gemma-3 Explanation
        setExplanation(response.data.ai_explanation);

        setVerdict(response.data.combined_verdict);
        setScanning(false);
        setShowResults(true);

        const successMsg = "✓ ANALYSIS_SUCCESS: OUTPUTTING DATA";
        setModel1Logs(prev => [...prev, successMsg]);
        setModel2Logs(prev => [...prev, successMsg]);
        setModel3Logs(prev => [...prev, successMsg]);
      }, 4000);

    } catch (err) {
      console.error(err);
      const errorMsg = "✖ CRITICAL ERROR: CORE_DISCONNECT";
      setModel1Logs(prev => [...prev, errorMsg]);
      setModel2Logs(prev => [...prev, errorMsg]);
      setModel3Logs(prev => [...prev, errorMsg]);
      setScanning(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setScanning(false);
    setShowResults(false);
    setModel1Logs([]);
    setModel2Logs([]);
    setModel3Logs([]);
    setVerdict("");
    setExplanation("");
  };

  return (
    <div className="relative min-h-screen text-white p-8 font-sans selection:bg-blue-500/30">
      <DynamicBackground />

      <header className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-blue-500 w-10 h-10" />
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">
            <span className="text-blue-500 underline decoration-2 underline-offset-4">Deepfake Detection</span>
          </h1>
        </div>
        <div className="font-mono text-[10px] text-slate-500 bg-slate-900/80 px-4 py-2 rounded-full border border-slate-800">
          STATUS: <span className={scanning ? "text-amber-500 animate-pulse" : "text-green-500"}>
            {scanning ? "TRIPLE_ENGINE_FORENSICS" : "SYSTEM_READY"}
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto space-y-6">
        <section>
          <Dropzone onImageUpload={startAnalysis} onReset={handleReset} />
        </section>

        <AnimatePresence>
          {showResults && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* UPDATED TO 3 COLUMNS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <ResultCard 
                  title="Tampering Engine (M1)" 
                  percentage={scores.model1} 
                  status={scores.model1Status} 
                  color="#3b82f6" 
                />

                <ResultCard 
                  title="Synthetic Engine (M2)" 
                  percentage={scores.model2} 
                  status={scores.model2Status} 
                  color="#10b981" 
                />

                <ResultCard 
                  title="Face Forensic (M3)" 
                  percentage={scores.model3} 
                  status={scores.model3Status} 
                  color="#a855f7" 
                />

              </div>

              {/* Banner - Redesigned to show the AI explanation */}
              <div className={`p-6 rounded-2xl border ${verdict === 'DEEPFAKE' ? 'bg-red-500/10 border-red-500/50' : 'bg-green-500/10 border-green-500/50'}`}>
                <div className="flex items-start gap-4">
                  {verdict === 'DEEPFAKE' ? <AlertTriangle className="text-red-500 mt-1" /> : <CheckCircle className="text-green-500 mt-1" />}
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-60">Final Forensic Verdict</h4>
                    <p className={`text-2xl font-black italic mb-2 ${verdict === 'DEEPFAKE' ? 'text-red-500' : 'text-green-500'}`}>
                      {verdict === 'DEEPFAKE' ? 'CRITICAL_ANOMALY: DEEPFAKE_DETECTED' : 'SECURE_IMAGE: AUTHENTIC'}
                    </p>
                    <p className={`text-sm text-slate-300 leading-relaxed border-l-2 border-blue-500/30 pl-4 bg-blue-500/5 p-2 rounded-r-lg ${!explanation ? 'animate-pulse' : ''}`}>
                      <span className="text-blue-400 font-bold tracking-wider">AI_EXPERT_VERDICT:</span> 
                      {" "}{explanation || "Analysing forensic patterns and generating summary..."}
                    </p>
                  </div>
                </div>
                <div className="text-right hidden md:block font-mono text-[10px] opacity-40 uppercase mt-2">
                  <p>System: TRIPLE_VALIDATION_V3</p>
                  <p>Timestamp: {new Date().toLocaleTimeString()}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LOG CONSOLES UPDATED TO 3 COLUMNS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Console title="Hybrid Tampering" logs={model1Logs} isProcessing={scanning} icon={Zap} />
          <Console title="Synthetic DNA" logs={model2Logs} isProcessing={scanning} icon={Cpu} />
          <Console title="Face Master" logs={model3Logs} isProcessing={scanning} icon={UserCheck} />
        </div>
      </main>
    </div>
  );
}

export default App; 