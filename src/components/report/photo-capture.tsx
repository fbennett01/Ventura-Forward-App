import { useId } from "react";
import { Camera } from "lucide-react";
import { motion } from "framer-motion";

interface PhotoCaptureProps {
  cameraError: string | null;
  onRetry: () => void;
  onFileSelected: (file: File) => void;
}

export function PhotoCapture({ cameraError, onRetry, onFileSelected }: PhotoCaptureProps) {
  const inputId = useId();

  return (
    <div className="flex flex-col min-h-screen bg-vf-navy/70 backdrop-blur-xl relative">
      {/* Header */}
      <header className="absolute top-0 inset-x-0 z-40 h-[calc(4rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] flex items-center justify-center px-5 border-b border-border/5 bg-vf-navy/60">
        <span className="font-poppins font-black text-sm tracking-widest text-white uppercase drop-shadow-sm">
          Capture Photo
        </span>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center pt-[calc(4rem+env(safe-area-inset-top))] px-6">
        
        {cameraError && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-red-950/30 border border-red-500/20 rounded-2xl p-5 text-center mb-6 shadow-vf-medium"
          >
            <p className="text-sm font-medium text-red-300 mb-4">{cameraError}</p>
            <button 
              type="button" 
              onClick={onRetry}
              className="text-xs font-bold text-vf-navy bg-vf-accent px-4 py-2 rounded-full hover:bg-white transition-colors"
            >
              Retry Camera
            </button>
          </motion.div>
        )}

        <label 
          htmlFor={inputId}
          className="relative w-full aspect-[4/5] max-h-[60vh] bg-vf-navy-100/40 rounded-3xl border border-white/10 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-vf-navy-100/60 hover:border-white/20 transition-all group overflow-hidden shadow-vf-medium"
        >
          {/* Target Corners */}
          <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 rounded-tl-xl border-vf-accent/40 group-hover:border-vf-accent transition-colors" />
          <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 rounded-tr-xl border-vf-accent/40 group-hover:border-vf-accent transition-colors" />
          <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 rounded-bl-xl border-vf-accent/40 group-hover:border-vf-accent transition-colors" />
          <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 rounded-br-xl border-vf-accent/40 group-hover:border-vf-accent transition-colors" />

          <div className="w-16 h-16 rounded-full bg-vf-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Camera className="size-8 text-vf-accent" />
          </div>
          <p className="font-poppins font-semibold text-lg text-white">Tap to snap</p>
          <p className="text-sm text-vf-sand/50 font-medium">or upload from gallery</p>

          <input
            id={inputId}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onFileSelected(file);
                event.target.value = "";
              }
            }}
          />
        </label>
      </div>

      {/* Footer Area */}
      <div className="absolute bottom-0 inset-x-0 pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-4 bg-gradient-to-t from-vf-navy/90 to-transparent flex justify-center z-40">
        <label
          htmlFor={inputId}
          className="flex items-center justify-center w-16 h-16 rounded-full bg-white text-vf-navy shadow-vf-premium cursor-pointer hover:scale-105 active:scale-95 transition-transform"
        >
          <span className="sr-only">Take Photo</span>
          <div className="w-14 h-14 rounded-full border-2 border-vf-navy flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-vf-navy" />
          </div>
        </label>
      </div>
    </div>
  );
}