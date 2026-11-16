import React, { useEffect, useState } from 'react';
import { Activity, ShieldAlert, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';
import { checkBackendHealth } from '../services/api';

export default function Navbar() {
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'offline' | 'checking'

  useEffect(() => {
    const verifyStatus = async () => {
      const res = await checkBackendHealth();
      if (res.success && res.data?.status === 'healthy') {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    };
    verifyStatus();
    const interval = setInterval(verifyStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-sky-500 flex items-center justify-center text-white shadow-sm shadow-teal-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Pneumo<span className="text-teal-600">AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200/60">
                  EfficientNetV2-S
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                Chest X-ray Classification & Grad-CAM Interpretability
              </p>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <a href="#analyzer" className="hover:text-teal-600 transition-colors">Analyzer</a>
            <a href="#how-it-works" className="hover:text-teal-600 transition-colors">How It Works</a>
            <a href="#metrics" className="hover:text-teal-600 transition-colors">Model Metrics</a>
            <a href="#about" className="hover:text-teal-600 transition-colors">About</a>
          </nav>

          {/* Backend Status indicator */}
          <div className="flex items-center space-x-3">
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                backendStatus === 'online'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : backendStatus === 'offline'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
              title={backendStatus === 'online' ? 'FastAPI Backend is running on http://127.0.0.1:8000' : 'Cannot reach backend on port 8000'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus === 'online'
                    ? 'bg-emerald-500 animate-pulse'
                    : backendStatus === 'offline'
                    ? 'bg-rose-500'
                    : 'bg-amber-500 animate-ping'
                }`}
              />
              <span className="capitalize">
                {backendStatus === 'online'
                  ? 'Backend Active'
                  : backendStatus === 'offline'
                  ? 'Backend Offline'
                  : 'Connecting...'}
              </span>
            </div>

            <a
              href="#analyzer"
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 shadow-sm transition-all"
            >
              Analyze Scan
            </a>
          </div>

        </div>
      </div>
    </header>
  );
}
