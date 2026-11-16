import React from 'react';
import { AlertTriangle, CheckCircle2, Sliders, Layers, Ruler, Activity } from 'lucide-react';

export default function ResultsSection({ results }) {
  if (!results) return null;

  const {
    predicted_class,
    predicted_label,
    threshold_applied,
    probabilities,
    image_dimensions,
  } = results;

  const isPneumonia = predicted_class === 'PNEUMONIA';
  const pneumoniaPct = (probabilities.PNEUMONIA * 100).toFixed(2);
  const normalPct = (probabilities.NORMAL * 100).toFixed(2);
  const thresholdPct = (threshold_applied * 100).toFixed(0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-fadeIn">
      
      {/* Primary Classification Result Banner */}
      <div
        className={`rounded-2xl p-6 border shadow-sm transition-all ${
          isPneumonia
            ? 'bg-rose-50/90 border-rose-200 text-rose-950'
            : 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          
          <div className="flex items-start space-x-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                isPneumonia
                  ? 'bg-rose-500 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {isPneumonia ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <CheckCircle2 className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 border border-current">
                  Model Decision
                </span>
                <span className="text-xs text-slate-500">
                  Threshold: {threshold_applied}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black mt-1">
                {isPneumonia ? 'Pneumonia Indicated' : 'Normal Classification'}
              </h3>

              <p className="text-sm mt-1 text-slate-700 max-w-xl">
                {isPneumonia ? (
                  <>
                    The EfficientNetV2-S model yielded a model-estimated probability of pneumonia of{' '}
                    <strong>{pneumoniaPct}%</strong>, which meets or exceeds the operating threshold of{' '}
                    <strong>{threshold_applied}</strong>.
                  </>
                ) : (
                  <>
                    The model-estimated probability of pneumonia is <strong>{pneumoniaPct}%</strong>, which is below
                    the decision threshold of <strong>{threshold_applied}</strong>, resulting in a NORMAL classification.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Probability pill */}
          <div className="text-right flex-shrink-0">
            <div
              className={`text-3xl font-black ${
                isPneumonia ? 'text-rose-600' : 'text-emerald-700'
              }`}
            >
              {isPneumonia ? `${pneumoniaPct}%` : `${normalPct}%`}
            </div>
            <div className="text-xs text-slate-500 font-medium">Model-estimated probability</div>
          </div>

        </div>
      </div>

      {/* Probabilities Breakdown with Threshold Marker */}
      <div className="mt-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center justify-between">
          <span>Softmax Probability Distribution</span>
          <span className="text-xs text-slate-400 font-normal">Sum: 100.0%</span>
        </h4>

        {/* Pneumonia Bar */}
        <div className="space-y-1.5 mb-5">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-slate-700 flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-2" />
              Pneumonia (Class 1)
            </span>
            <span className="text-slate-900 font-mono font-bold">{pneumoniaPct}%</span>
          </div>

          <div className="relative w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(0, probabilities.PNEUMONIA * 100))}%` }}
            />
          </div>

          {/* Calibrated threshold marker */}
          <div className="relative pt-1">
            <div
              className="absolute -top-4 flex flex-col items-center"
              style={{ left: `${thresholdPct}%`, transform: 'translateX(-50%)' }}
              title="Decision threshold: 0.77 (77%)"
            >
              <div className="w-0.5 h-6 bg-slate-900/60 z-10" />
              <span className="text-[10px] font-mono font-semibold bg-slate-800 text-white px-1.5 py-0.5 rounded shadow-sm mt-0.5 whitespace-nowrap">
                Threshold {threshold_applied}
              </span>
            </div>
          </div>
        </div>

        {/* Normal Bar */}
        <div className="space-y-1.5 pt-4 border-t border-slate-100">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-slate-700 flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2" />
              Normal (Class 0)
            </span>
            <span className="text-slate-900 font-mono font-bold">{normalPct}%</span>
          </div>

          <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(0, probabilities.NORMAL * 100))}%` }}
            />
          </div>
        </div>

        <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
          *Note: Threshold <strong>0.77</strong> was selected on validation data to maximize specificity (reaching <strong>98.94%</strong>) while maintaining sensitivity of at least 98% (<strong>98.21%</strong>).
        </p>
      </div>

      {/* Metadata Metrics Row */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[11px] font-medium text-slate-400 flex items-center justify-center">
            <Sliders className="w-3 h-3 mr-1 text-teal-600" />
            Decision Threshold
          </span>
          <div className="text-base font-bold text-slate-800 mt-0.5 font-mono">
            {threshold_applied}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[11px] font-medium text-slate-400 flex items-center justify-center">
            <Activity className="w-3 h-3 mr-1 text-teal-600" />
            Predicted Label
          </span>
          <div className="text-base font-bold text-slate-800 mt-0.5 font-mono">
            {predicted_label} ({predicted_class})
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[11px] font-medium text-slate-400 flex items-center justify-center">
            <Ruler className="w-3 h-3 mr-1 text-teal-600" />
            Image Dimensions
          </span>
          <div className="text-base font-bold text-slate-800 mt-0.5 font-mono">
            {image_dimensions ? `${image_dimensions.width} × ${image_dimensions.height}` : '224 × 224'}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[11px] font-medium text-slate-400 flex items-center justify-center">
            <Layers className="w-3 h-3 mr-1 text-teal-600" />
            Target Layer
          </span>
          <div className="text-base font-bold text-slate-800 mt-0.5 font-mono">
            features[5]
          </div>
        </div>

      </div>

    </div>
  );
}
