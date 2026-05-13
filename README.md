DeepFake Detection: Hybrid Ensemble Forensic SystemProject OverviewIn an era of hyper-realistic AI-generated media, traditional detection methods often fail due to a single-vector focus. This project, developed for the System Design Practice curriculum at Dharmsinh Desai University, implements a robust Triple-Engine Ensemble to verify digital image authenticity.  Unlike conventional tools, our system scrutinizes images for localized tampering, global synthetic fingerprints, and biometric inconsistencies simultaneously using a high-performance FastAPI backend and a React.js frontend.  🚀 Key FeaturesTriple-Engine Validation: Parallel execution of three specialized AI engines (M1, M2, and M3).  Real-Time Forensic Console: A terminal-style UI that streams live progress logs from the AI engines.  Explainable AI (XAI): A rule-based logic engine that translates complex mathematical scores into human-readable summaries.  Asynchronous Inference: Backend powered by FastAPI ensures low-latency processing (< 5 seconds).  Sensitivity-First Logic: An "OR-logic" aggregation that flags an image if any single engine detects a high probability of fraud.  

Engine,Name,Architecture,Forensic Focus
M1,Global Tampering,ResNet-50 Hybrid,Detects minute pixel-level inconsistencies and manual splicing.  +1
M2,Synthetic DNA,Dual-Branch CNN + FFT,"Uses Fast Fourier Transform (FFT) to identify AI-generated ""checkerboard"" artifacts.  +1"
M3,Face Master,MTCNN + XceptionNet,Isolates human faces to detect localized swaps and biometric anomalies.  +1


Performance & AccuracyBased on testing across benchmark datasets (CASIA2, Celeb-DF v2, and FaceForensics++), the individual engines recorded the following accuracies:  M1 (Tampering): 71% Accuracy.  M2 (Synthetic): 89% Accuracy.  Note: The system utilizes an ensemble approach to mitigate individual model misclassifications (Inter-Model Conflict).  🛠️ Technology StackBackend: Python, FastAPI, PyTorch, TensorFlow.  Frontend: React.js, Vite, Tailwind CSS, Framer Motion.  Computer Vision: OpenCV (CV2), MTCNN, Scikit-Learn.  📦 Installation & Setup1. Clone the RepositoryBashgit clone https://github.com/Musk-ankk809/deepfake-detection.git
cd deepfake-detection
2. Backend SetupBash# Navigate to backend directory
cd backend
# Install dependencies
pip install -r requirements.txt
# Start the FastAPI server
uvicorn main:app --reload
3. Frontend SetupBash# Navigate to frontend directory
cd frontend
# Install dependencies
npm install
# Run the development server
npm run dev
👥 Contributors:
Priya Goswami (CE001)  
Muskanbanu Kanduravalakachi (CE003) 
Guided by: Prof. Apurva A Mehta   
