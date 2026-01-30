import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Mail, Phone, Building } from 'lucide-react';
import { adminService } from '../../services/adminService';
import SnackbarAlert from '../common/SnackbarAlert';

const DEFAULT_PASSWORD = "Admin@123";

const CreateAdmin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    mobileNo: '',
    password: DEFAULT_PASSWORD,
    fullName: '',
    phone: '',
    role: 'ADMIN',
    organizationName: '',
    isSubscription: true,
    accountType: 'SUBSCRIPTION',
    isFreeDemo: false,
    demoCreditsLimit: 0
  });

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showMessage = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email?.trim())) {
      showMessage('Please enter a valid email address.', 'error');
      return false;
    }

    const username = formData.username?.trim();
    const mobileNo = formData.mobileNo?.trim();
    const organizationName = formData.organizationName?.trim();

    const usernameRegex = /^[a-zA-Z0-9._-]{3,50}$/;
    if (!username || !usernameRegex.test(username)) {
      showMessage('Username must be 3-50 characters and can only contain letters, numbers, dots, underscores, and hyphens.', 'error');
      return false;
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileNo || !mobileRegex.test(mobileNo)) {
      showMessage('Mobile number must be exactly 10 digits.', 'error');
      return false;
    }

    if (!organizationName) {
      showMessage('Company Name is required.', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare admin payload (backend will generate UUID)
      const adminPayload = {
        email: formData.email?.trim(),
        password: DEFAULT_PASSWORD,
        fullName: formData.username?.trim(),
        phone: formData.mobileNo?.trim(),
        role: 'ADMIN',
        organizationName: formData.organizationName?.trim(),
        // Don't send organizationId - let backend generate it
        isSubscription: formData.accountType === 'DEMO' ? formData.isFreeDemo : false,
        accountType: formData.accountType,
        isFreeDemo: formData.accountType === 'DEMO' ? formData.isFreeDemo : false,
        demoCreditsLimit: (formData.accountType === 'DEMO' && formData.isFreeDemo) ? parseInt(formData.demoCreditsLimit) : 0
      };

      showMessage('Creating admin account...', 'info');
      console.log('Calling admin API...');

      // Call admin API - backend creates admin + org + database + generates UUID
      const response = await adminService.createAdmin(adminPayload);
      console.log('Admin API response:', response);

      // Extract organizationId from response
      const organizationId = response.admin?.[0]?.organizationId;

      if (!organizationId) {
        throw new Error('Organization ID not returned from backend');
      }

      console.log('Admin created successfully. Organization ID:', organizationId);

      // Send Welcome Email decoupled
      showMessage('Sending Welcome Email...', 'info');
      try {
        // Use the admin ID from response and the known password
        const adminId = response.admin?.[0]?.id;
        if (adminId) {
          await adminService.sendWelcomeEmail(adminId, DEFAULT_PASSWORD);
          showMessage('Admin created & Welcome Email sent!', 'success');
        } else {
          console.warn("Admin ID not found for email sending.");
        }
      } catch (emailErr) {
        console.error("Failed to send welcome email:", emailErr);
        showMessage('Admin created, but Welcome Email failed.', 'warning');
      }

      // Store admin data with organizationId for subscription page
      sessionStorage.setItem('pendingAdminData', JSON.stringify({
        ...adminPayload,
        organizationId: organizationId,
        adminId: response.admin?.[0]?.id
      }));

      showMessage('Admin created successfully! Redirecting to subscription setup...', 'success');

      if (formData.accountType === 'DEMO') {
        showMessage('Demo Admin created successfully!', 'success');
        setTimeout(() => {
          navigate('/dashboard/admins');
        }, 1000);
      } else {
        showMessage('Admin created successfully! Redirecting to subscription setup...', 'success');
        setTimeout(() => {
          navigate(`/dashboard/admin-subscription`);
        }, 1000);
      }

    } catch (err) {
      console.error('Error creating admin:', err);
      showMessage(err.response?.data?.error || err.message || 'Failed to create admin', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard/admins');
  };

  return (
    <div className="min-h-screen py-2 px-2" style={{ backgroundColor: '#f0f4f8' }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-4">
          <button
            onClick={handleBack}
            className="inline-flex items-center text-sm text-qwikBlue hover:text-qwikBlueDark transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to User Management
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="flex flex-col md:flex-row">
            {/* Left Column - Form */}
            <div className="w-full md:w-1/2 p-0">
              <div className="bg-qwikBlue py-4 px-6">
                <h1 className="text-2xl font-bold text-white">
                  Add New User
                </h1>
                <p className="text-blue-100 text-sm mt-1">
                  Create a new user account with ADMIN privileges
                </p>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-5">
                    {/* Username */}
                    <div>
                      <label htmlFor="username" className="block text-xs font-medium text-gray-700 mb-1">
                        Username <span className="text-red-500">*</span>
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="username"
                          name="username"
                          placeholder="Enter Username (3-50 characters)"
                          value={formData.username}
                          onChange={handleInputChange}
                          required
                          className="block w-full pl-10 pr-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-qwikBlue focus:border-qwikBlue bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          placeholder="Enter Email Address"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="block w-full pl-10 pr-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-qwikBlue focus:border-qwikBlue bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label htmlFor="mobileNo" className="block text-xs font-medium text-gray-700 mb-1">
                        Contact Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="flex">
                          <div className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-600 text-xs">
                            <img
                              src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg"
                              alt="India flag"
                              className="w-3 h-auto mr-1"
                            />
                            +91
                          </div>
                          <input
                            type="tel"
                            id="mobileNo"
                            name="mobileNo"
                            value={formData.mobileNo}
                            onChange={handleInputChange}
                            required
                            placeholder="10-digit mobile number"
                            className="block w-full rounded-none rounded-r-md border border-gray-300 py-2 pl-3 text-xs bg-white focus:ring-qwikBlue focus:border-qwikBlue transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Company Name */}
                    <div>
                      <label htmlFor="organizationName" className="block text-xs font-medium text-gray-700 mb-1">
                        Company Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Building className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="organizationName"
                          name="organizationName"
                          placeholder="Enter Company Name"
                          value={formData.organizationName}
                          onChange={handleInputChange}
                          required
                          className="block w-full pl-10 pr-3 py-2 text-xs border border-gray-300 rounded-md bg-white focus:ring-qwikBlue focus:border-qwikBlue transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Account Type */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Account Type
                      </label>
                      <div className="flex space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio text-qwikBlue focus:ring-qwikBlue h-4 w-4"
                            name="accountType"
                            value="SUBSCRIPTION"
                            checked={formData.accountType === 'SUBSCRIPTION'}
                            onChange={handleInputChange}
                            disabled={loading}
                          />
                          <span className="ml-2 text-xs text-gray-700">Subscription</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio text-qwikBlue focus:ring-qwikBlue h-4 w-4"
                            name="accountType"
                            value="DEMO"
                            checked={formData.accountType === 'DEMO'}
                            onChange={handleInputChange}
                            disabled={loading}
                          />
                          <span className="ml-2 text-xs text-gray-700">Demo</span>
                        </label>
                      </div>
                    </div>

                    {/* Demo Options */}
                    {formData.accountType === 'DEMO' && (
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-200 space-y-3 animation-fade-in">
                        <div className="flex items-center">
                          <input
                            id="isFreeDemo"
                            name="isFreeDemo"
                            type="checkbox"
                            checked={formData.isFreeDemo}
                            onChange={(e) => setFormData({ ...formData, isFreeDemo: e.target.checked })}
                            disabled={loading}
                            className="h-4 w-4 text-qwikBlue focus:ring-qwikBlue border-gray-300 rounded"
                          />
                          <label htmlFor="isFreeDemo" className="ml-2 block text-xs text-gray-900">
                            Enable Free Demo Credits
                          </label>
                        </div>

                        {formData.isFreeDemo && (
                          <div>
                            <label htmlFor="demoCreditsLimit" className="block text-xs font-medium text-gray-700 mb-1">
                              Credit Limit
                            </label>
                            <input
                              type="number"
                              id="demoCreditsLimit"
                              name="demoCreditsLimit"
                              min="0"
                              value={formData.demoCreditsLimit}
                              onChange={handleInputChange}
                              disabled={loading}
                              className="block w-full pl-3 pr-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-qwikBlue focus:border-qwikBlue bg-white shadow-sm"
                            />
                            <p className="mt-1 text-[10px] text-gray-500">
                              Maximum credits allowed for this demo account
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-qwikBlue transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-qwikBlue hover:bg-qwikBlueDark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-qwikBlue transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Creating Admin...' : 'Continue to Subscription'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column - Illustration */}
            <div className="hidden md:block p-0 bg-blue-50 relative overflow-hidden border-l border-gray-200 md:w-1/2">
              <div className="relative h-full flex flex-col justify-center items-center">
                <div className="w-full max-w-sm p-8">
                  <svg className="w-full h-auto" viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="100" y="50" width="300" height="330" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="2" />
                    <rect x="100" y="50" width="300" height="60" rx="8" fill="#E0F2F7" />
                    <rect x="130" y="74" width="170" height="12" rx="2" fill="#0284C7" />
                    <rect x="130" y="130" width="240" height="8" rx="2" fill="#9CA3AF" />
                    <rect x="130" y="145" width="240" height="30" rx="4" fill="white" stroke="#D1D5DB" strokeWidth="2" />
                    <rect x="130" y="190" width="240" height="8" rx="2" fill="#9CA3AF" />
                    <rect x="130" y="205" width="240" height="30" rx="4" fill="white" stroke="#D1D5DB" strokeWidth="2" />
                    <rect x="130" y="250" width="240" height="8" rx="2" fill="#9CA3AF" />
                    <rect x="130" y="265" width="240" height="30" rx="4" fill="white" stroke="#D1D5DB" strokeWidth="2" />
                    <rect x="250" y="320" width="120" height="36" rx="6" fill="#0284C7" />
                    <rect x="280" y="334" width="60" height="8" rx="2" fill="white" />
                    <circle cx="350" cy="75" r="20" fill="#BAE6FD" stroke="#0284C7" strokeWidth="2" />
                    <path d="M350 65V85M340 75H360" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="180" cy="370" r="10" fill="#0284C7" opacity="0.2" />
                    <circle cx="180" cy="355" r="8" fill="#0284C7" opacity="0.2" />
                    <circle cx="400" cy="150" r="50" fill="#E0F2F7" opacity="0.5" />
                    <circle cx="80" cy="280" r="40" fill="#E0F2F7" opacity="0.5" />
                  </svg>

                  <div className="text-center mt-6">
                    <h2 className="text-gray-800 text-xl font-bold mb-3">Team Management Portal</h2>
                    <p className="text-gray-600 text-sm mb-6">
                      Create and manage team members with appropriate roles and permissions to collaborate efficiently.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SnackbarAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </div>
  );
};

export default CreateAdmin;
