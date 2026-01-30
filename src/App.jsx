
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/auth/Login";
import Dashboard from "./components/dashboard/Dashboard";
import NotFound from "./components/common/NotFound";

import CreateRole from "./components/role/CreateRole";
import AdminsPage from "./pages/admin/AdminsPage";
import JobsPage from "./pages/job/JobsPage";
import CollegesPage from "./pages/college/CollegesPage";
import CandidatesPage from "./pages/candidate/CandidatesPage";
import CreditsPage from "./pages/credit/CreditsPage";
import PaymentsPage from "./pages/payment/PaymentsPage";
import SettingsPage from "./pages/settings/SettingsPage";
import EditAdmin from "./pages/admin/EditAdmin";
import CreateAdmin from "./components/admin/CreateAdmin";
import InvitationsPage from "./pages/admin/InvitationsPage";
import CandidateInvitationsPage from "./pages/candidate/CandidateInvitationsPage";
import AdminSubscription from "./components/admin/AdminSubscription";
import AdminManualPayment from "./components/admin/AdminManualPayment";
import CreateJob from "./pages/job/CreateJob";
import DashboardContent from "./components/dashboard/DashboardContent";
import ErrorBoundary from "./components/common/ErrorBoundary";
import SnackbarAlert from "./components/common/SnackbarAlert";
import { authService } from "./services/authService";
import { clearAuthCookies } from "./utils/cookieUtils";
import { clearTokens } from "./utils/tokenStorage";
import { setSessionCheckFlag } from "./config/axiosConfig";
import { ThemeProvider } from "./contexts/ThemeContext";


const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const showMessage = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Check for existing session on app mount
  useEffect(() => {
    const checkSession = async () => {
      // Set flag to prevent interceptor from redirecting
      setSessionCheckFlag(true);

      try {
        const data = await authService.getCurrentAdmin(true);
        if (data) {
          const admin = Array.isArray(data.admin) && data.admin.length ? data.admin[0] : data.admin;
          setAdminInfo(admin);
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Clear tokens and cookies if it's an auth error (401, 403) or admin not found (404)
        const status = error?.response?.status;
        const isAuthError = status === 401 || status === 403 || status === 404;

        if (isAuthError) {
          clearTokens();
          clearAuthCookies();
        } else {
          // Only log unexpected errors (network issues, etc.) - but suppress for session check
          // Don't clear cookies on network errors - might be temporary
        }
        setIsAuthenticated(false);
      } finally {
        setSessionCheckFlag(false);
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const admin = Array.isArray(response.admin) && response.admin.length ? response.admin[0] : response.admin;
      setAdminInfo(admin);
      setIsAuthenticated(true);
      showMessage("Login successful");
    } catch (error) {
      // Error is already handled in Login component
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearTokens();
      clearAuthCookies();
      setIsAuthenticated(false);
      setAdminInfo(null);
      showMessage("Logged out successfully");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-900 mx-auto"></div>
          <p className="mt-4 text-navy-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Login onLogin={handleLogin} />
                )
              }
            />
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? (
                  <Dashboard adminInfo={adminInfo} onLogout={handleLogout} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            >
              {/* Nested Routes */}
              <Route index element={<DashboardContent adminInfo={adminInfo} currentView="dashboard" />} />
              <Route path="admins" element={<AdminsPage adminInfo={adminInfo} />} />
              <Route path="admins/:id/edit" element={<EditAdmin adminInfo={adminInfo} />} />
              <Route path="create-admin" element={<CreateAdmin adminInfo={adminInfo} />} />
              <Route path="invitations" element={<InvitationsPage adminInfo={adminInfo} />} />
              <Route path="candidates" element={<CandidatesPage adminInfo={adminInfo} />} />
              <Route path="candidate-invitations" element={<CandidateInvitationsPage adminInfo={adminInfo} />} />
              <Route path="jobs" element={<JobsPage adminInfo={adminInfo} />} />
              <Route path="create-job" element={<CreateJob adminInfo={adminInfo} />} />
              <Route path="colleges" element={<CollegesPage adminInfo={adminInfo} />} />
              <Route path="credits" element={<CreditsPage adminInfo={adminInfo} />} />
              {/* Add routes for admin subscription flow */}
              <Route path="admin-subscription" element={<AdminSubscription adminInfo={adminInfo} />} />
              <Route path="payments" element={<PaymentsPage adminInfo={adminInfo} />} />
              <Route path="admin-manual-payment" element={<AdminManualPayment adminInfo={adminInfo} />} />
              <Route path="settings" element={<SettingsPage adminInfo={adminInfo} />} />
              <Route path="create-role" element={<CreateRole adminInfo={adminInfo} />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <SnackbarAlert
            open={snackbar.open}
            message={snackbar.message}
            severity={snackbar.severity}
            onClose={handleCloseSnackbar}
          />
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;

