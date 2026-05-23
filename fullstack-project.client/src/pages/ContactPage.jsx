import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock, MessageCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const faqs = [
  { q: 'How do I book a service?', a: 'Browse services, click on one you need, and click "Book Now". Select a time slot and confirm your booking.' },
  { q: 'Are workers background checked?', a: 'Yes! Every worker goes through a thorough background check and skill verification before joining.' },
  { q: 'What is your cancellation policy?', a: 'You can cancel for free up to 24 hours before the scheduled service. Late cancellations may incur a small fee.' },
  { q: 'How do I pay?', a: 'We accept all major credit/debit cards through our secure Stripe payment system. Cash on delivery also available.' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    setSent(true);
    setSending(false);
    toast.success('Message sent! We\'ll reply within 24 hours.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <MessageCircle className="w-14 h-14 mx-auto mb-4 opacity-90" />
          <h1 className="text-4xl font-bold mb-3">Get In Touch</h1>
          <p className="text-indigo-100 text-lg">We're here to help. Reach out anytime!</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-5">
            {[
              { icon: Mail, label: 'Email Us', value: 'support@dailyneeds.com', sub: 'Reply within 24 hours', color: 'bg-blue-100 text-blue-600' },
              { icon: Phone, label: 'Call Us', value: '+1 (800) 555-0123', sub: 'Mon-Fri, 9am - 6pm EST', color: 'bg-green-100 text-green-600' },
              { icon: MapPin, label: 'Visit Us', value: '123 Main Street, San Francisco, CA 94102', sub: 'Mon-Fri, 9am - 5pm', color: 'bg-purple-100 text-purple-600' },
              { icon: Clock, label: 'Working Hours', value: '24/7 Online Support', sub: 'Always available for you', color: 'bg-orange-100 text-orange-600' },
            ].map(info => (
              <div key={info.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
                <div className={`${info.color} w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <info.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800 text-sm">{info.label}</div>
                  <div className="text-gray-700 text-sm mt-0.5">{info.value}</div>
                  <div className="text-gray-400 text-xs mt-0.5">{info.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {sent ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Message Sent!</h2>
                <p className="text-gray-500">We'll get back to you within 24 hours.</p>
                <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                  className="btn-primary mt-6">Send Another</button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name</label>
                      <input className="input-field" value={form.name} required onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                      <input type="email" className="input-field" value={form.email} required onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                    <input className="input-field" value={form.subject} required onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="How can we help?" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                    <textarea className="input-field" rows={6} value={form.message} required onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Tell us more..." />
                  </div>
                  <button type="submit" disabled={sending} className="btn-primary w-full py-3.5 text-base">
                    <Send className="w-4 h-4" /> {sending ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {faqs.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-start gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i+1}</span>
                  {f.q}
                </h3>
                <p className="text-gray-500 text-sm pl-8">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
