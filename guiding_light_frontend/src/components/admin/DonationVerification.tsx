/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, {
  useEffect,
  useState
} from 'react';

import {
  Search,
  Filter,
  ShieldCheck,
  Loader,
  AlertTriangle,
  Printer
} from 'lucide-react';

import type { User } from '../../types';

interface DonationVerificationProps {
  currentUser: User | null;
}

interface Donation {
  donation_id: number;
  donor_name: string;
  contact_email: string;
  amount: string;
  reference_number: string;
  transaction_date: string;
  payment_method: number;
  status: number;
}

export default function DonationVerification({
  currentUser
}: DonationVerificationProps) {

  const [donations, setDonations] =
    useState<Donation[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [searchQuery, setSearchQuery] =
    useState('');

  const [showFilters, setShowFilters] =
    useState(false);

  const [dateFrom, setDateFrom] =
    useState('');

  const [dateTo, setDateTo] =
    useState('');

  const [showPrintPrompt, setShowPrintPrompt] =
    useState(false);

  const [printDateFrom, setPrintDateFrom] =
    useState('');

  const [printDateTo, setPrintDateTo] =
    useState('');

  const [printDateError, setPrintDateError] =
    useState<string | null>(null);

  const [
    reportGeneratedAt,
    setReportGeneratedAt
  ] = useState(new Date());

  useEffect(() => {
    fetchDonations();
  }, [currentUser]);

  const fetchDonations = async () => {

    if (!currentUser?.id) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {

      const response = await fetch(
        '/guiding_light_backend/get_donations.php',
        {
          credentials: 'include'
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {

        throw new Error(
          data.error ||
          'Failed to load donations.'
        );
      }

      setDonations(
        data.data || []
      );

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to connect to the server.'
      );

    } finally {

      setIsLoading(false);
    }
  };

  const getPaymentMethodName = (
    method: number | string
  ) => {

    switch (Number(method)) {

      case 1:
        return 'Bank Card';

      case 2:
        return 'Manual Bank';

      case 3:
        return 'E-Wallet / Card';

      default:
        return 'Unknown';
    }
  };

  const formatCurrency = (
    amount: string | number
  ) => {

    return new Intl.NumberFormat(
      'en-PH',
      {
        style: 'currency',
        currency: 'PHP'
      }
    ).format(
      Number(amount) || 0
    );
  };

  const formatDate = (
    value: string
  ) => {

    const date =
      new Date(
        value.replace(' ', 'T')
      );

    return date.toLocaleDateString(
      'en-PH'
    );
  };

  const formatTime = (
    value: string
  ) => {

    const date =
      new Date(
        value.replace(' ', 'T')
      );

    return date.toLocaleTimeString(
      'en-PH',
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  };

  const successfulDonations =
    donations.filter(
      donation =>
        Number(donation.status) === 2
    );

  const filteredDonations =
    successfulDonations.filter(
      donation => {

        const query =
          searchQuery
            .trim()
            .toLowerCase();

        const matchesSearch =
          query === '' ||
          donation.reference_number
            ?.toLowerCase()
            .includes(query) ||
          donation.donor_name
            ?.toLowerCase()
            .includes(query) ||
          donation.contact_email
            ?.toLowerCase()
            .includes(query);

        const donationDate =
          donation.transaction_date
            ?.slice(0, 10);

        const matchesDateFrom =
          !dateFrom ||
          donationDate >= dateFrom;

        const matchesDateTo =
          !dateTo ||
          donationDate <= dateTo;

        return (
          matchesSearch &&
          matchesDateFrom &&
          matchesDateTo
        );
      }
    );

  const totalAmount =
    filteredDonations.reduce(
      (total, donation) =>
        total +
        (
          Number(
            donation.amount
          ) || 0
        ),
      0
    );

  const activeFilterCount =
    [
      dateFrom,
      dateTo
    ].filter(Boolean).length;

  const clearFilters = () => {

    setDateFrom('');
    setDateTo('');
    setSearchQuery('');
  };

  const getReportPeriod = () => {

    if (
      dateFrom &&
      dateTo
    ) {

      return (
        `${dateFrom} to ${dateTo}`
      );
    }

    if (dateFrom) {
      return `From ${dateFrom}`;
    }

    if (dateTo) {
      return `Up to ${dateTo}`;
    }

    return 'All available records';
  };

  const handlePrint = () => {

    if (
      !printDateFrom ||
      !printDateTo
    ) {

      setPrintDateError(
        'Please select both the start and end date.'
      );

      return;
    }

    if (
      printDateFrom >
      printDateTo
    ) {

      setPrintDateError(
        'The start date cannot be later than the end date.'
      );

      return;
    }


    const reportDonations =
      successfulDonations.filter(
        donation => {

          const donationDate =
            donation.transaction_date
              ?.slice(0, 10);

          return (
            donationDate >= printDateFrom &&
            donationDate <= printDateTo
          );
        }
      );

    if (reportDonations.length === 0) {

      setPrintDateError(
        'No successful donations were found within the selected reporting period.'
      );

      return;
    }

    setDateFrom(
      printDateFrom
    );

    setDateTo(
      printDateTo
    );

    // Audit report should contain every
    // successful donation in the period,
    // not only the current search result.
    setSearchQuery('');
    setReportGeneratedAt(
      new Date()
    );

    setPrintDateError(null);
    setShowPrintPrompt(false);

    // Allow React to apply the selected
    // reporting period before print preview.
    setTimeout(
      () => {
        window.print();
      },
      100
    );
  };

  return (

    <div className="donation-print-area space-y-8">
      {showPrintPrompt && (

        <div className="donation-no-print fixed inset-0 z-[200] bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-lg rounded-[32px] p-8 shadow-2xl">

            <div className="mb-7">

              <h3 className="text-2xl font-serif italic text-stone-800 mb-2">
                Print Donation Report
              </h3>

              <p className="text-sm text-stone-500">
                Select the reporting period to include in the audit report.
              </p>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div>

                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                  Date From
                </label>

                <input
                  type="date"
                  value={printDateFrom}
                  onChange={(e) => {
                    setPrintDateFrom(
                      e.target.value
                    );

                    setPrintDateError(null);
                  }}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm"
                />

              </div>

              <div>

                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                  Date To
                </label>

                <input
                  type="date"
                  value={printDateTo}
                  onChange={(e) => {
                    setPrintDateTo(
                      e.target.value
                    );

                    setPrintDateError(null);
                  }}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm"
                />

              </div>

            </div>

            {printDateError && (

              <div className="mt-5 flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-xs font-medium">

                <AlertTriangle className="w-4 h-4 shrink-0" />

                {printDateError}

              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8">

              <button
                type="button"
                onClick={() => {
                  setShowPrintPrompt(false);
                  setPrintDateError(null);
                }}
                className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-stone-500 bg-stone-100 hover:bg-stone-200"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest bg-[#3a4740] text-[#d4c5b3] hover:bg-[#2c3630] flex items-center justify-center gap-2"
              >

                <Printer className="w-4 h-4" />

                Print Report

              </button>

            </div>

          </div>

        </div>
      )}

      {/* PRINT-ONLY REPORT HEADER */}
      <div className="donation-print-header">

        <div className="border-b border-stone-400 pb-4 mb-6">

          <h1 className="text-2xl font-bold not-italic">
            Streetlight: Suga sa Dalan Organization Inc.
          </h1>

          <h2 className="text-lg font-bold not-italic mt-1">
            Donation Audit Report
          </h2>

          <div className="mt-4 text-sm space-y-1">

            <p>
              <strong>
                Reporting Period:
              </strong>{' '}
              {getReportPeriod()}
            </p>

            <p>
              <strong>
                Generated By:
              </strong>{' '}
              {
                currentUser?.username ||
                'Administrator'
              }
            </p>

            <p>
              <strong>
                Generated:
              </strong>{' '}
              {
                reportGeneratedAt
                  .toLocaleString(
                    'en-PH'
                  )
              }
            </p>

          </div>
        </div>
      </div>

      {/* SCREEN HEADER */}
      <div className="donation-no-print flex flex-col xl:flex-row xl:items-end justify-between gap-6">

        <div>

          <h2 className="text-3xl font-serif italic text-stone-800">
            Donation Ledger
          </h2>

          <p className="text-stone-400 text-sm">
            Read-only audit trail of successfully verified donations.
          </p>

        </div>

        <div className="flex flex-col sm:flex-row gap-3">

          <div className="relative group">

            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 group-focus-within:text-stone-500" />

            <input
              type="text"
              placeholder="Search TXN ID or Name..."
              value={searchQuery}
              onChange={
                e =>
                  setSearchQuery(
                    e.target.value
                  )
              }
              className="pl-12 pr-6 py-3 bg-white border border-stone-100 rounded-full text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-[#d4c5b3] w-full sm:w-72 shadow-sm"
            />

          </div>

          <button
            type="button"
            onClick={
              () =>
                setShowFilters(
                  !showFilters
                )
            }
            className="relative px-5 py-3 bg-white border border-stone-100 rounded-full hover:bg-stone-50 text-stone-500 transition-colors shadow-sm flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest"
          >

            <Filter className="w-4 h-4" />

            Filters

            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-[#4b5e52] text-white rounded-full flex items-center justify-center text-[9px]">

                {activeFilterCount}

              </span>
            )}

          </button>

          <button
            type="button"
            onClick={() => {

              setPrintDateFrom(
                dateFrom
              );

              setPrintDateTo(
                dateTo
              );

              setPrintDateError(null);
              setShowPrintPrompt(true);
            }}
            disabled={
              isLoading ||
              successfulDonations.length === 0
            }
            className="px-5 py-3 bg-[#3a4740] text-[#d4c5b3] rounded-full hover:bg-[#2c3630] transition-colors shadow-sm flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
          >

            <Printer className="w-4 h-4" />

            Print Report

          </button>

        </div>
      </div>

      {/* FILTER PANEL */}
      {showFilters && (

        <div className="donation-no-print bg-white border border-stone-100 rounded-[28px] p-6 shadow-sm">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>

              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                Date From
              </label>

              <input
                type="date"
                value={dateFrom}
                onChange={
                  e =>
                    setDateFrom(
                      e.target.value
                    )
                }
                className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm"
              />

            </div>

            <div>

              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                Date To
              </label>

              <input
                type="date"
                value={dateTo}
                onChange={
                  e =>
                    setDateTo(
                      e.target.value
                    )
                }
                className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm"
              />

            </div>

          </div>

          <div className="flex justify-end mt-5">

            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-stone-700"
            >
              Clear Filters
            </button>

          </div>

        </div>
      )}

      {/* AUDIT SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">

          <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-2">
            Transactions
          </p>

          <p className="text-2xl font-bold text-stone-800">
            {filteredDonations.length}
          </p>

        </div>

        <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">

          <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-2">
            Total Amount
          </p>

          <p className="text-xl font-bold text-[#4b5e52]">
            {
              formatCurrency(
                totalAmount
              )
            }
          </p>

        </div>

      </div>

      {/* DONATION TABLE */}
      <div className="bg-white rounded-[40px] border border-stone-100 shadow-sm overflow-hidden p-4">

        {error ? (

          <div className="p-12 text-center text-red-500 flex flex-col items-center justify-center">

            <AlertTriangle className="w-12 h-12 mb-4 opacity-50" />

            <p className="font-bold uppercase tracking-widest">
              {error}
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-left border-collapse min-w-[900px]">

              <thead>

                <tr className="border-b border-stone-100">

                  <th className="px-6 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-[0.15em]">
                    Date
                  </th>

                  <th className="px-6 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-[0.15em]">
                    TXN ID
                  </th>

                  <th className="px-6 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-[0.15em]">
                    Donor Profile
                  </th>

                  <th className="px-6 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-[0.15em] text-right">
                    Amount
                  </th>

                  <th className="px-6 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-[0.15em]">
                    Method
                  </th>

                  <th className="px-6 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-[0.15em]">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-stone-50">

                {isLoading ? (

                  <tr>

                    <td
                      colSpan={6}
                      className="text-center p-20"
                    >

                      <div className="flex flex-col items-center justify-center text-stone-400">

                        <Loader className="w-8 h-8 animate-spin mb-4" />

                        <span className="text-xs font-bold uppercase tracking-widest">
                          Loading Records...
                        </span>

                      </div>

                    </td>

                  </tr>

                ) : filteredDonations.length === 0 ? (

                  <tr>

                    <td
                      colSpan={6}
                      className="text-center p-20 text-stone-400 font-bold uppercase tracking-widest"
                    >
                      No successful donation records match the selected filters.
                    </td>

                  </tr>

                ) : (

                  filteredDonations.map(
                    donation => (

                      <tr
                        key={
                          donation.donation_id
                        }
                        className="hover:bg-stone-50/50 transition-colors"
                      >

                        <td className="px-6 py-5">

                          <p className="text-xs font-bold text-stone-800 mb-1">

                            {
                              formatDate(
                                donation.transaction_date
                              )
                            }

                          </p>

                          <p className="text-[10px] text-stone-400">

                            {
                              formatTime(
                                donation.transaction_date
                              )
                            }

                          </p>

                        </td>

                        <td className="px-6 py-5">

                          <span className="text-[10px] font-mono font-bold text-stone-500">

                            {
                              donation.reference_number
                            }

                          </span>

                        </td>

                        <td className="px-6 py-5">

                          <p className="text-xs font-bold text-stone-800 mb-1">
                            {donation.donor_name}
                          </p>

                          <p className="text-[10px] text-stone-400">
                            {donation.contact_email}
                          </p>

                        </td>

                        <td className="px-6 py-5 text-sm font-bold text-[#4b5e52] text-right whitespace-nowrap">

                          {
                            formatCurrency(
                              donation.amount
                            )
                          }

                        </td>

                        <td className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-stone-500">

                          {
                            getPaymentMethodName(
                              donation.payment_method
                            )
                          }

                        </td>

                        <td className="px-6 py-5">

                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[9px] font-bold bg-[#3a4740]/10 text-[#3a4740] uppercase tracking-widest border border-[#3a4740]/20">

                            <ShieldCheck className="w-3 h-3 mr-2" />

                            Successful

                          </span>

                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* PRINT FOOTER */}
      <div className="donation-print-header mt-8 text-xs border-t border-stone-300 pt-4">

        <p>
          Total Transactions:{' '}
          <strong>
            {filteredDonations.length}
          </strong>
        </p>

        <p>
          Total Donation Amount:{' '}
          <strong>
            {
              formatCurrency(
                totalAmount
              )
            }
          </strong>
        </p>

        <p className="mt-4 text-stone-500">
          Generated from the Guiding Light donation ledger for audit and reporting purposes.
        </p>

      </div>

    </div>
  );
}