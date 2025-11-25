import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tests from './pages/Test/Tests';
import ViewTests from './pages/Test/DisplayTests';
import Questions from './pages/Crushers/Crushers';
import Users from './pages/Users/Users';

import ProtectedRoute from './components/ProtectedRoute';
import AddQuestionsPage from './pages/AddQuestionsPage';

import Exams from './pages/Exams/Exams';
import Subjects from './pages/Subjects/Subjects';
import AddSubject from './pages/Subjects/AddSubject';
import UploadSubjectExcel from './pages/Subjects/UploadSubjectExcel';
import Chapters from './pages/Chapters/Chapters';
import AddChapter from './pages/Chapters/AddChapter';
import UploadChapterExcel from './pages/Chapters/UploadChapterExcel';

import Lorries from './pages/Lorries/Lorries';
import ManageLorryForm from './pages/Lorries/ManageLorryForm';
import Batches from './pages/Batches/Batches';
import AddBatch from './pages/Batches/AddBatch';
import ManageBatchForm from './pages/Batches/ManageBatchForm';
import Students from './pages/Students/Student';
import AddStudent from './pages/Students/AddStudent';
import ManageStudentForm from './pages/Students/ManageStudentForm';

import QuestionSets from './pages/Customers/Customers';
import AddQuestionSet from './pages/Customers/AddQuestionSet';

import Groups from './pages/Groups/Groups';
import ManageGroupForm from './pages/Groups/ManageGroupForm';
import AddGroup from './pages/Groups/AddGroup';
import RandomTestBuilder from './pages/Test/RandomTest';
import DisplayRandomTests from './pages/RandomTest/DisplayRandomTests';

// Course pages - FULL SCREEN (without Layout)
import CourseForm from './pages/Course/CourseForm';
import CourseList from './pages/Course/CourseList';
import CourseDetail from './pages/Course/CourseDetail';
import EnrolledCourses from './pages/Course/CourseEnrollment';

import ResultsPage from './pages/Resultes/ResultsPage';

import ManageQuestionSetForm from './pages/Customers/ManageCustomerForm';
import AddQuestion from './pages/Crushers/AddQuestion';
import InstituteAdmins from './pages/InstituteAdmins/InstituteAdmins';
import InstituteAdminForm from './pages/InstituteAdmins/InstituteAdminForm';
import CourseEnrollment from './pages/Course/CourseEnrollment';
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
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Results - Full screen without nav */}
            <Route
              path="/results/:courseId/:testId"
              element={
                <ProtectedRoute>
                  <ResultsPage />
                </ProtectedRoute>
              }
            />

            {/* Course routes - FULL SCREEN (without Layout) */}

            <Route
              path="/courses/create"
              element={
                <ProtectedRoute>
                  <CourseForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/edit/:id"
              element={
                <ProtectedRoute>
                  <CourseForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:courseId"
              element={
                <ProtectedRoute>
                  <CourseDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-courses"
              element={
                <ProtectedRoute>
                  <EnrolledCourses />
                </ProtectedRoute>
              }
            />

            {/* All other routes with Layout */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      {/* Dashboard */}
                      <Route path="/dashboard" element={<Dashboard />} />


                      <Route
                        path="/courses"
                        element={
                          <ProtectedRoute>
                            <CourseList />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/enroll/course/:courseId"
                        element={
                          <ProtectedRoute>
                            <CourseEnrollment />
                          </ProtectedRoute>
                        }
                      />
                      {/* Lorries */}
                      <Route path="/lorries" element={<Lorries />} />
                      <Route path="/lorries/create" element={<ManageLorryForm />} />
                      <Route path="/lorries/edit/:id" element={<ManageLorryForm />} />


                      {/* Lorry Details with nested routes */}
                      <Route path="/lorries/:lorryId" element={<LorryDetails />}>
                        <Route path="trips" element={<LorryTrips />} />
                        <Route path="expenses" element={<LorryExpenses />} />
                      </Route>

                      {/* Standalone forms */}
                      <Route path="/trips/create" element={<TripForm />} />
                      <Route path="/trips/edit/:tripId" element={<TripForm />} />
                      <Route path="/expenses/create" element={<ExpenseForm />} />
                      <Route path="/expenses/edit/:expenseId" element={<ExpenseForm />} />

                      {/* Customers Management */}
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/customers/create" element={<ManageCustomerForm />} />
                      <Route path="/customers/edit/:id" element={<ManageCustomerForm />} />
                      <Route path="customers/:customerId" element={<CustomerDetails />}>
                        <Route index element={<Navigate to="trips" replace />} />
                        <Route path="trips" element={<CustomerTrips />} />
                        <Route path="payments" element={<CustomerPayments />} />
                      </Route>
                      <Route path="/customers/:customerId/trips/create" element={<CustomerTripForm />} />
                      <Route path="/customers/:customerId/payments/create" element={<CustomerPaymentForm />} />



                      {/* Crushers Management */}
                      <Route path="/crushers" element={<Crushers />} />
                      <Route path="/crushers/create" element={<ManageCrusherForm />} />
                      <Route path="/crushers/edit/:id" element={<ManageCrusherForm />} />
                      <Route path="/crushers/:crusherId" element={<CrusherDetails />}>
                        <Route index element={<Navigate to="trips" replace />} />
                        <Route path="trips" element={<CrusherTrips />} />
                        <Route path="trips/create" element={<CrusherTripForm />} />
                        <Route path="payments" element={<CrusherPayments />} />
                      </Route>

                      {/* Collaboration Management */}
                      <Route path="/collaborations" element={<CollaborationDashboard />} />
                      <Route path="/collaborations/transactions/:collaborationId" element={<CollaboratorsTab />} />
                      <Route path="/collaborations/requests" element={<CollaborationRequestsTab />} />


                      <Route path="/settlement" element={<SettlementTab />} />

                      {/* drivers Management */}
                      <Route path="/drivers" element={<Drivers />} />
                      <Route path="/drivers/create" element={<ManageDriverForm />} />
                      <Route path="/drivers/edit/:id" element={<ManageDriverForm />} />
                      <Route path="/drivers/:driverId" element={<DriverDetails />} />

                      <Route path="/attendance/create" element={<ManageAttendanceForm />} />
                      <Route path="/attendance/edit/:id" element={<ManageAttendanceForm />} />



                      {/* Owners Management */}
                      <Route path="/owners" element={<Owners />} />
                      <Route path="/owners/create" element={<ManageOwnerForm />} />
                      <Route path="/owners/edit/:id" element={<ManageOwnerForm />} />

                      {/* Users */}
                      <Route path="/users" element={<Users />} />

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