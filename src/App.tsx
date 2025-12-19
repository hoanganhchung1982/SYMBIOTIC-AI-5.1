import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Send, ChevronLeft, Zap, Loader2, Sparkles, XCircle } from 'lucide-react';

// ĐƯỜNG DẪN ĐÃ HIỆU CHỈNH THEO ẢNH image_4b2c3e.png
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
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartCamera = async () => {
    setIsCameraActive(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) videoRef.current.srcObject = stream;
  };

  const handleSubmit = async () => {
    if (!currentSubject) return;
    setIsAiLoading(true);
    try {
      const res = await generateStudyContent(SUBJECT_CONFIG[currentSubject].label, inputText || "Giải bài tập", capturedImage || undefined);
      setAiResponse(res);
    } catch (e) { alert("Lỗi kết nối AI"); }
    finally { setIsAiLoading(false); }
  };

  if (!currentSubject) {
    return (
      <div className="min-h-screen p-10 bg-slate-50 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-black mb-10">Symbiotic AI</h1>
        <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
          {(Object.keys(SUBJECT_CONFIG) as Subject[]).map((subj) => (
            <button key={subj} onClick={() => setCurrentSubject(subj)} className={`p-8 rounded-3xl text-white font-bold bg-gradient-to-br ${SUBJECT_CONFIG[subj].gradient}`}>
              {SUBJECT_CONFIG[subj].label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className={`p-4 text-white font-bold flex gap-4 bg-gradient-to-r ${SUBJECT_CONFIG[currentSubject].gradient}`}>
        <button onClick={() => setCurrentSubject(null)}><ChevronLeft /></button>
        {SUBJECT_CONFIG[currentSubject].label}
      </header>
      
      <main className="p-6 max-w-2xl mx-auto space-y-6">
        {isAiLoading ? (
          <div className="flex flex-col items-center py-20"><Loader2 className="animate-spin" /></div>
        ) : aiResponse ? (
          <div className="space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {Object.keys(TAB_CONFIG).map(t => (
                <button key={t} onClick={() => setActiveTab(t as ModuleTab)} className={`px-4 py-2 rounded-full border ${activeTab === t ? 'bg-black text-white' : ''}`}>
                  {(TAB_CONFIG as any)[t].label}
                </button>
              ))}
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl whitespace-pre-wrap">
              {activeTab === 'speed' ? aiResponse.speed.answer : (aiResponse as any)[activeTab]}
            </div>
            <MermaidChart chart={aiResponse.mermaid} />
            <button onClick={() => setAiResponse(null)} className="w-full py-4 border-2 rounded-2xl font-bold">CÂU HỎI MỚI</button>
          </div>
        ) : (
          <div className="space-y-6">
            {isCameraActive && <video ref={videoRef} autoPlay className="w-full rounded-2xl bg-black" />}
            <div className="grid grid-cols-2 gap-4">
              <button onClick={handleStartCamera} className="p-4 bg-slate-100 rounded-2xl">Camera</button>
              <button onClick={() => fileInputRef.current?.click()} className="p-4 bg-slate-100 rounded-2xl">Chọn ảnh</button>
              <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) { const r = new FileReader(); r.onload = (ev) => setCapturedImage(ev.target?.result as string); r.readAsDataURL(f); }
              }} />
            </div>
            <textarea value={inputText} onChange={e => setInputText(e.target.value)} className="w-full p-4 border rounded-2xl h-40" placeholder="Nhập câu hỏi..." />
            <button onClick={handleSubmit} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold">GIẢI BÀI TẬP</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
