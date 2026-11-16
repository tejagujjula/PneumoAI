import React from 'react';
import { Activity, ShieldAlert, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      
      {/* Prominent Educational Disclaimer Banner */}
      <div className="bg-slate-950/90 py-6 border-b border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h5 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
              Educational & Research Disclaimer
            </h5>
            <p className="text-slate-300 text-xs leading-relaxed">
              <strong>This is an experimental educational project, not a clinical diagnostic tool.</strong> It is developed solely for academic research, computer vision demonstrations, and explainability exploration. This software should not be used for medical diagnosis, clinical treatment planning, or patient triage in healthcare settings.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-tight">
                Pneumo<span className="text-teal-400">AI</span>
              </span>
              <p className="text-[11px] text-slate-500">
                Pneumonia Classification & Visual Interpretability
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 text-xs text-slate-400">
            <a href="#analyzer" className="hover:text-teal-400 transition-colors">Analyzer</a>
            <a href="#how-it-works" className="hover:text-teal-400 transition-colors">Pipeline</a>
            <a href="#metrics" className="hover:text-teal-400 transition-colors">Metrics</a>
            <a href="#about" className="hover:text-teal-400 transition-colors">About</a>
            <a
              href="http://127.0.0.1:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-400 hover:underline"
            >
              API Docs
            </a>
          </div>

          <div className="text-center md:text-right text-[11px] text-slate-500">
            <p>&copy; {new Date().getFullYear()} PneumoAI Project. College Demonstration Edition.</p>
            <p className="mt-0.5 text-slate-600">Built with EfficientNetV2-S, FastAPI & React</p>
          </div>

        </div>
      </div>

    </footer>
  );
}
