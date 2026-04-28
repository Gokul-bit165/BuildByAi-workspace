import ContactForm from '@/components/ui/ContactForm';
import { Mail, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="flex flex-col flex-grow p-8 max-w-6xl mx-auto w-full py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <h1 className="text-5xl font-extrabold mb-6">Let's Build Something.</h1>
          <p className="text-xl text-slate-400 mb-12">
            Whether you need a custom web application, an AI integration, or just want to chat about technology, we'd love to hear from you.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-blue-900/30 p-3 rounded-lg text-blue-400 mr-4">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Email Us</h3>
                <p className="text-slate-400">hello@buildbyai.example.com</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-purple-900/30 p-3 rounded-lg text-purple-400 mr-4">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Location</h3>
                <p className="text-slate-400">Remote &mdash; Global</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/50 p-8 md:p-10 rounded-2xl border border-slate-700">
          <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
