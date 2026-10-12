import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, ArrowLeft } from 'lucide-react';

interface PaymentViewProps {
  plan: 'tenant' | 'subscription';
  onBack: () => void;
  onSubmitProof: (file: File) => void;
}

export const PaymentView: React.FC<PaymentViewProps> = ({ plan, onBack, onSubmitProof }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const bankDetails = {
    bank: 'Capitec',
    name: 'Matthews',
    accountNumber: '1334067366',
    reference: plan === 'tenant' ? 'Ten29' : 'Sub29'
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="h-full w-full bg-slate-50 p-6 overflow-y-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 font-bold text-sm mb-6 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Back to Selection
      </button>

      <h2 className="text-xl font-black mb-6 text-slate-900">Make Payment</h2>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-6">
        <h3 className="font-bold text-slate-800 mb-4">Banking Details</h3>
        <div className="space-y-2 text-sm">
          <p><span className="font-bold">Bank:</span> {bankDetails.bank}</p>
          <p><span className="font-bold">Account Name:</span> {bankDetails.name}</p>
          <p><span className="font-bold">Account Number:</span> {bankDetails.accountNumber}</p>
          <p className="text-emerald-700"><span className="font-bold text-slate-800">Reference:</span> {bankDetails.reference}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4">Upload Proof of Payment</h3>
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-2xl cursor-pointer hover:bg-slate-50">
          <Upload className="w-8 h-8 text-slate-400 mb-2" />
          <span className="text-xs text-slate-500 font-bold">{selectedFile ? selectedFile.name : 'Click to upload proof'}</span>
          <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />
        </label>
        
        {selectedFile && (
          <button 
            onClick={() => onSubmitProof(selectedFile)}
            className="mt-6 w-full py-4 rounded-2xl bg-emerald-600 text-white font-black hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" /> Submit for Verification
          </button>
        )}
      </div>
    </div>
  );
};
