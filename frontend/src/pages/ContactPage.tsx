import React, { useState } from 'react';
import { ChevronDown, Clock, Mail, MapPin, Phone, Send, CheckCircle2 } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';

const FAQS = [
  {
    id: 'shipping',
    q: 'How fast is shipping and how do I get free delivery?',
    a: 'Orders over $50 qualify automatically for Free Express Shipping. Within Phnom Penh, orders dispatch within 24 hours; provincial deliveries arrive within 2–3 business days.',
  },
  {
    id: 'returns',
    q: 'What is your Return & Exchange Policy?',
    a: 'Unopened collector figures, manga box sets, and unworn apparel can be returned or exchanged within 14 days of delivery. If a box arrives damaged in transit, we replace it free of charge.',
  },
  {
    id: 'authenticity',
    q: 'Are all anime figures officially licensed?',
    a: 'Yes. Every statue carries its official distributor hologram seal and comes factory-sealed in its original window collector carton.',
  },
  {
    id: 'club',
    q: 'How do Anime Club discounts work?',
    a: 'Simply register a free account on Anime Store to activate Anime Club perks. Your 10% member discount applies automatically in your shopping cart, or you can use code ANIME10.',
  },
];

export const ContactPage: React.FC = () => {
  const { settings, showToast } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Order Inquiry');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<string>('shipping');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitted(true);
    showToast('Message sent!', 'Our collector support team will reply within 24 hours.');
  };

  return (
    <div className="pb-10 space-y-10">
      <div className="rounded-2xl sm:rounded-3xl bg-[#F7E5CE] border border-[#EAD3B8] px-6 py-7 sm:px-8">
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#3D160F]">
          Contact & Customer Support
        </h1>
        <p className="mt-1.5 text-sm sm:text-base text-[#6B4235] max-w-2xl">
          Questions about figure pre-orders, manga restocks, or an existing shipment? Reach out anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] p-6 space-y-4">
            <h2 className="font-display text-xl font-bold text-[#3D160F]">Reach Us Directly</h2>
            <div className="space-y-3.5 text-sm text-[#5E3527]">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#D96532] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#3D160F]">Phone & Telegram</p>
                  <p>{settings.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#D96532] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#3D160F]">Email Support</p>
                  <p>{settings.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#D96532] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#3D160F]">Flagship Store</p>
                  <p>{settings.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#D96532] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#3D160F]">Opening Hours</p>
                  <p>Daily, 9:00 AM – 8:30 PM ICT</p>
                </div>
              </div>
            </div>
          </div>

          <div id="shipping" className="rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] p-6">
            <h3 className="font-display text-lg font-bold text-[#3D160F]">Shipping & Returns</h3>
            <p id="returns" className="mt-2 text-xs sm:text-sm text-[#6B4235] leading-relaxed">
              Free delivery on all orders over <strong>${settings.freeShippingThreshold}</strong>. Standard shipping is <strong>${settings.standardShippingFee.toFixed(2)}</strong>. Unopened items enjoy hassle-free 14-day returns.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] p-6 sm:p-8">
          {submitted ? (
            <div className="py-10 text-center">
              <div className="w-14 h-14 rounded-full bg-[#2E7D32]/12 text-[#2E7D32] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="mt-4 font-display text-2xl font-bold text-[#3D160F]">
                Message Received!
              </h2>
              <p className="mt-2 text-sm text-[#6B4235] max-w-md mx-auto">
                Thank you, {name}. Our support crew will reply to <strong>{email}</strong> shortly.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setMessage('');
                }}
                className="mt-6 px-5 py-2.5 rounded-full bg-[#D96532] text-white text-sm font-semibold cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-display text-2xl font-bold text-[#3D160F]">Send Us a Message</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5A3224] mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A3224] mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A3224] mb-1.5">Topic</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
                >
                  <option>Order Inquiry</option>
                  <option>Figure Pre-Order Request</option>
                  <option>Manga Restock Question</option>
                  <option>Returns & Exchanges</option>
                  <option>Wholesale / Club Partnership</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A3224] mb-1.5">
                  Message *
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us how we can help..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D96532] hover:bg-[#BF5223] text-white text-sm font-semibold shadow-sm cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* FAQ Accordion */}
      <section id="faq" className="rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] p-6 sm:p-8">
        <h2 className="font-display text-2xl font-bold text-[#3D160F] mb-5">
          Frequently Asked Questions
        </h2>
        <div className="divide-y divide-[#F0E2D3]">
          {FAQS.map((item) => {
            const isOpen = openFaq === item.id;
            return (
              <div key={item.id} className="py-3.5">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? '' : item.id)}
                  className="w-full flex items-center justify-between gap-4 text-left font-semibold text-sm sm:text-base text-[#3D160F] hover:text-[#D96532] cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-[#D96532]' : 'text-[#8E6453]'
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="mt-2.5 text-sm text-[#6B4235] leading-relaxed pr-6">{item.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
