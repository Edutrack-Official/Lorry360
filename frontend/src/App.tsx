import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tests from './pages/Test/Tests';
import ViewTests from './pages/Test/DisplayTests';
import Questions from './pages/Questions/Questions';
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

import Institutes from './pages/Institutes/Institutes';
import AddInstitute from './pages/Institutes/AddInstitute';
import ManageInstituteForm from './pages/Institutes/ManageInstituteForm';
import Batches from './pages/Batches/Batches';
import AddBatch from './pages/Batches/AddBatch';
import ManageBatchForm from './pages/Batches/ManageBatchForm';
import Students from './pages/Students/Student';
import AddStudent from './pages/Students/AddStudent';
import ManageStudentForm from './pages/Students/ManageStudentForm';

import QuestionSets from './pages/QuestionSets/QuestionSets';
import AddQuestionSet from './pages/QuestionSets/AddQuestionSet';

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

import ManageQuestionSetForm from './pages/QuestionSets/ManageQuestionSetForm';
import AddQuestion from './pages/Questions/AddQuestion';
import InstituteAdmins from './pages/InstituteAdmins/InstituteAdmins';
import InstituteAdminForm from './pages/InstituteAdmins/InstituteAdminForm';
import CourseEnrollment from './pages/Course/CourseEnrollment';
import NotFound from './pages/NotFound';

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
                      {/* Institutes */}
                      <Route path="/institutes" element={<Institutes />} />
                      <Route path="/institutes/create" element={<AddInstitute />} />
                      <Route path="/institutes/edit/:id" element={<ManageInstituteForm />} />
                      <Route path="/institutes/:instituteId/admins" element={<InstituteAdmins />} />
                      <Route path="/institutes/:instituteId/admins/create" element={<InstituteAdminForm />} />
                      <Route path="/institutes/:instituteId/admins/edit/:id" element={<InstituteAdminForm />} />

                      {/* Batches */}
                      <Route path="/institutes/:instituteId/batches" element={<Batches />} />
                      <Route path="/batches/create" element={<AddBatch />} />
                      <Route path="/batches/edit/:id" element={<ManageBatchForm />} />
                      <Route path="/batches/:batchId/students" element={<Students />} />
                      <Route path="/students/create" element={<AddStudent />} />
                      <Route path="/students/edit/:id" element={<ManageStudentForm />} />

                      {/* Exams / Subjects / Chapters */}
                      <Route path="/exams" element={<Exams />} />
                      <Route path="/exams/:examId/subjects" element={<Subjects />} />
                      <Route path="/exams/:examId/subjects/add" element={<AddSubject />} />
                      <Route path="/exams/:examId/subjects/upload" element={<UploadSubjectExcel />} />
                      <Route path="/subjects/:subjectId/chapters" element={<Chapters />} />
                      <Route path="/subjects/:subjectId/chapters/add" element={<AddChapter />} />
                      <Route path="/subjects/:subjectId/chapters/upload" element={<UploadChapterExcel />} />

                      {/* Question Sets */}
                      <Route path="/questionsets" element={<QuestionSets />} />
                      <Route path="/questionsets/add" element={<AddQuestionSet />} />
                      <Route path="/questionsets/edit/:id" element={<ManageQuestionSetForm />} />

                      {/* Questions */}
                      <Route path="/questions/:questionSetId" element={<Questions />} />
                      <Route path="/questions/:questionSetId/add" element={<AddQuestion />} />
                      <Route path="/questions/:questionSetId/edit/:id" element={<AddQuestion />} />

                      {/* Groups */}
                      <Route path="/batches/:batchId/groups" element={<Groups />} />
                      <Route path="/groups/create/:batchId" element={<ManageGroupForm />} />
                      <Route path="/groups/edit/:id" element={<ManageGroupForm />} />
                      <Route path="/groups" element={<AddGroup />} />

                      {/* Tests */}
                      <Route path="/tests" element={<Tests />} />
                      <Route path="/tests/edit/:id" element={<Tests />} />
                      <Route path="/view-tests" element={<ViewTests />} />
                      <Route path="/random-tests" element={<RandomTestBuilder />} />
                      <Route path="/random-tests/edit/:id" element={<RandomTestBuilder />} />
                      <Route path="/view-random-tests" element={<DisplayRandomTests />} />
                      <Route path="/test/:id/add-questions" element={<AddQuestionsPage />} />

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