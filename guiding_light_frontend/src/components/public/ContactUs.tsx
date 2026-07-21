import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactUs() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('http://localhost/GuidingLight_Project/guiding_light_backend/send_message.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setIsSuccess(true);
        e.currentTarget.reset();
      } else {
        setError(result.error || 'An unknown error occurred.');
      }
    } catch (err) {
      setError('Failed to connect to the server. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-[#3a4740] pt-40 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-serif italic text-[#d4c5b3] mb-4 tracking-tight">Contact Us</h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">We're here to help. Reach out to us for any inquiries or support.</p>
          </motion.div>
        </div>
      </div>

      <section className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div>
                <h2 className="text-3xl font-serif italic text-stone-800 mb-6">Get in Touch</h2>
                <p className="text-stone-600 leading-relaxed mb-8">
                  Whether you're looking for help, want to volunteer, or have questions about our transparency tracker, 
                  our team is ready to listen.
                </p>
              </div>

              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mr-6 shrink-0 text-[#4b5e52]">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Message Us</p>
                    <p className="text-lg font-bold text-stone-800">+63 917 123 4567</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mr-6 shrink-0 text-[#4b5e52]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Email Us</p>
                    <p className="text-lg font-bold text-stone-800">support@streetlight.org</p>
                  </div>
                </div>

                <a href="https://maps.app.goo.gl/dxjgKe2dajQUqayo8" target="_blank" rel="noopener noreferrer" className="flex items-start group">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mr-6 shrink-0 text-[#4b5e52]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Visit Us</p>
                    <p className="text-lg font-bold text-stone-800 group-hover:text-[#4b5e52] transition-colors">
                      208 Tiano Brothers St. Cagayan De Oro City, Northern Mindanao, Philippines
                    </p>
                  </div>
                </a>

                <div className="pt-8">
                  <a 
                    href="https://www.facebook.com/share/16QTUtyzEC/?mibextid=wwXIfr" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center px-8 py-4 bg-[#1877F2] text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg"
                  >
                    <svg className="w-5 h-5 mr-3 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Chat with us via Facebook
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 md:p-12 rounded-[48px] shadow-sm border border-stone-100"
            >
              {isSuccess ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Send className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-serif italic text-stone-800 mb-4">Message Sent!</h3>
                  <p className="text-stone-600 mb-8">Thank you for reaching out. We will get back to you as soon as possible.</p>
                  <button 
                    onClick={() => setIsSuccess(false)}
                    className="text-[#4b5e52] font-bold text-xs uppercase tracking-widest underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Full Name</label>
                      <input 
                        type="text" 
                        id="name"
                        name="name"
                        required
                        className="w-full px-6 py-4 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-[#d4c5b3]" 
                        placeholder="Juan Dela Cruz"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Email Address</label>
                      <input 
                        type="email" 
                        id="email"
                        name="email"
                        required
                        className="w-full px-6 py-4 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-[#d4c5b3]" 
                        placeholder="juan@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Subject</label>
                    <input 
                      type="text" 
                      id="subject"
                      name="subject"
                      required
                      className="w-full px-6 py-4 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-[#d4c5b3]" 
                      placeholder="How can we help?"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Message</label>
                    <textarea 
                      id="message"
                      name="message"
                      required
                      rows={5}
                      className="w-full px-6 py-4 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-[#d4c5b3] resize-none" 
                      placeholder="Tell us more about your inquiry..."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#4b5e52] text-white py-6 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#3a4740] transition-all flex items-center justify-center shadow-xl disabled:opacity-50"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                  {error && (
                    <div className="text-center text-red-500 text-sm font-bold">
                      {error}
                    </div>
                  )}
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
