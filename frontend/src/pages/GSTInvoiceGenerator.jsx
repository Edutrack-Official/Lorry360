// import React, { useState, useEffect } from 'react';
// import {
//   Download,
//   FileText,
//   Calendar,
//   Loader,
//   Users,
//   FileSpreadsheet,
//   ChevronDown,
//   ChevronUp,
//   Eye,
//   Printer,
// } from 'lucide-react';
// import toast from 'react-hot-toast';
// import api from "../api/client";
// import { useAuth } from '../contexts/AuthContext';

// const GSTInvoiceGenerator = () => {
//   const { user } = useAuth();
//   const [fromDate, setFromDate] = useState('');
//   const [toDate, setToDate] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [invoiceData, setInvoiceData] = useState(null);
//   const [expandedCustomers, setExpandedCustomers] = useState({});
//   const [selectedCustomer, setSelectedCustomer] = useState(null);
//   const [detailedView, setDetailedView] = useState(false);

//   useEffect(() => {
//     // Set default date range to last 30 days
//     const today = new Date();
//     const thirtyDaysAgo = new Date();
//     thirtyDaysAgo.setDate(today.getDate() - 30);

//     setFromDate(thirtyDaysAgo.toISOString().split('T')[0]);
//     setToDate(today.toISOString().split('T')[0]);
//   }, []);

//   const generateGSTInvoice = async () => {
//     if (!fromDate || !toDate) {
//       toast.error('Please select date range');
//       return;
//     }

//     if (new Date(fromDate) > new Date(toDate)) {
//       toast.error('From date cannot be after to date');
//       return;
//     }

//     setLoading(true);
//     setInvoiceData(null);
//     setSelectedCustomer(null);
//     setDetailedView(false);

//     try {
//       // Call GST invoice endpoint (without customer_id for all customers)
//       const res = await api.get(
//         `/trips/gst-invoice-data?from_date=${fromDate}&to_date=${toDate}`
//       );

//       if (res.data.success) {
//         setInvoiceData(res.data.data);
//         toast.success(`Generated GST invoice for ${res.data.data.customers?.length || 0} customers`);
//       } else {
//         toast.error(res.data.error || 'Failed to generate GST invoice');
//       }
//     } catch (error) {
//       console.error('Error generating GST invoice:', error);
//       if (error.response?.data?.error) {
//         toast.error(error.response.data.error);
//       } else {
//         toast.error('Failed to generate GST invoice');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const viewCustomerDetails = async (customer) => {
//     try {
//       setLoading(true);
      
//       // Call GST invoice endpoint with specific customer_id
//       const res = await api.get(
//         `/trips/gst-invoice-data?customer_id=${customer.customer_id}&from_date=${fromDate}&to_date=${toDate}`
//       );

//       if (res.data.success) {
//         setSelectedCustomer({
//           ...res.data.data,
//           customer_name: customer.customer_name
//         });
//         setDetailedView(true);
//       } else {
//         toast.error(res.data.error || 'Failed to load customer details');
//       }
//     } catch (error) {
//       console.error('Error loading customer details:', error);
//       toast.error('Failed to load customer details');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const generateGSTTableRows = (trips) => {
//     if (!trips || !Array.isArray(trips)) return [];
    
//     return trips.map((trip, index) => {
//       const taxableValue = parseFloat(trip.taxable_amount) || 0;
//       const cgstAmount = parseFloat(trip.cgst_amount) || 0;
//       const sgstAmount = parseFloat(trip.sgst_amount) || 0;
//       const igstAmount = parseFloat(trip.igst_amount) || 0;
//       const gstAmount = parseFloat(trip.gst_amount) || 0;
//       const quantity = parseFloat(trip.quantity) || 0;
      
//       // Get GST rates from API or use default
//       const cgstRate = trip.cgst_rate || "0%";
//       const sgstRate = trip.sgst_rate || "0%";
//       const igstRate = trip.igst_rate || "0%";
//       const totalGstRate = trip.gst_rate || "10%";
      
//       const rate = quantity > 0 ? (taxableValue / quantity).toFixed(2) : "0.00";
//       const totalAmount = taxableValue + gstAmount;
      
//       return {
//         s_no: index + 1,
//         description: trip.material || trip.material_name || 'Material',
//         hsn_code: "2505", // Standard HSN for sand
//         quantity: quantity,
//         rate: rate,
//         taxable_value: taxableValue.toFixed(2),
//         gst_rate: totalGstRate,
//         cgst_amount: cgstAmount.toFixed(2),
//         sgst_amount: sgstAmount.toFixed(2),
//         igst_amount: igstAmount.toFixed(2),
//         total_amount: totalAmount.toFixed(2)
//       };
//     });
//   };

