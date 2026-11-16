import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ImageUpload from './components/ImageUpload';
import ResultsSection from './components/ResultsSection';
import GradCamVisualizer from './components/GradCamVisualizer';
import HowItWorks from './components/HowItWorks';
import ModelPerformance from './components/ModelPerformance';
import AboutTech from './components/AboutTech';
import Footer from './components/Footer';
import { analyzeChestXRay } from './services/api';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const handleAnalyze = async (file) => {
    setIsLoading(true);
    setApiError(null);
    setAnalysisResults(null);

    const result = await analyzeChestXRay(file);

    setIsLoading(false);

    if (result.success) {
      setAnalysisResults(result.data);
      // Smoothly scroll down to the results section after brief render tick
      setTimeout(() => {
        const resultsEl = document.getElementById('results-anchor');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      setApiError(result.error);
    }
  };

  const handleClear = () => {
    setAnalysisResults(null);
    setApiError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* 1. Header Navigation */}
      <Navbar />

      <main className="flex-1">
        
        {/* 2. Hero Section */}
        <Hero />

        {/* 3. Upload & Analysis Section */}
        <section className="py-6">
          <ImageUpload
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            onClear={handleClear}
          />

          {/* Global API Error Banner */}
          {apiError && (
            <div className="max-w-4xl mx-auto px-4 mt-4">
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start space-x-3 shadow-sm">
                <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold">Inference Failure: </span>
                  {apiError}
                </div>
                <button
                  onClick={() => setApiError(null)}
                  className="text-rose-400 hover:text-rose-600 font-bold"
                >
                  &times;
                </button>
              </div>
            </div>
          )}
        </section>

        {/* 4. Results & Visualizations Anchor */}
        <div id="results-anchor" />

        {analysisResults && (
          <div className="space-y-4 pb-12">
            {/* Numerical & Classification Results */}
            <ResultsSection results={analysisResults} />

            {/* Grad-CAM Triplet & Explanations */}
            <GradCamVisualizer
              visualizations={analysisResults.visualizations}
              predictedClass={analysisResults.predicted_class}
            />
          </div>
        )}

        {/* 5. How It Works Pipeline */}
        <HowItWorks />

        {/* 6. Empirical Performance Metrics & Charts */}
        <ModelPerformance />

        {/* 7. Technology Stack & Project Architecture */}
        <AboutTech />

      </main>

      {/* 8. Footer & Mandatory Disclaimer */}
      <Footer />

    </div>
  );
}
