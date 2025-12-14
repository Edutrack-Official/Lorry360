import React, { useState, useEffect } from 'react';
import { 
  Download, 
  FileText, 
  User,
  Calendar,
  Search,
  Loader,
  Users,
  Building,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from "../api/client";
import { useAuth } from '../contexts/AuthContext';

// Invoice Generator Component with Collaboration Support
const InvoiceGenerator = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [collaborations, setCollaborations] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedCollaboration, setSelectedCollaboration] = useState('');
  const [selectedCollaborationId, setSelectedCollaborationId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentProgress, setCurrentProgress] = useState({ current: 0, total: 0 });
  const [invoiceType, setInvoiceType] = useState('customer');
  const [includeInactive, setIncludeInactive] = useState(false);

  const currentUserId = user?.userId || user?.id;

  useEffect(() => {
    fetchCustomers();
    fetchCollaborations();
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setFromDate(thirtyDaysAgo.toISOString().split('T')[0]);
    setToDate(today.toISOString().split('T')[0]);
  }, []);

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

  const fetchCollaborations = async () => {
    try {
      const res = await api.get('/collaborations/active');
      console.log("Collaboration fetch response:", res.data.data?.collaborations);
      
      const filteredCollaborations = (res.data.data?.collaborations || []).filter(collab => {
        return collab.from_owner_id?._id === currentUserId || collab.to_owner_id?._id === currentUserId;
      });
      
      setCollaborations(filteredCollaborations);
    } catch (error) {
      console.error('Error fetching collaborations:', error);
      toast.error('Error fetching collaborations');
    }
  };

  const getPartnerInfo = (collab) => {
    if (!currentUserId) return { partnerId: null, partnerName: '', partnerCompany: '', collaborationId: '' };
    
    if (collab.from_owner_id?._id === currentUserId) {
      return {
        partnerId: collab.to_owner_id?._id,
        partnerName: collab.to_owner_id?.name || '',
        partnerCompany: collab.to_owner_id?.company_name || '',
        collaborationId: collab._id || ''
      };
    } else {
      return {
        partnerId: collab.from_owner_id?._id,
        partnerName: collab.from_owner_id?.name || '',
        partnerCompany: collab.from_owner_id?.company_name || '',
        collaborationId: collab._id || ''
      };
    }
  };

  const generateInvoice = async (id = null, collaborationId = null) => {
    let requestUrl = '';
    
    if (invoiceType === 'customer') {
      const customer = id || selectedCustomer;
      if (!customer || !fromDate || !toDate) {
        toast.error('Please select customer and date range');
        return;
      }
      requestUrl = `/trips/invoice-data?customer_id=${customer}&from_date=${fromDate}&to_date=${toDate}`;
    } else {
      const collaboration = collaborationId || selectedCollaborationId;
      const partnerId = id || selectedCollaboration;
      
      if (!partnerId || !collaboration || !fromDate || !toDate) {
        toast.error('Please select collaboration partner and date range');
        return;
      }
      
      requestUrl = `/trips/collaboration-invoice-data?partner_owner_id=${partnerId}&collaboration_id=${collaboration}&from_date=${fromDate}&to_date=${toDate}&include_inactive=${includeInactive}`;
    }

    setLoading(true);
    try {
      const res = await api.get(requestUrl);    
      if (res.data.success) {
        setInvoiceData(res.data.data);
        console.log("Generated invoice data:", res.data.data);
        toast.success(`${invoiceType === 'customer' ? 'Customer' : 'Collaboration'} invoice data loaded successfully!`);
      } else {
        toast.error(res.data.error || 'Failed to generate invoice');
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      if(error.response?.data?.error){
        toast.error(error.response.data.error); 
      }
    }
    setLoading(false);
  };

  // Safe accessor functions
  const getSupplierName = () => invoiceData?.supplier?.name || '';
  const getSupplierAddress = () => invoiceData?.supplier?.full_address || '';
  const getSupplierPhone = () => invoiceData?.supplier?.phone || '';
  const getSupplierGST = () => invoiceData?.supplier?.gst_number || '';
  const getSupplierLogo = () => invoiceData?.supplier?.logo || '';
  
  const getCustomerName = () => invoiceData?.customer?.name || '';
  const getCustomerAddress = () => invoiceData?.customer?.address || '';
  const getCustomerPhone = () => invoiceData?.customer?.phone || '';
  
  const getPartnerName = () => invoiceData?.partner?.name || '';
  const getPartnerAddress = () => invoiceData?.partner?.full_address || '';
  const getPartnerPhone = () => invoiceData?.partner?.phone || '';
  const getPartnerGST = () => invoiceData?.partner?.gst_number || '';
  
  const getInvoiceNumber = () => invoiceData?.invoice_details?.invoice_number || '';
  const getInvoicePeriod = () => invoiceData?.invoice_details?.period || '';
  const getOpeningBalanceDate = () => invoiceData?.invoice_details?.opening_balance_date || '';
  
  const getTableHeaders = () => invoiceData?.table_data?.headers || [];
  const getTableRows = () => invoiceData?.table_data?.rows || [];
  
  const getSummary = () => invoiceData?.table_data?.summary || {};
  const getFinancialSummary = () => invoiceData?.financial_summary || {};
  const getAdditionalInfo = () => invoiceData?.additional_info || {};
  
  const isCollaboration = () => invoiceData?.invoice_details?.is_collaboration || false;



const generateAllInvoices = async () => {
  if (!fromDate || !toDate) {
    toast.error('Please select date range');
    return;
  }

  if (invoiceType === 'customer') {
    if (customers.length === 0) {
      toast.error('No customers found');
      return;
    }

    const localFilteredCustomers = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
    );
    
    const customersToProcess = localFilteredCustomers.length > 0 ? localFilteredCustomers : customers;
    
    await processAllItems(customersToProcess, 'customer');
  } else {
    if (collaborations.length === 0) {
      toast.error('No active collaborations found');
      return;
    }

    await processAllItems(collaborations, 'collaboration');
  }
};