//   const calculateTotals = (trips) => {
//     if (!trips || !Array.isArray(trips)) {
//       return {
//         total_taxable_value: "0.00",
//         total_cgst: "0.00",
//         total_sgst: "0.00",
//         total_igst: "0.00",
//         total_gst: "0.00",
//         grand_total: "0.00"
//       };
//     }
    
//     let totals = {
//       total_taxable_value: 0,
//       total_cgst: 0,
//       total_sgst: 0,
//       total_igst: 0,
//       total_gst: 0,
//       grand_total: 0
//     };
    
//     trips.forEach(trip => {
//       const taxableValue = parseFloat(trip.taxable_amount) || 0;
//       const cgstAmount = parseFloat(trip.cgst_amount) || 0;
//       const sgstAmount = parseFloat(trip.sgst_amount) || 0;
//       const igstAmount = parseFloat(trip.igst_amount) || 0;
//       const gstAmount = parseFloat(trip.gst_amount) || 0;
      
//       totals.total_taxable_value += taxableValue;
//       totals.total_cgst += cgstAmount;
//       totals.total_sgst += sgstAmount;
//       totals.total_igst += igstAmount;
//       totals.total_gst += gstAmount;
//       totals.grand_total += taxableValue + gstAmount;
//     });
    
//     // Format all totals to 2 decimal places
//     Object.keys(totals).forEach(key => {
//       totals[key] = totals[key].toFixed(2);
//     });
    
//     return totals;
//   };

//   const formatCurrency = (amount) => {
//     const num = parseFloat(amount || 0);
//     return `₹${num.toLocaleString('en-IN', {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2
//     })}`;
//   };

// const downloadAllGSTInvoices = async () => {
//   if (!invoiceData || !invoiceData.customers || invoiceData.customers.length === 0) {
//     toast.error('No invoice data available to download');
//     return;
//   }

//   try {
//     const html2pdf = (await import('html2pdf.js')).default;
    
//     // Use the main invoiceData for company info
//     const companyData = invoiceData?.company || {};
    
//     // Combine all trips from all customers
//     let allTrips = [];
//     invoiceData.customers.forEach(customer => {
//       if (customer.trips && Array.isArray(customer.trips)) {
//         // Add customer name to each trip for identification
//         const tripsWithCustomer = customer.trips.map(trip => ({
//           ...trip,
//           customer_name: customer.customer_name,
//           customer_gst: customer.gst_number,
//           customer_address: customer.address
//         }));
//         allTrips = [...allTrips, ...tripsWithCustomer];
//       }
//     });
    
//     // Generate GST table rows for all trips
//     const gstRows = generateGSTTableRows(allTrips);
    
//     // Calculate totals for all trips
//     const totals = calculateTotals(allTrips);

//     // Create combined invoice content
// const combinedInvoiceContent = `
//   <div style="font-family: Arial, sans-serif; color: #000; width: 100%; box-sizing: border-box;">
//     <!-- Header Section -->
//     <div style="margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 15px; display: flex; justify-content: space-between; align-items: flex-start;">
//       <div style="line-height:1.25;">
//         <h1 style="margin:0; font-size:26px; font-weight:700;">${companyData?.name || 'SMT BUILDING MATERIAL SUPPLIERS'}</h1>
//         <p style="margin:6px 0 2px 0; font-size:14px;">${companyData?.address || '2/132 Mana mettu thottam, priyakuilai post, chettipalayam via'}</p>
//         <p style="margin:0 0 2px 0; font-size:14px;">${companyData?.city || 'Coimbatore'}, ${companyData?.state || 'Tamilnadu'} - ${companyData?.pincode || '641201'}</p>
//         <p style="margin:0 0 2px 0; font-size:14px;">Contact: ${companyData?.phone || '+91-6385255714'}</p>
//         ${companyData?.gst_number ? `
//           <p style="margin:4px 0 0 0; font-size:14px; font-weight:700;">GSTIN: ${companyData.gst_number}</p>
//         ` : ''}
//       </div>
      
//       <div style="text-align: right;">
//         <h2 style="font-size: 32px; font-weight: bold; margin: 0; color: #333;">GST INVOICE</h2>
//         <p style="margin: 5px 0; font-size: 14px;">Invoice Type: Tax Invoice (GTA)</p>
//         <p style="margin: 5px 0; font-size: 14px;">Place of Supply: Tamil Nadu</p>
//         <p style="margin: 5px 0; font-size: 14px;">Period: ${fromDate} to ${toDate}</p>
//         ${invoiceData?.invoice_number ? `
//           <p style="margin: 5px 0; font-size: 14px;">Invoice No: ${invoiceData.invoice_number}-001</p>
//         ` : ''}
//       </div>
//     </div>

