import { useState, useRef, useEffect } from 'react';
import { ThemeType, HighlightStyle, LayoutStyle, BlurStyle, AspectRatio } from '../App';
import { ChevronDown, Check, Upload, PlayCircle, Type } from 'lucide-react';

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
  customFont: string | null;
  setCustomFont: (f: string | null) => void;
  textAnimPreset: string;
  setTextAnimPreset: (s: any) => void;
}

const TEMPLATES = [
  { id: 'custom', label: 'Custom / Manual', config: null },
  { id: 'news_classic', label: '🗞️ The Classic News', config: { theme: 'news', layout: 'newspaper', highlight: 'marker', zoomLevel: 120, blurStyle: 'vignette', speed: 150, textAnimPreset: 'fade' } },
  { id: 'cyber_attack', label: '💻 Cyber Attack', config: { theme: 'cyberpunk', layout: 'digital', highlight: 'neon', zoomLevel: 160, blurStyle: 'none', speed: 60, textAnimPreset: 'zoom' } },
  { id: 'cinematic', label: '🎬 Cinematic Focus', config: { theme: 'diary', layout: 'book', highlight: 'red-ink', zoomLevel: 110, blurStyle: 'radial', speed: 250, textAnimPreset: 'slide' } },
  { id: 'minimal_cut', label: '⚡ Minimal Match Cut', config: { theme: 'lorem', layout: 'match-cut', highlight: 'cutout', zoomLevel: 100, blurStyle: 'none', speed: 120, textAnimPreset: 'random' } },
];

interface Option {
  value: string;
  label: string;
}

