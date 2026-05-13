import { useState } from 'react';
import { Play, Pause, Download } from 'lucide-react';
import { StudioCanvas } from './components/StudioCanvas';
import { ControlPanel } from './components/ControlPanel';

export type ThemeType = 'news' | 'diary' | 'cyberpunk' | 'lorem';
export type HighlightStyle = 'marker' | 'cutout' | 'red-ink' | 'neon';
export type LayoutStyle = 'newspaper' | 'digital' | 'minimal' | 'book' | 'match-cut';
export type BlurStyle = 'none' | 'radial' | 'linear-tilt' | 'vignette' | 'box';
export type AspectRatio = '16/9' | '9/16' | '1/1' | '4/3' | '3/4';

export default function App() {
  const [targetText, setTargetText] = useState('ALWAYS YOU');
  const [theme, setTheme] = useState<ThemeType>('news');
  const [highlightStyle, setHighlightStyle] = useState<HighlightStyle>('marker');
  const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>('newspaper');
  const [speed, setSpeed] = useState(100);
  const [isPlaying, setIsPlaying] = useState(true);
  const [blurStyle, setBlurStyle] = useState<BlurStyle>('radial');
  const [blurIntensity, setBlurIntensity] = useState(40);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16/9');
  const [zoomLevel, setZoomLevel] = useState(120);

  const handleExport = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
          alert("Screen recording is not supported in this preview frame. Please open the app in a new tab (using the arrow icon at the top right) to use the export feature.");
          return;
      }
      alert("To export your video, please select the 'Current Tab' when prompted to share screen. Recording will automatically capture 5 seconds.");
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "browser" },
        audio: false
      });
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
         if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
         const blob = new Blob(chunks, { type: 'video/mp4' });
         const url = URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = url;
         a.download = `TextCut_Export_${Date.now()}.mp4`;
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
      alert("Export canceled or failed. Please ensure screen sharing permissions are granted.");
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
                 onClick={() => setIsPlaying(!isPlaying)}
                 className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors border ${isPlaying ? 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700' : 'bg-white border-white text-black hover:bg-zinc-200'}`}
               >
                 {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                 <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Play'}</span>
               </button>
               <button 
                 onClick={handleExport}
                 className="px-2 sm:px-4 py-1.5 bg-white text-black text-[10px] sm:text-xs font-bold rounded hover:bg-zinc-200 uppercase tracking-wider flex items-center gap-1 sm:gap-2"
               >
                 <Download size={14} />
                 <span className="hidden sm:inline">Export</span>
               </button>
            </div>
         </header>

         <div className="flex-1 relative flex items-center justify-center overflow-hidden p-2 sm:p-6 min-h-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px] sm:bg-[size:24px_24px]">
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
            />
         </div>
      </main>
    </div>
  );
}