//     <!-- GST Rate Notice -->
//     <div style="margin-bottom: 10px; padding: 8px; background-color: #f0f8ff; border-left: 4px solid #007bff;">
//       <p style="margin: 0; font-size: 12px; font-weight: bold;">
//         GST @ 5% under GTA services (SAC 9965)
//       </p>
//     </div>

//     <!-- GST Table for All Trips -->
//     <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10px;">
//       <thead style="background-color: #f8f9fa;">
//         <tr>
//           <th style="border: 1px solid #000; padding: 8px; text-align: center;">S.No</th>
//           <th style="border: 1px solid #000; padding: 8px;">Customer Name</th>
//           <th style="border: 1px solid #000; padding: 8px;">Description</th>
//           <th style="border: 1px solid #000; padding: 8px; text-align: center;">SAC Code</th>
//           <th style="border: 1px solid #000; padding: 8px; text-align: right;">Quantity (Trips)</th>
//           <th style="border: 1px solid #000; padding: 8px; text-align: right;">Rate (₹)</th>
//           <th style="border: 1px solid #000; padding: 8px; text-align: right;">Taxable Value (₹)</th>
//           <th style="border: 1px solid #000; padding: 8px; text-align: center;">GST Rate</th>
//           <th style="border: 1px solid #000; padding: 8px; text-align: right;">CGST @ 2.5% (₹)</th>
//           <th style="border: 1px solid #000; padding: 8px; text-align: right;">SGST @ 2.5% (₹)</th>
//           <th style="border: 1px solid #000; padding: 8px; text-align: right;">IGST (₹)</th>
//           <th style="border: 1px solid #000; padding: 8px; text-align: right;">Total (₹)</th>
//         </tr>
//       </thead>
//       <tbody>
//         ${gstRows.map((row, index) => {
//           // Find the original trip data to get customer name
//           const originalTrip = allTrips[index];
//           // Update description for GST compliance
//           const gstDescription = row.description.includes('sand') 
//             ? `Goods Transport Service - ${row.description.toUpperCase()}`
//             : `Goods Transport Service - ${row.description}`;
          
//           return `
//             <tr>
//               <td style="border: 1px solid #000; padding: 6px; text-align: center;">${row.s_no}</td>
//               <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">${originalTrip?.customer_name || row.description}</td>
//               <td style="border: 1px solid #000; padding: 6px;">${gstDescription}</td>
//               <td style="border: 1px solid #000; padding: 6px; text-align: center;">9965</td>
//               <td style="border: 1px solid #000; padding: 6px; text-align: right;">${row.quantity}</td>
//               <td style="border: 1px solid #000; padding: 6px; text-align: right;">${row.rate}</td>
//               <td style="border: 1px solid #000; padding: 6px; text-align: right;">${formatCurrency(row.taxable_value)}</td>
//               <td style="border: 1px solid #000; padding: 6px; text-align: center;">${row.gst_rate}</td>
//               <td style="border: 1px solid #000; padding: 6px; text-align: right;">${formatCurrency(row.cgst_amount)}</td>
//               <td style="border: 1px solid #000; padding: 6px; text-align: right;">${formatCurrency(row.sgst_amount)}</td>
//               <td style="border: 1px solid #000; padding: 6px; text-align: right;">${formatCurrency(row.igst_amount)}</td>
//               <td style="border: 1px solid #000; padding: 6px; text-align: right; font-weight: bold;">${formatCurrency(row.total_amount)}</td>
//             </tr>
//           `;
//         }).join('')}
//       </tbody>
//     </table>

