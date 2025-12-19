
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Expense, Category } from '../types';
import { parseReceipt } from '../geminiService';
import { CameraIcon, Loader2Icon, CheckCircle2Icon, ScanSearchIcon, AlertCircleIcon } from 'lucide-react';

interface AddExpenseModalProps {
  onAdd: (expense: Expense) => void;
}

const CATEGORIES: Category[] = [
  'Food & Dining', 'Transport', 'Housing', 'Entertainment', 'Shopping', 'Health', 'Utilities', 'Income', 'Other'
];

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ onAdd }) => {
  const [activeMode, setActiveMode] = useState<'manual' | 'scan'>('manual');
  const [isScanning, setIsScanning] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState<'idle' | 'searching' | 'detected' | 'failed'>('idle');
  const [formData, setFormData] = useState({
    amount: '',
    merchant: '',
    category: 'Food & Dining' as Category,
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionIntervalRef = useRef<number | null>(null);

  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 30, 10]);
    }
  };

  const startCamera = async () => {
    setActiveMode('scan');
    setDetectionStatus('searching');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera access denied", err);
      alert("Please grant camera access to use the scanner.");
      setActiveMode('manual');
    }
  };

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (detectionIntervalRef.current) {
      window.clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  }, []);

  const performAutoCapture = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isScanning) return;

    // Grab a frame for detection
    const context = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context?.drawImage(videoRef.current, 0, 0);
    
    const base64Image = canvasRef.current.toDataURL('image/jpeg', 0.6); // Lower quality for faster detection

    try {
      // Use the parseReceipt service but we treat it as an "auto-detector"
      // If it returns valid data, we consider it a successful "detection"
      const extracted = await parseReceipt(base64Image);
      
      if (extracted.amount && extracted.merchant) {
        triggerHaptic();
        setDetectionStatus('detected');
        setIsScanning(true);
        
        setFormData(prev => ({
          ...prev,
          amount: extracted.amount?.toString() || prev.amount,
          merchant: extracted.merchant || prev.merchant,
          category: (extracted.category as Category) || prev.category,
          date: extracted.date || prev.date,
        }));

        // Give a small delay to show the "detected" state before switching
        setTimeout(() => {
          stopCamera();
          setActiveMode('manual');
          setIsScanning(false);
          setDetectionStatus('idle');
        }, 800);
      }
    } catch (err) {
      // Silently fail detection attempts
      console.debug("Detection attempt failed or no receipt found");
    }
  }, [isScanning, stopCamera]);

  useEffect(() => {
    if (activeMode === 'scan') {
      // Check for receipt every 3 seconds
      detectionIntervalRef.current = window.setInterval(() => {
        performAutoCapture();
      }, 3000);
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeMode, performAutoCapture, stopCamera]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.merchant) return;

    onAdd({
      id: crypto.randomUUID(),
      amount: parseFloat(formData.amount),
      merchant: formData.merchant,
      category: formData.category,
      date: formData.date,
      description: formData.description
    });
  };

  return (
    <div className="p-6">
      <div className="flex gap-4 mb-6 p-1 bg-slate-100 rounded-2xl">
        <button 
          onClick={() => setActiveMode('manual')}
          className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all ${activeMode === 'manual' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
        >
          Manual Entry
        </button>
        <button 
          onClick={startCamera}
          className={`flex-1 py-2 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${activeMode === 'scan' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
        >
          <CameraIcon size={18} />
          Auto Scan
        </button>
      </div>

      {activeMode === 'scan' ? (
        <div className="relative rounded-[32px] overflow-hidden bg-black aspect-[3/4] shadow-inner">
          <video ref={videoRef} className="w-full h-full object-cover opacity-80" playsInline muted />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Scanning Animation Overlays */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            {/* Guide Box */}
            <div className={`w-[80%] aspect-[1/1.4] border-2 transition-all duration-500 rounded-2xl ${detectionStatus === 'detected' ? 'border-emerald-400 scale-105 shadow-[0_0_20px_rgba(52,211,153,0.5)]' : 'border-white/30'}`}>
              {/* Corner Accents */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
              
              {/* Laser Line */}
              {detectionStatus === 'searching' && (
                <div className="absolute left-0 right-0 h-1 bg-blue-500/50 shadow-[0_0_15px_#3b82f6] animate-[scan_2s_ease-in-out_infinite]" />
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="absolute top-6 left-0 right-0 flex justify-center">
            <div className={`px-4 py-2 rounded-full backdrop-blur-md flex items-center gap-2 transition-all duration-300 ${
              detectionStatus === 'detected' ? 'bg-emerald-500/90 text-white' : 'bg-black/40 text-white/90'
            }`}>
              {detectionStatus === 'searching' && <ScanSearchIcon size={18} className="animate-pulse" />}
              {detectionStatus === 'detected' && <CheckCircle2Icon size={18} className="animate-bounce" />}
              <span className="text-xs font-bold uppercase tracking-wider">
                {detectionStatus === 'searching' && "Align receipt..."}
                {detectionStatus === 'detected' && "Receipt Captured!"}
              </span>
            </div>
          </div>

          {/* Bottom Help Text */}
          <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2 px-8 text-center">
            <p className="text-white/60 text-[10px] font-medium uppercase tracking-[0.2em]">AI Powered Detection</p>
            <p className="text-white/40 text-[9px]">Hold steady. The app will capture once details are clear.</p>
          </div>

          <style>{`
            @keyframes scan {
              0%, 100% { top: 5%; }
              50% { top: 95%; }
            }
          `}</style>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Merchant / Shop Name</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Swiggy, Reliance Digital"
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all font-medium"
              value={formData.merchant}
              onChange={e => setFormData({...formData, merchant: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Amount (₹)</label>
              <input 
                required
                type="number" 
                step="0.01"
                placeholder="0.00"
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all font-bold text-lg"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Date</label>
              <input 
                required
                type="date" 
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all font-medium"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Category</label>
            <div className="relative">
              <select 
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all appearance-none font-medium text-slate-700"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as Category})}
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <PlusIcon size={16} className="rotate-45" />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-[24px] font-black text-lg shadow-xl shadow-blue-100 transition-all active:scale-[0.97] mt-4 flex items-center justify-center gap-3"
          >
            <CheckCircle2Icon size={24} />
            Add to Khata
          </button>
        </form>
      )}
    </div>
  );
};

// Re-importing locally to ensure availability
import { PlusIcon } from 'lucide-react';

export default AddExpenseModal;
