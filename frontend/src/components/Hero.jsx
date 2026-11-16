import React from 'react';
import { ArrowDownCircle, Sparkles, ShieldCheck } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-8 pb-14 bg-gradient-to-b from-teal-50/50 via-white to-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Subtle pill tag */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium bg-teal-100/80 text-teal-800 border border-teal-200 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>EfficientNetV2-S Binary Classifier • Grad-CAM Interpretability</span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Understand Chest X-rays <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-teal-600 via-teal-500 to-sky-600 bg-clip-text text-transparent">
              with Explainable AI
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Upload chest radiograph images to evaluate an experimental binary classifier (NORMAL vs. PNEUMONIA).
            Inspect model-estimated probabilities and visualize feature regions that influenced the model prediction using
            <strong> Grad-CAM heatmaps</strong> (an interpretability aid, not a clinically validated localization method).
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-3">
            <a
              href="#analyzer"
              className="inline-flex items-center px-6 py-3 rounded-xl font-semibold text-sm bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-600/20 transition-all hover:scale-[1.02]"
            >
              <ArrowDownCircle className="w-4 h-4 mr-2" />
              Upload & Analyze Scan
            </a>
            <a
              href="#metrics"
              className="inline-flex items-center px-6 py-3 rounded-xl font-semibold text-sm bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-sm transition-all"
            >
              <ShieldCheck className="w-4 h-4 mr-2 text-teal-600" />
              View Evaluation Metrics
            </a>
          </div>
        </div>

        {/* Feature Badges Strip with Exact Experimental Metrics */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          
          <div className="bg-white/80 p-4 rounded-xl border border-slate-200/80 shadow-sm text-center">
            <div className="text-2xl font-black text-teal-600">98.21%</div>
            <div className="text-xs font-medium text-slate-500 mt-1">Validation Sensitivity</div>
            <div className="text-[11px] text-slate-400">Maintains &ge; 98% target</div>
          </div>

          <div className="bg-white/80 p-4 rounded-xl border border-slate-200/80 shadow-sm text-center">
            <div className="text-2xl font-black text-slate-800">98.94%</div>
            <div className="text-xs font-medium text-slate-500 mt-1">Validation Specificity</div>
            <div className="text-[11px] text-slate-400">Maximized at threshold 0.77</div>
          </div>

          <div className="bg-white/80 p-4 rounded-xl border border-slate-200/80 shadow-sm text-center">
            <div className="text-2xl font-black text-sky-600">87.98%</div>
            <div className="text-xs font-medium text-slate-500 mt-1">Held-Out Test Accuracy</div>
            <div className="text-[11px] text-slate-400">F1-score: 91.15%</div>
          </div>

          <div className="bg-white/80 p-4 rounded-xl border border-slate-200/80 shadow-sm text-center">
            <div className="text-2xl font-black text-slate-800">96.64%</div>
            <div className="text-xs font-medium text-slate-500 mt-1">Test ROC-AUC</div>
            <div className="text-[11px] text-slate-400">Area under curve: 0.9664</div>
          </div>

        </div>

      </div>
    </section>
  );
}