//     <!-- Summary Section -->
//     <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #000; background-color: #f8f9fa;">
//       <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: bold;">Invoice Summary</h3>
//       <table style="width: 100%; font-size: 13px;">
//         <tr>
//           <td style="padding: 5px 0;"><strong>Total Customers:</strong></td>
//           <td style="padding: 5px 0; text-align: right;">${invoiceData.customers.length}</td>
//         </tr>
//         <tr>
//           <td style="padding: 5px 0;"><strong>Total Trips:</strong></td>
//           <td style="padding: 5px 0; text-align: right;">${allTrips.length}</td>
//         </tr>
//         <tr>
//           <td style="padding: 5px 0;"><strong>Total Taxable Value:</strong></td>
//           <td style="padding: 5px 0; text-align: right;">${formatCurrency(totals.total_taxable_value)}</td>
//         </tr>
//         <tr>
//           <td style="padding: 5px 0;"><strong>Total CGST @ 2.5%:</strong></td>
//           <td style="padding: 5px 0; text-align: right;">${formatCurrency(totals.total_cgst)}</td>
//         </tr>
//         <tr>
//           <td style="padding: 5px 0;"><strong>Total SGST @ 2.5%:</strong></td>
//           <td style="padding: 5px 0; text-align: right;">${formatCurrency(totals.total_sgst)}</td>
//         </tr>
//         <tr>
//           <td style="padding: 5px 0;"><strong>Total IGST:</strong></td>
//           <td style="padding: 5px 0; text-align: right;">${formatCurrency(totals.total_igst)}</td>
//         </tr>
//         <tr>
//           <td style="padding: 5px 0;"><strong>Total GST:</strong></td>
//           <td style="padding: 5px 0; text-align: right;">${formatCurrency(totals.total_gst)}</td>
//         </tr>
//         <tr style="border-top: 2px solid #000;">
//           <td style="padding: 8px 0;"><strong>Grand Total (Taxable + GST):</strong></td>
//           <td style="padding: 8px 0; text-align: right; font-weight: bold; font-size: 16px;">${formatCurrency(totals.grand_total)}</td>
//         </tr>
//       </table>
//     </div>

//     <!-- Legal Footer -->
//     <div style="margin-top: 30px; padding: 15px; border-top: 2px solid #000; text-align: center; font-size: 11px; color: #333; background-color: #f9f9f9;">
//       <p style="margin: 5px 0; font-weight: bold;">
//         This is a computer generated GST Tax Invoice.
//       </p>
//       <p style="margin: 5px 0;">
//         GST charged as per applicable GTA services under SAC 9965.
//       </p>
//       <p style="margin: 5px 0;">
//         Generated on ${new Date().toLocaleDateString('en-GB')} | Consolidated GST Invoice for multiple customers
//       </p>
//     </div>
//   </div>
// `;

//     const element = document.createElement('div');
//     element.innerHTML = combinedInvoiceContent;

//     const opt = {
//       margin: [10, 10, 10, 10],
//       filename: `GST_Invoice_${fromDate}_to_${toDate}.pdf`,
//       image: { type: 'jpeg', quality: 0.98 },
//       html2canvas: {
//         scale: 2,
//         useCORS: true,
//         letterRendering: true,
//         width: 1120,
//         height: 1584 // Double height for A4 landscape with more content
//       },
//       jsPDF: {
//         unit: 'mm',
//         format: 'a4',
//         orientation: 'landscape'
//       }
//     };

//     await html2pdf().set(opt).from(element).save();
//     toast.success(`Downloaded GST invoice`);
//   } catch (error) {
//     console.error('Error generating PDF:', error);
//     toast.error('Failed to generate PDF');
//   }
// };

//   const toggleCustomerExpansion = (customerId) => {
//     setExpandedCustomers(prev => ({
//       ...prev,
//       [customerId]: !prev[customerId]
//     }));
//   };

//   const backToSummary = () => {
//     setSelectedCustomer(null);
//     setDetailedView(false);
//   };

//   return (
//     <div className="max-w-7xl mx-auto p-6 space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div className="space-y-1">
//           <div className="flex items-center gap-2">
//             <FileSpreadsheet className="h-6 w-6 text-green-600" />
//             <h1 className="text-2xl font-bold text-gray-900">
//               GST Invoice Generator
//             </h1>
//           </div>
//           <p className="text-gray-600">
//             Generate GST invoices for customers with GST-enabled trips
//           </p>
//         </div>
//       </div>

//       {/* Date Range Selection */}
//       <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//         <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//           <Calendar className="h-5 w-5 text-blue-600" />
//           Select Date Range
//         </h2>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               From Date
//             </label>
//             <input
//               type="date"
//               value={fromDate}
//               onChange={(e) => setFromDate(e.target.value)}
//               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               To Date
//             </label>
//             <input
//               type="date"
//               value={toDate}
//               onChange={(e) => setToDate(e.target.value)}
//               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//             />
//           </div>
//         </div>

//         {/* Generate Button */}
//         <button
//           onClick={generateGSTInvoice}
//           disabled={loading || !fromDate || !toDate}
//           className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
//         >
//           {loading ? (
//             <>
//               <Loader className="h-5 w-5 animate-spin" />
//               Generating GST Invoice...
//             </>
//           ) : (
//             <>
//               <Download className="h-5 w-5" />
//               Generate GST Invoice
//             </>
//           )}
//         </button>
//       </div>

