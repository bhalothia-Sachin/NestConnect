import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { PropertyProvider } from './contexts/PropertyContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import PropertyListPage from './pages/PropertyListPage';
import PublicPropertyListPage from './pages/PublicPropertyListPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AddPropertyPage from './pages/AddPropertyPage';
import EditPropertyPage from './pages/EditPropertyPage';
import MyPropertiesPage from './pages/MyPropertiesPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { UserRole } from './constants/enums';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PropertyProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/browse" element={<PublicPropertyListPage />} />
                  <Route path="/properties" element={<PropertyListPage />} />
                  <Route path="/properties/:id" element={<PropertyDetailPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/add-property" 
                    element={
                      <ProtectedRoute allowedRoles={[UserRole.HOMEOWNER, UserRole.BROKER]}>
                        <AddPropertyPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/edit-property/:id" 
                    element={
                      <ProtectedRoute allowedRoles={[UserRole.HOMEOWNER, UserRole.BROKER]}>
                        <EditPropertyPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/my-properties" 
                    element={
                      <ProtectedRoute allowedRoles={[UserRole.HOMEOWNER, UserRole.BROKER]}>
                        <MyPropertiesPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/messages" 
                    element={
                      <ProtectedRoute>
                        <MessagesPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
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
        </PropertyProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

