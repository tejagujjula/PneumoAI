import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ShieldCheck, CheckCircle2, TrendingUp, Sliders, Database, Award } from 'lucide-react';

export default function ModelPerformance() {
  // Exact experimental results at threshold 0.77
  const comparisonData = [
    { metric: 'Sensitivity (Recall)', Validation: 98.21, Test: 98.97 },
    { metric: 'Specificity', Validation: 98.94, Test: 69.66 },
  ];

  const testSummary = [
    { label: 'Accuracy', value: '87.98%', desc: 'Overall test accuracy' },
    { label: 'Precision', value: '84.46%', desc: 'Positive predictive value' },
    { label: 'Sensitivity / Recall', value: '98.97%', desc: 'Pneumonia detection rate' },
    { label: 'Specificity', value: '69.66%', desc: 'True negative rate on test set' },
    { label: 'F1-Score', value: '91.15%', desc: 'Harmonic mean of precision & recall' },
    { label: 'ROC-AUC', value: '96.64%', desc: 'Area under ROC curve (0.9664)' },
  ];

  return (
    <section id="metrics" className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60">
            Empirical Evaluation
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
            Experimental Validation & Held-Out Test Metrics
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-2">
            Rigorous evaluation of the EfficientNetV2-S binary classifier at calibrated threshold &tau; = 0.77.
          </p>
        </div>

        {/* 4 Primary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
            <span className="text-xs font-semibold text-slate-500">Validation Sensitivity</span>
            <div className="text-3xl font-black text-teal-600 mt-1">98.21%</div>
            <p className="text-[11px] text-slate-400 mt-1">Maintains &ge; 98% target</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
            <span className="text-xs font-semibold text-slate-500">Validation Specificity</span>
            <div className="text-3xl font-black text-slate-800 mt-1">98.94%</div>
            <p className="text-[11px] text-slate-400 mt-1">Maximized at threshold 0.77</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
            <span className="text-xs font-semibold text-slate-500">Held-Out Test Accuracy</span>
            <div className="text-3xl font-black text-sky-600 mt-1">87.98%</div>
            <p className="text-[11px] text-slate-400 mt-1">F1-Score: 91.15%</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
            <span className="text-xs font-semibold text-slate-500">Test ROC-AUC</span>
            <div className="text-3xl font-black text-emerald-600 mt-1">96.64%</div>
            <p className="text-[11px] text-slate-400 mt-1">AUC = 0.9664</p>
          </div>

        </div>

        {/* Recharts Comparison Chart & Threshold Justification */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-10">
          
          {/* Recharts Bar Graph */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Sensitivity & Specificity Comparison (%) at &tau; = 0.77
                </h3>
                <p className="text-xs text-slate-500">
                  Validation set vs. Held-out test set
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-teal-600" />
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparisonData}
                  margin={{ top: 20, right: 30, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="metric" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 12, fill: '#64748b' }} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', fontSize: '12px' }}
                    formatter={(value) => [`${value}%`]}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="Validation" fill="#0d9488" radius={[6, 6, 0, 0]} name="Validation Set (τ = 0.77)" />
                  <Bar dataKey="Test" fill="#0284c7" radius={[6, 6, 0, 0]} name="Held-Out Test Set (τ = 0.77)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Threshold Justification & Training Explainer */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-teal-700">
              <Sliders className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-base text-slate-900">
                Operating Threshold Selection
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              In experimental pneumonia screening, missing potential positive cases is particularly undesirable. A default threshold of 
              <code className="text-[11px] bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono mx-1">0.50</code> can lead to excessive false positives due to class imbalance and subtle normal radiographic variations.
            </p>

            <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200/80 text-xs text-teal-900 space-y-1.5">
              <div className="font-bold flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-teal-600" />
                Validation Calibration:
              </div>
              <p className="text-[11px] text-teal-800 leading-relaxed">
                Threshold <strong>0.77</strong> was selected on validation data to <strong>maximize specificity (reaching 98.94%)</strong> while <strong>maintaining sensitivity of at least 98% (98.21%)</strong>.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Best Checkpoint:</span>
                <strong className="font-mono text-slate-800">Epoch 3</strong>
              </div>
              <div className="flex justify-between">
                <span>Best Validation Loss:</span>
                <strong className="font-mono text-slate-800">0.0382</strong>
              </div>
              <div className="flex justify-between">
                <span>Early Stopping:</span>
                <strong className="font-mono text-slate-800">Epoch 8</strong>
              </div>
            </div>
          </div>

        </div>

        {/* Complete Held-out Test Metrics Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <Award className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-bold text-slate-900">
              Held-Out Test Set Performance Breakdown (&tau; = 0.77)
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {testSummary.map((item) => (
              <div key={item.label} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <div className="text-[11px] font-medium text-slate-500">{item.label}</div>
                <div className="text-lg font-black text-slate-900 mt-0.5">{item.value}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
