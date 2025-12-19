import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Image as ImageIcon, 
  Mic, 
  Send, 
  ChevronLeft,
  Zap,
  Loader2,
  BrainCircuit,
  XCircle,
  PlusCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

// ĐÃ SỬA ĐƯỜNG DẪN THEO ẢNH image_4b2c3e.png
import { SUBJECT_CONFIG, TAB_CONFIG } from '../constants';
import { generateStudyContent } from '../services/geminiService';
import MermaidChart from '../components/MermaidChart';
import { Subject, ModuleTab, AIResponse } from '../types';

const App: React.FC = () => {
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [activeTab, setActiveTab] = useState<ModuleTab>(ModuleTab.SPEED);
  const [inputText, setInputText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showMcqAnswer, setShowMcqAnswer] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tabContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showResult && tabContainerRef.current) {
      const activeBtn = tabContainerRef.current.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement;
      if (activeBtn) {
        const containerWidth = tabContainerRef.current.offsetWidth;
        const btnOffset = activeBtn.offsetLeft;
        const btnWidth = activeBtn.offsetWidth;
        tabContainerRef.current.scrollTo({
          left: btnOffset - (containerWidth / 2) + (btnWidth / 2),
          behavior: 'smooth'
        });
      }
    }
  }, [activeTab, showResult]);

  const handleSubjectSelect = (subject: Subject) => {
    if (subject === Subject.TIME) return alert("Tính năng đang phát triển!");
    setCurrentSubject(subject);
    resetState();
  };

  const resetState = () => {
    setAiResponse(null);
    setCapturedImage(null);
    setInputText('');
    setShowResult(false);
    setIsCameraActive(false);
    setSelectedOption(null);
    setShowMcqAnswer(false);
    setActiveTab(ModuleTab.SPEED);
  };

  const handleStartCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Lỗi camera!");
      setIsCameraActive(false);
    }
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(videoRef.current, 0, 0);
      setCapturedImage(canvasRef.current.toDataURL('image/jpeg'));
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach(t => t.stop());
      setIsCameraActive(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setCapturedImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!currentSubject || (!inputText && !capturedImage)) return;
    setIsAiLoading(true);
    try {
      const label = SUBJECT_CONFIG[currentSubject].label;
      const res = await generateStudyContent(label, inputText || "Giải bài tập", capturedImage || undefined);
      setAiResponse(res);
      setShowResult(true);
    } catch (e: any) {
      alert("Lỗi kết nối AI");
    } finally {
      setIsAiLoading(false);
    }
  };

  const renderHome = () => (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center gap-12 bg-slate-50">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-slate-800">Symbiotic AI</h1>
        <p className="text-slate-500 font-medium mt-2">Dự án KHKT 2025 - THPT Mai Sơn</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {(Object.keys(SUBJECT_CONFIG) as Subject[]).map((subj) => (
          <button key={subj} onClick={() => handleSubjectSelect(subj)} className={`flex flex-col items-center p-6 rounded-3xl transition-all shadow-lg bg-gradient-to-br ${SUBJECT_CONFIG[subj].gradient} text-white hover:scale-105`}>
            <div className="bg-white/20 p-4 rounded-2xl mb-4">{SUBJECT_CONFIG[subj].icon}</div>
            <span className="font-bold uppercase">{SUBJECT_CONFIG[subj].label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderSubjectView = () => {
    const config = SUBJECT_CONFIG[currentSubject!];
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <header className={`p-4 flex items-center justify-between text-white bg-gradient-to-r ${config.gradient} sticky top-0 z-50`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentSubject(null)} className="p-2 hover:bg-white/20 rounded-full"><ChevronLeft /></button>
            <h2 className="font-bold uppercase">{config.label}</h2>
          </div>
        </header>

        <main className="flex-1 max-w-4xl mx-auto w-full p-4 pb-40">
          {!showResult && !isAiLoading ? (
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
              {isCameraActive && (
                <div className="relative mb-6 rounded-3xl overflow-hidden bg-black aspect-video">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <button onClick={captureFrame} className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white p-5 rounded-full"><Camera /></button>
                </div>
              )}
              {capturedImage && !isCameraActive && (
                <div className="relative mb-8 max-w-xs mx-auto">
                  <img src={capturedImage} className="rounded-3xl border-4 border-white shadow-xl" alt="Preview" />
                  <button onClick={() => setCapturedImage(null)} className="absolute -top-3 -right-3 bg-rose-500 text-white p-2 rounded-full"><XCircle /></button>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <button onClick={handleStartCamera} className="flex flex-col items-center gap-2 py-4 bg-slate-50 rounded-2xl border hover:border-indigo-400"><Camera /><span>Camera</span></button>
                <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 py-4 bg-slate-50 rounded-2xl border hover:border-emerald-400"><ImageIcon /><span>Ảnh</span></button>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
              </div>
              <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Nhập câu hỏi..." className="w-full p-6 bg-slate-50 rounded-2xl min-h-[150px] mb-6 focus:outline-none border focus:border-indigo-500" />
              <button onClick={handleSubmit} disabled={isAiLoading} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex justify-center items-center gap-2">
                <Sparkles className="w-5 h-5" /> THỰC HIỆN
              </button>
            </div>
          ) : isAiLoading ? (
            <div className="flex flex-col items-center py-20"><Loader2 className="w-12 h-12 animate-spin text-indigo-600" /><p className="mt-4 font-bold">AI đang suy nghĩ...</p></div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden">
                <div className="flex overflow-x-auto p-4 gap-2 bg-slate-50 border-b">
                  {(Object.keys(TAB_CONFIG) as ModuleTab[]).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-xl font-bold whitespace-nowrap ${activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-white border'}`}>
                      {TAB_CONFIG[tab].label}
                    </button>
                  ))}
                </div>
                <div className="p-8">
                  {activeTab === ModuleTab.SPEED ? (
                    <div className="bg-indigo-50 p-8 rounded-2xl">
                      <h4 className="text-indigo-600 font-black mb-4 uppercase">Đáp án</h4>
                      <div className="text-3xl font-black">{aiResponse?.speed.answer}</div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap leading-relaxed">{(aiResponse as any)?.[activeTab]}</div>
                  )}
                </div>
              </div>
              <MermaidChart chart={aiResponse?.mermaid || ''} />
              <button onClick={resetState} className="w-full py-6 bg-white border-2 rounded-3xl font-bold text-indigo-600 uppercase tracking-widest">Câu hỏi mới</button>
            </div>
          )}
        </main>
        {showResult && (
          <footer className="fixed bottom-0 left-0 right-0 bg-white/90 p-4 border-t z-50">
            <div className="max-w-4xl mx-auto flex gap-4">
              <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Hỏi thêm..." className="flex-1 bg-slate-100 p-4 rounded-full" />
              <button onClick={handleSubmit} className="p-4 text-indigo-600"><Send /></button>
            </div>
          </footer>
        )}
      </div>
    );
  };

  return currentSubject ? renderSubjectView() : renderHome();
};

export default App;
