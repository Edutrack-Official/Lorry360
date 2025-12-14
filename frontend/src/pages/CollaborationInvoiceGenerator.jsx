// CollaborationInvoiceGenerator.jsx
import React, { useState, useEffect } from 'react';
import { 
  Download, 
  FileText, 
  User,
  Calendar,
  Search,
  Loader,
  Users,
  Truck,
  CreditCard,
  Building2,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from "../api/client";

const CollaborationInvoiceGenerator = ({ partnerId, partner, onClose }) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRange, setSelectedRange] = useState('custom');

  // Fetch collaboration trips and payments data
  const fetchCollaborationData = async () => {
    if (!partnerId || !fromDate || !toDate) {
      toast.error('Please select date range');
      return;
    }

    setLoading(true);
    try {
      // Fetch trips where partner is collaborator (trips done by me for partner)
      const myTripsRes = await api.get('/trips', {
        params: {
          trip_type: 'collaborative',
          collab_owner_id: partnerId,
          fetch_mode: 'as_owner',
          status: 'completed',
          from_date: fromDate,
          to_date: toDate
        }
      });

      // Fetch trips where I am collaborator (trips done by partner for me)
      const partnerTripsRes = await api.get('/trips', {
        params: {
          trip_type: 'collaborative',
          collab_owner_id: partnerId,
          fetch_mode: 'as_collaborator',
          status: 'completed',
          from_date: fromDate,
          to_date: toDate
        }
      });

      // Fetch my payments to partner
      const myPaymentsRes = await api.get(`/payments/to-partner/${partnerId}`, {
        params: {
          from_date: fromDate,
          to_date: toDate
        }
      });

      // Fetch partner payments to me
      const partnerPaymentsRes = await api.get('/payments-received', {
        params: { 
          owner_id: partnerId,
          from_date: fromDate,
          to_date: toDate
        }
      });

      const myTrips = myTripsRes.data.data?.trips || [];
      const partnerTrips = partnerTripsRes.data.data?.trips || [];
      const myPayments = myPaymentsRes.data.data?.payments || [];
      const partnerPayments = partnerPaymentsRes.data.data?.payments || [];

      // Filter only approved items
      const approvedMyTrips = myTrips.filter(trip => trip.collab_trip_status === 'approved');
      const approvedPartnerTrips = partnerTrips.filter(trip => trip.collab_trip_status === 'approved');
      const approvedMyPayments = myPayments.filter(payment => payment.collab_payment_status === 'approved');
      const approvedPartnerPayments = partnerPayments.filter(payment => payment.collab_payment_status === 'approved');

      // Calculate totals
      const totalMyTripsAmount = approvedMyTrips.reduce((sum, trip) => sum + (trip.customer_amount || 0), 0);
      const totalPartnerTripsAmount = approvedPartnerTrips.reduce((sum, trip) => sum + (trip.customer_amount || 0), 0);
      const totalMyPayments = approvedMyPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const totalPartnerPayments = approvedPartnerPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

      const netTripAmount = totalPartnerTripsAmount - totalMyTripsAmount;
      const netPayments = totalPartnerPayments - totalMyPayments;
      const closingBalance = netTripAmount - totalMyPayments + totalPartnerPayments;

      // Format currency
      const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount || 0);
      };

      // Generate invoice data
      const invoiceData = {
        partner: partner,
        period: `${new Date(fromDate).toLocaleDateString()} - ${new Date(toDate).toLocaleDateString()}`,
        myTrips: approvedMyTrips.map(trip => ({
          date: trip.trip_date,
          trip_number: trip.trip_number,
          material: trip.material_name,
          location: trip.location,
          amount: formatCurrency(trip.customer_amount),
          notes: trip.notes
        })),
        partnerTrips: approvedPartnerTrips.map(trip => ({
          date: trip.trip_date,
          trip_number: trip.trip_number,
          material: trip.material_name,
          location: trip.location,
          amount: formatCurrency(trip.customer_amount),
          notes: trip.notes
        })),
        myPayments: approvedMyPayments.map(payment => ({
          date: payment.payment_date,
          payment_number: payment.payment_number,
          mode: payment.payment_mode,
          amount: formatCurrency(payment.amount),
          notes: payment.notes
        })),
        partnerPayments: approvedPartnerPayments.map(payment => ({
          date: payment.payment_date,
          payment_number: payment.payment_number,
          mode: payment.payment_mode,
          amount: formatCurrency(payment.amount),
          notes: payment.notes
        })),
        summary: {
          totalMyTripsAmount: formatCurrency(totalMyTripsAmount),
          totalPartnerTripsAmount: formatCurrency(totalPartnerTripsAmount),
          totalMyPayments: formatCurrency(totalMyPayments),
          totalPartnerPayments: formatCurrency(totalPartnerPayments),
          netTripAmount: formatCurrency(netTripAmount),
          netPayments: formatCurrency(netPayments),
          closingBalance: formatCurrency(closingBalance)
        }
      };

      setInvoiceData(invoiceData);
      toast.success('Collaboration data loaded successfully!');

    } catch (error) {
      console.error('Error fetching collaboration data:', error);
      toast.error('Failed to fetch collaboration data');
    } finally {
      setLoading(false);
    }
  };

  const downloadCollaborationPDF = async () => {
    if (!invoiceData) {
      toast.error('No invoice data available');
      return;
    }

    try {
      const html2pdf = (await import('html2pdf.js')).default;

      const invoiceContent = `
        <div style="font-family: Arial, sans-serif; color: #000; width: 100%; box-sizing: border-box; padding: 20px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px;">
            <h1 style="font-size: 32px; font-weight: bold; margin: 0 0 10px 0;">COLLABORATION STATEMENT</h1>
            <h2 style="font-size: 24px; margin: 5px 0; color: #333;">${partner.name}</h2>
            <p style="margin: 0; font-size: 16px; color: #666;">${partner.company_name || ''}</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">Period: ${invoiceData.period}</p>
          </div>

          <!-- Partner Info -->
          <div style="margin-bottom: 30px; padding: 15px; border: 1px solid #000; background-color: #f8f9fa;">
            <h3 style="margin: 0 0 10px 0; font-size: 18px;">Partner Information</h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${partner.name}</p>
            <p style="margin: 5px 0;"><strong>Company:</strong> ${partner.company_name || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${partner.phone || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${partner.email || 'N/A'}</p>
          </div>

          <!-- Summary -->
          <div style="margin-bottom: 30px; padding: 20px; border: 2px solid #333; background-color: #fff;">
            <h3 style="margin: 0 0 15px 0; font-size: 20px; text-align: center;">FINANCIAL SUMMARY</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
              <div style="text-align: center; padding: 10px; border: 1px solid #ccc; background-color: #e8f5e9;">
                <p style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">Trips by You</p>
                <p style="margin: 0; font-size: 18px; font-weight: bold;">${invoiceData.summary.totalMyTripsAmount}</p>
              </div>
              <div style="text-align: center; padding: 10px; border: 1px solid #ccc; background-color: #e3f2fd;">
                <p style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">Trips by Partner</p>
                <p style="margin: 0; font-size: 18px; font-weight: bold;">${invoiceData.summary.totalPartnerTripsAmount}</p>
              </div>
              <div style="text-align: center; padding: 10px; border: 1px solid #ccc; background-color: #fff8e1;">
                <p style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">Payments by You</p>
                <p style="margin: 0; font-size: 18px; font-weight: bold;">${invoiceData.summary.totalMyPayments}</p>
              </div>
              <div style="text-align: center; padding: 10px; border: 1px solid #ccc; background-color: #fce4ec;">
                <p style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">Payments by Partner</p>
                <p style="margin: 0; font-size: 18px; font-weight: bold;">${invoiceData.summary.totalPartnerPayments}</p>
              </div>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; border: 2px solid #4caf50; background-color: #f1f8e9; text-align: center;">
              <p style="margin: 0 0 5px 0; font-size: 16px;"><strong>Net Amount:</strong> ${invoiceData.summary.netTripAmount}</p>
              <p style="margin: 0 0 5px 0; font-size: 16px;"><strong>Net Payments:</strong> ${invoiceData.summary.netPayments}</p>
              <p style="margin: 0; font-size: 20px; font-weight: bold; color: #2e7d32;">Closing Balance: ${invoiceData.summary.closingBalance}</p>
            </div>
          </div>

          <!-- Detailed Transactions -->
          <div style="margin-bottom: 30px;">
            <!-- Your Trips -->
            ${invoiceData.myTrips.length > 0 ? `
              <h3 style="margin: 0 0 10px 0; font-size: 18px; background-color: #e8f5e9; padding: 10px;">Trips Done by You</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px;">
                <thead>
                  <tr style="background-color: #f2f2f2;">
                    <th style="border: 1px solid #000; padding: 8px; text-align: left;">Date</th>
                    <th style="border: 1px solid #000; padding: 8px; text-align: left;">Trip No</th>
                    <th style="border: 1px solid #000; padding: 8px; text-align: left;">Material</th>
                    <th style="border: 1px solid #000; padding: 8px; text-align: left;">Location</th>
                    <th style="border: 1px solid #000; padding: 8px; text-align: left;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoiceData.myTrips.map(trip => `
                    <tr>
                      <td style="border: 1px solid #000; padding: 8px;">${new Date(trip.date).toLocaleDateString()}</td>
                      <td style="border: 1px solid #000; padding: 8px;">${trip.trip_number}</td>
                      <td style="border: 1px solid #000; padding: 8px;">${trip.material}</td>
                      <td style="border: 1px solid #000; padding: 8px;">${trip.location}</td>
                      <td style="border: 1px solid #000; padding: 8px; font-weight: bold;">${trip.amount}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : ''}

            <!-- Partner Trips -->
            ${invoiceData.partnerTrips.length > 0 ? `
              <h3 style="margin: 0 0 10px 0; font-size: 18px; background-color: #e3f2fd; padding: 10px;">Trips Done by Partner</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px;">
                <thead>
                  <tr style="background-color: #f2f2f2;">
                    <th style="border: 1px solid #000; padding: 8px; text-align: left;">Date</th>
                    <th style="border: 1px solid #000; padding: 8px; text-align: left;">Trip No</th>
                    <th style="border: 1px solid #000; padding: 8px; text-align: left;">Material</th>
                    <th style="border: 1px solid #000; padding: 8px; text-align: left;">Location</th>
                    <th style="border: 1px solid #000; padding: 8px; text-align: left;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoiceData.partnerTrips.map(trip => `
                    <tr>
                      <td style="border: 1px solid #000; padding: 8px;">${new Date(trip.date).toLocaleDateString()}</td>
                      <td style="border: 1px solid #000; padding: 8px;">${trip.trip_number}</td>
                      <td style="border: 1px solid #000; padding: 8px;">${trip.material}</td>
                      <td style="border: 1px solid #000; padding: 8px;">${trip.location}</td>
                      <td style="border: 1px solid #000; padding: 8px; font-weight: bold;">${trip.amount}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : ''}

            <!-- Your Payments -->
            ${invoiceData.myPayments.length > 0 ? `
              <h3 style="margin: 0 0 10px 0; font-size: 18px; background-color: #fff8e1; padding: 10px;">Payments Made by You</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px;">
                <thead>
                  <tr style="background-color: #f2f2f2;">
                    <th style="border: 1px solid #000; padding: 8px; text-align: left;">Date</th>
                    <th style="border: 1px solid #000; padding: 8px; text-align: left;">Payment No</th>
                    <th style="border: 1px solid #000; padding: 8px; text-align: left;">Mode</th>
                    <th style="border: 1px solid #000; padding: 8px; text-align: left;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoiceData.myPayments.map(payment => `
                    <tr>
                      <td style="border: 1px solid #000; padding: 8px;">${new Date(payment.date).toLocaleDateString()}</td>
                      <td style="border: 1px solid #000; padding: 8px;">${payment.payment_number}</td>
                      <td style="border: 1px solid #000; padding: 8px;">${payment.mode}</td>
                      <td style="border: 1px solid #000; padding: 8px; font-weight: bold; color: green;">${payment.amount}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : ''}

            <!-- Partner Payments -->
            ${invoiceData.partnerPayments.length > 0 ? `
              <h3 style="margin: 0 0 10px 0; font-size: 18px; background-color: #fce4ec; padding: 10px;">Payments Received from Partner</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px;">
                <thead>
                  <tr style="background-color: #f2f2f2;">
                    <th style="border: 1px solid #000; padding: 8px; text-align: left;">Date</th>
                    <th style="border: 1px solid #000; padding: 8px; text-align: left;">Payment No</th>
                    <th style="border: 1px solid #000; padding: 8px; text-align: left;">Mode</th>
                    <th style="border: 1px solid #000; padding: 8px; text-align: left;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoiceData.partnerPayments.map(payment => `
                    <tr>
                      <td style="border: 1px solid #000; padding: 8px;">${new Date(payment.date).toLocaleDateString()}</td>
                      <td style="border: 1px solid #000; padding: 8px;">${payment.payment_number}</td>
                      <td style="border: 1px solid #000; padding: 8px;">${payment.mode}</td>
                      <td style="border: 1px solid #000; padding: 8px; font-weight: bold; color: green;">${payment.amount}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : ''}
          </div>

          <!-- Footer -->
          <div style="margin-top: 40px; text-align: center; border-top: 1px solid #000; padding-top: 20px;">
            <p style="margin: 0; font-size: 14px; color: #666;">Generated on ${new Date().toLocaleDateString()}</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">This is a collaboration statement showing mutual transactions between partners</p>
          </div>
        </div>
      `;

      const element = document.createElement('div');
      element.innerHTML = invoiceContent;

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `Collaboration_Statement_${partner.name.replace(/[^a-zA-Z0-9]/g, '_')}_${fromDate}_to_${toDate}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait'
        }
      };

      await html2pdf().set(opt).from(element).save();
      toast.success('Collaboration statement downloaded successfully!');

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  // Set date range presets
  const setDateRange = (range) => {
    const today = new Date();
    setSelectedRange(range);
    
    switch(range) {
      case 'today':
        setFromDate(today.toISOString().split('T')[0]);
        setToDate(today.toISOString().split('T')[0]);
        break;
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        setFromDate(weekAgo.toISOString().split('T')[0]);
        setToDate(today.toISOString().split('T')[0]);
        break;
      case 'month':
        const monthAgo = new Date();
        monthAgo.setDate(today.getDate() - 30);
        setFromDate(monthAgo.toISOString().split('T')[0]);
        setToDate(today.toISOString().split('T')[0]);
        break;
      case 'quarter':
        const quarterAgo = new Date();
        quarterAgo.setDate(today.getDate() - 90);
        setFromDate(quarterAgo.toISOString().split('T')[0]);
        setToDate(today.toISOString().split('T')[0]);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setFromDate(thirtyDaysAgo.toISOString().split('T')[0]);
    setToDate(today.toISOString().split('T')[0]);
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Collaboration Statement</h1>
            <p className="text-gray-600">Generate statement for {partner?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setInvoiceData(null)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Reset
          </button>
          {invoiceData && (
            <button
              onClick={downloadCollaborationPDF}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
          )}
        </div>
      </div>

      {/* Date Range Selection */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Select Date Range
        </h2>
        
        <div className="space-y-4">
          {/* Quick Date Range Buttons */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <button
              onClick={() => setDateRange('today')}
              className={`px-3 py-2 rounded-lg text-sm ${selectedRange === 'today' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Today
            </button>
            <button
              onClick={() => setDateRange('week')}
              className={`px-3 py-2 rounded-lg text-sm ${selectedRange === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setDateRange('month')}
              className={`px-3 py-2 rounded-lg text-sm ${selectedRange === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setDateRange('quarter')}
              className={`px-3 py-2 rounded-lg text-sm ${selectedRange === 'quarter' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Last 90 Days
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setSelectedRange('custom');
                  setFromDate(e.target.value);
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setSelectedRange('custom');
                  setToDate(e.target.value);
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <button
            onClick={fetchCollaborationData}
            disabled={loading || !fromDate || !toDate}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Loading Collaboration Data...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Generate Collaboration Statement
              </>
            )}
          </button>
        </div>
      </div>

      {/* Statement Preview */}
      {invoiceData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary Section */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Collaboration Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-700">Trips Done by You</h3>
                </div>
                <p className="text-2xl font-bold text-green-900">{invoiceData.summary.totalMyTripsAmount}</p>
                <p className="text-sm text-green-600">{invoiceData.myTrips.length} trips</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-700">Trips Done by Partner</h3>
                </div>
                <p className="text-2xl font-bold text-blue-900">{invoiceData.summary.totalPartnerTripsAmount}</p>
                <p className="text-sm text-blue-600">{invoiceData.partnerTrips.length} trips</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-5 w-5 text-yellow-600" />
                  <h3 className="font-semibold text-yellow-700">Payments by You</h3>
                </div>
                <p className="text-2xl font-bold text-yellow-900">{invoiceData.summary.totalMyPayments}</p>
                <p className="text-sm text-yellow-600">{invoiceData.myPayments.length} payments</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-700">Payments by Partner</h3>
                </div>
                <p className="text-2xl font-bold text-purple-900">{invoiceData.summary.totalPartnerPayments}</p>
                <p className="text-sm text-purple-600">{invoiceData.partnerPayments.length} payments</p>
              </div>
            </div>

            {/* Net Amount */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border-2 border-blue-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Net Amount</h3>
                  <p className="text-gray-600">{invoiceData.summary.netTripAmount}</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Net Payments</h3>
                  <p className="text-gray-600">{invoiceData.summary.netPayments}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-bold text-gray-900">Closing Balance</h3>
                  <p className="text-2xl font-bold text-green-600">{invoiceData.summary.closingBalance}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Sections */}
          {invoiceData.myTrips.length > 0 && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5 text-green-600" />
                Trips Done by You ({invoiceData.myTrips.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-3 text-left text-sm font-semibold text-gray-900 border">Date</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-900 border">Trip No</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-900 border">Material</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-900 border">Location</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-900 border">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.myTrips.map((trip, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-3 border">{new Date(trip.date).toLocaleDateString()}</td>
                        <td className="p-3 border font-medium">{trip.trip_number}</td>
                        <td className="p-3 border">{trip.material}</td>
                        <td className="p-3 border">{trip.location}</td>
                        <td className="p-3 border font-bold text-green-600">{trip.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {invoiceData.partnerTrips.length > 0 && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-600" />
                Trips Done by Partner ({invoiceData.partnerTrips.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-3 text-left text-sm font-semibold text-gray-900 border">Date</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-900 border">Trip No</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-900 border">Material</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-900 border">Location</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-900 border">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.partnerTrips.map((trip, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-3 border">{new Date(trip.date).toLocaleDateString()}</td>
                        <td className="p-3 border font-medium">{trip.trip_number}</td>
                        <td className="p-3 border">{trip.material}</td>
                        <td className="p-3 border">{trip.location}</td>
                        <td className="p-3 border font-bold text-blue-600">{trip.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default CollaborationInvoiceGenerator;