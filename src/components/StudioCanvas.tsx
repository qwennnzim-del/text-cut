import { useEffect, useLayoutEffect, useState, useRef } from 'react';
import { dictionaries } from '../lib/dictionaries';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface Props {
  targetText: string;
  theme: string;
  highlightStyle: string;
  layoutStyle: string;
  speed: number;
  isPlaying: boolean;
  blurStyle: string;
  blurIntensity: number;
  aspectRatio: string;
  zoomLevel: number;
  customFont?: string | null;
  textAnimPreset: string;
}

export function StudioCanvas({ 
  targetText, theme, highlightStyle, layoutStyle, speed, isPlaying,
  blurStyle, blurIntensity, aspectRatio, zoomLevel, customFont, textAnimPreset
}: Props) {
  const [fillerTop, setFillerTop] = useState<string>('');
  const [fillerBottom, setFillerBottom] = useState<string>('');
  
  const [activeLayout, setActiveLayout] = useState(layoutStyle === 'match-cut' ? 'newspaper' : layoutStyle);
  const [activeHighlight, setActiveHighlight] = useState(layoutStyle === 'match-cut' ? 'marker' : highlightStyle);

  const targetRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  // We need to continuously align the vertical center of the target text
  useLayoutEffect(() => {
    if (targetRef.current && containerRef.current && isPlaying) {
        const target = targetRef.current;
        const targetCenterX = target.offsetLeft + (target.offsetWidth / 2);
        const targetCenterY = target.offsetTop + (target.offsetHeight / 2);
        
        if (Math.abs(targetCenterX - offsetX) > 1 || Math.abs(targetCenterY - offsetY) > 1) {
            setOffsetX(targetCenterX);
            setOffsetY(targetCenterY);
        }
    }
  });

  const generateFiller = (count: number) => {
    const dict = dictionaries[theme] || dictionaries.news;
    return Array(count).fill(0).map(() => dict[Math.floor(Math.random() * dict.length)]).join(' ');
  };

  useEffect(() => {
    if (layoutStyle !== 'match-cut') {
      setActiveLayout(layoutStyle);
      setActiveHighlight(highlightStyle);
    }
  }, [layoutStyle, highlightStyle]);

  useEffect(() => {
    setFillerTop(generateFiller(150));
    setFillerBottom(generateFiller(150));
  }, [theme, activeLayout]);

  useEffect(() => {
    if (!isPlaying) return;
    let tick = 0;
    const intervalId = setInterval(() => {
      const scramble = (text: string, intensity: number) => {
        const dict = dictionaries[theme] || dictionaries.news;
        const words = text.split(' ');
        if (words.length <= 1) return text;
        const scrambleCount = Math.max(1, Math.floor(words.length * intensity));
        for (let i = 0; i < scrambleCount; i++) {
          const idx = Math.floor(Math.random() * words.length);
          words[idx] = dict[Math.floor(Math.random() * dict.length)];
        }
        return words.join(' ');
      };

      setFillerTop(prev => scramble(prev, 0.4));
      setFillerBottom(prev => scramble(prev, 0.4));

      tick++;
      if (layoutStyle === 'match-cut') {
        if (tick % 6 === 0) {
            const layouts = ['newspaper', 'digital', 'minimal', 'book'];
            const highlights = ['marker', 'cutout', 'red-ink', 'neon'];
            setActiveLayout(prev => {
                const available = layouts.filter(l => l !== prev);
                return available[Math.floor(Math.random() * available.length)];
            });
            setActiveHighlight(prev => {
                const available = highlights.filter(h => h !== prev);
                return available[Math.floor(Math.random() * available.length)];
            });
            setFillerTop(generateFiller(150));
            setFillerBottom(generateFiller(150));
        }
      }
    }, speed);
    return () => clearInterval(intervalId);
  }, [isPlaying, speed, theme, layoutStyle]);

  const getHighlightClass = () => {
    switch (activeHighlight) {
      case 'marker': 
        return 'bg-yellow-300 text-black px-1 py-0 shadow-[0_2px_10px_rgba(253,224,71,0.5)] transform -rotate-1 skew-x-[1deg] rounded-[2px]';
      case 'cutout': 
        return 'bg-[#0f0f0f] text-white px-2 py-0 transform rotate-1 ring-1 ring-white/10 shadow-lg tracking-widest uppercase';
      case 'red-ink': 
        return 'text-red-600 decoration-red-600/80 decoration-wavy underline decoration-[2px] underline-offset-[2px] transform -rotate-1 italic drop-shadow-sm';
      case 'neon': 
        return 'text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.8)] bg-neutral-950/90 px-2 py-0 ring-1 ring-cyan-500/50 rounded-md';
      default: 
        return '';
    }
  };

  const getContainerClass = () => {
    switch (activeLayout) {
      case 'newspaper':
        return 'border border-black shadow-[0_0_80px_rgba(0,0,0,0.6)]';
      case 'digital':
        return 'border border-white/10 shadow-2xl rounded-md overflow-hidden';
      case 'minimal':
        return '';
      case 'book':
        return 'shadow-[0_40px_100px_rgba(0,0,0,0.8)] rounded-r-2xl border-l-[12px] border-[#1A1918]';
      default:
        return '';
    }
  };

  const renderBlurOverlay = () => {
    if (blurStyle === 'none' || blurIntensity === 0) return null;
    
    const blurPx = Math.floor((blurIntensity / 100) * 12); // max 12px blur
    let maskImage = '';

    switch (blurStyle) {
      case 'radial':
        maskImage = 'radial-gradient(circle at center, transparent 15%, black 60%)';
        break;
      case 'vignette':
        maskImage = 'radial-gradient(ellipse at center, transparent 30%, black 80%)';
        break;
      case 'linear-tilt':
        maskImage = 'linear-gradient(to bottom, black 0%, transparent 40%, transparent 60%, black 100%)';
        break;
      case 'box':
        // using multiple layers to achieve box blur focus
        return (
          <>
             <div className="absolute inset-0 z-40 pointer-events-none" style={{ backdropFilter: `blur(${blurPx}px)`, WebkitMaskImage: 'linear-gradient(to right, black 0%, transparent 15%, transparent 85%, black 100%)' }}></div>
             <div className="absolute inset-0 z-40 pointer-events-none" style={{ backdropFilter: `blur(${blurPx}px)`, WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 15%, transparent 85%, black 100%)' }}></div>
          </>
        );
      default:
        return null;
    }

    return (
      <div 
        className="absolute inset-0 z-40 pointer-events-none" 
        style={{ 
          backdropFilter: `blur(${blurPx}px)`, 
          WebkitMaskImage: maskImage,
          maskImage: maskImage 
        }} 
      />
    );
  };

  const TargetPhrase = () => (
      <span className={cn(
         "whitespace-nowrap transition-all duration-300 relative align-baseline",
         getHighlightClass()
      )}>
        {targetText}
      </span>
  );

  const getAnimProps = () => {
    switch (textAnimPreset) {
      case 'fade':
        return { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.8, ease: "easeOut" } };
      case 'slide':
        return { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, type: 'spring', bounce: 0.4 } };
      case 'zoom':
        return { initial: { opacity: 0, scale: 0.2 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.6, type: 'spring', bounce: 0.5 } };
      case 'random':
        const randX = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 50 + 20);
        const randY = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 50 + 20);
        const randRot = (Math.random() - 0.5) * 60;
        return { 
          initial: { opacity: 0, x: randX, y: randY, rotate: randRot, scale: Math.random() * 0.5 + 0.5 }, 
          animate: { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }, 
          transition: { duration: 0.7, type: 'spring', bounce: 0.4 } 
        };
      default:
        return {};
    }
  };

  const FlowingText = ({ className }: { className?: string }) => {
    const animProps = getAnimProps();
    
    return (
      <div className="absolute inset-0" ref={containerRef} style={customFont ? { fontFamily: `'${customFont}', sans-serif` } : undefined}>
          <div 
             className="absolute w-[200%] sm:w-[150%] md:w-[125%]" 
             style={{ 
                 left: '50%', top: '50%', 
                 transform: `translate(calc(-${offsetX}px), calc(-${offsetY}px))`, 
                 willChange: 'transform' 
             }}
          >
              <p className={cn("relative pointer-events-none text-justify", className)}>
                  {fillerTop}{' '}
                  <motion.span 
                     key={activeLayout + textAnimPreset + targetText + activeHighlight}
                     ref={targetRef as any} 
                     className={cn(
                       "relative inline-block align-baseline z-20 mx-1",
                       getHighlightClass()
                     )}
                     {...animProps}
                  >
                    {targetText}
                  </motion.span>
                  {' '}{fillerBottom}
              </p>
          </div>
      </div>
    );
  };

  return (
    <div 
      className={cn("relative transition-all duration-300 w-full max-h-full", getContainerClass())}
      style={{
        aspectRatio: aspectRatio.replace('/', ' / '),
        // Ensure the canvas fits within the viewport by capping width based on max height aspect calculation
        maxWidth: '100%',
        margin: '0 auto'
      }}
    >
      <motion.div
         // Smooth continuous camera zoom targeted at the absolute center
         animate={{ scale: isPlaying ? [zoomLevel / 100, (zoomLevel / 100) + 0.08] : zoomLevel / 100 }}
         transition={{ duration: 5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
         style={{ transformOrigin: 'center center', willChange: 'transform' }}
         className="absolute inset-0 w-full h-full transform-gpu overflow-hidden bg-neutral-900 flex items-center justify-center"
      >
          {/* -- NEWSPAPER LAYOUT -- */}
         {activeLayout === 'newspaper' && (
            <div className="absolute inset-0 w-full h-full flex flex-col p-6 md:p-10 bg-[#E3E1D9] text-neutral-900 z-0">
               <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] z-0"></div>
               <div className="border-b-[3px] border-black pb-2 mb-4 flex justify-between items-end relative z-30 w-full shrink-0">
                  <span className="font-serif italic text-xl font-bold">The Daily Chronos</span>
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-neutral-600 border border-black px-2 py-0.5">Vol. XCIV</span>
               </div>
               <div className="flex-1 w-full relative z-10 overflow-hidden">
                  <FlowingText className="text-justify font-serif text-base md:text-xl lg:text-2xl leading-[1.6] md:leading-[1.7] opacity-90 text-neutral-800" />
               </div>
            </div>
         )}

         {/* -- DIGITAL ARTICLE LAYOUT -- */}
         {activeLayout === 'digital' && (
            <div className="absolute inset-0 w-full h-full flex flex-col p-8 md:p-12 bg-[#ffffff] text-neutral-900 z-0 radial-gradient-mask">
               <div className="border-b border-zinc-200 pb-2 mb-6 flex items-center gap-3 relative z-30 shrink-0">
                 <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]"></div>
                 <span className="font-sans font-black text-[10px] uppercase tracking-[0.2em] text-red-600">Live Feed</span>
                 <span className="font-sans text-[10px] text-zinc-400 font-bold ml-auto font-mono">10:42:09.12</span>
               </div>
               <div className="flex-1 w-full relative z-10 overflow-hidden">
                  <FlowingText className="font-sans text-neutral-600 text-lg md:text-2xl lg:text-3xl leading-[1.6] md:leading-[1.7] text-justify text-neutral-500" />
               </div>
            </div>
         )}

         {/* -- MINIMAL / TERMINAL LAYOUT -- */}
         {activeLayout === 'minimal' && (
            <div className="absolute inset-0 w-full h-full flex flex-col p-8 md:p-12 bg-transparent text-zinc-300 z-0">
               <div className="w-full text-center tracking-[0.5em] text-[8px] font-mono text-zinc-600 mb-8 uppercase border-b border-white/5 pb-2 shrink-0 relative z-30">
                 -- Signal Intercept --
               </div>
               <div className="flex-1 w-full relative z-10 overflow-hidden px-2 md:px-6">
                  <FlowingText className="font-sans text-amber-500/70 text-xs md:text-base tracking-[0.2em] uppercase leading-[2.5] text-center" />
               </div>
            </div>
         )}
         
         {/* -- NOVEL / BOOK LAYOUT -- */}
         {activeLayout === 'book' && (
            <div className="absolute inset-0 w-full h-full flex flex-col p-8 md:p-16 bg-[#F8F5EF] text-[#2C2B29] z-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
               <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.1)] pointer-events-none"></div>
               <div className="absolute top-6 left-0 w-full flex justify-between items-center px-12 text-[8px] text-[#A69C8E] tracking-[0.3em] uppercase font-sans font-bold shrink-0 z-30">
                 <span>Chapter IV</span>
                 <span>Pg. 204</span>
               </div>
               <div className="flex-1 w-full relative z-10 overflow-hidden mt-4 px-2 md:px-6">
                  <FlowingText className="font-serif leading-[2] text-base md:text-xl lg:text-2xl text-justify opacity-85 first-letter:text-5xl first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-black first-letter:text-[#1A1918]" />
               </div>
            </div>
         )}
         
         {renderBlurOverlay()}

      </motion.div>
    </div>
  );
}

