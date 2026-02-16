
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const Standards: React.FC = () => {
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  const handleProceed = () => {
    if (agreed) {
      api.acceptStandards();
      navigate('/onboarding');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-sm mx-auto">
      <header className="text-center pt-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">Community Standards</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Before we start, let's agree on how we interact.</p>
      </header>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <div className="flex gap-3">
            <span className="shrink-0 text-green-600">✓</span>
            <p><span className="font-bold">Non-partisan:</span> Village Boy does not favor any party. We are here for civic expression only.</p>
          </div>
          <div className="flex gap-3">
            <span className="shrink-0 text-green-600">✓</span>
            <p><span className="font-bold">No Hate Speech:</span> We respect all tribes, religions, and backgrounds.</p>
          </div>
          <div className="flex gap-3">
            <span className="shrink-0 text-green-600">✓</span>
            <p><span className="font-bold">No Coercion:</span> Your choices are yours alone. No bullying allowed.</p>
          </div>
          <div className="flex gap-3">
            <span className="shrink-0 text-green-600">✓</span>
            <p><span className="font-bold">Privacy:</span> Do not attempt to doxx or reveal others' identities.</p>
          </div>
        </div>

        <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl cursor-pointer transition-colors">
          <input 
            type="checkbox" 
            checked={agreed} 
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-5 h-5 accent-green-600 rounded"
          />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">I agree to the Community Standards</span>
        </label>
      </div>

      <button
        disabled={!agreed}
        onClick={handleProceed}
        className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${agreed ? 'bg-green-600 text-white shadow-lg shadow-green-200 dark:shadow-green-900/20 active:scale-95' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}
      >
        Continue to Onboarding
      </button>
    </div>
  );
};

export default Standards;
