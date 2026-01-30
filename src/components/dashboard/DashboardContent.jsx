import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Users, UserPlus, Mail, Search, Edit, Trash2, X, Check, GraduationCap, Shield, Plus, Briefcase, Upload, UserX, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { adminService } from "../../services/adminService";
import { dashboardService } from "../../services/dashboardService";
import { candidateService } from "../../services/candidateService";
import { collegeService } from "../../services/collegeService";
import { jobService } from "../../services/jobService";
import { roleService } from "../../services/roleService";

import { creditService } from "../../services/creditService";
import SnackbarAlert from "../common/SnackbarAlert";
import AdminSubscription from "../admin/AdminSubscription";
import AdminManualPayment from "../admin/AdminManualPayment";

const DashboardContent = ({ currentView, adminInfo }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [admins, setAdmins] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [showEditAdminModal, setShowEditAdminModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showInviteCandidateModal, setShowInviteCandidateModal] = useState(false);
  const [showCreateCollegeModal, setShowCreateCollegeModal] = useState(false);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [showEditJobModal, setShowEditJobModal] = useState(false);
  const [showDeleteJobModal, setShowDeleteJobModal] = useState(false);
  const [showUploadCsvModal, setShowUploadCsvModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [organizationsCredits, setOrganizationsCredits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Revenue Filter State
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [weeklyData, setWeeklyData] = useState([]);

  const showMessage = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    if (trends?.weeklyRevenue) {
      setWeeklyData(trends.weeklyRevenue);
    }
  }, [trends]);

  const handleMonthChange = async (e) => {
    const [m, y] = e.target.value.split('-').map(Number);
    setSelectedMonth(m);
    setSelectedYear(y);

    try {
      const response = await dashboardService.getWeeklyRevenue(m, y);
      if (response && response.weeklyRevenue) {
        setWeeklyData(response.weeklyRevenue);
      }
    } catch (error) {
      console.error("Failed to fetch weekly trend", error);
    }
  };

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const [statsData, trendsData] = await Promise.all([
        dashboardService.getSuperAdminStats(),
        dashboardService.getDashboardTrends()
      ]);
      setDashboardStats(statsData);
      setTrends(trendsData);
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
      showMessage("Failed to load dashboard statistics", "error");
    } finally {
      setLoading(false);
    }
  };

  // Load admins/users
  const loadAdmins = async () => {
    try {
      setLoading(true);
      // Check if admin has organization (ADMIN) or not (SUPERADMIN)
      if (adminInfo?.organization?.organizationId) {
        // ADMIN: Use organization-specific API
        const data = await adminService.getUsersByOrganizationId(adminInfo.organization.organizationId);
        setAdmins(Array.isArray(data) ? data : (data.content || []));
      } else {
        // SUPERADMIN: Use normal API
        const data = await adminService.getAllAdmins();
        setAdmins(Array.isArray(data) ? data : (data.content || []));
      }
    } catch (error) {
      console.error("Error loading admins:", error);
      const errorMessage = error?.response?.data?.error || error?.message || "Failed to load admins. Please try again.";
      showMessage(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  // Load candidates
  const loadCandidates = async () => {
    try {
      setLoading(true);
      const data = await candidateService.getAllCandidates();
      setCandidates(Array.isArray(data) ? data : (data.content || []));
    } catch (error) {
      console.error("Error loading candidates:", error);
      const errorMessage = error?.response?.data?.error || error?.message || "Failed to load candidates. Please try again.";
      showMessage(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  // Load colleges
  const loadColleges = async () => {
    try {
      setLoading(true);
      const data = await collegeService.getAllColleges();
      setColleges(Array.isArray(data) ? data : (data.content || []));
    } catch (error) {
      console.error("Error loading colleges:", error);
      const errorMessage = error?.response?.data?.error || error?.message || "Failed to load colleges. Please try again.";
      showMessage(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  // Load jobs
  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await jobService.getAllJobs();
      setJobs(Array.isArray(data) ? data : (data.content || []));
    } catch (error) {
      console.error("Error loading jobs:", error);
      const errorMessage = error?.response?.data?.error || error?.message || "Failed to load jobs. Please try again.";
      showMessage(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  // Load roles
  const loadRoles = async () => {
    try {
      setLoading(true);
      // Check if admin has organization (ADMIN) or not (SUPERADMIN)
      if (adminInfo?.organization?.organizationId) {
        // ADMIN: Use organization-specific API
        const data = await roleService.getRolesByOrganizationId(adminInfo.organization.organizationId);
        setRoles(Array.isArray(data) ? data : (data.content || []));
      } else {
        // SUPERADMIN: Use normal API
        const data = await roleService.getAllRoles();
        setRoles(Array.isArray(data) ? data : (data.content || []));
      }
    } catch (error) {
      console.error("Error loading roles:", error);
      const errorMessage = error?.response?.data?.error || error?.message || "Failed to load roles. Please try again.";
      showMessage(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentView || currentView === "dashboard") {
      loadDashboardStats();
    } else if (currentView === "admins") {
      loadAdmins();
    } else if (currentView === "candidates") {
      loadCandidates();
    } else if (currentView === "colleges") {
      loadColleges();
    } else if (currentView === "jobs") {
      loadJobs();
    } else if (currentView === "users") {
      loadAdmins();
    } else if (currentView === "roles") {
      loadRoles();
    } else if (currentView === "credits") {
      loadCredits();
    } else if (currentView === "manual-payments") {
      loadManualRequests();
    }
  }, [currentView]);

  const [manualRequests, setManualRequests] = useState([]);

  const loadManualRequests = async () => {
    try {
      setLoading(true);
      const data = await creditService.getAllManualRequests();
      setManualRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading manual requests:", error);
      showMessage("Failed to load manual payment requests", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      setLoading(true);
      await creditService.approveManualRequest(requestId);
      showMessage("Request approved and credits assigned successfully");
      loadManualRequests();
    } catch (error) {
      console.error("Error approving request:", error);
      showMessage("Failed to approve request", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (requestId) => {
    const reason = prompt("Enter rejection reason:");
    if (reason === null) return;

    try {
      setLoading(true);
      await creditService.rejectManualRequest(requestId, reason);
      showMessage("Request rejected");
      loadManualRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
      showMessage("Failed to reject request", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadCredits = async () => {
    try {
      setLoading(true);
      const data = await creditService.getAllOrganizationsCredits();
      setOrganizationsCredits(Array.isArray(data) ? data : (data.content || data.data || []));
    } catch (error) {
      console.error("Error loading credits:", error);
      showMessage("Failed to load organization credits", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit Admin
  const handleEditAdmin = (admin) => {
    setSelectedAdmin(admin);
    setShowEditAdminModal(true);
  };

  // Handle Delete Admin
  const handleDeleteAdmin = async (adminId) => {
    try {
      await adminService.deleteAdmin(adminId);
      showMessage("Admin deleted successfully");
      setShowDeleteConfirmModal(false);
      setSelectedAdmin(null);
      loadAdmins();
    } catch (error) {
      console.error("Error deleting admin:", error);
      const errorMessage = error?.response?.data?.error || error?.message || "Failed to delete admin. Please try again.";
      showMessage(errorMessage, "error");
    }
  };


  // Edit Admin Modal
  const EditAdminModal = () => {
    const [formData, setFormData] = useState({
      fullName: selectedAdmin?.fullName || "",
      phone: selectedAdmin?.phone || "",
      active: selectedAdmin?.active ?? true
    });

    useEffect(() => {
      if (selectedAdmin) {
        setFormData({
          fullName: selectedAdmin.fullName || "",
          phone: selectedAdmin.phone || "",
          active: selectedAdmin.active ?? true
        });
      }
    }, [selectedAdmin]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await adminService.updateAdmin(selectedAdmin.id, formData);
        showMessage("Admin updated successfully");
        setShowEditAdminModal(false);
        setSelectedAdmin(null);
        loadAdmins();
      } catch (error) {
        console.error("Error updating admin:", error);
        const errorMessage = error?.response?.data?.error || error?.message || "Failed to update admin. Please try again.";
        showMessage(errorMessage, "error");
      }
    };

    if (!selectedAdmin) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-bold text-slate-900">Edit Admin</h2>
            <button onClick={() => { setShowEditAdminModal(false); setSelectedAdmin(null); }} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Email</label>
              <input
                type="email"
                value={selectedAdmin.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qwikBlue focus:border-qwikBlue transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qwikBlue focus:border-qwikBlue transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Status</label>
              <select
                value={formData.active ? "active" : "inactive"}
                onChange={(e) => setFormData({ ...formData, active: e.target.value === "active" })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qwikBlue focus:border-qwikBlue transition"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-2 px-4 bg-qwikBlue hover:bg-qwikBlueDark text-slate-900 font-semibold rounded-lg transition duration-200 shadow-lg">Update</button>
              <button type="button" onClick={() => { setShowEditAdminModal(false); setSelectedAdmin(null); }} className="px-4 py-2 border-2 border-gray-300 hover:border-gray-400 text-slate-700 hover:text-slate-900 font-medium rounded-lg transition duration-200">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal
  const DeleteConfirmModal = () => {
    if (!selectedAdmin) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-bold text-slate-900">Delete Admin</h2>
            <button onClick={() => { setShowDeleteConfirmModal(false); setSelectedAdmin(null); }} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          <div className="mb-6">
            <p className="text-slate-500 mb-2">Are you sure you want to delete this admin?</p>
            <p className="text-[10px] text-gray-600">
              <strong>Email:</strong> {selectedAdmin.email}<br />
              <strong>Name:</strong> {selectedAdmin.fullName || "N/A"}
            </p>
            <p className="text-[10px] text-red-600 mt-4 font-medium">This action cannot be undone.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleDeleteAdmin(selectedAdmin.id)}
              className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition duration-200 shadow-lg"
            >
              Delete
            </button>
            <button
              onClick={() => { setShowDeleteConfirmModal(false); setSelectedAdmin(null); }}
              className="px-4 py-2 border-2 border-gray-300 hover:border-gray-600 text-gray-700 hover:text-gray-900 font-medium rounded-lg transition duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Invite Candidate Modal
  const InviteCandidateModal = () => {
    const [email, setEmail] = useState("");

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await candidateService.createCandidateInvitation(email);
        showMessage("Candidate invitation sent successfully");
        setShowInviteCandidateModal(false);
        setEmail("");
        loadCandidates();
      } catch (error) {
        console.error("Error inviting candidate:", error);
        const errorMessage = error?.response?.data?.error || error?.message || "Failed to invite candidate. Please try again.";
        showMessage(errorMessage, "error");
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-bold text-slate-900">Invite Candidate</h2>
            <button onClick={() => setShowInviteCandidateModal(false)} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qwikBlue focus:border-qwikBlue transition"
                placeholder="candidate@example.com"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-2 px-4 bg-qwikBlue hover:bg-qwikBlueDark text-slate-900 font-semibold rounded-lg transition duration-200 shadow-lg">Send Invitation</button>
              <button type="button" onClick={() => setShowInviteCandidateModal(false)} className="px-4 py-2 border-2 border-gray-300 hover:border-gray-400 text-slate-700 hover:text-slate-900 font-medium rounded-lg transition duration-200">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Create College Modal
  const CreateCollegeModal = () => {
    const [formData, setFormData] = useState({
      collegeName: "",
      collegeCode: "",
      dbName: ""
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await collegeService.createCollege(formData);
        showMessage("College created successfully");
        setShowCreateCollegeModal(false);
        setFormData({ collegeName: "", collegeCode: "", dbName: "" });
        loadColleges();
      } catch (error) {
        console.error("Error creating college:", error);
        const errorMessage = error?.response?.data?.error || error?.message || "Failed to create college. Please try again.";
        showMessage(errorMessage, "error");
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-bold text-slate-900">Create College</h2>
            <button onClick={() => setShowCreateCollegeModal(false)} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">College Name</label>
              <input
                type="text"
                required
                value={formData.collegeName}
                onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qwikBlue focus:border-qwikBlue transition"
                placeholder="College Name"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">College Code</label>
              <input
                type="text"
                required
                value={formData.collegeCode}
                onChange={(e) => setFormData({ ...formData, collegeCode: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qwikBlue focus:border-qwikBlue transition"
                placeholder="College Code"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Database Name</label>
              <input
                type="text"
                required
                value={formData.dbName}
                onChange={(e) => setFormData({ ...formData, dbName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qwikBlue focus:border-qwikBlue transition"
                placeholder="Database Name"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-2 px-4 bg-qwikBlue hover:bg-qwikBlueDark text-slate-900 font-semibold rounded-lg transition duration-200 shadow-lg">Create</button>
              <button type="button" onClick={() => setShowCreateCollegeModal(false)} className="px-4 py-2 border-2 border-gray-300 hover:border-gray-400 text-slate-700 hover:text-slate-900 font-medium rounded-lg transition duration-200">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Create Job Modal
  const CreateJobModal = () => {
    const [formData, setFormData] = useState({
      jobCode: "",
      companyName: "",
      jobTitle: "",
      skills: "",
      jd: "",
      packageAmount: "",
      links: "",
      startDate: "",
      lastDate: ""
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await jobService.createJob(formData);
        showMessage("Job created successfully");
        setShowCreateJobModal(false);
        setFormData({ jobCode: "", companyName: "", jobTitle: "", skills: "", jd: "", packageAmount: "", links: "", startDate: "", lastDate: "" });
        loadJobs();
      } catch (error) {
        console.error("Error creating job:", error);
        const errorMessage = error?.response?.data?.error || error?.message || "Failed to create job. Please try again.";
        showMessage(errorMessage, "error");
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-bold text-slate-900">Create Job</h2>
            <button onClick={() => setShowCreateJobModal(false)} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-1">Job Code *</label>
                <input
                  type="text"
                  required
                  value={formData.jobCode}
                  onChange={(e) => setFormData({ ...formData, jobCode: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qwikBlue focus:border-qwikBlue transition"
                  placeholder="JOB001"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qwikBlue focus:border-qwikBlue transition"
                  placeholder="Company Name"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Job Title *</label>
              <input
                type="text"
                required
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qwikBlue focus:border-qwikBlue transition"
                placeholder="Software Engineer"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Skills</label>
              <textarea
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qwikBlue focus:border-qwikBlue transition"
                placeholder="Java, Spring Boot, React, etc."
                rows={2}
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Job Description (JD)</label>
              <textarea
                value={formData.jd}
                onChange={(e) => setFormData({ ...formData, jd: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qwikBlue focus:border-qwikBlue transition"
                placeholder="Job description details..."
                rows={4}
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Package (Optional)</label>
              <input
                type="text"
                value={formData.packageAmount}
                onChange={(e) => setFormData({ ...formData, packageAmount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qwikBlue focus:border-qwikBlue transition"
                placeholder="10-15 LPA"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Links</label>
              <textarea
                value={formData.links}
                onChange={(e) => setFormData({ ...formData, links: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qwikBlue focus:border-qwikBlue transition"
                placeholder="https://example.com/apply"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-1">Start Date (Optional)</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qwikBlue focus:border-qwikBlue transition"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-1">Last Date (Optional)</label>
                <input
                  type="date"
                  value={formData.lastDate}
                  onChange={(e) => setFormData({ ...formData, lastDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qwikBlue focus:border-qwikBlue transition"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-2 px-4 bg-qwikBlue hover:bg-qwikBlueDark text-slate-900 font-semibold rounded-lg transition duration-200 shadow-lg">Create</button>
              <button type="button" onClick={() => setShowCreateJobModal(false)} className="px-4 py-2 border-2 border-gray-300 hover:border-gray-400 text-slate-700 hover:text-slate-900 font-medium rounded-lg transition duration-200">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Edit Job Modal
  const EditJobModal = () => {
    const [formData, setFormData] = useState({
      jobCode: selectedJob?.jobCode || "",
      companyName: selectedJob?.companyName || "",
      jobTitle: selectedJob?.jobTitle || "",
      skills: selectedJob?.skills || "",
      jd: selectedJob?.jd || "",
      packageAmount: selectedJob?.packageAmount || "",
      links: selectedJob?.links || "",
      startDate: selectedJob?.startDate || "",
      lastDate: selectedJob?.lastDate || ""
    });

    useEffect(() => {
      if (selectedJob) {
        setFormData({
          jobCode: selectedJob.jobCode || "",
          companyName: selectedJob.companyName || "",
          jobTitle: selectedJob.jobTitle || "",
          skills: selectedJob.skills || "",
          jd: selectedJob.jd || "",
          packageAmount: selectedJob.packageAmount || "",
          links: selectedJob.links || "",
          startDate: selectedJob.startDate || "",
          lastDate: selectedJob.lastDate || ""
        });
      }
    }, [selectedJob]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await jobService.updateJob(selectedJob.jobId, formData);
        showMessage("Job updated successfully");
        setShowEditJobModal(false);
        setSelectedJob(null);
        loadJobs();
      } catch (error) {
        console.error("Error updating job:", error);
        const errorMessage = error?.response?.data?.error || error?.message || "Failed to update job. Please try again.";
        showMessage(errorMessage, "error");
      }
    };

    if (!selectedJob) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-bold text-slate-900">Edit Job</h2>
            <button onClick={() => { setShowEditJobModal(false); setSelectedJob(null); }} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-1">Job Code *</label>
                <input
                  type="text"
                  required
                  value={formData.jobCode}
                  onChange={(e) => setFormData({ ...formData, jobCode: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qwikBlue focus:border-qwikBlue transition"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qwikBlue focus:border-qwikBlue transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Job Title *</label>
              <input
                type="text"
                required
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qwikBlue focus:border-qwikBlue transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Skills</label>
              <textarea
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qwikBlue focus:border-qwikBlue transition"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Job Description (JD)</label>
              <textarea
                value={formData.jd}
                onChange={(e) => setFormData({ ...formData, jd: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qwikBlue focus:border-qwikBlue transition"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Package (Optional)</label>
              <input
                type="text"
                value={formData.packageAmount}
                onChange={(e) => setFormData({ ...formData, packageAmount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qwikBlue focus:border-qwikBlue transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Links</label>
              <textarea
                value={formData.links}
                onChange={(e) => setFormData({ ...formData, links: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qwikBlue focus:border-qwikBlue transition"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-1">Start Date (Optional)</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qwikBlue focus:border-qwikBlue transition"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-1">Last Date (Optional)</label>
                <input
                  type="date"
                  value={formData.lastDate}
                  onChange={(e) => setFormData({ ...formData, lastDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qwikBlue focus:border-qwikBlue transition"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-2 px-4 bg-qwikBlue hover:bg-qwikBlueDark text-slate-900 font-semibold rounded-lg transition duration-200 shadow-lg">Update</button>
              <button type="button" onClick={() => { setShowEditJobModal(false); setSelectedJob(null); }} className="px-4 py-2 border-2 border-gray-300 hover:border-gray-400 text-slate-700 hover:text-slate-900 font-medium rounded-lg transition duration-200">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Delete Job Modal
  const DeleteJobModal = () => {
    if (!selectedJob) return null;

    const handleDelete = async () => {
      try {
        await jobService.deleteJob(selectedJob.jobId);
        showMessage("Job deleted successfully");
        setShowDeleteJobModal(false);
        setSelectedJob(null);
        loadJobs();
      } catch (error) {
        console.error("Error deleting job:", error);
        const errorMessage = error?.response?.data?.error || error?.message || "Failed to delete job. Please try again.";
        showMessage(errorMessage, "error");
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-bold text-slate-900">Delete Job</h2>
            <button onClick={() => { setShowDeleteJobModal(false); setSelectedJob(null); }} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          <div className="mb-6">
            <p className="text-slate-500 mb-2">Are you sure you want to delete this job?</p>
            <p className="text-[10px] text-gray-600">
              <strong>Job Code:</strong> {selectedJob.jobCode}<br />
              <strong>Company:</strong> {selectedJob.companyName}<br />
              <strong>Title:</strong> {selectedJob.jobTitle}
            </p>
            <p className="text-[10px] text-red-600 mt-4 font-medium">This action cannot be undone.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition duration-200 shadow-lg"
            >
              Delete
            </button>
            <button
              onClick={() => { setShowDeleteJobModal(false); setSelectedJob(null); }}
              className="px-4 py-2 border-2 border-gray-300 hover:border-gray-600 text-gray-700 hover:text-gray-900 font-medium rounded-lg transition duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Upload CSV Modal
  const UploadCsvModal = () => {
    const [csvFile, setCsvFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.type === "text/csv" || file.name.endsWith(".csv")) {
          setCsvFile(file);
        } else {
          showMessage("Please select a CSV file", "error");
        }
      }
    };

    const handleUpload = async (e) => {
      e.preventDefault();
      if (!csvFile) {
        showMessage("Please select a CSV file", "error");
        return;
      }

      try {
        setUploading(true);
        const result = await jobService.uploadJobsFromCsv(csvFile);
        showMessage(`Successfully uploaded ${result.count} jobs`);
        setShowUploadCsvModal(false);
        setCsvFile(null);
        loadJobs();
      } catch (error) {
        console.error("Error uploading CSV:", error);
        const errorMessage = error?.response?.data?.error || error?.message || "Failed to upload CSV. Please try again.";
        showMessage(errorMessage, "error");
      } finally {
        setUploading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-bold text-slate-900">Upload Jobs from CSV</h2>
            <button onClick={() => { setShowUploadCsvModal(false); setCsvFile(null); }} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          <div className="mb-4">
            <p className="text-[10px] text-gray-600 mb-2">
              CSV format: job_code, company_name, job_title, skills, jd, package, links
            </p>
            <p className="text-[10px] text-gray-500">
              The first row will be treated as header and skipped.
            </p>
          </div>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Select CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qwikBlue focus:border-qwikBlue transition"
              />
              {csvFile && (
                <p className="text-[10px] text-gray-600 mt-2">Selected: {csvFile.name}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!csvFile || uploading}
                className="flex-1 py-2 px-4 bg-qwikBlue hover:bg-qwikBlueDark text-slate-900 font-semibold rounded-lg transition duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
              <button
                type="button"
                onClick={() => { setShowUploadCsvModal(false); setCsvFile(null); }}
                className="px-4 py-2 border-2 border-gray-300 hover:border-gray-400 text-slate-700 hover:text-slate-900 font-medium rounded-lg transition duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Update Credits Modal
  const UpdateCreditsModal = ({ org, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
      totalInterviewCredits: org?.totalInterviewCredits || 0,
      totalPositionCredits: org?.totalPositionCredits || 0,
      validTill: org?.validTill ? org.validTill.split('T')[0] : ""
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await creditService.updateOrganizationCredits(org.organizationId, formData);
        showMessage("Credits updated successfully");
        onSuccess();
      } catch (error) {
        console.error("Error updating credits:", error);
        showMessage("Failed to update credits", "error");
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-bold text-slate-900">Update Credits: {org.organizationName}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Total Interview Credits</label>
              <input
                type="number"
                required
                value={formData.totalInterviewCredits}
                onChange={(e) => setFormData({ ...formData, totalInterviewCredits: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qwikBlue focus:border-qwikBlue transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Total Position Credits</label>
              <input
                type="number"
                required
                value={formData.totalPositionCredits}
                onChange={(e) => setFormData({ ...formData, totalPositionCredits: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qwikBlue focus:border-qwikBlue transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Valid Till</label>
              <input
                type="date"
                required
                value={formData.validTill}
                onChange={(e) => setFormData({ ...formData, validTill: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qwikBlue focus:border-qwikBlue transition"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <button type="submit" className="flex-1 py-3 px-4 bg-qwikBlue hover:bg-qwikBlueDark text-slate-900 font-bold rounded-lg transition duration-200 shadow-lg">Update Credits</button>
              <button type="button" onClick={onClose} className="px-4 py-3 border-2 border-gray-300 hover:border-gray-400 text-slate-700 hover:text-slate-900 font-medium rounded-lg transition duration-200">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const filteredAdmins = admins.filter(admin =>
    admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCandidates = candidates.filter(candidate =>
    candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredColleges = colleges.filter(college =>
    college.collegeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.collegeCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredJobs = jobs.filter(job =>
    job.jobCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (currentView === "admins") {
    return (
      <div className="space-y-6 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Management</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Manage admin users in your organization</p>
          </div>
          <button
            onClick={() => navigate("/dashboard/create-admin")}
            className="inline-flex items-center gap-x-1.5 rounded-md bg-qwikBlue px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-qwikBlueDark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all"
          >
            <UserPlus className="-ml-0.5 h-4 w-4" aria-hidden="true" />
            Create Admin
          </button>
        </div>

        {/* Standard Controls (Search) */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search admins by email, name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md pl-3 pr-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Admins Table */}
        <div className="bg-transparent flex flex-col">
          <div className="w-full overflow-x-auto">
            <table className="min-w-full border-separate" style={{ borderSpacing: '0 8px' }}>
              <thead className="sticky top-0 z-10 bg-qwikBlue shadow-sm">
                <tr className="rounded-md h-12 mb-4">
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue rounded-l-lg">Email</th>
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Full Name</th>
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Role</th>
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Status</th>
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-transparent">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        Loading admins...
                      </div>
                    </td>
                  </tr>
                ) : filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500">
                      {searchTerm ? "No admins found matching your search" : "No admins found"}
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin) => (
                    <tr key={admin.id} className="bg-white shadow-sm hover:shadow-md transition-shadow group rounded-md">
                      <td className="px-6 py-3 rounded-l-lg border-l border-y border-gray-100 text-xs font-medium text-black">
                        {admin.email}
                      </td>
                      <td className="px-6 py-3 border-y border-gray-100 text-xs text-black">
                        {admin.fullName || "-"}
                      </td>
                      <td className="px-6 py-3 border-y border-gray-100 text-xs">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-black border border-blue-200">
                          {admin.role}
                        </span>
                      </td>
                      <td className="px-6 py-3 border-y border-gray-100 text-xs text-black">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${admin.active ? "bg-green-50 text-green-700 ring-green-600/20" : "bg-red-50 text-red-700 ring-red-600/20"
                          }`}>
                          {admin.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-3 rounded-r-lg border-r border-y border-gray-100 text-xs">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditAdmin(admin)}
                            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            title="Edit Admin"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => { setSelectedAdmin(admin); setShowDeleteConfirmModal(true); }}
                            className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Delete Admin"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showEditAdminModal && <EditAdminModal />}
        {showDeleteConfirmModal && <DeleteConfirmModal />}
        <SnackbarAlert
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={handleCloseSnackbar}
        />
      </div>
    );
  }

  if (currentView === "candidates") {
    return (
      <div className="space-y-6 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Candidate Management</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Manage candidates and invitations</p>
          </div>
          <button
            onClick={() => setShowInviteCandidateModal(true)}
            className="inline-flex items-center gap-x-1.5 rounded-md bg-qwikBlue px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-qwikBlueDark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all"
          >
            <Mail className="-ml-0.5 h-4 w-4" aria-hidden="true" />
            Invite Candidate
          </button>
        </div>

        {/* Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md pl-3 pr-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Candidates Table */}
        <div className="bg-transparent flex flex-col">
          <div className="w-full overflow-x-auto">
            <table className="min-w-full border-separate" style={{ borderSpacing: '0 8px' }}>
              <thead className="sticky top-0 z-10 bg-qwikBlue shadow-sm">
                <tr className="rounded-md h-12 mb-4">
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue rounded-l-lg">Email</th>
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Full Name</th>
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Phone</th>
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Payment Status</th>
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-transparent">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        Loading candidates...
                      </div>
                    </td>
                  </tr>
                ) : filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500">
                      {searchTerm ? "No candidates found matching your search" : "No candidates found"}
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((candidate) => (
                    <tr key={candidate.id} className="bg-white shadow-sm hover:shadow-md transition-shadow group rounded-md">
                      <td className="px-6 py-3 rounded-l-lg border-l border-y border-gray-100 text-xs font-medium text-black">
                        {candidate.email}
                      </td>
                      <td className="px-6 py-3 border-y border-gray-100 text-xs text-black">
                        {candidate.fullName || "-"}
                      </td>
                      <td className="px-6 py-3 border-y border-gray-100 text-xs text-black">
                        {candidate.phone || "-"}
                      </td>
                      <td className="px-6 py-3 border-y border-gray-100 text-xs">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${candidate.registrationPaid ? "bg-green-50 text-green-700 ring-green-600/20" : "bg-yellow-50 text-yellow-700 ring-yellow-600/20"
                          }`}>
                          {candidate.registrationPaid ? (
                            <>
                              <Check size={12} className="mr-1" />
                              Paid
                            </>
                          ) : (
                            "Pending"
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-3 rounded-r-lg border-r border-y border-gray-100 text-xs">
                        <button className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                          <Edit size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showInviteCandidateModal && <InviteCandidateModal />}
        <SnackbarAlert
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={handleCloseSnackbar}
        />
      </div>
    );
  }

  if (currentView === "colleges") {
    return (
      <div className="space-y-6 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">College Management</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Manage partner colleges</p>
          </div>
          <button
            onClick={() => setShowCreateCollegeModal(true)}
            className="inline-flex items-center gap-x-1.5 rounded-md bg-qwikBlue px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-qwikBlueDark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all"
          >
            <GraduationCap className="-ml-0.5 h-4 w-4" aria-hidden="true" />
            Create College
          </button>
        </div>

        {/* Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search colleges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md pl-3 pr-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Colleges Table */}
        <div className="bg-transparent flex flex-col">
          <div className="w-full overflow-x-auto">
            <table className="min-w-full border-separate" style={{ borderSpacing: '0 8px' }}>
              <thead className="sticky top-0 z-10 bg-qwikBlue shadow-sm">
                <tr className="rounded-md h-12 mb-4">
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue rounded-l-lg">College Name</th>
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">College Code</th>
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Database Name</th>
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-transparent">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        Loading colleges...
                      </div>
                    </td>
                  </tr>
                ) : filteredColleges.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-sm text-gray-500">
                      {searchTerm ? "No colleges found matching your search" : "No colleges found"}
                    </td>
                  </tr>
                ) : (
                  filteredColleges.map((college) => (
                    <tr key={college.collegeId} className="bg-white shadow-sm hover:shadow-md transition-shadow group rounded-md">
                      <td className="px-6 py-3 rounded-l-lg border-l border-y border-gray-100 text-xs font-medium text-black">
                        {college.collegeName}
                      </td>
                      <td className="px-6 py-3 border-y border-gray-100 text-xs">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-black border border-blue-200">
                          {college.collegeCode}
                        </span>
                      </td>
                      <td className="px-6 py-3 border-y border-gray-100 text-xs font-mono text-gray-600">
                        {college.dbName}
                      </td>
                      <td className="px-6 py-3 rounded-r-lg border-r border-y border-gray-100 text-xs">
                        <div className="flex gap-2">
                          <button className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                            <Edit size={16} />
                          </button>
                          <button className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showCreateCollegeModal && <CreateCollegeModal />}
        <SnackbarAlert
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={handleCloseSnackbar}
        />
      </div>
    );
  }

  if (currentView === "jobs") {
    return (
      <div className="space-y-6 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Job Management</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Manage job opportunities and openings</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowUploadCsvModal(true)}
              className="inline-flex items-center gap-x-1.5 rounded-md bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-all"
            >
              <Upload className="-ml-0.5 h-4 w-4 text-slate-500" aria-hidden="true" />
              Upload CSV
            </button>
            <button
              onClick={() => {
                setSelectedJob(null);
                setShowCreateJobModal(true);
              }}
              className="inline-flex items-center gap-x-1.5 rounded-md bg-qwikBlue px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-qwikBlueDark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all"
            >
              <Briefcase className="-ml-0.5 h-4 w-4" aria-hidden="true" />
              Create Job
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md pl-3 pr-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-transparent flex flex-col">
          <div className="w-full overflow-x-auto">
            <table className="min-w-full border-separate" style={{ borderSpacing: '0 8px' }}>
              <thead className="sticky top-0 z-10 bg-qwikBlue shadow-sm">
                <tr className="rounded-md h-12 mb-4">
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue rounded-l-lg">Job Code</th>
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Company</th>
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Job Title</th>
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Skills</th>
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Package</th>
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-transparent">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        Loading jobs...
                      </div>
                    </td>
                  </tr>
                ) : filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-500">
                      {searchTerm ? "No jobs found matching your search" : "No jobs found"}
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => (
                    <tr key={job.jobId} className="bg-white shadow-sm hover:shadow-md transition-shadow group rounded-md">
                      <td className="px-6 py-3 rounded-l-lg border-l border-y border-gray-100 text-xs text-black">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {job.jobCode}
                        </span>
                      </td>
                      <td className="px-6 py-3 border-y border-gray-100 text-xs text-black">
                        {job.companyName}
                      </td>
                      <td className="px-6 py-3 border-y border-gray-100 text-xs font-medium text-black">
                        {job.jobTitle}
                      </td>
                      <td className="px-6 py-3 border-y border-gray-100 text-xs text-gray-500">
                        <div className="max-w-xs truncate" title={job.skills}>
                          {job.skills || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-3 border-y border-gray-100 text-xs text-black font-medium">
                        {job.packageAmount || "-"}
                      </td>
                      <td className="px-6 py-3 rounded-r-lg border-r border-y border-gray-100 text-xs">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedJob(job);
                              setShowEditJobModal(true);
                            }}
                            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            title="Edit Job"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedJob(job);
                              setShowDeleteJobModal(true);
                            }}
                            className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Delete Job"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showCreateJobModal && <CreateJobModal />}
        {showEditJobModal && <EditJobModal />}
        {showDeleteJobModal && <DeleteJobModal />}
        {showUploadCsvModal && <UploadCsvModal />}
        <SnackbarAlert
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={handleCloseSnackbar}
        />
      </div>
    );
  }

  // Users View
  if (currentView === "users") {
    return (
      <div className="space-y-6 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Management</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Manage system users</p>
          </div>
          <button
            onClick={() => navigate("/dashboard/create-admin")}
            className="inline-flex items-center gap-x-1.5 rounded-md bg-qwikBlue px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-qwikBlueDark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all"
          >
            <UserPlus className="-ml-0.5 h-4 w-4" aria-hidden="true" />
            Add User
          </button>
        </div>

        {/* Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md pl-3 pr-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-transparent flex flex-col">
          <div className="w-full overflow-x-auto">
            <table className="min-w-full border-separate" style={{ borderSpacing: '0 8px' }}>
              <thead className="sticky top-0 z-10 bg-qwikBlue shadow-sm">
                <tr className="rounded-md h-12 mb-4">
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue rounded-l-lg">Email</th>
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Full Name</th>
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Role</th>
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Status</th>
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-transparent">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        Loading users...
                      </div>
                    </td>
                  </tr>
                ) : filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500">
                      {searchTerm ? "No users found matching your search" : "No users found"}
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin) => (
                    <tr key={admin.id} className="bg-white shadow-sm hover:shadow-md transition-shadow group rounded-md">
                      <td className="px-6 py-3 rounded-l-lg border-l border-y border-gray-100 text-xs font-medium text-black">
                        {admin.email}
                      </td>
                      <td className="px-6 py-3 border-y border-gray-100 text-xs text-black">
                        {admin.fullName || "-"}
                      </td>
                      <td className="px-6 py-3 border-y border-gray-100 text-xs text-black">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-black border border-blue-200">
                          {admin.role}
                        </span>
                      </td>
                      <td className="px-6 py-3 border-y border-gray-100 text-xs">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${admin.active ? "bg-green-50 text-green-700 ring-green-600/20" : "bg-red-50 text-red-700 ring-red-600/20"
                          }`}>
                          {admin.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-3 rounded-r-lg border-r border-y border-gray-100 text-xs">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditAdmin(admin)}
                            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            title="Edit User"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => { setSelectedAdmin(admin); setShowDeleteConfirmModal(true); }}
                            className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showEditAdminModal && <EditAdminModal />}
        {showDeleteConfirmModal && <DeleteConfirmModal />}
        <SnackbarAlert
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={handleCloseSnackbar}
        />
      </div>
    );
  }

  // Roles View
  if (currentView === "roles") {
    return (
      <div className="space-y-6 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Role Management</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Manage system roles</p>
          </div>
          <button
            onClick={() => navigate("/dashboard/create-role")}
            className="inline-flex items-center gap-x-1.5 rounded-md bg-qwikBlue px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-qwikBlueDark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all"
          >
            <Plus className="-ml-0.5 h-4 w-4" aria-hidden="true" />
            Add Role
          </button>
        </div>

        {/* Roles Table */}
        <div className="bg-transparent flex flex-col">
          <div className="w-full overflow-x-auto">
            <table className="min-w-full border-separate" style={{ borderSpacing: '0 8px' }}>
              <thead className="sticky top-0 z-10 bg-qwikBlue shadow-sm">
                <tr className="rounded-md h-12 mb-4">
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue rounded-l-lg">Role ID</th>
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Role Name</th>
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-transparent">
                {loading ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        Loading roles...
                      </div>
                    </td>
                  </tr>
                ) : roles.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-sm text-gray-500">
                      No roles found
                    </td>
                  </tr>
                ) : (
                  roles.map((role) => (
                    <tr key={role.id} className="bg-white shadow-sm hover:shadow-md transition-shadow group rounded-md">
                      <td className="px-6 py-3 rounded-l-lg border-l border-y border-gray-100 text-xs font-medium text-black">
                        {role.id}
                      </td>
                      <td className="px-6 py-3 border-y border-gray-100 text-xs text-black">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-black border border-blue-200">
                          {role.name}
                        </span>
                      </td>
                      <td className="px-6 py-3 rounded-r-lg border-r border-y border-gray-100 text-xs">
                        <button className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                          <Edit size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
  }

  // Credits View
  if (currentView === "credits") {
    return (
      <div className="space-y-4">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-xs font-bold text-slate-900">Credit Management</h1>
            <p className="text-slate-500 mt-2">Manage organization test credits</p>
          </div>
          <button
            onClick={() => navigate('/dashboard/create-admin')}
            className="bg-qwikBlue text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-qwikBlueDark transition shadow-md font-semibold text-xs"
          >
            <UserPlus size={18} />
            Create Admin
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qwikBlue focus:border-qwikBlue transition"
            />
          </div>
        </div>

        {/* Credits Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-qwikBlue text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-[10px] font-medium">Organization</th>
                  <th className="px-6 py-3 text-left text-[10px] font-medium">Interview Credits</th>
                  <th className="px-6 py-3 text-left text-[10px] font-medium">Position Credits</th>
                  <th className="px-6 py-3 text-left text-[10px] font-medium">Valid Till</th>
                  <th className="px-6 py-3 text-left text-[10px] font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center">Loading...</td>
                  </tr>
                ) : organizationsCredits.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No organizations found</td>
                  </tr>
                ) : (
                  organizationsCredits.map((org) => (
                    <tr key={org.organizationId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-[10px] font-bold">{org.organizationName}</td>
                      <td className="px-6 py-4 text-[10px]">
                        <span className="text-green-600 font-bold">{org.remainingInterviewCredits}</span> / {org.totalInterviewCredits}
                      </td>
                      <td className="px-6 py-4 text-[10px]">
                        <span className="text-blue-600 font-bold">{org.remainingPositionCredits}</span> / {org.totalPositionCredits}
                      </td>
                      <td className="px-6 py-4 text-[10px]">
                        {org.validTill ? new Date(org.validTill).toLocaleDateString() : "No Expiry"}
                      </td>
                      <td className="px-6 py-4 text-[10px]">
                        <button
                          onClick={() => {
                            setSelectedOrgForCredits(org);
                            setShowUpdateCreditsModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold"
                        >
                          <Plus size={16} />
                          Update
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showUpdateCreditsModal && (
          <UpdateCreditsModal
            org={selectedOrgForCredits}
            onClose={() => {
              setShowUpdateCreditsModal(false);
              setSelectedOrgForCredits(null);
            }}
            onSuccess={() => {
              loadCredits();
              setShowUpdateCreditsModal(false);
              setSelectedOrgForCredits(null);
            }}
          />
        )}
      </div>
    );
  }

  // Manual Payment Requests View
  if (currentView === "manual-payments") {
    return (
      <div className="space-y-4">
        <div className="mb-6">
          <h1 className="text-xs font-bold text-slate-900">Manual Payment Requests</h1>
          <p className="text-slate-500 mt-2">Manage top-up requests from organization admins</p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-qwikBlue text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-[10px] font-medium">Organization / Admin</th>
                  <th className="px-6 py-3 text-left text-[10px] font-medium">Requested</th>
                  <th className="px-6 py-3 text-left text-[10px] font-medium">Amount</th>
                  <th className="px-6 py-3 text-left text-[10px] font-medium">Method / Txn ID</th>
                  <th className="px-6 py-3 text-left text-[10px] font-medium">Status</th>
                  <th className="px-6 py-3 text-left text-[10px] font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center">Loading...</td>
                  </tr>
                ) : manualRequests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No requests found</td>
                  </tr>
                ) : (
                  manualRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-[10px] font-bold text-slate-900">{req.organizationName || "Unknown Org"}</div>
                        <div className="text-[8px] text-gray-500">{req.adminName || "Unknown Admin"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[10px]"><span className="font-bold">{req.requestedCredits}</span> Int.</div>
                        <div className="text-[10px]"><span className="font-bold">{req.requestedPositions}</span> Pos.</div>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-bold">₹{req.amount}</td>
                      <td className="px-6 py-4">
                        <div className="text-[10px] font-medium">{req.paymentMethod}</div>
                        <div className="text-[8px] text-gray-500 font-mono">{req.transactionId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[8px] font-bold uppercase ${req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          req.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {req.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveRequest(req.id)}
                              className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                              title="Approve"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => handleRejectRequest(req.id)}
                              className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                              title="Reject"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                        {req.status === 'REJECTED' && (
                          <div className="text-[8px] text-red-500 italic max-w-[100px] truncate" title={req.rejectionReason}>
                            {req.rejectionReason}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Admin Subscription View
  if (currentView === "admin-subscription") {
    return (
      <div className="p-4">
        <AdminSubscription onComplete={() => setCurrentView("admin-manual-payment")} />
      </div>
    );
  }

  if (currentView === "admin-manual-payment") {
    return (
      <div className="p-4">
        <AdminManualPayment onComplete={() => setCurrentView("admins")} />
      </div>
    );
  }



  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SuperAdmin Analytics</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Platform-wide performance and statistics</p>
        </div>
      </div>

      {loading && !dashboardStats && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && (
        <div className="space-y-8">

          {/* TOP ROW - STATS CARDS (Revenue, Jobs, Colleges) */}
          {/* User asked for: Admin Revenue, Student Revenue, Jobs, Colleges */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Admin Revenue */}
            <div className="bg-orange-50 rounded-xl p-6 shadow-sm border border-orange-100 flex flex-col justify-between h-40 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start z-10">
                <div className="p-2 bg-orange-100/50 rounded-lg">
                  <Briefcase className="text-orange-600" size={24} />
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">+12%</span>
              </div>
              <div className="z-10 mt-4">
                <p className="text-sm font-medium text-orange-800">Admin Revenue</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(dashboardStats?.adminRevenue || 0)}
                </h3>
              </div>
              {/* Decorative Background Icon */}
              <Briefcase className="absolute -right-4 -bottom-4 text-orange-100/50 group-hover:text-orange-200/50 transition-colors" size={120} />
            </div>

            {/* Student Revenue */}
            <div className="bg-cyan-50 rounded-xl p-6 shadow-sm border border-cyan-100 flex flex-col justify-between h-40 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start z-10">
                <div className="p-2 bg-cyan-100/50 rounded-lg">
                  <GraduationCap className="text-cyan-600" size={24} />
                </div>
                <span className="text-xs font-semibold text-red-500 bg-red-100 px-2 py-1 rounded-full">-5%</span>
              </div>
              <div className="z-10 mt-4">
                <p className="text-sm font-medium text-cyan-800">Student Revenue</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(dashboardStats?.studentRevenue || 0)}
                </h3>
              </div>
              <GraduationCap className="absolute -right-4 -bottom-4 text-cyan-100/50 group-hover:text-cyan-200/50 transition-colors" size={120} />
            </div>

            {/* Jobs Card */}
            <div className="bg-red-50 rounded-xl p-6 shadow-sm border border-red-100 flex flex-col justify-between h-40 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start z-10">
                <div className="p-2 bg-red-100/50 rounded-lg">
                  <Briefcase className="text-red-600" size={24} />
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">+8%</span>
              </div>
              <div className="z-10 mt-4">
                <p className="text-sm font-medium text-red-800">Total Jobs</p>
                <h3 className="text-2xl font-bold text-gray-900">{dashboardStats?.totalJobs || 0}</h3>
              </div>
              <Briefcase className="absolute -right-4 -bottom-4 text-red-100/50 group-hover:text-red-200/50 transition-colors" size={120} />
            </div>

            {/* Colleges Card */}
            <div className="bg-blue-50 rounded-xl p-6 shadow-sm border border-blue-100 flex flex-col justify-between h-40 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start z-10">
                <div className="p-2 bg-blue-100/50 rounded-lg">
                  <Shield className="text-blue-600" size={24} />
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">+23%</span>
              </div>
              <div className="z-10 mt-4">
                <p className="text-sm font-medium text-blue-800">Total Colleges</p>
                <h3 className="text-2xl font-bold text-gray-900">{dashboardStats?.totalColleges || 0}</h3>
              </div>
              <Shield className="absolute -right-4 -bottom-4 text-blue-100/50 group-hover:text-blue-200/50 transition-colors" size={120} />
            </div>

          </div>

          {/* MIDDLE SECTION - 3 COLUMNS (Admins, Students, Organizations) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* COLUMN 1: ADMINS ("Summary" replacement) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">Admins</h3>
                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium">{dashboardStats?.totalUsers || 0} Total</span>
              </div>
              <div className="space-y-3">

                {/* Total Admins */}
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-200 rounded-md text-amber-700"><Users size={18} /></div>
                    <span className="text-gray-700 font-medium text-sm">Total Admins</span>
                  </div>
                  <span className="text-amber-900 font-bold">{dashboardStats?.totalUsers || 0}</span>
                </div>

                {/* Active Admins */}
                <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-200 rounded-md text-cyan-700"><Check size={18} /></div>
                    <span className="text-gray-700 font-medium text-sm">Active Admins</span>
                  </div>
                  <span className="text-cyan-900 font-bold">{dashboardStats?.activeUsers || 0}</span>
                </div>

                {/* Inactive Admins */}
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-200 rounded-md text-yellow-700"><Clock size={18} /></div>
                    <span className="text-gray-700 font-medium text-sm">Inactive Admins</span>
                  </div>
                  <span className="text-yellow-900 font-bold">{dashboardStats?.inactiveUsers || 0}</span>
                </div>

                {/* Expired Admins */}
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-200 rounded-md text-red-700"><X size={18} /></div>
                    <span className="text-gray-700 font-medium text-sm">Expired Admins</span>
                  </div>
                  <span className="text-red-900 font-bold">{dashboardStats?.expiredUsers || 0}</span>
                </div>

              </div>
            </div>

            {/* COLUMN 2: STUDENTS ("Leads" replacement) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">Students</h3>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">Detailed View</span>
              </div>
              <div className="space-y-3">

                {/* Total Students */}
                <div className="flex items-center justify-between p-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600"><Users size={16} /></div>
                    <div>
                      <p className="text-sm font-bold text-gray-700">Total Students</p>
                      <p className="text-xs text-gray-400">Registered</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-blue-100 bg-blue-600 rounded-full">
                    {dashboardStats?.totalStudents ? `+${dashboardStats?.totalStudents}` : '+0'}
                  </span>
                </div>

                {/* Active Students (Total - Inactive) */}
                <div className="flex items-center justify-between p-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full text-green-600"><Check size={16} /></div>
                    <div>
                      <p className="text-sm font-bold text-gray-700">Active Students</p>
                      <p className="text-xs text-gray-400">Online</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-green-100 bg-green-600 rounded-full">
                    +{((dashboardStats?.totalStudents || 0) - (dashboardStats?.inactiveStudents || 0))}
                  </span>
                </div>

                {/* Inactive Students */}
                <div className="flex items-center justify-between p-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full text-gray-600"><UserX size={16} /></div>
                    <div>
                      <p className="text-sm font-bold text-gray-700">Inactive Students</p>
                      <p className="text-xs text-gray-400">Offline</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-gray-100 bg-gray-600 rounded-full">
                    +{dashboardStats?.inactiveStudents || 0}
                  </span>
                </div>

                {/* Paid Students */}
                <div className="flex items-center justify-between p-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-full text-indigo-600"><Check size={16} /></div>
                    <div>
                      <p className="text-sm font-bold text-gray-700">Paid Students</p>
                      <p className="text-xs text-gray-400">Subscribed</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-indigo-100 bg-indigo-600 rounded-full">
                    +{dashboardStats?.paidStudents || 0}
                  </span>
                </div>

                {/* Unpaid Students */}
                <div className="flex items-center justify-between p-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-full text-orange-600"><Clock size={16} /></div>
                    <div>
                      <p className="text-sm font-bold text-gray-700">Unpaid Students</p>
                      <p className="text-xs text-gray-400">Pending</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-orange-100 bg-orange-600 rounded-full">
                    +{dashboardStats?.unpaidStudents || 0}
                  </span>
                </div>

              </div>
            </div>

            {/* COLUMN 3: ORGANIZATIONS ("Attendance" replacement) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center">
              <div className="w-full flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-gray-800">Organizations</h3>
                <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-md">Today's View</span>
              </div>

              <div className="h-48 w-full mt-4 flex items-center justify-center relative">
                {/* Donut Chart */}
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Active', value: (dashboardStats?.totalOrganizations || 0), fill: '#4F46E5' }, // Indigo
                        { name: 'Pending', value: 0, fill: '#06B6D4' }, // Cyan (Mock pending)
                        { name: 'Inactive', value: 0, fill: '#10B981' } // Emerald (Mock inactive)
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell key="cell-org-active" fill="#4F46E5" />
                      <Cell key="cell-org-pending" fill="#06B6D4" />
                      <Cell key="cell-org-inactive" fill="#10B981" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-indigo-900">{dashboardStats?.totalOrganizations || 0}</span>
                  <span className="text-xs text-gray-500">Total</span>
                </div>
              </div>

              {/* Legend */}
              <div className="w-full mt-6 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-indigo-600"></div>
                    <span className="text-gray-600 font-medium">Total Orgs</span>
                  </div>
                  <span className="font-bold text-gray-900">{dashboardStats?.totalOrganizations || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-cyan-500"></div>
                    <span className="text-gray-600 font-medium">New Joined</span>
                  </div>
                  <span className="font-bold text-gray-900">0</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
                    <span className="text-gray-600 font-medium">Verified</span>
                  </div>
                  <span className="font-bold text-gray-900">0</span>
                </div>
              </div>

            </div>

          </div>

          {/* Growth Chart Section (Kept as extra value below) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-800">Platform Growth Trends</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends?.growth || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAdmins" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FB923C" stopOpacity={0.8} /> {/* Orange default */}
                      <stop offset="95%" stopColor="#FB923C" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCandidates" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.8} /> {/* Cyan default */}
                      <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Area type="monotone" dataKey="admins" name="Admins" stroke="#FB923C" fillOpacity={1} fill="url(#colorAdmins)" strokeWidth={3} />
                  <Area type="monotone" dataKey="candidates" name="Candidates" stroke="#22D3EE" fillOpacity={1} fill="url(#colorCandidates)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* REVENUE ANALYTICS SECTION */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 mt-8">

          {/* REVENUE TRENDS (Timeline) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Revenue Trends</h3>
                <p className="text-sm text-gray-500">Monthly breakdown</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Total Revenue</p>
                  <p className="text-lg font-bold text-gray-900">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR' }).format(
                      (dashboardStats?.adminRevenue || 0) + (dashboardStats?.studentRevenue || 0)
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends?.revenue || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevAdmin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FB923C" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#FB923C" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRevStudent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} prefix="₹" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value) => [`₹${value.toLocaleString()}`, '']}
                  />
                  <Area type="monotone" dataKey="adminRevenue" name="Admin Revenue" stroke="#FB923C" fillOpacity={1} fill="url(#colorRevAdmin)" strokeWidth={2} />
                  <Area type="monotone" dataKey="studentRevenue" name="Student Revenue" stroke="#3B82F6" fillOpacity={1} fill="url(#colorRevStudent)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* TOTAL COUNTS PIE CHART (Middle) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-800">Total Counts</h3>
              <p className="text-sm text-gray-500">Platform Overview</p>
            </div>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Admins', value: dashboardStats?.totalUsers || 0, fill: '#FB923C' },
                      { name: 'Students', value: dashboardStats?.totalStudents || 0, fill: '#3B82F6' },
                      { name: 'Orgs', value: dashboardStats?.totalOrganizations || 0, fill: '#10B981' },
                      { name: 'Jobs', value: dashboardStats?.totalJobs || 0, fill: '#06B6D4' },
                      { name: 'Colleges', value: dashboardStats?.totalColleges || 0, fill: '#8B5CF6' }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell key="cell-0" fill="#FB923C" />
                    <Cell key="cell-1" fill="#3B82F6" />
                    <Cell key="cell-2" fill="#10B981" />
                    <Cell key="cell-3" fill="#06B6D4" />
                    <Cell key="cell-4" fill="#8B5CF6" />
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs mt-2">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-400"></div>Admins: {dashboardStats?.totalUsers || 0}</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div>Students: {dashboardStats?.totalStudents || 0}</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>Orgs: {dashboardStats?.totalOrganizations || 0}</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-cyan-500"></div>Jobs: {dashboardStats?.totalJobs || 0}</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"></div>Colleges: {dashboardStats?.totalColleges || 0}</div>
            </div>
          </div>

          {/* WEEKLY REVENUE (Bar Chart) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Weekly Revenue</h3>
              </div>

              {/* Month Selector */}
              <div className="flex items-center gap-2">
                <select
                  className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5 cursor-pointer outline-none"
                  onChange={handleMonthChange}
                  defaultValue={`${new Date().getMonth() + 1}-${new Date().getFullYear()}`}
                >
                  {Array.from({ length: 12 }).map((_, i) => {
                    const d = new Date();
                    d.setMonth(d.getMonth() - i);
                    const m = d.getMonth() + 1;
                    const y = d.getFullYear();
                    const label = d.toLocaleString('default', { month: 'short', year: 'numeric' });
                    return <option key={`${m}-${y}`} value={`${m}-${y}`}>{label}</option>
                  })}
                </select>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={weeklyData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#E5E7EB" />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={50} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 500 }} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value) => [`₹${value.toLocaleString()}`, '']}
                  />
                  <Bar dataKey="studentRevenue" name="Student Revenue" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={8} />
                  <Bar dataKey="adminRevenue" name="Admin Revenue" fill="#FB923C" radius={[0, 4, 4, 0]} barSize={8} />
                </BarChart>
              </ResponsiveContainer>

              <div className="flex justify-center gap-4 text-xs mt-4">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                  <span className="text-gray-600">Admins</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-gray-600">Students</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default DashboardContent;


