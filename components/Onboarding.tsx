import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NIGERIAN_STATES, LGAS_BY_STATE } from '../constants';
import { api } from '../services/api';

const Onboarding: React.FC = () => {
  const [step, setStep] = useState(1);
  const [state, setState] = useState('');
  const [lga, setLga] = useState('');
  const [privacy, setPrivacy] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else {
      api.updateLocation({ state, lga, privacyDefault: privacy });
      navigate('/ballot');
    }
  };

  const detectLocation = () => {
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Simplified mapping for demo - in a real app use a reverse geocoding API
        // For now, we'll just simulate a successful detection in Lagos
        setTimeout(() => {
          setState('Lagos');
          setIsDetecting(false);
          if (step === 1) handleNext();
        }, 1200);
      },
      (err) => {
        setIsDetecting(false);
        alert("Could not detect location. Please select manually.");
      }
    );
  };

  const lgas = state ? LGAS_BY_STATE[state] || [] : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4 px-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-1.5 flex-1 mx-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-green-600 shadow-[0_0_8px_rgba(22,163,74,0.4)]' : 'bg-slate-200 dark:bg-slate-800'}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <header className="space-y-2 px-2">
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100">Where do you vote?</h2>
            <p className="text-slate-500 dark:text-slate-400">Select your State to see relevant local candidates.</p>
          </header>

          <button 
            onClick={detectLocation}
            disabled={isDetecting}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-green-600 ${isDetecting ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {isDetecting ? 'Detecting...' : 'Detect My Location'}
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-50 dark:bg-slate-950 px-2 text-slate-400 font-bold">Or select manually</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {NIGERIAN_STATES.map((s) => (
              <button
                key={s}
                onClick={() => { setState(s); handleNext(); }}
                className={`text-left p-4 rounded-2xl border-2 transition-all active:scale-[0.97] ${state === s ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-bold' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <header className="space-y-2 px-2">
            <div className="flex items-center gap-2">
              <button onClick={() => setStep(1)} className="p-2 -ml-2 text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100">Select LGA</h2>
            </div>
            <p className="text-slate-500 dark:text-slate-400">Local Government Area in <span className="text-green-600 font-bold">{state}</span>.</p>
          </header>

          {lgas.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {lgas.map((l) => (
                <button
                  key={l}
                  onClick={() => { setLga(l); handleNext(); }}
                  className={`text-left p-5 rounded-[1.5rem] border-2 transition-all active:scale-[0.98] flex justify-between items-center ${lga === l ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-bold' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'}`}
                >
                  {l}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">We're still adding LGAs for {state}. You can skip for now.</p>
              <button onClick={handleNext} className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-4 rounded-2xl font-bold">Skip for Now</button>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <header className="space-y-2 px-2">
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100">Almost there!</h2>
            <p className="text-slate-500 dark:text-slate-400">Safety first. Your choices are private by default.</p>
          </header>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-black text-lg text-slate-900 dark:text-slate-100 tracking-tight">Private Mode</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Only you can see your specific choices.</p>
              </div>
              <button 
                onClick={() => setPrivacy(!privacy)}
                className={`w-14 h-8 rounded-full p-1 transition-colors relative ${privacy ? 'bg-green-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${privacy ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                <span className="font-bold text-slate-700 dark:text-slate-200">Village Boy Guarantee:</span> We never store your name, email, or phone number. We only track "who" you prefer anonymously to help the community pulse.
              </p>
            </div>

            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">By continuing, you agree to our non-partisan community standards.</p>
          </div>

          <button 
            onClick={handleNext}
            className="w-full bg-green-600 text-white py-5 rounded-[1.5rem] font-black text-xl shadow-lg shadow-green-200 dark:shadow-green-900/20 active:scale-95 transition-all"
          >
            Enter Village
          </button>
        </div>
      )}
    </div>
  );
};

export default Onboarding;