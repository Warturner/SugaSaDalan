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
  Clock,
  Printer
} from 'lucide-react';

interface DonationVerificationProps {
  currentUser: {
    id: number;
    username: string;
    role?: string;
  } | null;
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

type StatusFilter =
  | 'all'
  | 'successful'
  | 'pending';

type PaymentFilter =
  | 'all'
  | '1'
  | '2'
  | '3';

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

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('all');

  const [paymentFilter, setPaymentFilter] =
    useState<PaymentFilter>('all');

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

      const data = await response.json();

      if (!response.ok || !data.success) {

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

  const filteredDonations =
    donations.filter(
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

        const matchesStatus =
          statusFilter === 'all' ||
          (
            statusFilter ===
            'successful' &&
            Number(donation.status) === 2
          ) ||
          (
            statusFilter ===
            'pending' &&
            Number(donation.status) !== 2
          );

        const matchesPayment =
          paymentFilter === 'all' ||
          Number(
            donation.payment_method
          ) ===
          Number(paymentFilter);

        return (
          matchesSearch &&
          matchesDateFrom &&
          matchesDateTo &&
          matchesStatus &&
          matchesPayment
        );
      }
    );

  const totalAmount =
    filteredDonations.reduce(
      (total, donation) =>
        total +
        (Number(donation.amount) || 0),
      0
    );

  const successfulCount =
    filteredDonations.filter(
      donation =>
        Number(donation.status) === 2
    ).length;

  const pendingCount =
    filteredDonations.length -
    successfulCount;

  const activeFilterCount =
    [
      dateFrom,
      dateTo,
      statusFilter !== 'all',
      paymentFilter !== 'all'
    ].filter(Boolean).length;

  const clearFilters = () => {

    setDateFrom('');
    setDateTo('');
    setStatusFilter('all');
    setPaymentFilter('all');
    setSearchQuery('');
  };

  const getReportPeriod = () => {

    if (dateFrom && dateTo) {
      return `${dateFrom} to ${dateTo}`;
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

    setReportGeneratedAt(
      new Date()
    );

    setTimeout(
      () => {
        window.print();
      },
      0
    );
  };

  return (
    <div className="donation-print-area space-y-8">

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
              <strong>Reporting Period:</strong>{' '}
              {getReportPeriod()}
            </p>

            <p>
              <strong>Generated By:</strong>{' '}
              {currentUser?.username ||
                'Administrator'}
            </p>

            <p>
              <strong>Generated:</strong>{' '}
              {reportGeneratedAt.toLocaleString(
                'en-PH'
              )}
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
            Read-only audit trail of all incoming transactions.
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
            onClick={handlePrint}
            disabled={
              isLoading ||
              filteredDonations.length === 0
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

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

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

            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as StatusFilter
                  )
                }
                className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm"
              >
                <option value="all">
                  All Statuses
                </option>

                <option value="successful">
                  Successful
                </option>

                <option value="pending">
                  Pending
                </option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                Payment Method
              </label>

              <select
                value={paymentFilter}
                onChange={(e) =>
                  setPaymentFilter(
                    e.target.value as PaymentFilter
                  )
                }
                className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm"
              >
                <option value="all">
                  All Methods
                </option>

                <option value="1">
                  Bank Card
                </option>

                <option value="2">
                  Manual Bank
                </option>

                <option value="3">
                  E-Wallet / Card
                </option>
              </select>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

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
            {formatCurrency(
              totalAmount
            )}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
          <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-2">
            Successful
          </p>

          <p className="text-2xl font-bold text-stone-800">
            {successfulCount}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
          <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-2">
            Pending
          </p>

          <p className="text-2xl font-bold text-stone-800">
            {pendingCount}
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
                      No donation records match the selected filters.
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
                            {formatDate(
                              donation.transaction_date
                            )}
                          </p>

                          <p className="text-[10px] text-stone-400">
                            {formatTime(
                              donation.transaction_date
                            )}
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
                            {
                              donation.donor_name
                            }
                          </p>

                          <p className="text-[10px] text-stone-400">
                            {
                              donation.contact_email
                            }
                          </p>
                        </td>

                        <td className="px-6 py-5 text-sm font-bold text-[#4b5e52] text-right whitespace-nowrap">

                          {formatCurrency(
                            donation.amount
                          )}
                        </td>

                        <td className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-stone-500">

                          {getPaymentMethodName(
                            donation.payment_method
                          )}
                        </td>

                        <td className="px-6 py-5">

                          {Number(
                            donation.status
                          ) === 2 ? (

                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[9px] font-bold bg-[#3a4740]/10 text-[#3a4740] uppercase tracking-widest border border-[#3a4740]/20">

                              <ShieldCheck className="w-3 h-3 mr-2" />

                              Successful
                            </span>

                          ) : (

                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[9px] font-bold bg-[#d4a373]/10 text-[#d4a373] uppercase tracking-widest border border-[#d4a373]/20">

                              <Clock className="w-3 h-3 mr-2" />

                              Pending
                            </span>
                          )}
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
            {formatCurrency(
              totalAmount
            )}
          </strong>
        </p>

        <p className="mt-4 text-stone-500">
          Generated from the Guiding Light donation ledger for audit and reporting purposes.
        </p>
      </div>

    </div>
  );
}