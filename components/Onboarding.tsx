
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NIGERIAN_STATES, LGAS_BY_STATE } from '../constants';
import { api } from '../services/api';

const Onboarding: React.FC = () => {
  const [step, setStep] = useState(1);
  const [state, setState] = useState('');
  const [lga, setLga] = useState('');
  const [privacy, setPrivacy] = useState(true);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else {
      api.updateLocation({ state, lga, privacyDefault: privacy });
      navigate('/ballot');
    }
  };

  const lgas = state ? LGAS_BY_STATE[state] || [] : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-1.5 flex-1 mx-1 rounded-full transition-all ${s <= step ? 'bg-green-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Where are you voting?</h2>
          <p className="text-slate-500 dark:text-slate-400">Select your State to see relevant local candidates.</p>
          <div className="grid grid-cols-1 gap-2">
            {NIGERIAN_STATES.map((s) => (
              <button
                key={s}
                onClick={() => { setState(s); handleNext(); }}
                className={`text-left p-4 rounded-2xl border-2 transition-all ${state === s ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Select your LGA</h2>
          <p className="text-slate-500 dark:text-slate-400">Local Government Area in {state}.</p>
          {lgas.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {lgas.map((l) => (
                <button
                  key={l}
                  onClick={() => { setLga(l); handleNext(); }}
                  className={`text-left p-4 rounded-2xl border-2 transition-all ${lga === l ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-100 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <p className="text-slate-500 dark:text-slate-400">We're still adding LGAs for {state}. You can skip for now.</p>
              <button onClick={handleNext} className="mt-4 font-bold text-green-600">Skip to next</button>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Privacy Preference</h2>
          <p className="text-slate-500 dark:text-slate-400">Safety first. Your choices are private by default.</p>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">Private Preferences</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Only you can see your ballot</p>
              </div>
              <button 
                onClick={() => setPrivacy(!privacy)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${privacy ? 'bg-green-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${privacy ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">By continuing, you agree to our non-partisan community standards.</p>
          </div>
          <button 
            onClick={handleNext}
            className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-green-200 dark:shadow-green-900/20"
          >
            Enter Village
          </button>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
