import { ThemeType, HighlightStyle, LayoutStyle, BlurStyle, AspectRatio } from '../App';

interface Props {
  targetText: string;
  setTargetText: (t: string) => void;
  theme: ThemeType;
  setTheme: (t: ThemeType) => void;
  highlightStyle: HighlightStyle;
  setHighlightStyle: (s: HighlightStyle) => void;
  layoutStyle: LayoutStyle;
  setLayoutStyle: (s: LayoutStyle) => void;
  speed: number;
  setSpeed: (s: number) => void;
  isPlaying: boolean;
  setIsPlaying: (s: boolean) => void;
  blurStyle: BlurStyle;
  setBlurStyle: (s: BlurStyle) => void;
  blurIntensity: number;
  setBlurIntensity: (s: number) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (s: AspectRatio) => void;
  zoomLevel: number;
  setZoomLevel: (s: number) => void;
}

export function ControlPanel(props: Props) {
  return (
    <aside className="w-full md:w-72 h-[40vh] md:h-full border-t md:border-t-0 md:border-r border-zinc-800 bg-[#0f0f0f] flex flex-col flex-shrink-0 z-30 font-sans">
      <div className="p-4 md:p-6 flex-1 overflow-y-auto flex flex-col gap-6 md:gap-8">
         {/* Target Text */}
         <section>
           <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-3 block">Target Anchor</label>
           <input
             type="text"
             value={props.targetText}
             onChange={(e) => props.setTargetText(e.target.value)}
             className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 text-white font-serif italic text-lg outline-none focus:border-white transition-colors"
             placeholder="E.g. ALWAYS YOU"
           />
         </section>

         {/* Aspect Ratio */}
         <section>
           <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-3 block">Canvas Ratio</label>
           <select
             value={props.aspectRatio}
             onChange={(e) => props.setAspectRatio(e.target.value as AspectRatio)}
             className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 text-zinc-300 text-xs outline-none focus:border-white transition-colors cursor-pointer"
           >
             <option value="16/9">16:9 Landscape</option>
             <option value="9/16">9:16 Portrait</option>
             <option value="1/1">1:1 Square</option>
             <option value="4/3">4:3 Standard</option>
             <option value="3/4">3:4 Standard Vertical</option>
           </select>
         </section>

         {/* Dictionary Theme */}
         <section>
           <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-3 block">Dynamic Context (Dict)</label>
           <select
             value={props.theme}
             onChange={(e) => props.setTheme(e.target.value as ThemeType)}
             className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 text-zinc-300 text-xs outline-none focus:border-white transition-colors cursor-pointer"
           >
             <option value="news">News / Journalistic</option>
             <option value="diary">Personal Diary</option>
             <option value="cyberpunk">Cyberpunk / Tech</option>
             <option value="lorem">Lorem Ipsum</option>
           </select>
         </section>

         {/* Layout Style */}
         <section>
           <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-3 block">Layout Pattern</label>
           <select
             value={props.layoutStyle}
             onChange={(e) => props.setLayoutStyle(e.target.value as LayoutStyle)}
             className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 text-zinc-300 text-xs outline-none focus:border-white transition-colors cursor-pointer"
           >
             <option value="newspaper">The Observer (Newspaper)</option>
             <option value="digital">Digital Article</option>
             <option value="minimal">Minimalist View</option>
             <option value="book">Novel / Book</option>
             <option value="match-cut">Auto Match Cut (Mixed)</option>
           </select>
         </section>

         {/* Highlight Style */}
         <section className={props.layoutStyle === 'match-cut' ? 'opacity-50 pointer-events-none' : ''}>
           <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-3 block">Highlight Logic</label>
           <select
             value={props.highlightStyle}
             onChange={(e) => props.setHighlightStyle(e.target.value as HighlightStyle)}
             className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 text-zinc-300 text-xs outline-none focus:border-white transition-colors cursor-pointer"
           >
             <option value="marker">Yellow Marker Offset</option>
             <option value="red-ink">Red Ink Wavy</option>
             <option value="cutout">Ransom Cutout Card</option>
             <option value="neon">Cyber Neon Glow</option>
           </select>
         </section>

         {/* Camera Zoom */}
         <section>
           <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3">
             <span>Camera Zoom</span>
             <span>{props.zoomLevel}%</span>
           </div>
           <input
             type="range"
             min="100"
             max="300"
             step="5"
             value={props.zoomLevel}
             onChange={(e) => props.setZoomLevel(Number(e.target.value))}
             className="w-full"
           />
         </section>

         {/* Camera Focus Blur */}
         <section>
           <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-3 block">Camera Focus Blur</label>
           <div className="space-y-4">
             <select
               value={props.blurStyle}
               onChange={(e) => props.setBlurStyle(e.target.value as BlurStyle)}
               className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 text-zinc-300 text-xs outline-none focus:border-white transition-colors cursor-pointer"
             >
               <option value="none">No Blur (Flat)</option>
               <option value="radial">Radial Spotlight</option>
               <option value="vignette">Deep Vignette</option>
               <option value="linear-tilt">Linear Tilt-Shift</option>
               <option value="box">Box Center Focus</option>
             </select>
             
             {props.blurStyle !== 'none' && (
                <div className="pt-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3">
                    <span>Intensity</span>
                    <span>{props.blurIntensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={props.blurIntensity}
                    onChange={(e) => props.setBlurIntensity(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
             )}
           </div>
         </section>

         {/* Speed Slider */}
         <section>
           <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3">
             <span>Scramble Rate</span>
             <span>{props.speed}ms</span>
           </div>
           <input
             type="range"
             min="30"
             max="500"
             step="10"
             value={530 - props.speed}
             onChange={(e) => props.setSpeed(530 - Number(e.target.value))}
             className="w-full"
           />
         </section>
      </div>
    </aside>
  );
}