//       {/* Results Section */}
//       {invoiceData && !detailedView && (
//         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-xl font-semibold text-gray-900">
//               GST Invoice Summary
//             </h2>
//             <div className="flex items-center gap-4">
//               <div className="text-sm text-gray-600">
//                 <span className="font-semibold">{invoiceData.customers?.length || 0}</span> customers found
//                 {invoiceData.invoice_number && (
//                   <span className="ml-4">Invoice No: {invoiceData.invoice_number}</span>
//                 )}
//               </div>
//               <button
//                 onClick={downloadAllGSTInvoices}
//                 disabled={!invoiceData || !invoiceData.customers || invoiceData.customers.length === 0}
//                 className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
//               >
//                 <Download className="h-4 w-4" />
//                 Download All Invoices
//               </button>
//             </div>
//           </div>

//           {/* Summary Stats */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//             <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
//               <p className="text-sm text-blue-700 mb-1">Total Customers</p>
//               <p className="text-2xl font-bold text-blue-900">{invoiceData.summary?.total_customers || 0}</p>
//             </div>
//             <div className="bg-green-50 p-4 rounded-lg border border-green-100">
//               <p className="text-sm text-green-700 mb-1">Total Trips</p>
//               <p className="text-2xl font-bold text-green-900">{invoiceData.summary?.total_trips || 0}</p>
//             </div>
//             <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
//               <p className="text-sm text-purple-700 mb-1">Taxable Value</p>
//               <p className="text-2xl font-bold text-purple-900">
//                 ₹{invoiceData.summary?.total_taxable_value || '0.00'}
//               </p>
//             </div>
//             <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
//               <p className="text-sm text-orange-700 mb-1">Total GST</p>
//               <p className="text-2xl font-bold text-orange-900">
//                 ₹{invoiceData.summary?.total_gst_amount || '0.00'}
//               </p>
//             </div>
//           </div>

//           {/* Company Info */}
//           {invoiceData.company && (
//             <div className="mb-6 p-4 bg-gray-50 rounded-lg">
//               <h3 className="font-medium text-gray-900 mb-2">Company Information</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <p className="font-semibold text-gray-900">{invoiceData.company.name}</p>
//                   <p className="text-sm text-gray-600">{invoiceData.company.address}</p>
//                   <p className="text-sm text-gray-600">{invoiceData.company.city}, {invoiceData.company.state} - {invoiceData.company.pincode}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Phone: {invoiceData.company.phone}</p>
//                   <p className="text-sm text-gray-600 font-semibold">GSTIN: {invoiceData.company.gst_number}</p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Customers List */}
//           <div className="space-y-4">
//             {invoiceData.customers?.map((customer) => (
//               <div key={customer.customer_id} className="border border-gray-200 rounded-lg overflow-hidden">
//                 <div className="bg-gray-50 p-4 flex items-center justify-between hover:bg-gray-100 transition-colors">
//                   <div className="flex-1">
//                     <div className="flex items-center gap-3">
//                       <button
//                         onClick={() => toggleCustomerExpansion(customer.customer_id)}
//                         className="text-gray-500 hover:text-gray-700"
//                       >
//                         {expandedCustomers[customer.customer_id] ? (
//                           <ChevronUp className="h-5 w-5" />
//                         ) : (
//                           <ChevronDown className="h-5 w-5" />
//                         )}
//                       </button>
//                       <div>
//                         <h3 className="font-semibold text-gray-900">{customer.customer_name}</h3>
//                         <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
//                           <span>GST: {customer.gst_number || 'Not Provided'}</span>
//                           <span>State: {customer.state || customer.address || 'N/A'}</span>
//                           <span>Trips: {customer.summary?.total_trips || 0}</span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-4">
//                     <span className="font-bold text-lg">
//                       ₹{customer.summary?.total_amount || '0.00'}
//                     </span>
//                     <div className="flex gap-2">
//                       <button
//                         onClick={() => viewCustomerDetails(customer)}
//                         className="inline-flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
//                       >
//                         <Eye className="h-4 w-4" />
//                         View Details
//                       </button>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Expanded Details */}
//                 {expandedCustomers[customer.customer_id] && (
//                   <div className="p-4 border-t border-gray-200 bg-white">
//                     <h4 className="font-medium text-gray-900 mb-3">Materials Summary</h4>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                       {customer.materials?.map((material, index) => (
//                         <div key={index} className="bg-gray-50 p-3 rounded-lg">
//                           <p className="font-medium text-gray-900">{material.material_name}</p>
//                           <div className="flex justify-between text-sm text-gray-600 mt-2">
//                             <span>Quantity: {material.total_quantity}</span>
//                             <span className="font-semibold">₹{material.total_amount}</span>
//                           </div>
//                           <p className="text-xs text-gray-500 mt-1">{material.trip_count} trips</p>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Detailed Customer View */}
//       {detailedView && selectedCustomer && (
//         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//           <div className="flex items-center justify-between mb-6">
//             <div>
//               <button
//                 onClick={backToSummary}
//                 className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-2"
//               >
//                 ← Back to Summary
//               </button>
//               <h2 className="text-xl font-semibold text-gray-900">
//                 GST Invoice - {selectedCustomer.customer_name}
//               </h2>
//             </div>
//           </div>

