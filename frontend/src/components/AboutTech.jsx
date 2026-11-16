import React from 'react';
import { Code2, Server, Database, Brain, Sparkles, BookOpen } from 'lucide-react';

export default function AboutTech() {
  const techStack = [
    {
      category: 'Deep Learning',
      icon: Brain,
      items: ['PyTorch 2.11', 'Torchvision 0.26', 'EfficientNetV2-S', 'Grad-CAM Hooks (features[5])'],
    },
    {
      category: 'Backend & Inference',
      icon: Server,
      items: ['FastAPI 0.136', 'Uvicorn ASGI', 'Pydantic v2', 'OpenCV & Pillow'],
    },
    {
      category: 'Frontend & UI',
      icon: Code2,
      items: ['React 18', 'Vite 5', 'Tailwind CSS', 'Recharts & Lucide Icons'],
    },
    {
      category: 'Dataset & Training',
      icon: Database,
      items: ['Chest X-Ray Radiographs', 'Weighted Cross-Entropy', 'ImageNet Normalization', 'Threshold Calibration (0.77)'],
    },
  ];

  return (
    <section id="about" className="py-16 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60">
            System Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
            About PneumoAI & Technology Stack
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-2">
            Engineered as a clean, modular computer vision system designed for student viva demonstrations and healthcare AI research.
          </p>
        </div>

        {/* Tech Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {techStack.map((tech) => {
            const Icon = tech.icon;
            return (
              <div
                key={tech.category}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-100/70 text-teal-700 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-3">
                  {tech.category}
                </h3>

                <ul className="space-y-2 text-xs text-slate-600">
                  {tech.items.map((item) => (
                    <li key={item} className="flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Project Context Box */}
        <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-teal-50/70 via-sky-50/70 to-slate-50 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-sm font-bold text-slate-900 flex items-center justify-center md:justify-start">
              <BookOpen className="w-4 h-4 mr-2 text-teal-600" />
              Academic Demonstration Note
            </h4>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              This system features an un-retrained, pre-trained checkpoint (<code className="font-mono text-teal-700">efficientnetv2_s_best.pth</code>) 
              evaluated with dynamic Grad-CAM request hooks and exact training normalization transforms for high academic reproducibility.
            </p>
          </div>

          <a
            href="http://127.0.0.1:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 shadow-sm transition-all whitespace-nowrap"
          >
            Open Swagger API Docs &rarr;
          </a>
        </div>

      </div>
    </section>
  );
}
