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


                      {/* Customers Management */}
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/customers/create" element={<ManageCustomerForm />} />
                      <Route path="/customers/edit/:id" element={<ManageCustomerForm />} />

                      {/* Crushers Management */}
                      <Route path="/crushers" element={<Crushers />} />
                      <Route path="/crushers/create" element={<ManageCrusherForm />} />
                      <Route path="/crushers/edit/:id" element={<ManageCrusherForm />} />

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