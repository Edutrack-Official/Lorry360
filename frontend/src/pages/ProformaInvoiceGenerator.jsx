import React, { useState, useEffect } from 'react';
import { 
  Download, 
  FileText, 
  User,
  Plus,
  Trash2,
  Search,
  MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from "../api/client";
import { useAuth } from '../contexts/AuthContext';

const ProformaInvoiceGenerator = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [useCustomCustomer, setUseCustomCustomer] = useState(false);
  const [customCustomer, setCustomCustomer] = useState({
    name: '',
    address: '',
    phone: '',
    // Removed siteAddress from customCustomer since it's now a common field
  });
  const [siteAddress, setSiteAddress] = useState(''); // Common field for all customers
  const [invoiceItems, setInvoiceItems] = useState([
    { id: 1, description: '', quantity: 1, unit: '', rate: 0, amount: 0 }
  ]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
    // Set default invoice date to today
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    // Generate a simple invoice number
      setInvoiceNumber(`P-${Math.floor(1000 + Math.random() * 900)}`);
    // Set default payment terms
    setPaymentTerms('50% advance payment, 50% before delivery.');
    // Set default notes
    setNotes('This is a proforma invoice and not a demand for payment. Prices are subject to change without prior notice. Valid for 15 days from the date of issue.');
  }, []);

  // Get company details from auth user
  const getCompanyDetails = () => {
    if (!user) return {};
    console.log("user",user)
    return {
      name: user.company_name,
      address: user.address,
      phone: user.phone ,
      email: user.email,
      city: user.city,
      state: user.state,
      pincode: user.pincode,
      website: user.website || 'www.yourcompany.com'
    };
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get(`/customers`);
      const customers = res.data.data.customers || [];
      setCustomers(customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Error fetching customers');
    }
  };

  // Calculate amount when quantity or rate changes
  useEffect(() => {
    const updatedItems = invoiceItems.map(item => ({
      ...item,
      amount: item.quantity * item.rate
    }));
    setInvoiceItems(updatedItems);
  }, [invoiceItems]);

  // Add new item at the top
  const addInvoiceItem = () => {
    const newItem = {
      id: Date.now(),
      description: '',
      quantity: 1,
      unit: '',
      rate: 0,
      amount: 0
    };
    setInvoiceItems([newItem, ...invoiceItems]);
  };

  const removeInvoiceItem = (id) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter(item => item.id !== id));
    }
  };

  const updateInvoiceItem = (id, field, value) => {
    const updatedItems = invoiceItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setInvoiceItems(updatedItems);
  };

  const getSelectedCustomerDetails = () => {
    if (useCustomCustomer) {
      return customCustomer;
    }
    return customers.find(customer => customer._id === selectedCustomer) || {};
  };

  const calculateSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const downloadProformaPDF = () => {
    const customerDetails = getSelectedCustomerDetails();
    const companyDetails = getCompanyDetails();
    
    if ((!selectedCustomer && !useCustomCustomer) || !customerDetails.name) {
      toast.error('Please select or enter customer details');
      return;
    }

    if (invoiceItems.some(item => !item.description || item.amount === 0)) {
      toast.error('Please fill all item details');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to download PDF');
      return;
    }

    const proformaContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Proforma Invoice ${invoiceNumber}</title>
        <style>
          @media print {
            .page-break {
              page-break-before: always;
              break-before: page;
            }
            .keep-together {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .section-break {
              page-break-after: always;
              break-after: page;
            }
            .force-page-break {
              page-break-before: always;
            }
            .no-break {
              page-break-inside: avoid;
              break-inside: avoid;
            }
          }
          
          body { 
            font-family: Arial, sans-serif; 
            margin: 15px; 
            color: #000;
            line-height: 1.4;
            font-size: 12px;
          }
          
          .header { 
            text-align: center; 
            margin-bottom: 15px; 
            border-bottom: 2px solid #000;
            padding-bottom: 12px;
            page-break-after: avoid;
          }
          
          .company-name { 
            font-size: 22px; 
            font-weight: bold; 
            margin-bottom: 6px; 
            color: #000;
          }
          
          .company-contact {
            font-size: 11px;
            margin-bottom: 4px;
          }
          
          .document-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin: 12px 0;
            text-align: center;
            page-break-before: avoid;
          }
          
          .info-section { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 15px;
            padding: 12px;
            border: 1px solid #000;
            page-break-inside: avoid;
          }
          
          /* Improved table styling for page breaks */
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 15px;
          }
          
          th, td { 
            border: 1px solid #000; 
            padding: 6px; 
            text-align: left; 
            font-size: 10px;
          }
          
          th { 
            background-color: #f8f9fa; 
            font-weight: bold;
          }
          
          /* Ensure table rows don't break across pages */
          tbody tr {
            page-break-inside: avoid;
            page-break-after: auto;
            break-inside: avoid;
          }
          
          thead {
            display: table-header-group;
          }
          
          tfoot {
            display: table-footer-group;
          }
          
          .summary-section {
            margin-top: 15px;
            page-break-inside: avoid;
          }
          
          .summary-row {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 5px;
          }
          
          .summary-label {
            font-weight: bold;
            width: 120px;
            text-align: right;
            padding-right: 10px;
          }
          
          .summary-value {
            font-weight: bold;
            width: 100px;
            text-align: right;
          }
          
          .footer { 
            margin-top: 20px; 
            text-align: center; 
            border-top: 1px solid #000;
            padding-top: 12px;
            font-size: 10px;
            page-break-before: avoid;
          }
          
          .notes-section {
            margin-top: 15px;
            page-break-inside: avoid;
          }
          
          .notes {
            padding: 10px;
            border: 1px dashed #000;
            background-color: #f9f9f9;
            margin-bottom: 10px;
            font-size: 10px;
          }
          
          .payment-terms {
            padding: 10px;
            border: 1px solid #000;
            background-color: #f0f8ff;
            font-size: 10px;
          }
          
          .section-title {
            font-weight: bold;
            margin-bottom: 5px;
            color: #333;
            font-size: 11px;
          }
          
          .page-container {
            min-height: 95vh;
            display: flex;
            flex-direction: column;
          }
          
          .content-section {
            flex: 1;
          }
          
          .footer-section {
            margin-top: auto;
          }
          
          @media print {
            body { margin: 10px; }
            .header { margin-bottom: 10px; }
            .info-section { margin-bottom: 10px; }
            
            /* Better table printing behavior */
            table { 
              page-break-inside: auto;
            }
            tr { 
              page-break-inside: avoid;
              page-break-after: auto;
            }
            thead {
              display: table-header-group;
            }
            tfoot {
              display: table-footer-group;
            }
            
            /* Ensure notes and payment terms stay with table when possible */
            .table-notes-container {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="page-container">
          <!-- First Page -->
          <div class="header">
            <div class="company-name">${companyDetails.name}</div>
            <div class="company-contact">${companyDetails.address}</div>
            <div class="company-contact">${companyDetails.city}${companyDetails.state ? ', ' + companyDetails.state : ''}${companyDetails.pincode ? ' - ' + companyDetails.pincode : ''}</div>
            <div class="company-contact">CONTACT: ${companyDetails.phone} | EMAIL: ${companyDetails.email}</div>
          </div>

          <div class="document-title">PROFORMA INVOICE</div>

          <div class="info-section keep-together">
            <div>
              <strong>To:</strong><br>
              ${customerDetails.name}<br>
              ${customerDetails.address || ''}<br>
              ${customerDetails.phone ? `<strong>Phone:</strong> ${customerDetails.phone}` : ''}
              ${siteAddress ? `<br><br><strong>Site Address:</strong><br>${siteAddress}` : ''}
            </div>
            <div style="text-align: right;">
              <strong>Invoice No:</strong> ${invoiceNumber}<br>
              <strong>Date:</strong> ${new Date(invoiceDate).toLocaleDateString()}<br>
            </div>
          </div>

          <div class="content-section">
            <table>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Rate (₹)</th>
                  <th>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${invoiceItems.map((item, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>${item.unit}</td>
                    <td>${item.rate.toFixed(2)}</td>
                    <td>${item.amount.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="summary-section">
              <div class="summary-row">
                <div class="summary-label">Total:</div>
                <div class="summary-value">₹${calculateSubtotal().toFixed(2)}</div>
              </div>
            </div>

            <!-- Notes and Payment Terms - Kept together with table -->
            <div class="table-notes-container no-break">
              ${paymentTerms ? `
                <div class="payment-terms">
                  <div class="section-title">Payment Terms:</div>
                  ${paymentTerms.split('\n').map(term => term.trim()).filter(term => term).map(term => `${term}<br>`).join('')}
                </div>
              ` : ''}
              
              ${notes ? `
                <div class="notes">
                  <div class="section-title">Notes:</div>
                  ${notes.split('\n').map(note => note.trim()).filter(note => note).map(note => `${note}<br>`).join('')}
                </div>
              ` : ''}
            </div>
          </div>

          <div class="footer-section">
            <div class="footer">
              <p>For Queries: ${companyDetails.phone} | ${companyDetails.email}</p>
            </div>
          </div>
        </div>

        <script>
          setTimeout(() => {
            window.print();
            setTimeout(() => {
              window.close();
            }, 1000);
          }, 500);
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(proformaContent);
    printWindow.document.close();
    
    toast.success('Proforma Invoice generated successfully!');
  };

  const resetForm = () => {
    setSelectedCustomer('');
    setUseCustomCustomer(false);
    setCustomCustomer({ name: '', address: '', phone: '' });
    setSiteAddress(''); // Reset site address
    setInvoiceItems([{ id: 1, description: '', quantity: 1, unit: '', rate: 0, amount: 0 }]);
    setInvoiceNumber(`P-${Math.floor(100 + Math.random() * 900)}`);
    setPaymentTerms('50% advance payment, 50% before delivery.');
    setNotes('This is a proforma invoice and not a demand for payment. Prices are subject to change without prior notice. Valid for 15 days from the date of issue.');
  };

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proforma Invoice Generator</h1>
          <p className="text-gray-600">Generate proforma invoices for customer estimates</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={resetForm}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            onClick={downloadProformaPDF}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="h-4 w-4" />
            Download Proforma
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Selection */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Customer Information
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={!useCustomCustomer}
                  onChange={() => setUseCustomCustomer(false)}
                  className="text-blue-600"
                />
                Select Existing Customer
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={useCustomCustomer}
                  onChange={() => setUseCustomCustomer(true)}
                  className="text-blue-600"
                />
                Enter Custom Customer
              </label>
            </div>

            {!useCustomCustomer ? (
              <>
                {/* Search Box */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto">
                  {filteredCustomers.map(customer => (
                    <div
                      key={customer._id}
                      onClick={() => setSelectedCustomer(customer._id)}
                      className={`p-4 border rounded-lg mb-2 cursor-pointer transition-all ${
                        selectedCustomer === customer._id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                      <p className="text-sm text-gray-600">{customer.phone}</p>
                      <p className="text-sm text-gray-500 truncate">{customer.address}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={customCustomer.name}
                    onChange={(e) => setCustomCustomer({...customCustomer, name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={customCustomer.address}
                    onChange={(e) => setCustomCustomer({...customCustomer, address: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Enter customer address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={customCustomer.phone}
                    onChange={(e) => setCustomCustomer({...customCustomer, phone: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter customer phone"
                  />
                </div>
              </div>
            )}

            {/* Site Address Section - Common for both customer types */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                Site Address (Optional)
              </h3>
              <textarea
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Enter site/project address where goods/services will be delivered"
              />
              <p className="text-sm text-gray-500 mt-2">
                This will appear separately from the customer's address on the invoice
              </p>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Invoice Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Number
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter invoice number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-lg font-semibold text-blue-800 text-center">
                Subtotal: ₹{calculateSubtotal().toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Items */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Items Details</h2>
          <button
            onClick={addInvoiceItem}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        </div>

        <div className="space-y-4">
          {invoiceItems.map((item, index) => (
            <div key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end p-4 border border-gray-200 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateInvoiceItem(item.id, 'description', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Item description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateInvoiceItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <input
                  type="text"
                  value={item.unit}
                  onChange={(e) => updateInvoiceItem(item.id, 'unit', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Unit"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate (₹)
                </label>
                <input
                  type="number"
                  value={item.rate}
                  onChange={(e) => updateInvoiceItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="text"
                  value={item.amount.toFixed(2)}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div className="flex justify-center">
                {invoiceItems.length > 1 && (
                  <button
                    onClick={() => removeInvoiceItem(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes and Payment Terms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Terms */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Terms (Optional)</h2>
          <textarea
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            rows="4"
            placeholder="Enter payment terms (e.g., 50% advance, 50% before delivery, Net 30 days, etc.)"
          />
        </div>

        {/* Notes */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes (Optional)</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            rows="4"
            placeholder="Enter additional notes, terms and conditions, validity period, etc."
          />
        </div>
      </div>
    </div>
  );
};

export default ProformaInvoiceGenerator;