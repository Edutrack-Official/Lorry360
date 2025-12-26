import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute, { OwnerRoute } from './AdminRoute'; // Add this import
import Lorries from './pages/Lorries/Lorries';
import ManageLorryForm from './pages/Lorries/ManageLorryForm';
import NotFound from './pages/NotFound';
import Customers from './pages/Customers/Customers';
import ManageCustomerForm from './pages/Customers/ManageCustomerForm';
import Crushers from './pages/Crushers/Crushers';
import ManageCrusherForm from './pages/Crushers/ManageCrusherForm';
import Owners from './pages/Owners/Owners';
import ManageOwnerForm from './pages/Owners/ManageOwnerForm';
import LorryTrips from './pages/Lorries/LorryTrips';
import TripForm from './pages/Lorries/TripForm';
import Drivers from './pages/Drivers/Drivers';
import ManageDriverForm from './pages/Drivers/ManageDriverForm';
import DriverDetails from './pages/Drivers/DriverDetails';
import AddAttendance from './pages/Drivers/ManageAttendanceForm';
import ManageAttendanceForm from './pages/Drivers/ManageAttendanceForm';
import CollaborationDashboard from './pages/Collaboration/CollaborationDashboard';
import CollaboratorsTab from './pages/Collaboration/CollaboratorsTab';
import CollaborationRequestsTab from './pages/Collaboration/CollaborationRequestsTab';
import ExpenseForm from './pages/Lorries/ExpenseForm';
import LorryExpenses from './pages/Lorries/LorryExpenses';
import LorryDetails from './pages/Lorries/LorryDetails';
import CustomerDetails from './pages/Customers/CustomerDetails';
import CustomerExpenses from './pages/Customers/CustomerTrips';
import CustomerTrips from './pages/Customers/CustomerTrips';
import CustomerPayments from './pages/Customers/CustomerPayments';
import CustomerTripForm from './pages/Customers/CustomerTripForm';
import CustomerPaymentForm from './pages/Customers/CustomerPaymentForm';
import CrusherTrips from './pages/Crushers/CrusherTrips';
import CrusherPayments from './pages/Crushers/CrusherPayments';
import CrusherDetails from './pages/Crushers/CrusherDetails';
import SettlementTab from './pages/Settlement/SettlementTab';
import CrusherTripForm from './pages/Crushers/CrusherTripForm';
import InvoiceGenerator from './pages/InvoiceGenerator';
import ProformaInvoiceGenerator from './pages/ProformaInvoiceGenerator';
import CrusherPaymentForm from './pages/Crushers/CrusherPaymentForm';
import Reminders from './pages/Reminders/Reminders';
import ManageReminderForm from './pages/Reminders/ManageReminderForm';
import ReminderDetails from './pages/Reminders/ReminderDetails';
import ForgotPassword from './pages/ForgotPassword';
import CollaborationListPage from './pages/Partner/CollaborationListPage';
import CollaborationDetailsPage from './pages/Partner/CollaborationDetailsPage';
import PartnerPaymentForm from './pages/Partner/PartnerPaymentForm';
import Bunks from './pages/Bunks/Bunks';
import ManageBunkForm from './pages/Bunks/ManageBunkForm';
import BunkDetails from './pages/Bunks/BunkDetails';
import BunkExpenses from './pages/Bunks/BunkExpenses';
import BunkPayments from './pages/Bunks/BunkPayments';
import BunkPaymentForm from './pages/Bunks/BunkPaymentForm';
import ProfilePage from './pages/ProfilePage';
import CollaborationInvoiceGenerator from './pages/CollaborationInvoiceGenerator';
import GSTInvoiceGenerator from './pages/GSTInvoiceGenerator';



