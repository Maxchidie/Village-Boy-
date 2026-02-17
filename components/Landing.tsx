import React from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const onGetStarted = () => {
    // Navigate immediately so UI never stalls
    navigate("/onboarding");

    // Kick off session init in background (non-blocking)
    api.initSession?.().catch((e: any) => {
      console.warn("initSession failed (non-blocking):", e);
    });
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="text-center space-y-6 pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-wider">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Live for Nigeria
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
          The Village Voice. <br/>
          <span className="text-green-600">Your preferences.</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
          Choose your preferred leaders at every level. Non-partisan. Private by default. Built for low data.
        </p>
        <div className="flex flex-col gap-3 pt-4">
          <button 
            onClick={onGetStarted} 
            className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-green-200 dark:shadow-green-900/20 active:scale-[0.98] transition-all"
          >
            Get Started
          </button>
          <button className="text-slate-500 dark:text-slate-400 font-medium py-2">Learn More</button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Privacy First</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Your personal choices are never shared. We only aggregate counts for community insights.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
          <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Low Data</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Optimized for Nigeria's mobile networks. Fast loading, minimal bandwidth usage.</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 px-2">Privacy Promise</h2>
        <div className="bg-slate-900 dark:bg-slate-800 text-slate-200 p-6 rounded-3xl space-y-3 shadow-xl transition-colors">
          <p className="text-sm opacity-90">We believe civic participation should be safe. Village Boy:</p>
          <ul className="text-xs space-y-2 opacity-80 list-disc list-inside">
            <li>Never asks for your Full Name.</li>
            <li>Stores data locally on your device where possible.</li>
            <li>Aggregates results only when sample size exceeds 25.</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Landing;
