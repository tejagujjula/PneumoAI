import React, { useState } from 'react';
import { Layers, Download, Info, Sparkles, AlertCircle } from 'lucide-react';

export default function GradCamVisualizer({ visualizations, predictedClass }) {
  if (!visualizations) return null;

  const { original, heatmap, overlay } = visualizations;
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'overlay' | 'heatmap' | 'original'

  const downloadImage = (dataUrl, filename) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fadeIn">
      
      {/* Section Title */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/60 mb-2">
          <Layers className="w-3.5 h-3.5 text-teal-600" />
          <span>Grad-CAM Interpretability Engine</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Feature Attribution & Visual Interpretability
        </h2>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl mx-auto">
          Gradient-weighted Class Activation Mapping (Grad-CAM) highlights spatial activation patterns in 
          <code className="text-xs bg-slate-100 px-1 py-0.5 rounded text-teal-700 font-mono ml-1">model.features[5]</code> that 
          influenced the model prediction. This is an exploratory interpretability aid, not a clinically validated localization method.
        </p>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Side-by-Side (All 3)
          </button>
          <button
            onClick={() => setActiveTab('overlay')}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              activeTab === 'overlay'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Blended Overlay
          </button>
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              activeTab === 'heatmap'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            JET Heatmap
          </button>
          <button
            onClick={() => setActiveTab('original')}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              activeTab === 'original'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Original Radiograph
          </button>
        </div>
      </div>

      {/* Visualizations Content */}
      {activeTab === 'all' ? (
        /* 3-Column Comparison Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Original */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800">1. Original Radiograph</span>
                <p className="text-[11px] text-slate-500">Input Chest X-Ray</p>
              </div>
              <button
                onClick={() => downloadImage(original, 'original_xray.png')}
                className="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-white"
                title="Download original PNG"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-950 flex items-center justify-center flex-1">
              <img
                src={original}
                alt="Original Chest X-ray"
                className="max-h-72 w-auto object-contain rounded-lg shadow-sm"
              />
            </div>

            <div className="p-3 bg-white border-t border-slate-100 text-[11px] text-slate-500">
              Evaluated chest radiograph at native resolution.
            </div>
          </div>

          {/* Card 2: Heatmap */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800">2. Grad-CAM Activation</span>
                <p className="text-[11px] text-slate-500">JET Colormapped Map</p>
              </div>
              <button
                onClick={() => downloadImage(heatmap, 'gradcam_heatmap.png')}
                className="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-white"
                title="Download heatmap PNG"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-950 flex items-center justify-center flex-1">
              <img
                src={heatmap}
                alt="Grad-CAM Jet Heatmap"
                className="max-h-72 w-auto object-contain rounded-lg shadow-sm"
              />
            </div>

            <div className="p-3 bg-white border-t border-slate-100 text-[11px] text-slate-500">
              Interpolated to native dimensions with bilinear smoothing.
            </div>
          </div>

          {/* Card 3: Overlay */}
          <div className="bg-white rounded-2xl border-2 border-teal-500/30 shadow-md overflow-hidden flex flex-col">
            <div className="p-3.5 bg-teal-50/70 border-b border-teal-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-teal-900 flex items-center">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-teal-600" />
                  3. Blended Overlay (40/60)
                </span>
                <p className="text-[11px] text-teal-700">Feature Alignment</p>
              </div>
              <button
                onClick={() => downloadImage(overlay, 'gradcam_overlay.png')}
                className="p-1.5 text-teal-600 hover:text-teal-800 rounded-lg hover:bg-white"
                title="Download overlay PNG"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-950 flex items-center justify-center flex-1">
              <img
                src={overlay}
                alt="Composite Grad-CAM Overlay"
                className="max-h-72 w-auto object-contain rounded-lg shadow-sm"
              />
            </div>

            <div className="p-3 bg-white border-t border-slate-100 text-[11px] text-slate-500">
              Composite overlay highlighting feature regions that influenced the model prediction.
            </div>
          </div>

        </div>
      ) : (
        /* Single Focused View */
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden p-6 text-center">
          <div className="relative bg-slate-950 rounded-xl p-4 flex items-center justify-center">
            <img
              src={
                activeTab === 'overlay'
                  ? overlay
                  : activeTab === 'heatmap'
                  ? heatmap
                  : original
              }
              alt="Grad-CAM Display"
              className="max-h-[460px] w-auto object-contain rounded-lg"
            />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-left">
              <h4 className="text-sm font-bold text-slate-900 capitalize">
                {activeTab === 'overlay' ? 'Composite Overlay' : activeTab === 'heatmap' ? 'Pure Heatmap' : 'Original Radiograph'}
              </h4>
              <p className="text-xs text-slate-500">
                Resolution-aligned Base64 PNG visualization
              </p>
            </div>

            <button
              onClick={() => downloadImage(visualizations[activeTab], `${activeTab}_xray.png`)}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download PNG
            </button>
          </div>
        </div>
      )}

      {/* Colormap Legend & Medical Reading Note */}
      <div className="mt-8 bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 flex-shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-slate-900">Interpreting Grad-CAM Attributions:</span>
            <p className="mt-0.5">
              Warmer hues indicate regions in the feature maps with higher positive influence on the model's prediction. Grad-CAM is an exploratory interpretability tool and is <strong>not a clinically validated localization method</strong>.
            </p>
          </div>
        </div>

        {/* JET Colormap Gradient Bar */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <span className="text-[11px] font-medium text-slate-500">Lower Attribution</span>
          <div
            className="w-36 h-4 rounded-full shadow-inner"
            style={{
              background: 'linear-gradient(to right, #000080, #0000ff, #00ffff, #00ff00, #ffff00, #ff0000, #800000)',
            }}
          />
          <span className="text-[11px] font-bold text-rose-600">Higher Attribution</span>
        </div>

      </div>

    </div>
  );
}
