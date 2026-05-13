import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, X, Info, AlertTriangle, Maximize, Minimize } from 'lucide-react';
import { StudioCanvas } from './components/StudioCanvas';
import { ControlPanel } from './components/ControlPanel';

export type ThemeType = 'news' | 'diary' | 'cyberpunk' | 'lorem';
export type HighlightStyle = 'marker' | 'cutout' | 'red-ink' | 'neon';
export type LayoutStyle = 'newspaper' | 'digital' | 'minimal' | 'book' | 'match-cut';
export type BlurStyle = 'none' | 'radial' | 'linear-tilt' | 'vignette' | 'box';
export type AspectRatio = '16/9' | '9/16' | '1/1' | '4/3' | '3/4';

export default function App() {
  const [targetText, setTargetText] = useState('SuperRinz Studio');
  const [theme, setTheme] = useState<ThemeType>('news');
  const [highlightStyle, setHighlightStyle] = useState<HighlightStyle>('marker');
  const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>('newspaper');
  const [speed, setSpeed] = useState(100);
  const [isPlaying, setIsPlaying] = useState(true);
  const [blurStyle, setBlurStyle] = useState<BlurStyle>('radial');
  const [blurIntensity, setBlurIntensity] = useState(40);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9/16');
  const [zoomLevel, setZoomLevel] = useState(120);
  const [customFont, setCustomFont] = useState<string | null>(null);
  
  const [exportRes, setExportRes] = useState<'720p' | '1080p' | '4k'>('1080p');
  const [exportFormat, setExportFormat] = useState<'mp4' | 'webm'>('mp4');

  const [isFullscreenMode, setIsFullscreenMode] = useState(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
        setIsFullscreenMode(!!document.fullscreenElement || !!(document as any).webkitFullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    const el = canvasContainerRef.current;
    if (!el) return;

    if (!isFullscreenMode) {
        if (el.requestFullscreen) {
            el.requestFullscreen().catch(e => console.log(e));
        } else if ((el as any).webkitRequestFullscreen) {
            (el as any).webkitRequestFullscreen();
        }
        setIsFullscreenMode(true);
    } else {
        if (document.exitFullscreen && document.fullscreenElement) {
            document.exitFullscreen().catch(e => console.log(e));
        } else if ((document as any).webkitExitFullscreen && (document as any).webkitFullscreenElement) {
            (document as any).webkitExitFullscreen();
        }
        setIsFullscreenMode(false);
    }
  };

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'info' | 'warning' | 'error' | 'instruction' | 'export-options';
    title: string;
    message: string;
    recommendation?: string;
  } | null>(null);

  const handleExportClick = () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
          if (isMobile) {
              setModalState({
                  isOpen: true,
                  type: 'warning',
                  title: 'Ekspor Tidak Didukung di HP',
                  message: 'Fitur Unduh Video menggunakan sistem rekam layar browser yang sayangnya tidak didukung oleh perangkat HP (Android & iOS) karena batasan sistem dari pabrikan.',
                  recommendation: '💡 Solusi: Anda dapat menggunakan aplikasi Perekam Layar bawaan HP untuk merekam animasi secara manual.\n\nAtau buka website ini di Laptop/PC untuk menikmati fitur Auto-Download.'
              });
          } else {
              setModalState({
                  isOpen: true,
                  type: 'warning',
                  title: 'Ekspor Dibatasi',
                  message: 'Ekspor (Screen Recording) tidak didukung di lingkungan preview ini.',
                  recommendation: 'Silakan klik ikon panah di pojok kanan atas untuk membuka aplikasi ini di tab baru pada browser desktop Anda.'
              });
          }
          return;
      }
      
      setModalState({
          isOpen: true,
          type: 'export-options',
          title: 'Pengaturan Ekspor Video',
          message: 'Pilih resolusi dan format video yang diinginkan. Perekaman layar akan mengikuti rasio aspek canvas Anda saat ini.',
      });
  };

  const proceedToInstruction = () => {
      setModalState({
          isOpen: true,
          type: 'instruction',
          title: 'Persiapan Ekspor Video',
          message: `Saat Anda klik "Mulai Rekam", browser akan meminta izin share screen. Pastikan Anda memilih opsi "Current Tab" (Tab Saat Ini) agar video yang terekam pas dengan frame.`,
          recommendation: 'Sistem akan otomatis merekam selama 5 detik lalu mengunduh hasilnya.'
      });
  };

  const startExport = async () => {
    setModalState(null);
    try {
      let idealWidth = 1920;
      let idealHeight = 1080;
      if (exportRes === '720p') { idealWidth = 1280; idealHeight = 720; }
      if (exportRes === '4k') { idealWidth = 3840; idealHeight = 2160; }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          displaySurface: "browser",
          width: { ideal: idealWidth },
          height: { ideal: idealHeight }
        },
        audio: false
      });
      
      const mimeType = exportFormat === 'webm' ? 'video/webm' : 'video/mp4';
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, { mimeType });
      } catch (e) {
        recorder = new MediaRecorder(stream); // Fallback to browser default
      }
      
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
         if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
         const blob = new Blob(chunks, { type: recorder.mimeType || 'video/mp4' });
         const url = URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = url;
         a.download = `TextCut_Export_${Date.now()}.${exportFormat}`;
         document.body.appendChild(a);
         a.click();
         document.body.removeChild(a);
         URL.revokeObjectURL(url);
      };
      recorder.start();
      
      // Auto stop after 5s
      setTimeout(() => {
         if (recorder.state === 'recording') {
             recorder.stop();
             stream.getTracks().forEach(t => t.stop());
         }
      }, 5000);
    } catch (err) {
      console.error("Export error", err);
      setModalState({
          isOpen: true,
          type: 'error',
          title: 'Ekspor Dibatalkan',
          message: 'Gagal merekam layar karena izin dibatalkan atau tidak diberikan.',
          recommendation: 'Harap izinkan browser untuk merekam layar (bagikan Tab Saat Ini) ketika diminta.'
      });
    }
  };

  return (
    <div className="flex flex-col-reverse md:flex-row h-screen bg-[#0a0a0a] text-zinc-400 font-sans overflow-hidden">
      {/* Sidebar */}
         <ControlPanel
           targetText={targetText} setTargetText={setTargetText}
           theme={theme} setTheme={setTheme}
           highlightStyle={highlightStyle} setHighlightStyle={setHighlightStyle}
           layoutStyle={layoutStyle} setLayoutStyle={setLayoutStyle}
           speed={speed} setSpeed={setSpeed}
           isPlaying={isPlaying} setIsPlaying={setIsPlaying}
           blurStyle={blurStyle} setBlurStyle={setBlurStyle}
           blurIntensity={blurIntensity} setBlurIntensity={setBlurIntensity}
           aspectRatio={aspectRatio} setAspectRatio={setAspectRatio}
           zoomLevel={zoomLevel} setZoomLevel={setZoomLevel}
           customFont={customFont} setCustomFont={setCustomFont}
        />
      {/* Main Workspace */}
      <main className="flex-1 flex flex-col h-full relative bg-[#050505] min-h-0 overflow-hidden">
         <header className="h-14 border-b border-zinc-800 flex items-center px-3 sm:px-6 justify-between bg-[#0f0f0f] z-20 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex w-8 h-8 bg-white items-center justify-center text-black font-black text-xs italic shrink-0">T/C</div>
              <div className="flex flex-col">
                <span className="text-white font-medium tracking-tight text-sm sm:text-base leading-none mt-0.5">TEXTCUT<span className="text-zinc-500 font-normal ml-1">// STUDIO</span></span>
                <span className="text-[8px] sm:text-[9px] text-zinc-500 mt-1 uppercase tracking-widest leading-none">© SuperRinz Dev</span>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
               <button
                 onClick={toggleFullscreen}
                 className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors border bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
               >
                 {isFullscreenMode ? <Minimize size={14} /> : <Maximize size={14} />}
                 <span className="hidden sm:inline">{isFullscreenMode ? 'Tutup' : 'Layar Penuh'}</span>
               </button>
               <button
                 onClick={() => setIsPlaying(!isPlaying)}
                 className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors border ${isPlaying ? 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700' : 'bg-white border-white text-black hover:bg-zinc-200'}`}
               >
                 {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                 <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Play'}</span>
               </button>
               <button 
                 onClick={handleExportClick}
                 className="px-2 sm:px-4 py-1.5 bg-white text-black text-[10px] sm:text-xs font-bold rounded hover:bg-zinc-200 uppercase tracking-wider flex items-center gap-1 sm:gap-2"
               >
                 <Download size={14} />
                 <span className="hidden sm:inline">Export</span>
               </button>
            </div>
         </header>

         <div 
           ref={canvasContainerRef}
           className={`flex-1 relative flex items-center justify-center overflow-hidden p-2 sm:p-6 min-h-0 bg-[#050505] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px] sm:bg-[size:24px_24px] ${isFullscreenMode ? 'fixed inset-0 z-50 !bg-[#050505]' : ''}`}
         >
            {isFullscreenMode && (
              <button 
                onClick={toggleFullscreen}
                className="absolute top-4 right-4 z-[60] p-3 bg-black/60 hover:bg-black text-white/50 hover:text-white rounded-full transition-all backdrop-blur"
              >
                <Minimize size={20} />
              </button>
            )}
            <div className="absolute inset-0 pointer-events-none"></div>
            <StudioCanvas
              targetText={targetText}
              theme={theme}
              highlightStyle={highlightStyle}
              layoutStyle={layoutStyle}
              speed={speed}
              isPlaying={isPlaying}
              blurStyle={blurStyle}
              blurIntensity={blurIntensity}
              aspectRatio={aspectRatio}
              zoomLevel={zoomLevel}
              customFont={customFont}
            />
         </div>
      </main>

      {modalState && modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-zinc-800 p-6 rounded-xl max-w-sm w-full shadow-2xl relative flex flex-col">
            <button 
              onClick={() => setModalState(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${
              modalState.type === 'error' ? 'bg-red-500/20 text-red-500' :
              modalState.type === 'warning' ? 'bg-amber-500/20 text-amber-500' :
              'bg-blue-500/20 text-blue-500'
            }`}>
              {modalState.type === 'error' || modalState.type === 'warning' ? 
               <AlertTriangle size={20} /> : <Info size={20} />}
            </div>
            
            <h3 className="text-white font-semibold text-lg mb-2">{modalState.title}</h3>
            <p className="text-zinc-400 text-sm mb-4 leading-relaxed">{modalState.message}</p>
            
            {modalState.recommendation && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-3 mb-6">
                <p className="text-zinc-300 text-xs sm:text-sm whitespace-pre-line">{modalState.recommendation}</p>
              </div>
            )}
            
            {modalState.type === 'export-options' ? (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-2 block">Resolusi</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['720p', '1080p', '4k'].map(res => (
                      <button 
                         key={res}
                         onClick={() => setExportRes(res as any)}
                         className={`py-2 text-xs rounded border transition-colors ${exportRes === res ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500'}`}
                      >
                         {res.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-2 block">Format</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['mp4', 'webm'].map(fmt => (
                      <button 
                         key={fmt}
                         onClick={() => setExportFormat(fmt as any)}
                         className={`py-2 text-xs rounded border transition-colors ${exportFormat === fmt ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500'}`}
                      >
                         {fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button 
                     onClick={() => setModalState(null)}
                     className="px-4 py-2 rounded font-medium text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                     Batal
                  </button>
                  <button 
                     onClick={proceedToInstruction}
                     className="px-4 py-2 bg-white text-black rounded font-bold text-sm tracking-wide hover:bg-zinc-200 transition-colors"
                  >
                     Lanjut
                  </button>
                </div>
              </div>
            ) : modalState.type === 'instruction' ? (
              <div className="flex justify-end gap-3">
                <button 
                   onClick={() => setModalState({
                     isOpen: true,
                     type: 'export-options',
                     title: 'Pengaturan Ekspor Video',
                     message: 'Pilih resolusi dan format video yang diinginkan. Perekaman layar akan mengikuti rasio aspek canvas Anda saat ini.'
                   })}
                   className="px-4 py-2 rounded font-medium text-sm text-zinc-400 hover:text-white transition-colors"
                >
                   Kembali
                </button>
                <button 
                   onClick={startExport}
                   className="px-4 py-2 bg-white text-black rounded font-bold text-sm tracking-wide hover:bg-zinc-200 transition-colors"
                >
                   Mulai Rekam
                </button>
              </div>
            ) : (
              <button 
                 onClick={() => setModalState(null)}
                 className="w-full px-4 py-2 bg-zinc-800 text-white rounded font-medium text-sm tracking-wide hover:bg-zinc-700 transition-colors mt-2"
              >
                 Tutup
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