//           {/* Customer Info */}
//           <div className="bg-blue-50 p-4 rounded-lg mb-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <p className="text-sm text-blue-700 mb-1">Customer Details</p>
//                 <p className="font-semibold text-gray-900">{selectedCustomer.customer_name}</p>
//                 {selectedCustomer.customers?.[0]?.address && (
//                   <p className="text-sm text-gray-600">{selectedCustomer.customers[0].address}</p>
//                 )}
//                 {selectedCustomer.customers?.[0]?.gst_number && (
//                   <p className="text-sm text-gray-600">GSTIN: {selectedCustomer.customers[0].gst_number}</p>
//                 )}
//                 {selectedCustomer.customers?.[0]?.phone && (
//                   <p className="text-sm text-gray-600">Phone: {selectedCustomer.customers[0].phone}</p>
//                 )}
//               </div>
//               <div className="text-right">
//                 <p className="text-sm text-blue-700 mb-1">Invoice Details</p>
//                 <p className="font-semibold text-gray-900">{selectedCustomer.invoice_number || 'GST-INVOICE'}</p>
//                 <p className="text-sm text-gray-600">Period: {fromDate} to {toDate}</p>
//                 <p className="text-sm text-gray-600">Date: {selectedCustomer.invoice_date || new Date().toLocaleDateString('en-GB')}</p>
//               </div>
//             </div>
//           </div>