const processAllItems = async (items, type) => {
  setLoadingAll(true);
  setCurrentProgress({ current: 0, total: items.length });
  
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    setCurrentProgress({ current: i + 1, total: items.length });

    try {
      let id, collaborationId, partnerName = '', customerName = '';
      
      if (type === 'customer') {
        id = item._id;
        customerName = item.name || '';
      } else {
        const partnerInfo = getPartnerInfo(item);
        id = partnerInfo.partnerId;
        collaborationId = partnerInfo.collaborationId;
        partnerName = partnerInfo.partnerName || '';
        
        // For collaborations, we need to use the partner name as the "customer" name in the PDF
        customerName = partnerName;
      }
      
      const res = await api.get(
        type === 'customer' 
          ? `/trips/invoice-data?customer_id=${id}&from_date=${fromDate}&to_date=${toDate}`
          : `/trips/collaboration-invoice-data?partner_owner_id=${id}&collaboration_id=${collaborationId}&from_date=${fromDate}&to_date=${toDate}&include_inactive=${includeInactive}`
      );
      
      if (res.data.success && res.data.data) {
        // Ensure we're passing the correct data to downloadPDF
        const pdfSuccess = await downloadPDF(
          res.data.data, 
          type === 'customer' ? customerName : null, // For customer invoices
          type === 'collaboration' ? partnerName : null // For collaboration invoices
        );
        
        if (pdfSuccess) {
          successCount++;
        } else {
          failCount++;
        }
      } else {
        failCount++;
        console.error(`No data returned for ${type}:`, res.data);
      }

      // Small delay between items to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`Error generating ${type} invoice:`, error);
      failCount++;
    }
  }

  setLoadingAll(false);
  setCurrentProgress({ current: 0, total: 0 });

  if (successCount > 0) {
    toast.success(`Successfully generated ${successCount} ${type} ${successCount === 1 ? 'invoice' : 'invoices'}`);
  }
  if (failCount > 0) {
    toast.error(`Failed to generate ${failCount} ${type} ${failCount === 1 ? 'invoice' : 'invoices'}`);
  }
};

