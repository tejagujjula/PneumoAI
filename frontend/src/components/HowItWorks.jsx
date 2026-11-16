import React from 'react';
import { Scan, Cpu, Filter, Eye, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      icon: Scan,
      title: 'Standardization Pipeline',
      desc: 'Input chest radiograph images are converted to 3-channel RGB, resized to 224 × 224, and normalized with standard ImageNet mean and standard deviation.',
      badge: 'Resize & Normalize',
    },
    {
      num: '02',
      icon: Cpu,
      title: 'EfficientNetV2-S Inference',
      desc: 'The pre-trained convolutional backbone processes multi-scale feature representations across progressive Fused-MBConv stages, outputting a 1280-dimensional feature vector.',
      badge: '1280-dim Features',
    },
    {
      num: '03',
      icon: Filter,
      title: 'Calibrated Decision (τ = 0.77)',
      desc: 'Softmax probabilities are evaluated against threshold 0.77, which was selected on validation data to maximize specificity (reaching 98.94%) while maintaining sensitivity of at least 98% (98.21%).',
      badge: 'Threshold: 0.77',
    },
    {
      num: '04',
      icon: Eye,
      title: 'Grad-CAM on features[5]',
      desc: 'Backpropagating the target class score into layer features[5] produces a spatial activation map, resized to native dimensions to visualize feature attribution (not a clinically validated localization method).',
      badge: 'Visual Interpretability',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60">
            Methodology & Pipeline
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
            How PneumoAI Evaluates Radiographs
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-2">
            An end-to-end modular pipeline combining convolutional transfer learning with machine learning interpretability.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative bg-slate-50 rounded-2xl p-6 border border-slate-200/80 hover:border-teal-300 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-teal-600/30 group-hover:text-teal-600 transition-colors">
                      {step.num}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                      {step.badge}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-teal-600 shadow-sm mb-4 group-hover:bg-teal-600 group-hover:text-white transition-all">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200/60 flex items-center text-[11px] font-semibold text-teal-700">
                  <span>Pipeline Stage {idx + 1}</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