function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />

     

            {/* All other routes with Layout */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      {/* Dashboard */}
                      <Route path="/dashboard" element={<OwnerRoute><Dashboard /></OwnerRoute>} />
                      <Route path="/profile" element={<OwnerRoute><ProfilePage /></OwnerRoute>} />

                      {/* Lorries - OWNER ONLY */}
                      <Route path="/lorries" element={<OwnerRoute><Lorries /></OwnerRoute>} />
                      <Route path="/lorries/create" element={<OwnerRoute><ManageLorryForm /></OwnerRoute>} />
                      <Route path="/lorries/edit/:id" element={<OwnerRoute><ManageLorryForm /></OwnerRoute>} />
                      <Route path="/invoice" element={<OwnerRoute><InvoiceGenerator /></OwnerRoute>} />
                      <Route path="/gst-invoice" element={<OwnerRoute><GSTInvoiceGenerator /></OwnerRoute>} />
                      <Route path="/proinvoice" element={<OwnerRoute><ProformaInvoiceGenerator /></OwnerRoute>} />



                      <Route path="/reminders" element={<OwnerRoute><Reminders /></OwnerRoute>} />
                      <Route path="/reminders/edit/:id" element={<OwnerRoute><ManageReminderForm /></OwnerRoute>} />
                      <Route path="/reminders/create" element={<OwnerRoute><ManageReminderForm /></OwnerRoute>} />
                      <Route path="/reminders/:id" element={<OwnerRoute><ReminderDetails /></OwnerRoute>} />


                      <Route path="/partners" element={<OwnerRoute><CollaborationListPage /></OwnerRoute>} />
                      <Route path="/partners/collaboration/:partnerId" element={<OwnerRoute><CollaborationDetailsPage /></OwnerRoute>} />

                      <Route path="/partners/:partnerId/payments/create" element={<OwnerRoute><PartnerPaymentForm /></OwnerRoute>} />


                      <Route path="/partners/:partnerId/payments/edit/:paymentId" element={<PartnerPaymentForm />} />

                      {/* Lorry Details with nested routes - OWNER ONLY */}
                      <Route path="/lorries/:lorryId" element={<OwnerRoute><LorryDetails /></OwnerRoute>}>
                        <Route path="trips" element={<LorryTrips />} />
                        <Route path="expenses" element={<LorryExpenses />} />
                      </Route>

                      {/* Standalone forms - OWNER ONLY */}
                      <Route path="/trips/create" element={<OwnerRoute><TripForm /></OwnerRoute>} />
                      <Route path="/trips/edit/:tripId" element={<OwnerRoute><TripForm /></OwnerRoute>} />
                      <Route path="/expenses/create" element={<OwnerRoute><ExpenseForm /></OwnerRoute>} />
                      <Route path="/expenses/edit/:expenseId" element={<OwnerRoute><ExpenseForm /></OwnerRoute>} />

                      {/* Customers Management - OWNER ONLY */}
                      <Route path="/customers" element={<OwnerRoute><Customers /></OwnerRoute>} />
                      <Route path="/customers/create" element={<OwnerRoute><ManageCustomerForm /></OwnerRoute>} />
                      <Route path="/customers/edit/:id" element={<OwnerRoute><ManageCustomerForm /></OwnerRoute>} />
                      <Route path="customers/:customerId" element={<OwnerRoute><CustomerDetails /></OwnerRoute>}>
                        <Route index element={<Navigate to="trips" replace />} />
                        <Route path="trips" element={<CustomerTrips />} />
                        <Route path="payments" element={<CustomerPayments />} />
                      </Route>
                      <Route path="/customers/:customerId/trips/create" element={<OwnerRoute><CustomerTripForm /></OwnerRoute>} />
                      <Route path="/customers/:customerId/payments/create" element={<OwnerRoute><CustomerPaymentForm /></OwnerRoute>} />
                      <Route path="/customers/:customerId/payments/edit/:paymentId" element={<OwnerRoute><CustomerPaymentForm /></OwnerRoute>} />


                      {/* Crushers Management - OWNER ONLY */}
                      <Route path="/crushers" element={<OwnerRoute><Crushers /></OwnerRoute>} />
                      <Route path="/crushers/create" element={<OwnerRoute><ManageCrusherForm /></OwnerRoute>} />
                      <Route path="/crushers/edit/:id" element={<OwnerRoute><ManageCrusherForm /></OwnerRoute>} />
                      <Route path="/crushers/:crusherId" element={<OwnerRoute><CrusherDetails /></OwnerRoute>}>
                        <Route index element={<Navigate to="trips" replace />} />
                        <Route path="trips" element={<CrusherTrips />} />
                        <Route path="payments" element={<CrusherPayments />} />
                      </Route>
                      <Route path="trips/create" element={<OwnerRoute><CrusherTripForm /></OwnerRoute>} />
                      <Route path="/crushers/:crusherId/payments/create" element={<OwnerRoute><CrusherPaymentForm /></OwnerRoute>} />

                      {/* Fuel Bunks Management - OWNER ONLY */}
                      <Route path="/bunks" element={<OwnerRoute><Bunks /></OwnerRoute>} />
                      <Route path="/bunks/create" element={<OwnerRoute><ManageBunkForm /></OwnerRoute>} />
                      <Route path="/bunks/edit/:id" element={<OwnerRoute><ManageBunkForm /></OwnerRoute>} />
                      <Route path="/bunks/:bunkId" element={<OwnerRoute><BunkDetails /></OwnerRoute>}>
                        <Route index element={<Navigate to="expenses" replace />} />
                        <Route path="expenses" element={<BunkExpenses />} />
                        <Route path="payments" element={<BunkPayments />} />
                      </Route>
                      <Route path="/bunks/:bunkId/payments/create" element={<OwnerRoute><BunkPaymentForm /></OwnerRoute>} />
                      <Route path="/bunks/:bunkId/payments/edit/:paymentId" element={<OwnerRoute><BunkPaymentForm /></OwnerRoute>} />


                      {/* Collaboration Management - OWNER ONLY */}
                      <Route path="/collaborations" element={<OwnerRoute><CollaborationDashboard /></OwnerRoute>} />
                      <Route path="/collaborations/transactions/:collaborationId" element={<OwnerRoute><CollaboratorsTab /></OwnerRoute>} />
                      <Route path="/collaborations/requests" element={<OwnerRoute><CollaborationRequestsTab /></OwnerRoute>} />

                      <Route path="/settlement" element={<OwnerRoute><SettlementTab /></OwnerRoute>} />

                      {/* Drivers Management - OWNER ONLY */}
                      <Route path="/drivers" element={<OwnerRoute><Drivers /></OwnerRoute>} />
                      <Route path="/drivers/create" element={<OwnerRoute><ManageDriverForm /></OwnerRoute>} />
                      <Route path="/drivers/edit/:id" element={<OwnerRoute><ManageDriverForm /></OwnerRoute>} />
                      <Route path="/drivers/:driverId" element={<OwnerRoute><DriverDetails /></OwnerRoute>} />

                      <Route path="/attendance/create" element={<OwnerRoute><ManageAttendanceForm /></OwnerRoute>} />
                      <Route path="/attendance/edit/:id" element={<OwnerRoute><ManageAttendanceForm /></OwnerRoute>} />

                      {/* Owners Management - ADMIN ONLY */}
                      <Route
                        path="/owners"
                        element={
                          <AdminRoute>
                            <Owners />
                          </AdminRoute>
                        }
                      />
                      <Route
                        path="/owners/create"
                        element={
                          <AdminRoute>
                            <ManageOwnerForm />
                          </AdminRoute>
                        }
                      />
                      <Route
                        path="/owners/edit/:id"
                        element={
                          <AdminRoute>
                            <ManageOwnerForm />
                          </AdminRoute>
                        }
                      />
                      <Route path="/notfound" element={<NotFound />} />

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;