// Also update the downloadPDF function to handle the data properly
const downloadPDF = async (invoiceData, customerName = null, partnerName = null) => {
  if (!invoiceData) {
    toast.error('No invoice data available');
    return false;
  }

  try {
    const html2pdf = (await import('html2pdf.js')).default;

    let invoiceContent = '';
    
    // Determine if it's a collaboration invoice
    const isCollaborationInvoice = invoiceData?.invoice_details?.is_collaboration || 
                                  invoiceData?.is_collaboration || false;
    
    // Get safe values
    const supplierName = invoiceData?.supplier?.name || '';
    const partnerNameFromData = invoiceData?.partner?.name || '';
    const customerNameFromData = invoiceData?.customer?.name || '';
    
    // Use provided names or fall back to data names
    const finalPartnerName = partnerName || partnerNameFromData;
    const finalCustomerName = customerName || customerNameFromData;
    
    if (isCollaborationInvoice) {
      invoiceContent = `
        <div style="font-family: Arial, sans-serif; color: #000; width: 100%; box-sizing: border-box;">
          <!-- Header Section -->
          <div style="margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 15px; page-break-inside: avoid; display: flex; justify-content: space-between; align-items: flex-start;">
            <!-- Left: Logo and Company Name -->
            <div style="display:flex; align-items:center; gap:18px; margin-bottom:8px;">
              ${invoiceData?.supplier?.logo ? `
                <img 
                  src="${invoiceData.supplier.logo}" 
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
                  ${supplierName}
                </h1>
                <p style="margin:6px 0 2px 0; font-size:14px; color:#333;">
                  ${invoiceData?.supplier?.full_address || ''}
                </p>
                <p style="margin:0 0 2px 0; font-size:14px; color:#333;">
                  CONTACT: ${invoiceData?.supplier?.phone || ''}
                </p>
                ${invoiceData?.supplier?.gst_number ? `
                  <p style="margin:4px 0 0 0; font-size:14px; color:#333; font-weight:700;">
                    GSTIN: ${invoiceData.supplier.gst_number}
                  </p>
                ` : ''}
              </div>
            </div>
            
            <!-- Right: Invoice Title -->
            <div style="text-align: right;">
              <h2 style="font-size: 32px; font-weight: bold; margin: 0; color: #333;">COLLABORATION STATEMENT</h2>
            </div>
          </div>

          <!-- Partner and Invoice Details -->
          <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #000; page-break-inside: avoid;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="width: 50%; vertical-align: top; padding-right: 20px;">
                  <strong style="font-size: 15px;">Collaboration With:</strong><br>
                  <span style="font-size: 14px; font-weight: bold;">${finalPartnerName}</span><br>
                  <span style="font-size: 14px;">${invoiceData?.partner?.full_address || ''}</span><br>
                  <strong style="font-size: 14px;">Phone:</strong> <span style="font-size: 14px;">${invoiceData?.partner?.phone || ''}</span>
                  ${invoiceData?.partner?.gst_number ? `<br><strong style="font-size: 14px;">GSTIN:</strong> <span style="font-size: 14px;">${invoiceData.partner.gst_number}</span>` : ''}
                </td>
                <td style="width: 50%; vertical-align: top; text-align: right;">
                  <strong style="font-size: 14px;">Statement No:</strong> <span style="font-size: 14px;">${invoiceData?.invoice_details?.invoice_number || ''}</span><br>
                  <strong style="font-size: 14px;">Period:</strong> <span style="font-size: 14px;">${invoiceData?.invoice_details?.period || ''}</span><br>
                  <strong style="font-size: 14px;">Opening Balance Date:</strong> <span style="font-size: 14px;">${invoiceData?.invoice_details?.opening_balance_date || ''}</span><br>
                  <strong style="font-size: 14px;">Statement Date:</strong> <span style="font-size: 14px;">${new Date().toLocaleDateString('en-GB')}</span>
                </td>
              </tr>
            </table>
          </div>

          <!-- Table Section -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
            <thead style="display: table-header-group;">
              <tr style="background-color: #f8f9fa;">
                ${(invoiceData?.table_data?.headers || []).map(header => 
                  `<th style="border: 1px solid #000; padding: 10px 8px; text-align: left; font-weight: bold; font-size: 13px;">${header}</th>`
                ).join('')}
              </tr>
            </thead>
            <tbody>
              ${(invoiceData?.table_data?.rows || []).map((row, index) => `
                <tr style="${row.is_balance_row ? 'background-color: #f0f0f0; font-weight: bold;' : ''} page-break-inside: avoid;">
                  <td style="border: 1px solid #000; padding: 9px 8px; font-size: 13px;">${row.s_no || ''}</td>
                  <td style="border: 1px solid #000; padding: 9px 8px; font-size: 13px;">${row.date ? new Date(row.date).toLocaleDateString('en-GB') : ''}</td>
                  <td style="border: 1px solid #000; padding: 9px 8px; font-size: 13px;">${row.particular}</td>
                  <td style="border: 1px solid #000; padding: 9px 8px; font-size: 13px;">${row.quantity || ''}</td>
                  <td style="border: 1px solid #000; padding: 9px 8px; font-size: 13px;">${row.location || ''}</td>
                  <td style="border: 1px solid #000; padding: 9px 8px; font-size: 13px;">${row.price || ''}</td>
                  <td style="border: 1px solid #000; padding: 9px 8px; font-size: 13px;">${row.no_of_loads || ''}</td>
                  <td style="border: 1px solid #000; padding: 9px 8px; font-size: 13px;">${row.total_amount || ''}</td>
                  <td style="border: 1px solid #000; padding: 9px 8px; font-size: 13px;">${row.amount_received || ''}</td>
                  <td style="border: 1px solid #000; padding: 9px 8px; font-weight: bold; font-size: 13px;">${row.balance}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Summary Section -->
          <div style="margin-top: 30px; page-break-inside: avoid; min-height: 150px;">
            <div style="float: right; width: 300px; border: 1px solid #000; padding: 15px; background-color: #f8f9fa;">
              <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Opening Balance:</strong> ${invoiceData?.table_data?.summary?.opening_balance || '₹0.00'}</p>
              <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Your Trips:</strong> ${invoiceData?.table_data?.summary?.total_my_trips_amount || '₹0'} (${invoiceData?.table_data?.summary?.total_my_trips || 0})</p>
              <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Partner Trips:</strong> ${invoiceData?.table_data?.summary?.total_partner_trips_amount || '₹0'} (${invoiceData?.table_data?.summary?.total_partner_trips || 0})</p>
              <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Net Trip Amount:</strong> ${invoiceData?.table_data?.summary?.net_trip_amount || '₹0'}</p>
              <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Your Payments:</strong> ${invoiceData?.table_data?.summary?.total_my_payments_amount || '₹0'}</p>
              <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Partner Payments:</strong> ${invoiceData?.table_data?.summary?.total_partner_payments_amount || '₹0'}</p>
              <p style="margin: 0; font-size: 15px;"><strong>Closing Balance:</strong> <strong>${invoiceData?.table_data?.summary?.closing_balance || '₹0.00'}</strong></p>
              <div style="margin-top: 10px; padding: 8px; background-color: ${(invoiceData?.financial_summary?.closing_balance || 0) === 0 ? '#e8f7e8' : (invoiceData?.financial_summary?.closing_balance || 0) > 0 ? '#fff3e0' : '#ffe0e0'}; border-radius: 4px;">
                <strong style="font-size: 14px;">${invoiceData?.table_data?.summary?.who_needs_to_pay || ''}</strong><br>
                <span style="font-size: 14px;">Amount: ${invoiceData?.table_data?.summary?.amount_to_pay || '₹0.00'}</span>
              </div>
            </div>
            <div style="clear: both;"></div>
          
            <!-- Footer -->
            <div style="margin-top: 40px; text-align: center; border-top: 1px solid #000; padding-top: 15px; padding-bottom: 15px;">
              <p style="margin: 0; font-size: 13px; color: #666;">Generated on ${new Date().toLocaleDateString('en-GB')} | ${invoiceData?.additional_info?.notes || ''} | ${invoiceData?.additional_info?.calculation_note || ''}</p>
            </div>
          </div>
        </div>
      `;
    } else {
      invoiceContent = `
        <div style="font-family: Arial, sans-serif; color: #000; width: 100%; box-sizing: border-box;">
          <!-- Header Section -->
          <div style="margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 15px; page-break-inside: avoid; display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="display:flex; align-items:center; gap:18px; margin-bottom:8px;">
              ${invoiceData?.supplier?.logo ? `
                <img 
                  src="${invoiceData.supplier.logo}" 
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
                  ${supplierName}
                </h1>
                <p style="margin:6px 0 2px 0; font-size:14px; color:#333;">
                  ${invoiceData?.supplier?.full_address || ''}
                </p>
                <p style="margin:0 0 2px 0; font-size:14px; color:#333;">
                  CONTACT: ${invoiceData?.supplier?.phone || ''}
                </p>
                ${invoiceData?.supplier?.gst_number ? `
                  <p style="margin:4px 0 0 0; font-size:14px; color:#333; font-weight:700;">
                    GSTIN: ${invoiceData.supplier.gst_number}
                  </p>
                ` : ''}
              </div>
            </div>
            
            <div style="text-align: right;">
              <h2 style="font-size: 32px; font-weight: bold; margin: 0; color: #333;">INVOICE</h2>
            </div>
          </div>

          <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #000; page-break-inside: avoid;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="width: 50%; vertical-align: top; padding-right: 20px;">
                  <strong style="font-size: 15px;">To:</strong><br>
                  <span style="font-size: 14px;">${finalCustomerName}</span><br>
                  <span style="font-size: 14px;">${invoiceData?.customer?.address || ''}</span><br>
                  <strong style="font-size: 14px;">Phone:</strong> <span style="font-size: 14px;">${invoiceData?.customer?.phone || ''}</span>
                </td>
                <td style="width: 50%; vertical-align: top; text-align: right;">
                  <strong style="font-size: 14px;">Invoice No:</strong> <span style="font-size: 14px;">${invoiceData?.invoice_details?.invoice_number || ''}</span><br>
                  <strong style="font-size: 14px;">Period:</strong> <span style="font-size: 14px;">${invoiceData?.invoice_details?.period || ''}</span><br>
                  <strong style="font-size: 14px;">Date:</strong> <span style="font-size: 14px;">${new Date().toLocaleDateString('en-GB')}</span>
                </td>
              </tr>
            </table>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
            <thead style="display: table-header-group;">
              <tr style="background-color: #f8f9fa;">
                ${(invoiceData?.table_data?.headers || []).map(header => 
                  `<th style="border: 1px solid #000; padding: 10px 8px; text-align: left; font-weight: bold; font-size: 13px;">${header}</th>`
                ).join('')}
              </tr>
            </thead>
            <tbody>
              ${(invoiceData?.table_data?.rows || []).map((row, index) => `
                <tr style="${row.is_balance_row ? 'background-color: #f0f0f0; font-weight: bold;' : ''} page-break-inside: avoid;">
                  <td style="border: 1px solid #000; padding: 9px 8px; font-size: 13px;">${row.s_no || ''}</td>
                  <td style="border: 1px solid #000; padding: 9px 8px; font-size: 13px;">${row.date ? new Date(row.date).toLocaleDateString('en-GB') : ''}</td>
                  <td style="border: 1px solid #000; padding: 9px 8px; font-size: 13px;">${row.particular}</td>
                  <td style="border: 1px solid #000; padding: 9px 8px; font-size: 13px;">${row.quantity || ''}</td>
                  <td style="border: 1px solid #000; padding: 9px 8px; font-size: 13px;">${row.location || ''}</td>
                  <td style="border: 1px solid #000; padding: 9px 8px; font-size: 13px;">${row.price || ''}</td>
                  <td style="border: 1px solid #000; padding: 9px 8px; font-size: 13px;">${row.no_of_loads || ''}</td>
                  <td style="border: 1px solid #000; padding: 9px 8px; font-size: 13px;">${row.total_amount || ''}</td>
                  <td style="border: 1px solid #000; padding: 9px 8px; font-size: 13px;">${row.amount_received || ''}</td>
                  <td style="border: 1px solid #000; padding: 9px 8px; font-weight: bold; font-size: 13px;">${row.balance}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 30px; page-break-inside: avoid; min-height: 150px;">
            <div style="float: right; width: 300px; border: 1px solid #000; padding: 15px; background-color: #f8f9fa;">
              <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Opening Balance:</strong> ${invoiceData?.table_data?.summary?.opening_balance || '₹0.00'}</p>
              <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Total Sales:</strong> ${invoiceData?.table_data?.summary?.total_sales_amount || '₹0'}</p>
              <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Total Received:</strong> ${invoiceData?.table_data?.summary?.total_received || '₹0'}</p>
              <p style="margin: 0; font-size: 15px;"><strong>Closing Balance:</strong> <strong>${invoiceData?.table_data?.summary?.closing_balance || '₹0.00'}</strong></p>
            </div>
            <div style="clear: both;"></div>
          
            <div style="margin-top: 40px; text-align: center; border-top: 1px solid #000; padding-top: 15px; padding-bottom: 15px;">
              <p style="margin: 0; font-size: 13px; color: #666;">Generated on ${new Date().toLocaleDateString('en-GB')} | Thank you for your business!</p>
            </div>
          </div>
        </div>
      `;
    }

    const element = document.createElement('div');
    element.innerHTML = invoiceContent;

    const opt = {
      margin: [10, 10, 10, 10],
      filename: isCollaborationInvoice 
        ? `Collaboration_Statement_${finalPartnerName}_${fromDate}_to_${toDate}.pdf`
        : `Invoice_${finalCustomerName}_${fromDate}_to_${toDate}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: isCollaborationInvoice ? 'landscape' : 'landscape'
      },
      pagebreak: { 
        mode: ['css', 'legacy'],
        avoid: 'tr'
      }
    };

    await html2pdf().set(opt).from(element).save();
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Failed to generate PDF');
    return false;
  }
};



  const resetInvoice = () => {
    setInvoiceData(null);
    setSelectedCustomer('');
    setSelectedCollaboration('');
    setSelectedCollaborationId('');
  };

  const handleCollaborationSelect = (collab) => {
    const partnerInfo = getPartnerInfo(collab);
    setSelectedCollaboration(partnerInfo.partnerId);
    setSelectedCollaborationId(partnerInfo.collaborationId);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const filteredCollaborations = collaborations.filter(collab => {
    const partnerInfo = getPartnerInfo(collab);
    return partnerInfo.partnerName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoice Generator</h1>
          <p className="text-gray-600">Generate customer invoices and collaboration statements</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={resetInvoice}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Reset
          </button>
          {invoiceData && (
            <button
              onClick={() => downloadPDF(
                invoiceData, 
                isCollaboration() ? null : getCustomerName(),
                isCollaboration() ? getPartnerName() : null
              )}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
          )}
        </div>
      </div>

      {/* Invoice Type Selection */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Select Invoice Type
        </h2>
        <div className="flex gap-4">
          <button
            onClick={() => {
              setInvoiceType('customer');
              resetInvoice();
            }}
            className={`px-4 py-2 rounded-lg border ${invoiceType === 'customer' 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer Invoice
            </div>
          </button>
          <button
            onClick={() => {
              setInvoiceType('collaboration');
              resetInvoice();
            }}
            className={`px-4 py-2 rounded-lg border ${invoiceType === 'collaboration' 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Collaboration Statement
            </div>
          </button>
        </div>
      </div>

      {/* Customer/Collaboration Selection & Date Range */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selection Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            {invoiceType === 'customer' ? (
              <>
                <User className="h-5 w-5 text-blue-600" />
                Select Customer
              </>
            ) : (
              <>
                <Building className="h-5 w-5 text-blue-600" />
                Select Collaboration Partner
              </>
            )}
          </h2>
          
          {/* Search Box */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={invoiceType === 'customer' ? "Search customers..." : "Search partners..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            {invoiceType === 'customer' ? (
              filteredCustomers.map(customer => (
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
                  {customer.site_addresses && customer.site_addresses.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      Sites: {customer.site_addresses.join(', ')}
                    </p>
                  )}
                </div>
              ))
            ) : (
              filteredCollaborations.map(collab => {
                const partnerInfo = getPartnerInfo(collab);
                const collabStatus = collab.status;

                return (
                  <div
                    key={collab._id}
                    onClick={() => handleCollaborationSelect(collab)}
                    className={`p-4 border rounded-lg mb-2 cursor-pointer transition-all ${
                      selectedCollaboration === partnerInfo.partnerId
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900">{partnerInfo.partnerName}</h3>
                    {partnerInfo.partnerCompany && (
                      <p className="text-sm text-gray-600">{partnerInfo.partnerCompany}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        collabStatus === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {collabStatus}
                      </span>
                      <span className="text-xs text-gray-500">
                        Since: {new Date(collab.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Date Range & Generate Buttons */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Select Date Range
          </h2>
          
          <div className="space-y-4">
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

           

            <button
              onClick={() => generateInvoice()}
              disabled={loading || (invoiceType === 'customer' ? !selectedCustomer : !selectedCollaboration)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Generating {invoiceType === 'customer' ? 'Invoice' : 'Statement'}...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Generate {invoiceType === 'customer' ? 'Customer Invoice' : 'Collaboration Statement'}
                </>
              )}
            </button>

            <button
              onClick={generateAllInvoices}
              disabled={loadingAll || !fromDate || !toDate}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loadingAll ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  {currentProgress.total > 0 && (
                    <span className="ml-2">
                      Processing {currentProgress.current} of {currentProgress.total}...
                    </span>
                  )}
                </>
              ) : (
                <>
                  <Users className="h-4 w-4" />
                  Generate All {invoiceType === 'customer' ? 'Customer Invoices' : 'Collaboration Statements'}
                </>
              )}
            </button>

            {loadingAll && currentProgress.total > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{currentProgress.current} / {currentProgress.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentProgress.current / currentProgress.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Preview */}
      {invoiceData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Invoice Header with Logo on Left */}
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-4">
                {getSupplierLogo() && (
                  <img
                    src={getSupplierLogo()}
                    alt="Company Logo"
                    className="w-24 h-20 object-contain mt-1"
                  />
                )}
                <div className="leading-tight">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {getSupplierName()}
                  </h1>
                  <p className="text-gray-600">{getSupplierAddress()}</p>
                  <p className="text-gray-600">CONTACT: {getSupplierPhone()}</p>
                  {getSupplierGST() && (
                    <p className="text-gray-700 font-semibold mt-1">
                      GSTIN: <span className="font-bold">{getSupplierGST()}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <h2 className="text-3xl font-bold text-gray-800 tracking-wide">
                  {isCollaboration() ? 'COLLABORATION STATEMENT' : 'INVOICE'}
                </h2>
                {isCollaboration() && (
                  <p className="text-sm text-gray-600 mt-2">
                    Period: {getInvoicePeriod()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Customer/Partner & Invoice Info */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {isCollaboration() ? 'Collaboration With:' : 'Bill To:'}
                </h3>
                <div className="text-gray-600">
                  {isCollaboration() ? (
                    <>
                      <p className="font-medium text-lg">{getPartnerName()}</p>
                      <p>{getPartnerAddress()}</p>
                      <p>Phone: {getPartnerPhone()}</p>
                      {getPartnerGST() && (
                        <p className="font-semibold">GSTIN: {getPartnerGST()}</p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="font-medium">{getCustomerName()}</p>
                      <p>{getCustomerAddress()}</p>
                      <p>Phone: {getCustomerPhone()}</p>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Details:</h3>
                <div className="text-gray-600">
                  <p><strong>{isCollaboration() ? 'Statement No:' : 'Invoice No:'}</strong> {getInvoiceNumber()}</p>
                  <p><strong>Period:</strong> {getInvoicePeriod()}</p>
                  {isCollaboration() && (
                    <p><strong>Opening Balance Date:</strong> {new Date(getOpeningBalanceDate()).toLocaleDateString()}</p>
                  )}
                  <p><strong>Generated:</strong> {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Table */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Transaction Details
              </h2>
              {isCollaboration() && (
                <div className="text-sm text-gray-600">
                  <p>{getAdditionalInfo().calculation_note}</p>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    {getTableHeaders().map((header, index) => (
                      <th key={index} className="p-3 text-left text-sm font-semibold text-gray-900 border">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {getTableRows().map((row, index) => (
                    <tr key={index} className={`border-b hover:bg-gray-50 ${row.is_balance_row ? 'bg-gray-100 font-semibold' : ''}`}>
                      <td className="p-3 border">{row.s_no || ''}</td>
                      <td className="p-3 border">{row.date ? new Date(row.date).toLocaleDateString('en-GB') : ''}</td>
                      <td className="p-3 border">{row.particular}</td>
                      <td className="p-3 border">{row.quantity || ''}</td>
                      <td className="p-3 border">{row.location || ''}</td>
                      <td className="p-3 border">{row.price || ''}</td>
                      <td className="p-3 border">{row.no_of_loads || ''}</td>
                      <td className="p-3 border font-medium">{row.total_amount || ''}</td>
                      <td className="p-3 border">{row.amount_received || ''}</td>
                      <td className="p-3 border font-semibold">{row.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h2>
            {isCollaboration() ? (
              <div className="space-y-6">
                {/* Summary Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Opening Balance</p>
                    <p className="text-xl font-bold text-blue-600">{getSummary().opening_balance || '₹0.00'}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Your Trips</p>
                    <p className="text-xl font-bold text-green-600">{getSummary().total_my_trips_amount || '₹0'}</p>
                    <p className="text-xs text-gray-500 mt-1">({getSummary().total_my_trips || 0} trips)</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-gray-600">Partner Trips</p>
                    <p className="text-xl font-bold text-yellow-600">{getSummary().total_partner_trips_amount || '₹0'}</p>
                    <p className="text-xs text-gray-500 mt-1">({getSummary().total_partner_trips || 0} trips)</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Closing Balance</p>
                    <p className="text-xl font-bold text-purple-600">{getSummary().closing_balance || '₹0.00'}</p>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Your Payments to Partner</p>
                    <p className="text-lg font-bold text-red-600">{getSummary().total_my_payments_amount || '₹0'}</p>
                    <p className="text-xs text-gray-500 mt-1">({getSummary().total_my_payments || 0} payments)</p>
                  </div>
                  <div className="p-4 bg-teal-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Partner Payments to You</p>
                    <p className="text-lg font-bold text-teal-600">{getSummary().total_partner_payments_amount || '₹0'}</p>
                    <p className="text-xs text-gray-500 mt-1">({getSummary().total_partner_payments || 0} payments)</p>
                  </div>
                </div>

                {/* Final Settlement */}
                <div className={`p-6 rounded-lg ${getFinancialSummary().closing_balance === 0 
                  ? 'bg-green-50 border border-green-200' 
                  : getFinancialSummary().closing_balance > 0 
                    ? 'bg-orange-50 border border-orange-200'
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Settlement Summary</h3>
                  <p className="text-lg mb-2">
                    <span className="font-semibold">{getSummary().who_needs_to_pay || ''}</span>
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Amount to be settled:</p>
                      <p className="text-2xl font-bold">
                        {getSummary().amount_to_pay || '₹0.00'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Net Trip Amount: {getSummary().net_trip_amount || '₹0'}</p>
                      <p className="text-sm text-gray-600">Net Payment Amount: {getSummary().net_payment_amount || '₹0'}</p>
                    </div>
                  </div>
                </div>

                {/* Calculation Note */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 italic">
                    {getAdditionalInfo().calculation_note}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {getFinancialSummary().closing_balance > 0 
                      ? getAdditionalInfo().positive_balance_note
                      : getAdditionalInfo().negative_balance_note
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Opening Balance</p>
                  <p className="text-xl font-bold text-blue-600">{getSummary().opening_balance || '₹0.00'}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Sales</p>
                  <p className="text-xl font-bold text-green-600">{getSummary().total_sales_amount || '₹0'}</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Received</p>
                  <p className="text-xl font-bold text-yellow-600">{getSummary().total_received || '₹0'}</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Closing Balance</p>
                  <p className="text-xl font-bold text-purple-600">{getSummary().closing_balance || '₹0.00'}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default InvoiceGenerator;