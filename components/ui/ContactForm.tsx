'use client';

import { useState } from 'react';
import { submitContactForm } from '@/app/actions/contact';

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(formData: FormData) {
    setStatus('submitting');
    setErrorMessage('');
    
    const result = await submitContactForm(formData);
    
    if (result.error) {
      setStatus('error');
      setErrorMessage(result.error);
    } else {
      setStatus('success');
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-emerald-900/20 border border-emerald-800 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className="text-2xl font-bold text-emerald-400 mb-2">Message Sent!</h3>
        <p className="text-slate-300">Thank you for reaching out. We will get back to you shortly.</p>
        <button 
          onClick={() => setStatus('idle')}
          className="mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-md transition-colors"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      {status === 'error' && (
        <div className="p-4 bg-red-900/20 border border-red-800 text-red-400 rounded-md">
          {errorMessage}
        </div>
      )}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">Name</label>
        <input 
          type="text" 
          id="name" 
          name="name" 
          required 
          className="w-full bg-slate-900 border border-slate-700 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Jane Doe"
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          required 
          className="w-full bg-slate-900 border border-slate-700 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="jane@example.com"
        />
      </div>
      
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">Message</label>
        <textarea 
          id="message" 
          name="message" 
          required 
          rows={5}
          className="w-full bg-slate-900 border border-slate-700 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          placeholder="Tell us about your project..."
        ></textarea>
      </div>
      
      <button 
        type="submit" 
        disabled={status === 'submitting'}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-md transition-colors"
      >
        {status === 'submitting' ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
