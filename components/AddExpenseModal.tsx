import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Expense, Category, AppSettings, Currency } from '../types';
import { parseReceipt } from '../geminiService';
import { CameraIcon, CheckCircle2Icon, PlusIcon, SparklesIcon } from 'lucide-react';

interface AddExpenseModalProps {
  onAdd: (expense: Expense) => void;
  settings: AppSettings;
}

const CATEGORIES: Category[] = [
  'Food & Dining', 'Transport', 'Housing', 'Entertainment', 'Shopping', 'Health', 'Utilities', 'Income', 'Other'
];

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥'
};

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ onAdd, settings }) => {
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
    if ('vibrate' in navigator) navigator.vibrate([10, 30, 10]);
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

    const context = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context?.drawImage(videoRef.current, 0, 0);
    
    const base64Image = canvasRef.current.toDataURL('image/jpeg', 0.6);

    try {
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

        setTimeout(() => {
          stopCamera();
          setActiveMode('manual');
          setIsScanning(false);
          setDetectionStatus('idle');
        }, 800);
      }
    } catch (err) {
      console.debug("Detection attempt failed");
    }
  }, [isScanning, stopCamera]);

  useEffect(() => {
    if (activeMode === 'scan') {
      detectionIntervalRef.current = window.setInterval(() => {
        performAutoCapture();
      }, 4000);
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

  const symbol = CURRENCY_SYMBOLS[settings.currency];

  return (
    <div className="p-8">
      <div className={`flex gap-4 mb-8 p-1.5 rounded-2xl ${
        settings.theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'
      }`}>
        <button 
          type="button"
          onClick={() => setActiveMode('manual')}
          className={`flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
            activeMode === 'manual' 
              ? 'bg-white dark:bg-slate-700 shadow-lg text-blue-600 dark:text-blue-400' 
              : 'text-slate-500 opacity-60'
          }`}
        >
          Manual
        </button>
        <button 
          type="button"
          onClick={startCamera}
          className={`flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
            activeMode === 'scan' 
              ? 'bg-white dark:bg-slate-700 shadow-lg text-blue-600 dark:text-blue-400' 
              : 'text-slate-500 opacity-60'
          }`}
        >
          <CameraIcon size={16} />
          AI Scan
        </button>
      </div>

      {activeMode === 'scan' ? (
        <div className="relative rounded-[40px] overflow-hidden bg-black aspect-[3/4] shadow-2xl group">
          <video ref={videoRef} className="w-full h-full object-cover opacity-80" playsInline muted />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            <div className={`w-[85%] aspect-[1/1.5] border-2 transition-all duration-700 rounded-3xl ${
              detectionStatus === 'detected' 
                ? 'border-emerald-400 scale-105 shadow-[0_0_30px_rgba(52,211,153,0.6)]' 
                : 'border-white/20'
            }`}>
              {detectionStatus === 'searching' && (
                <div className="absolute left-0 right-0 h-1 bg-blue-500/80 shadow-[0_0_20px_#3b82f6] animate-[scan_2.5s_ease-in-out_infinite]" />
              )}
            </div>
          </div>

          <div className="absolute top-8 left-0 right-0 flex justify-center">
            <div className={`px-5 py-2.5 rounded-full backdrop-blur-xl flex items-center gap-3 transition-all duration-500 ${
              detectionStatus === 'detected' ? 'bg-emerald-500 text-white' : 'bg-black/60 text-white'
            }`}>
              {detectionStatus === 'searching' && <SparklesIcon size={18} className="animate-pulse text-blue-400" />}
              {detectionStatus === 'detected' && <CheckCircle2Icon size={18} className="animate-bounce" />}
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                {detectionStatus === 'searching' ? "AI Vision active..." : "Entry Captured"}
              </span>
            </div>
          </div>

          <style>{`
            @keyframes scan {
              0%, 100% { top: 2%; }
              50% { top: 98%; }
            }
          `}</style>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-top-4 duration-500">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Merchant Details</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Starbucks, Amazon"
              className={`w-full p-5 rounded-2xl border transition-all font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                settings.theme === 'dark' 
                  ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-600' 
                  : 'bg-slate-50 border-slate-200 placeholder:text-slate-400'
              }`}
              value={formData.merchant}
              onChange={e => setFormData({...formData, merchant: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount ({symbol})</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">{symbol}</span>
                <input 
                  required
                  type="number" 
                  step="0.01"
                  className={`w-full p-5 pl-10 rounded-2xl border transition-all font-black text-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                    settings.theme === 'dark' 
                      ? 'bg-slate-800 border-slate-700 text-white' 
                      : 'bg-slate-50 border-slate-200'
                  }`}
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
              <input 
                required
                type="date" 
                className={`w-full p-5 rounded-2xl border transition-all font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                  settings.theme === 'dark' 
                    ? 'bg-slate-800 border-slate-700 text-white' 
                    : 'bg-slate-50 border-slate-200'
                }`}
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Label</label>
            <div className="relative">
              <select 
                className={`w-full p-5 rounded-2xl border transition-all appearance-none font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                  settings.theme === 'dark' 
                    ? 'bg-slate-800 border-slate-700 text-white' 
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as Category})}
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <PlusIcon size={18} className="rotate-45" />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-3xl font-black text-xl shadow-2xl shadow-blue-600/20 transition-all active:scale-[0.96] mt-6 flex items-center justify-center gap-4 group"
          >
            <CheckCircle2Icon size={28} className="transition-transform group-hover:scale-110" />
            Commit to Khata
          </button>
        </form>
      )}
    </div>
  );
};

export default AddExpenseModal;