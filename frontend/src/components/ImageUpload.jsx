import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, RefreshCw, AlertCircle, FileCheck, Play, Loader2, Sparkles } from 'lucide-react';

export default function ImageUpload({ onAnalyze, isLoading, onClear }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const MAX_SIZE_MB = 10;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'];

  const validateAndSetFile = (file) => {
    setErrorMessage('');

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMessage(`Unsupported format (${file.type || 'unknown'}). Please upload JPEG, PNG, WEBP, or BMP.`);
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setErrorMessage(`File size (${sizeMB} MB) exceeds the 10 MB maximum upload limit.`);
      return;
    }

    // Revoke old object URL if exists
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    if (onClear) onClear(); // Clear previous predictions
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setErrorMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onClear) onClear();
  };

  const handleStartAnalysis = () => {
    if (selectedFile && onAnalyze) {
      onAnalyze(selectedFile);
    }
  };

  // Helper to create a quick synthetic sample for instant demonstration
  const handleLoadDemoSample = (type = 'pneumonia') => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Draw realistic synthetic chest X-ray
    ctx.fillStyle = '#101418';
    ctx.fillRect(0, 0, 512, 512);

    // Thoracic ellipse
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.ellipse(256, 256, 190, 230, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Bilateral lungs
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(170, 256, 65, 140, 0, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(342, 256, 65, 140, 0, 0, 2 * Math.PI);
    ctx.fill();

    // If pneumonia, add dense infiltrate opacity on left lower lobe
    if (type === 'pneumonia') {
      const grad = ctx.createRadialGradient(160, 310, 5, 160, 310, 55);
      grad.addColorStop(0, 'rgba(240, 240, 240, 0.85)');
      grad.addColorStop(1, 'rgba(30, 41, 59, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(160, 310, 55, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Rib cage shadows
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.lineWidth = 14;
    for (let y = 140; y < 420; y += 45) {
      ctx.beginPath();
      ctx.moveTo(110, y);
      ctx.quadraticCurveTo(256, y + 25, 402, y);
      ctx.stroke();
    }

    canvas.toBlob((blob) => {
      const file = new File([blob], `demo_${type}_xray.png`, { type: 'image/png' });
      validateAndSetFile(file);
    }, 'image/png');
  };

  return (
    <div id="analyzer" className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Section Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Upload Chest Radiograph
        </h2>
        <p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto">
          Drag and drop an anterior-posterior (AP) or postero-anterior (PA) chest X-ray image for experimental classification and Grad-CAM interpretability.
        </p>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-800 text-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Upload Error: </span>
            {errorMessage}
          </div>
          <button onClick={() => setErrorMessage('')} className="text-rose-400 hover:text-rose-600 font-bold">
            &times;
          </button>
        </div>
      )}

      {/* Main Upload Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        
        {!previewUrl ? (
          /* Dropzone */
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-teal-500 bg-teal-50/60 scale-[0.99]'
                : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50/70'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.webp,.bmp"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-4 shadow-sm">
              <Upload className="w-8 h-8" />
            </div>

            <p className="text-base font-semibold text-slate-800">
              Drag & Drop your Chest X-ray here, or <span className="text-teal-600 underline">Browse files</span>
            </p>

            <p className="text-xs text-slate-400 mt-2">
              Supported Formats: PNG, JPEG, WEBP, BMP • Maximum File Size: 10 MB
            </p>

            {/* Quick Demo Buttons for presentation */}
            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap justify-center items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <span className="text-xs text-slate-400 mr-2 flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-teal-500" />
                No scan file? Try demo samples:
              </span>
              <button
                type="button"
                onClick={() => handleLoadDemoSample('pneumonia')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
              >
                Sample: Pneumonia X-ray
              </button>
              <button
                type="button"
                onClick={() => handleLoadDemoSample('normal')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                Sample: Normal X-ray
              </button>
            </div>

          </div>
        ) : (
          /* Preview state */
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
              
              {/* Thumbnail */}
              <div className="relative w-44 h-44 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-slate-300 shadow-inner">
                <img
                  src={previewUrl}
                  alt="Selected Chest X-Ray Preview"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                  Input X-Ray
                </div>
              </div>

              {/* File Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start space-x-2 text-slate-800">
                  <FileCheck className="w-5 h-5 text-teal-600" />
                  <h3 className="font-semibold text-base truncate max-w-xs sm:max-w-md">
                    {selectedFile?.name}
                  </h3>
                </div>

                <div className="mt-2 text-xs text-slate-500 space-y-1">
                  <p>
                    <span className="font-medium text-slate-700">Size:</span>{' '}
                    {(selectedFile?.size / 1024).toFixed(1)} KB ({((selectedFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                  <p>
                    <span className="font-medium text-slate-700">MIME Type:</span>{' '}
                    {selectedFile?.type || 'image/png'}
                  </p>
                  <p className="text-teal-700 font-medium">
                    Ready for EfficientNetV2-S inference ($224 \times 224$ normalization).
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <button
                    type="button"
                    onClick={handleStartAnalysis}
                    disabled={isLoading}
                    className={`inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all ${
                      isLoading
                        ? 'bg-teal-400 cursor-not-allowed'
                        : 'bg-teal-600 hover:bg-teal-700 hover:scale-[1.02] shadow-teal-600/20'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Running Inference & Grad-CAM...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2 fill-current" />
                        Analyze Chest X-Ray
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Replace Image
                  </button>
                </div>
              </div>

            </div>

            {/* In-flight loading animation banner */}
            {isLoading && (
              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center space-x-3 animate-pulse">
                <Loader2 className="w-5 h-5 text-teal-600 animate-spin flex-shrink-0" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-teal-800">
                    Executing Model Inference Pipeline...
                  </p>
                  <p className="text-teal-600 text-[11px]">
                    1. Resize & Normalize (224x224) &rarr; 2. EfficientNetV2-S Logits &rarr; 3. Calibrated Threshold (0.77) &rarr; 4. Backward Hook on features[5]
                  </p>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
