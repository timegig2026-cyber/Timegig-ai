import React, { useState } from 'react';
import { Zap, Building2, User, CheckCircle2 } from 'lucide-react';
import { PaymentView } from './PaymentView';

export const ActivationView: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<'tenant' | 'subscription' | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  if (showPayment && selectedOption) {
    return (
      <PaymentView 
        plan={selectedOption} 
        onBack={() => setShowPayment(false)} 
        onSubmitProof={(file) => {
          console.log('Proof uploaded:', file);
          alert('Proof of payment submitted for verification!');
          setShowPayment(false);
          setSelectedOption(null);
        }}
      />
    );
  }

  return (
    <div className="h-full w-full bg-slate-50 p-6 overflow-y-auto">
      <h2 className="text-xl font-black mb-8 flex items-center justify-center gap-2 text-slate-900">
        <Zap className="w-6 h-6 text-amber-500" />
        Activation Center
      </h2>
      <div className="grid gap-6 max-w-lg mx-auto">
        <button
          onClick={() => setSelectedOption('tenant')}
          className={`relative p-6 rounded-3xl border-b-8 transition-all duration-200 flex items-start gap-4 ${
            selectedOption === 'tenant' 
              ? 'border-emerald-700 bg-white shadow-2xl translate-y-1' 
              : 'border-slate-300 bg-white shadow-[0_10px_0_0_#cbd5e1] hover:shadow-[0_15px_0_0_#cbd5e1] hover:-translate-y-1'
          }`}
        >
          <div className={`p-3 rounded-2xl ${selectedOption === 'tenant' ? 'bg-emerald-100' : 'bg-slate-100'}`}>
            <Building2 className={`w-8 h-8 ${selectedOption === 'tenant' ? 'text-emerald-600' : 'text-slate-500'}`} />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-black text-lg text-slate-900">Become a Tenant</h3>
            <p className="text-sm text-slate-600 mt-1">Earn monthly passive income through user subscription fees.</p>
            <p className="text-sm font-bold text-emerald-700 mt-2">R299,99 / month</p>
          </div>
          {selectedOption === 'tenant' && <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />}
        </button>

        <button
          onClick={() => setSelectedOption('subscription')}
          className={`relative p-6 rounded-3xl border-b-8 transition-all duration-200 flex items-start gap-4 ${
            selectedOption === 'subscription' 
              ? 'border-emerald-700 bg-white shadow-2xl translate-y-1' 
              : 'border-slate-300 bg-white shadow-[0_10px_0_0_#cbd5e1] hover:shadow-[0_15px_0_0_#cbd5e1] hover:-translate-y-1'
          }`}
        >
          <div className={`p-3 rounded-2xl ${selectedOption === 'subscription' ? 'bg-emerald-100' : 'bg-slate-100'}`}>
            <User className={`w-8 h-8 ${selectedOption === 'subscription' ? 'text-emerald-600' : 'text-slate-500'}`} />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-black text-lg text-slate-900">User Subscription</h3>
            <p className="text-sm text-slate-600 mt-1">Keep your account active and enjoy premium features.</p>
            <p className="text-sm font-bold text-emerald-700 mt-2">R29,99 / month</p>
          </div>
          {selectedOption === 'subscription' && <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />}
        </button>

        {selectedOption && (
            <button 
                onClick={() => setShowPayment(true)}
                className="mt-4 w-full py-4 rounded-2xl bg-slate-900 text-white font-black text-lg hover:bg-black transition-all shadow-xl active:shadow-inner active:translate-y-0.5"
            >
                Activate {selectedOption === 'tenant' ? 'Tenant Plan' : 'User Plan'}
            </button>
        )}
      </div>
    </div>
  );
};