//           {/* Trip Details Table */}
//           {selectedCustomer.trips && selectedCustomer.trips.length > 0 && (
//             <div className="mb-6 overflow-x-auto">
//               <h3 className="font-medium text-gray-900 mb-3">Trip Details</h3>
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trip No</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taxable Value (₹)</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST Rate</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST Amount (₹)</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total (₹)</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {selectedCustomer.trips.map((trip, index) => (
//                     <tr key={index} className="hover:bg-gray-50">
//                       <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
//                       <td className="px-4 py-3 text-sm text-gray-900">{trip.trip_number}</td>
//                       <td className="px-4 py-3 text-sm text-gray-900">
//                         {new Date(trip.date).toLocaleDateString('en-GB')}
//                       </td>
//                       <td className="px-4 py-3 text-sm text-gray-900">{trip.material}</td>
//                       <td className="px-4 py-3 text-sm text-gray-900 text-right">{trip.quantity}</td>
//                       <td className="px-4 py-3 text-sm text-gray-900 text-right">
//                         ₹{parseFloat(trip.taxable_amount).toLocaleString('en-IN')}
//                       </td>
//                       <td className="px-4 py-3 text-sm text-gray-900 text-center">{trip.gst_rate}</td>
//                       <td className="px-4 py-3 text-sm text-gray-900 text-right">
//                         ₹{parseFloat(trip.gst_amount).toLocaleString('en-IN')}
//                       </td>
//                       <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
//                         ₹{parseFloat(trip.total_amount).toLocaleString('en-IN')}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}

//           {/* Totals Section */}
//           {selectedCustomer.summary && (
//             <div className="bg-gray-50 p-6 rounded-lg">
//               <h3 className="font-medium text-gray-900 mb-4">Invoice Summary</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <div className="space-y-3">
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Total Trips:</span>
//                       <span className="font-semibold">{selectedCustomer.summary.total_trips}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Taxable Value:</span>
//                       <span className="font-semibold">₹{selectedCustomer.summary.taxable_value}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">GST Amount:</span>
//                       <span className="font-semibold">₹{selectedCustomer.summary.gst_amount}</span>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="border-l pl-6">
//                   <div className="space-y-3">
//                     <div className="flex justify-between text-xl">
//                       <span className="font-bold text-gray-900">Total Amount:</span>
//                       <span className="font-bold text-green-600">₹{selectedCustomer.summary.total_amount}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default GSTInvoiceGenerator;


import React, { useState, useEffect } from 'react';
import { Download, Calendar, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import api from "../api/client";
import { useAuth } from '../contexts/AuthContext';

const GSTInvoiceGenerator = () => {
  const { user } = useAuth();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set default date range to last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    setFromDate(thirtyDaysAgo.toISOString().split('T')[0]);
    setToDate(today.toISOString().split('T')[0]);
  }, []);

  const formatCurrency = (amount) => {
    const num = parseFloat(amount || 0);
    return num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const downloadGSTInvoice = async () => {
    if (!fromDate || !toDate) {
      toast.error('Please select date range');
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      toast.error('From date cannot be after to date');
      return;
    }

    setLoading(true);

    try {
      // Get GST invoice data from backend
      const res = await api.get(
        `/trips/gst-invoice-data?from_date=${fromDate}&to_date=${toDate}`
      );

      if (!res.data.success) {
        throw new Error(res.data.error || 'Failed to generate GST invoice');
      }

      const invoiceData = res.data.data;
      
      // Import html2pdf dynamically
      const html2pdf = (await import('html2pdf.js')).default;
      
      // Get company data
      const companyData = invoiceData?.company || {};

      // Prepare invoice content - EXACTLY as in your image
      const invoiceContent = `
        <div style="font-family: Arial, sans-serif; color: #000; width: 100%; box-sizing: border-box;">
          <!-- Header Section -->
           <div style="display:flex; align-items:center; gap:18px; margin-bottom:8px;">
      ${companyData?.logo ? `
        <img 
          src="${companyData.logo}" 
          alt="Company Logo"
          crossorigin="anonymous"
          style="
            width:90px;
            height:70px;
            object-fit:contain;
            object-position: center top;
            display:block;
          "
        />
      ` : ''}

      <div style="line-height:1.25;">
        <h1 style="margin:0; font-size:26px; font-weight:700;">
          ${companyData.name}
        </h1>
        <p style="margin:6px 0 2px 0; font-size:14px; color:#333;">
          ${companyData.address}
        </p>
        ${companyData.city || companyData.state || companyData.pincode ? `
          <p style="margin:2px 0; font-size:14px; color:#333;">
            ${companyData.city || ''}${companyData.state ? ', ' + companyData.state : ''}${companyData.pincode ? ' - ' + companyData.pincode : ''}
          </p>
        ` : ''}
        <p style="margin:0 0 2px 0; font-size:14px; color:#333;">
          CONTACT: ${companyData.phone} ${companyData.email ? '| EMAIL: ' + companyData.email : ''}
        </p>
        ${companyData.gst_number ? `
          <p style="margin:4px 0 0 0; font-size:14px; color:#333; font-weight:700;">
            GSTIN: ${companyData.gst_number}
          </p>
        ` : ''}
      </div>
    </div>
  </div>
            
            <!-- Invoice Header - Right Aligned -->
            <div style="text-align: right; margin-top: -100px;">
              <h2 style="font-size: 28px; font-weight: bold; margin: 0; color: #333; text-transform: uppercase;">
                GST INVOICE
              </h2>
              <p style="margin: 4px 0; font-size: 13px;">
                <strong>Invoice Type:</strong> Tax Invoice (GTA)
              </p>
              <p style="margin: 4px 0; font-size: 13px;">
                <strong>Place of Supply:</strong> Tamil Nadu
              </p>
              <p style="margin: 4px 0; font-size: 13px;">
                <strong>Period:</strong> ${new Date(fromDate).toLocaleDateString('en-GB')} to ${new Date(toDate).toLocaleDateString('en-GB')}
              </p>
              ${invoiceData?.invoice_number ? `
                <p style="margin: 4px 0; font-size: 13px;">
                  <strong>Invoice No:</strong> ${invoiceData.invoice_number}
                </p>
              ` : ''}
            </div>
            
            <!-- Horizontal Line -->
            <div style="border-bottom: 2px solid #000; margin: 20px 0;"></div>
          </div>

          <!-- GST Rate Notice -->
          <div style="margin-bottom: 15px; padding: 8px; background-color: #f0f8ff; border-left: 4px solid #007bff;">
            <p style="margin: 0; font-size: 12px; font-weight: bold;">
              GST @ 5% under GTA services (SAC 9965)
            </p>
          </div>

          <!-- GST Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10px;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">S.No</th>
                <th style="border: 1px solid #000; padding: 8px; font-weight: bold;">Customer Name</th>
                <th style="border: 1px solid #000; padding: 8px; font-weight: bold;">Description</th>
                <th style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold;">Quantity (Trips)</th>
                <th style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold;">Taxable Value (₹)</th>
                <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">GST Rate</th>
                <th style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold;">CGST @ 2.5% (₹)</th>
                <th style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold;">SGST @ 2.5% (₹)</th>
                <th style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold;">IGST (₹)</th>
                <th style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold;">Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${invoiceData.gst_table_rows && invoiceData.gst_table_rows.length > 0 
                ? invoiceData.gst_table_rows.map((row, index) => `
                  <tr>
                    <td style="border: 1px solid #000; padding: 6px; text-align: center;">${index + 1}</td>
                    <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">${row.customer_name}</td>
                    <td style="border: 1px solid #000; padding: 6px;">${row.description}</td>
                    <td style="border: 1px solid #000; padding: 6px; text-align: right;">${row.quantity}</td>
                    <td style="border: 1px solid #000; padding: 6px; text-align: right;">${formatCurrency(row.taxable_value)}</td>
                    <td style="border: 1px solid #000; padding: 6px; text-align: center;">${row.gst_rate}</td>
                    <td style="border: 1px solid #000; padding: 6px; text-align: right;">${formatCurrency(row.cgst_amount)}</td>
                    <td style="border: 1px solid #000; padding: 6px; text-align: right;">${formatCurrency(row.sgst_amount)}</td>
                    <td style="border: 1px solid #000; padding: 6px; text-align: right;">${formatCurrency(row.igst_amount)}</td>
                    <td style="border: 1px solid #000; padding: 6px; text-align: right; font-weight: bold;">${formatCurrency(row.total_amount)}</td>
                  </tr>
                `).join('')
                : `
                  <tr>
                    <td colspan="12" style="border: 1px solid #000; padding: 12px; text-align: center; font-style: italic;">
                      No GST trips found in selected period
                    </td>
                  </tr>
                `
              }
            </tbody>
          </table>

          <!-- Summary Section -->
          <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #000; background-color: #f8f9fa;">
            <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: bold;">Invoice Summary</h3>
            <table style="width: 100%; font-size: 13px;">
              <tr>
                <td style="padding: 5px 0;"><strong>Total Customers:</strong></td>
                <td style="padding: 5px 0; text-align: right;">${invoiceData.summary?.total_customers || 0}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;"><strong>Total Trips:</strong></td>
                <td style="padding: 5px 0; text-align: right;">${invoiceData.summary?.total_trips || 0}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;"><strong>Total Taxable Value:</strong></td>
                <td style="padding: 5px 0; text-align: right;">₹${formatCurrency(invoiceData.summary?.total_taxable_value)}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;"><strong>Total CGST @ 2.5%:</strong></td>
                <td style="padding: 5px 0; text-align: right;">₹${formatCurrency(invoiceData.summary?.total_cgst)}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;"><strong>Total SGST @ 2.5%:</strong></td>
                <td style="padding: 5px 0; text-align: right;">₹${formatCurrency(invoiceData.summary?.total_sgst)}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;"><strong>Total IGST:</strong></td>
                <td style="padding: 5px 0; text-align: right;">₹${formatCurrency(invoiceData.summary?.total_igst)}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;"><strong>Total GST:</strong></td>
                <td style="padding: 5px 0; text-align: right;">₹${formatCurrency(invoiceData.summary?.total_gst)}</td>
              </tr>
              <tr style="border-top: 2px solid #000;">
                <td style="padding: 8px 0;"><strong>Grand Total (Taxable + GST):</strong></td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; font-size: 16px;">
                  ₹${formatCurrency(invoiceData.summary?.grand_total)}
                </td>
              </tr>
            </table>
          </div>

          <!-- Legal Footer -->
          <div style="margin-top: 30px; padding: 15px; border-top: 2px solid #000; text-align: center; font-size: 11px; color: #333; background-color: #f9f9f9;">
            <p style="margin: 5px 0; font-weight: bold;">
              This is a computer generated GST Tax Invoice.
            </p>
            <p style="margin: 5px 0;">
              GST charged as per applicable GTA services under SAC 9965.
            </p>
            <p style="margin: 5px 0;">
              Generated on ${new Date().toLocaleDateString('en-GB')} | Consolidated GST Invoice for multiple customers
            </p>
          </div>
        </div>
      `;

      // Create HTML element
      const element = document.createElement('div');
      element.innerHTML = invoiceContent;

      // PDF options
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `GST_Invoice_${fromDate}_to_${toDate}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          width: 1120,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'landscape'
        }
      };

      // Generate and download PDF
      await html2pdf().set(opt).from(element).save();
      
      toast.success('GST Invoice downloaded successfully!');

    } catch (error) {
      console.error('Error generating GST invoice:', error);
      toast.error(error.response?.data?.error || 'Failed to generate GST invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Download className="h-6 w-6 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            GST Invoice Generator
          </h1>
        </div>
        <p className="text-gray-600">
          Download consolidated GST invoice for selected period
        </p>
      </div>

      {/* Date Range Selection */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Select Date Range
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
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
              onChange={(e) => setToDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={downloadGSTInvoice}
          disabled={loading || !fromDate || !toDate}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
        >
          {loading ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              Download GST Invoice PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default GSTInvoiceGenerator;