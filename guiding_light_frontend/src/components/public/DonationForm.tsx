/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { ServiceCategory } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

import {
  CreditCard,
  Landmark,
  CheckCircle2
} from 'lucide-react';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

import { useTheme } from '../../context/ThemeContext';


const CATEGORIES: ServiceCategory[] = [
  'Trauma Counseling',
  'Educational Support',
  'Emergency Relief',
  'Community Outreach',
  'Legal Assistance'
];

const METHODS = [
  {
    id: 'PayMongo',
    label: 'E-Wallet / Card',
    icon: CreditCard
  },
  {
    id: 'Manual Bank Transfer',
    label: 'Manual Bank',
    icon: Landmark
  }
];

const ALLOCATION_DATA = [
  {
    name: 'Trauma Counseling',
    value: 30,
    color: '#f2ede4'
  },
  {
    name: 'Educational Support',
    value: 25,
    color: '#4b5e52'
  },
  {
    name: 'Emergency Relief',
    value: 20,
    color: '#d4c5b3'
  },
  {
    name: 'Community Outreach',
    value: 15,
    color: '#8c9a8e'
  },
  {
    name: 'Legal Assistance',
    value: 10,
    color: '#c4b5a3'
  }
];


export default function DonationForm() {

  const { isDarkMode } = useTheme();

  const [amount, setAmount] =
    React.useState<string>('');

  const [donorName, setDonorName] = React.useState('');
  const [donorEmail, setDonorEmail] = React.useState('');

  const [method, setMethod] =
    React.useState<string>('PayMongo');

  const [isSubmitting, setIsSubmitting] =
    React.useState(false);

  const [isSuccess, setIsSuccess] =
    React.useState(false);

  const [isVerifying, setIsVerifying] =
    React.useState(false);

  const [error, setError] =
    React.useState<string | null>(null);


  const verifyPayment = async (
    sessionId: string
  ) => {

    setIsVerifying(true);

    try {

      const response = await fetch(
        '/guiding_light_backend/verify_donation.php',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            session_id: sessionId
          })
        }
      );

      const result =
        await response.json();

      if (result.success) {

        sessionStorage.removeItem('paymongo_session_id');
        window.history.replaceState({}, document.title, window.location.pathname);
        setIsSuccess(true);

      } else {

        setError(
          result.error ||
          'Failed to verify payment with PayMongo.'
        );

      }

    } catch (error) {

      console.error(
        'Payment verification failed:',
        error
      );

      setError(
        'Connection error while verifying payment.'
      );

    } finally {

      setIsVerifying(false);

    }

  };


  useEffect(() => {

    const params =
      new URLSearchParams(
        window.location.search
      );

    const paymentStatus =
      params.get('payment');

    const sessionId =
      sessionStorage.getItem(
        'paymongo_session_id'
      );


    if (
      paymentStatus === 'success' &&
      sessionId
    ) {

      verifyPayment(sessionId);

      // Retain the checkout reference and return URL until verification succeeds.
      // A failed server verification can now be retried by reloading the page.

    } else if (
      paymentStatus === 'cancelled'
    ) {

      setError(
        'Payment was cancelled.'
      );

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );

    }

  }, []);


  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    if (
      !amount ||
      parseFloat(amount) <= 0
    ) {
      return;
    }

    if (donorName.trim().length < 2 || donorName.trim().length > 100 ||
        donorEmail.trim().length > 100 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail.trim())) {
      setError('Enter your full name and a valid email before checkout.');
      return;
    }

    setIsSubmitting(true);
    setError(null);


    const donationData = {
      amount: parseFloat(amount),
      payment_method: method,
      donor_name: donorName.trim(),
      donor_email: donorEmail.trim()
    };


    try {

      const response = await fetch(
        '/guiding_light_backend/process_donation.php',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json'
          },
          body:
            JSON.stringify(
              donationData
            )
        }
      );

      const result =
        await response.json();


      if (
        result.success &&
        result.checkout_url
      ) {

        sessionStorage.setItem(
          'paymongo_session_id',
          result.session_id
        );

        window.location.href =
          result.checkout_url;

      } else {

        setError(
          result.error ||
          'Failed to create payment link.'
        );

        setIsSubmitting(false);

      }

    } catch (error) {

      console.error(
        'Donation request failed:',
        error
      );

      setError(
        'Failed to connect to the server. Please try again later.'
      );

      setIsSubmitting(false);

    }

  };


  if (isVerifying) {

    return (
      <div
        className={`min-h-[60vh] py-32 text-center transition-colors ${
          isDarkMode
            ? 'bg-[#242c28]'
            : 'bg-[#f7f5f2]'
        }`}
      >

        <div
          className={`w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-6 ${
            isDarkMode
              ? 'border-white/10 border-t-[#d4c5b3]'
              : 'border-stone-200 border-t-[#4b5e52]'
          }`}
        />

        <h2
          className={`text-2xl font-serif italic ${
            isDarkMode
              ? 'text-[#f7f5f2]'
              : 'text-stone-800'
          }`}
        >
          Verifying your donation...
        </h2>

        <p
          className={
            isDarkMode
              ? 'text-stone-400'
              : 'text-stone-500'
          }
        >
          Please wait, checking PayMongo records.
        </p>

      </div>
    );

  }


  if (isSuccess) {

    return (
      <div
        className={`py-20 px-4 transition-colors ${
          isDarkMode
            ? 'bg-[#242c28]'
            : 'bg-[#f7f5f2]'
        }`}
      >

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95
          }}
          animate={{
            opacity: 1,
            scale: 1
          }}
          className={`p-10 sm:p-16 rounded-[48px] shadow-sm border text-center max-w-2xl mx-auto ${
            isDarkMode
              ? 'bg-[#303a35] border-white/10'
              : 'bg-white border-stone-100'
          }`}
        >

          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 ${
              isDarkMode
                ? 'bg-white/10 text-[#d4c5b3]'
                : 'bg-stone-100 text-[#3a4740]'
            }`}
          >
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <h2
            className={`text-4xl font-serif italic mb-6 ${
              isDarkMode
                ? 'text-[#f7f5f2]'
                : 'text-stone-800'
            }`}
          >
            Salamat kaayo!
          </h2>

          <p
            className={`mb-10 leading-relaxed ${
              isDarkMode
                ? 'text-stone-300'
                : 'text-stone-600'
            }`}
          >
            Your donation has been verified and safely received.
            Thank you for your generous support in helping us empower the unheard!
          </p>

          <button
            onClick={() => {
              setIsSuccess(false);
              setAmount('');
              setDonorName('');
              setDonorEmail('');
              setError(null);
            }}
            className="bg-[#4b5e52] text-white px-12 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#3a4740] transition-all shadow-lg"
          >
            Make Another Donation
          </button>

        </motion.div>

      </div>
    );

  }


  return (
    <section
      className={`py-24 overflow-hidden transition-colors duration-300 ${
        isDarkMode
          ? 'bg-[#242c28]'
          : 'bg-[#f7f5f2]'
      }`}
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">

          <div
            className={`inline-block px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 ${
              isDarkMode
                ? 'bg-white/10 text-[#d4c5b3]'
                : 'bg-stone-200 text-stone-600'
            }`}
          >
            Your Impact
          </div>

          <h2
            className={`text-5xl font-serif italic mb-4 ${
              isDarkMode
                ? 'text-[#f7f5f2]'
                : 'text-stone-800'
            }`}
          >
            Support Our Cause
          </h2>

          <p
            className={`text-lg max-w-2xl mx-auto ${
              isDarkMode
                ? 'text-stone-300'
                : 'text-stone-600'
            }`}
          >
            See how your contributions are distributed and make a direct impact today.
          </p>

        </div>


        {/* TRANSPARENCY CHART */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          whileInView={{
            opacity: 1,
            y: 0
          }}
          viewport={{
            once: true
          }}
          className="bg-[#3a4740] rounded-[48px] p-8 md:p-12 mb-12 shadow-xl border border-white/10 relative overflow-hidden"
        >

          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl -mr-32 -mt-32 rounded-full" />


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

            <div>

              <h3 className="text-3xl font-serif italic text-[#d4c5b3] mb-6">
                Fund Allocation Transparency
              </h3>

              <p className="text-stone-300 mb-8 leading-relaxed">
                We believe in radical transparency. Every peso you donate is carefully allocated to ensure the highest impact for our survivors. This chart shows our planned distribution for the current fiscal year.
              </p>

              <div className="space-y-4">

                {ALLOCATION_DATA.map(
                  item => (

                    <div
                      key={item.name}
                      className="flex items-center justify-between gap-4"
                    >

                      <div className="flex items-center">

                        <div
                          className="w-3 h-3 rounded-full mr-3 shrink-0"
                          style={{
                            backgroundColor:
                              item.color
                          }}
                        />

                        <span className="text-xs font-bold text-white uppercase tracking-widest">
                          {item.name}
                        </span>

                      </div>

                      <span className="text-xs font-bold text-[#d4c5b3]">
                        {item.value}%
                      </span>

                    </div>

                  )
                )}

              </div>

            </div>


            <div className="h-[300px] md:h-[400px]">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={ALLOCATION_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >

                    {ALLOCATION_DATA.map(
                      (entry, index) => (

                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="none"
                        />

                      )
                    )}

                  </Pie>

                  <Tooltip
                    contentStyle={{
                      backgroundColor:
                        '#3a4740',
                      border:
                        '1px solid rgba(255,255,255,0.1)',
                      borderRadius:
                        '16px',
                      color: '#fff'
                    }}
                    itemStyle={{
                      color:
                        '#d4c5b3'
                    }}
                  />

                </PieChart>

              </ResponsiveContainer>

            </div>

          </div>

        </motion.div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* LEFT INFORMATION */}
          <div className="lg:sticky lg:top-32">

            <h3
              className={`text-3xl font-serif italic mb-8 leading-tight ${
                isDarkMode
                  ? 'text-[#f7f5f2]'
                  : 'text-stone-800'
              }`}
            >
              Your Light Helps Others Find Their Way
            </h3>

            <p
              className={`text-lg mb-10 leading-relaxed font-medium ${
                isDarkMode
                  ? 'text-stone-300'
                  : 'text-stone-600'
              }`}
            >
              Every peso donated to Streetlight goes directly into trauma counseling, education, and community support for those who need it most.
            </p>


            <div
              className={`p-8 rounded-[32px] border shadow-sm ${
                isDarkMode
                  ? 'bg-[#303a35] border-white/10'
                  : 'bg-white border-stone-100'
              }`}
            >

              <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-6">
                How we use your funds
              </h4>

              <ul className="space-y-4">

                {CATEGORIES.map(
                  category => (

                    <li
                      key={category}
                      className={`flex items-center font-bold text-[11px] uppercase tracking-widest ${
                        isDarkMode
                          ? 'text-stone-300'
                          : 'text-stone-700'
                      }`}
                    >

                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center mr-4 shrink-0 ${
                          isDarkMode
                            ? 'bg-white/10 text-[#d4c5b3]'
                            : 'bg-stone-50 text-[#4b5e52]'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>

                      {category}

                    </li>

                  )
                )}

              </ul>

            </div>

          </div>


          {/* DONATION FORM */}
          <motion.div
            initial={{
              opacity: 0,
              x: 30
            }}
            whileInView={{
              opacity: 1,
              x: 0
            }}
            viewport={{
              once: true
            }}
            className={`p-8 sm:p-12 rounded-[48px] shadow-sm border ${
              isDarkMode
                ? 'bg-[#303a35] border-white/10'
                : 'bg-white border-stone-100'
            }`}
          >

            <form
              onSubmit={handleSubmit}
              className="space-y-10"
            >

              <AnimatePresence>

                {method !==
                  'Manual Bank Transfer' && (

                  <motion.div
                    initial={{
                      opacity: 0,
                      height: 0
                    }}
                    animate={{
                      opacity: 1,
                      height: 'auto'
                    }}
                    exit={{
                      opacity: 0,
                      height: 0
                    }}
                  >

                    <div className="space-y-5 mb-8">
                      <div>
                        <label htmlFor="donation-donor-name" className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Full name (required for checkout)</label>
                        <input id="donation-donor-name" type="text" autoComplete="name"
                          required minLength={2} maxLength={100}
                          value={donorName} onChange={e => setDonorName(e.target.value)}
                          placeholder="Your full name"
                          className="w-full px-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl text-stone-800" />
                      </div>
                      <div>
                        <label htmlFor="donation-donor-email" className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Email address (required for checkout)</label>
                        <input id="donation-donor-email" type="email" autoComplete="email"
                          required maxLength={100}
                          value={donorEmail} onChange={e => setDonorEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full px-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl text-stone-800" />
                      </div>
                      <p className="text-xs text-stone-500">Your billing details are sent to PayMongo for payment processing. Our donation database encrypts these details before storage.</p>
                    </div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">
                      Amount (PHP)
                    </label>

                    <div className="relative">

                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400 font-serif italic text-2xl">
                        ₱
                      </span>

                      <input
                        type="number"
                        value={amount}
                        onChange={e =>
                          setAmount(
                            e.target.value
                          )
                        }
                        placeholder="0.00"
                        required={
                          method !==
                          'Manual Bank Transfer'
                        }
                        className={`w-full pl-14 pr-6 py-6 border rounded-[24px] focus:outline-none focus:ring-2 focus:ring-[#d4c5b3] font-mono text-2xl transition-colors ${
                          isDarkMode
                            ? 'bg-white/5 border-white/10 text-white placeholder:text-stone-600'
                            : 'bg-stone-50 border-transparent text-stone-800'
                        }`}
                      />

                    </div>

                  </motion.div>

                )}

              </AnimatePresence>


              {/* PAYMENT METHOD */}
              <div>

                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">
                  Payment Method
                </label>

                <div
                  className={`grid grid-cols-2 gap-3 p-2 rounded-[24px] ${
                    isDarkMode
                      ? 'bg-white/5'
                      : 'bg-stone-50'
                  }`}
                >

                  {METHODS.map(
                    paymentMethod => (

                      <button
                        key={
                          paymentMethod.id
                        }
                        type="button"
                        onClick={() =>
                          setMethod(
                            paymentMethod.id
                          )
                        }
                        className={`py-4 px-2 rounded-[18px] flex flex-col items-center justify-center transition-all gap-2 ${
                          method ===
                          paymentMethod.id
                            ? (
                                isDarkMode
                                  ? 'bg-[#3a4740] shadow-md text-[#d4c5b3]'
                                  : 'bg-white shadow-md text-[#3a4740]'
                              )
                            : (
                                isDarkMode
                                  ? 'text-stone-500 hover:text-stone-300'
                                  : 'text-stone-400 hover:text-stone-600'
                              )
                        }`}
                      >

                        <paymentMethod.icon className="w-5 h-5" />

                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {
                            paymentMethod.label
                          }
                        </span>

                      </button>

                    )
                  )}

                </div>

              </div>


              {/* BANK TRANSFER */}
              <AnimatePresence>

                {method ===
                  'Manual Bank Transfer' && (

                  <motion.div
                    initial={{
                      opacity: 0,
                      height: 0
                    }}
                    animate={{
                      opacity: 1,
                      height: 'auto'
                    }}
                    exit={{
                      opacity: 0,
                      height: 0
                    }}
                    className="overflow-hidden"
                  >

                    <div
                      className={`p-6 rounded-[24px] border mt-4 space-y-4 ${
                        isDarkMode
                          ? 'bg-white/5 border-white/10'
                          : 'bg-stone-50 border-stone-200'
                      }`}
                    >

                      <p
                        className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${
                          isDarkMode
                            ? 'text-[#d4c5b3]'
                            : 'text-[#4b5e52]'
                        }`}
                      >
                        Bank Transfer Details
                      </p>


                      <div className="space-y-3">

                        {[
                          {
                            label:
                              'Bank Name',
                            value:
                              'Bank of the Philippine Islands (BPI)'
                          },
                          {
                            label:
                              'Account Name',
                            value:
                              'Streetlight: Suga sa Dalan Org Inc.'
                          },
                          {
                            label:
                              'Account Number',
                            value:
                              '1234 5678 90'
                          }
                        ].map(item => (

                          <div
                            key={item.label}
                            className={`p-3 rounded-xl border ${
                              isDarkMode
                                ? 'bg-[#242c28] border-white/10'
                                : 'bg-white border-stone-100'
                            }`}
                          >

                            <p className="text-[9px] text-stone-400 uppercase tracking-tighter">
                              {item.label}
                            </p>

                            <p
                              className={`text-sm font-bold ${
                                item.label ===
                                'Account Number'
                                  ? 'font-mono'
                                  : ''
                              } ${
                                isDarkMode
                                  ? 'text-stone-200'
                                  : 'text-stone-800'
                              }`}
                            >
                              {item.value}
                            </p>

                          </div>

                        ))}

                      </div>


                      <p className="text-[9px] text-stone-400 italic">
                        Please send a screenshot of your transaction to finance@streetlight.org for verification.
                      </p>

                    </div>

                  </motion.div>

                )}

              </AnimatePresence>


              <AnimatePresence>

                {method !==
                  'Manual Bank Transfer' && (

                  <motion.div
                    initial={{
                      opacity: 0,
                      height: 0
                    }}
                    animate={{
                      opacity: 1,
                      height: 'auto'
                    }}
                    exit={{
                      opacity: 0,
                      height: 0
                    }}
                  >

                    <button
                      type="submit"
                      disabled={
                        isSubmitting
                      }
                      className={`w-full bg-[#4b5e52] text-white py-6 rounded-[24px] font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#3a4740] transition-all flex items-center justify-center relative overflow-hidden group shadow-xl disabled:opacity-50 ${
                        isDarkMode
                          ? 'shadow-black/20'
                          : 'shadow-stone-100'
                      }`}
                    >

                      {isSubmitting ? (

                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                      ) : (

                        <span>
                          Proceed to Secure Checkout
                        </span>

                      )}

                    </button>

                  </motion.div>

                )}

              </AnimatePresence>


              {error && (

                <div className="text-center text-red-500 text-sm font-bold pt-4">
                  {error}
                </div>

              )}


              <div className="flex items-center justify-center space-x-4 text-stone-400">

                <div
                  className={`h-px flex-1 ${
                    isDarkMode
                      ? 'bg-white/10'
                      : 'bg-stone-100'
                  }`}
                />

                <span className="text-[9px] font-bold uppercase tracking-[0.2em] shrink-0">
                  PayMongo Secured Transaction
                </span>

                <div
                  className={`h-px flex-1 ${
                    isDarkMode
                      ? 'bg-white/10'
                      : 'bg-stone-100'
                  }`}
                />

              </div>

            </form>

          </motion.div>

        </div>

      </div>

    </section>
  );
}