function CustomSelect({ value, onChange, options, disabled = false }: { value: string, onChange: (v: string) => void, options: Option[], disabled?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className={`relative ${disabled ? 'opacity-50 pointer-events-none' : ''}`} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#151515] hover:bg-[#1c1c1c] border border-zinc-800 rounded-lg p-3 px-4 text-zinc-300 text-xs outline-none transition-all duration-200 flex items-center justify-between group focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : 'group-hover:text-zinc-400'}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-[#151515] border border-zinc-800 rounded-lg shadow-[0_10px_40px_-5px_rgba(0,0,0,0.8)] py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-60 overflow-y-auto hidden-scrollbar">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between transition-colors ${
                  value === option.value 
                    ? 'bg-white/10 text-white font-medium' 
                    : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                }`}
              >
                <span className="truncate">{option.label}</span>
                {value === option.value && <Check size={14} className="text-white" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ControlPanel(props: Props) {
  const [activeTemplateId, setActiveTemplateId] = useState<string>('custom');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applyTemplate = (id: string) => {
    setActiveTemplateId(id);
    const template = TEMPLATES.find(t => t.id === id);
    if (template && template.config) {
      props.setTheme(template.config.theme as ThemeType);
      props.setLayoutStyle(template.config.layout as LayoutStyle);
      props.setHighlightStyle(template.config.highlight as HighlightStyle);
      props.setZoomLevel(template.config.zoomLevel);
      props.setBlurStyle(template.config.blurStyle as BlurStyle);
      props.setSpeed(template.config.speed);
      props.setTextAnimPreset(template.config.textAnimPreset);
    }
  };

  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const fontName = 'CustomFont_' + Date.now();
      const newStyle = document.createElement('style');
      newStyle.appendChild(document.createTextNode(`
        @font-face {
          font-family: '${fontName}';
          src: url('${url}');
        }
      `));
      document.head.appendChild(newStyle);
      props.setCustomFont(fontName);
    }
    if (fileInputRef.current) {
       fileInputRef.current.value = '';
    }
  };

  return (
    <aside className="w-full md:w-72 h-[40vh] md:h-full border-t md:border-t-0 md:border-r border-zinc-800 bg-[#0a0a0a] flex flex-col flex-shrink-0 z-30 font-sans">
      <div className="p-4 md:p-6 flex-1 overflow-y-auto flex flex-col gap-6 md:gap-8 hidden-scrollbar">
         {/* Pre-made Templates */}
         <section>
           <label className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-white mb-3 block flex items-center gap-2">
             <PlayCircle size={12} className="text-cyan-400" />
             Quick Templates
           </label>
           <CustomSelect 
             value={activeTemplateId}
             onChange={applyTemplate}
             options={TEMPLATES.map(t => ({ value: t.id, label: t.label }))}
           />
         </section>

         {/* Target Text */}
         <section>
           <label className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-zinc-400 mb-3 block">Target Anchor</label>
           <input
             type="text"
             value={props.targetText}
             onChange={(e) => props.setTargetText(e.target.value)}
             className="w-full bg-[#151515] border border-zinc-800 rounded-lg p-3 px-4 text-white font-serif italic text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all shadow-inner"
             placeholder="E.g. ALWAYS YOU"
           />
         </section>

         {/* Custom Font Upload */}
         <section>
           <label className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-zinc-400 mb-3 block flex items-center gap-2">
             <Type size={12} />
             Custom Font
           </label>
           <input 
             type="file" 
             accept=".ttf,.otf,.woff,.woff2" 
             className="hidden" 
             ref={fileInputRef} 
             onChange={handleFontUpload}
           />
           <button 
             onClick={() => fileInputRef.current?.click()}
             className={`w-full flex items-center justify-center gap-2 border rounded-lg p-3 text-xs font-medium transition-colors ${
               props.customFont ? 'bg-white text-black border-white hover:bg-zinc-200' : 'bg-[#151515] border-zinc-800 text-zinc-300 hover:bg-[#1c1c1c] hover:border-zinc-700'
             }`}
           >
             <Upload size={14} />
             {props.customFont ? 'Ganti Font' : 'Unggah Font (.ttf/.otf)'}
           </button>
           {props.customFont && (
             <button onClick={() => props.setCustomFont(null)} className="w-full mt-2 text-[10px] text-zinc-500 hover:text-white transition-colors uppercase tracking-widest text-center">
               Reset ke Default
             </button>
           )}
         </section>

         {/* Aspect Ratio */}
         <section>
           <label className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-zinc-400 mb-3 block">Canvas Ratio</label>
           <CustomSelect 
             value={props.aspectRatio}
             onChange={(v) => props.setAspectRatio(v as AspectRatio)}
             options={[
               { value: '16/9', label: '16:9 Landscape' },
               { value: '9/16', label: '9:16 Portrait' },
               { value: '1/1', label: '1:1 Square' },
               { value: '4/3', label: '4:3 Standard' },
               { value: '3/4', label: '3:4 Standard Vertical' }
             ]}
           />
         </section>

         {/* Dictionary Theme */}
         <section>
           <label className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-zinc-400 mb-3 block">Dynamic Context (Dict)</label>
           <CustomSelect 
             value={props.theme}
             onChange={(v) => props.setTheme(v as ThemeType)}
             options={[
               { value: 'news', label: 'News / Journalistic' },
               { value: 'diary', label: 'Personal Diary' },
               { value: 'cyberpunk', label: 'Cyberpunk / Tech' },
               { value: 'lorem', label: 'Lorem Ipsum' }
             ]}
           />
         </section>

         {/* Layout Style */}
         <section>
           <label className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-zinc-400 mb-3 block">Layout Pattern</label>
           <CustomSelect 
             value={props.layoutStyle}
             onChange={(v) => props.setLayoutStyle(v as LayoutStyle)}
             options={[
               { value: 'newspaper', label: 'The Observer (Newspaper)' },
               { value: 'digital', label: 'Digital Article' },
               { value: 'minimal', label: 'Minimalist View' },
               { value: 'book', label: 'Novel / Book' },
               { value: 'match-cut', label: 'Auto Match Cut (Mixed)' }
             ]}
           />
         </section>

         {/* Highlight Style */}
         <section className={props.layoutStyle === 'match-cut' ? 'opacity-50 pointer-events-none' : ''}>
           <label className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-zinc-400 mb-3 block">Highlight Logic</label>
           <CustomSelect 
             value={props.highlightStyle}
             onChange={(v) => props.setHighlightStyle(v as HighlightStyle)}
             options={[
               { value: 'marker', label: 'Yellow Marker Offset' },
               { value: 'red-ink', label: 'Red Ink Wavy' },
               { value: 'cutout', label: 'Ransom Cutout Card' },
               { value: 'neon', label: 'Cyber Neon Glow' }
             ]}
           />
         </section>

         {/* Text Animation Preset */}
         <section>
           <label className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-zinc-400 mb-3 block flex items-center gap-2">
             <PlayCircle size={12} className="text-purple-400" />
             Text Animation Preset
           </label>
           <CustomSelect 
             value={props.textAnimPreset}
             onChange={(v) => props.setTextAnimPreset(v)}
             options={[
               { value: 'none', label: 'None (Static)' },
               { value: 'fade', label: 'Fade In' },
               { value: 'slide', label: 'Slide In Up' },
               { value: 'zoom', label: 'Zoom In' },
               { value: 'random', label: 'Random Mix' }
             ]}
           />
         </section>

         {/* Camera Zoom */}
         <section>
           <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.25em] font-extrabold text-zinc-400 mb-3 block">
             <span>Camera Zoom</span>
             <span className="text-zinc-300 bg-zinc-800/50 px-2 py-0.5 rounded text-[9px]">{props.zoomLevel}%</span>
           </div>
           <input
             type="range"
             min="100"
             max="300"
             step="5"
             value={props.zoomLevel}
             onChange={(e) => props.setZoomLevel(Number(e.target.value))}
             className="w-full accent-white bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-white/20"
           />
         </section>

         {/* Camera Focus Blur */}
         <section>
           <label className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-zinc-400 mb-3 block">Camera Focus Blur</label>
           <div className="space-y-4">
             <CustomSelect 
               value={props.blurStyle}
               onChange={(v) => props.setBlurStyle(v as BlurStyle)}
               options={[
                 { value: 'none', label: 'No Blur (Flat)' },
                 { value: 'radial', label: 'Radial Spotlight' },
                 { value: 'vignette', label: 'Deep Vignette' },
                 { value: 'linear-tilt', label: 'Linear Tilt-Shift' },
                 { value: 'box', label: 'Box Center Focus' }
               ]}
             />
             
             {props.blurStyle !== 'none' && (
                <div className="pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.25em] font-extrabold text-zinc-400 mb-3 block">
                    <span>Intensity</span>
                    <span className="text-zinc-300 bg-zinc-800/50 px-2 py-0.5 rounded text-[9px]">{props.blurIntensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={props.blurIntensity}
                    onChange={(e) => props.setBlurIntensity(Number(e.target.value))}
                    className="w-full accent-white bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-white/20"
                  />
                </div>
             )}
           </div>
         </section>

         {/* Speed Slider */}
         <section className="pb-4">
           <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.25em] font-extrabold text-zinc-400 mb-3 block">
             <span>Scramble Rate</span>
             <span className="text-zinc-300 bg-zinc-800/50 px-2 py-0.5 rounded text-[9px]">{props.speed}ms</span>
           </div>
           <input
             type="range"
             min="30"
             max="500"
             step="10"
             value={530 - props.speed}
             onChange={(e) => props.setSpeed(530 - Number(e.target.value))}
             className="w-full accent-white bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-white/20"
           />
         </section>
      </div>
    </aside>
  );
}
