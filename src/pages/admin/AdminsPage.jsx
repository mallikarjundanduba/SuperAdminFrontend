import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import {
    Plus, Search, MoreVertical, RefreshCw, X, Eye, Edit, Ban, CheckCircle,
    Filter, ChevronLeft, ChevronRight, User, Mail, Phone, Code, Shield, Database, Users as UsersIcon, ArrowRight
} from "lucide-react";
import { adminService } from "../../services/adminService";
import { creditService } from "../../services/creditService";
import Pagination from "../../components/common/Pagination";
import SnackbarAlert from "../../components/common/SnackbarAlert";

const AdminsPage = ({ adminInfo }) => {
    const [admins, setAdmins] = useState([]);
    const [creditsMap, setCreditsMap] = useState({});
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const navigate = useNavigate();
    const [actionMenuOpen, setActionMenuOpen] = useState(null); // ID of admin with open menu

    // Modals state
    const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
    // Placeholders for future modal integration
    // const [showEditAdminModal, setShowEditAdminModal] = useState(false);
    // const [showDeleteAdminModal, setShowDeleteAdminModal] = useState(false);
    // const [selectedAdmin, setSelectedAdmin] = useState(null);

    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    // Details Drawer State
    const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
    const [fullAdminDetails, setFullAdminDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const showMessage = (message, severity = "success") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const loadAdmins = async () => {
        try {
            setLoading(true);

            // Build query params
            const params = {
                page: currentPage,
                size: itemsPerPage,
                search: searchTerm,
                sortBy: 'createdAt',
                direction: 'desc'
            };

            // Parallel fetch: Admins + Credits
            const [data, creditsResponse] = await Promise.all([
                adminService.getAllAdmins(params),
                creditService.getAllOrganizationsCredits().catch(err => {
                    console.error("Failed to fetch credits map:", err);
                    return { data: [] }; // Fallback
                })
            ]);

            // Process Credits Map
            const creditsList = creditsResponse?.data || creditsResponse || [];
            const newCreditsMap = {};
            if (Array.isArray(creditsList)) {
                creditsList.forEach(credit => {
                    if (credit.organizationId) {
                        newCreditsMap[credit.organizationId] = true;
                    }
                });
            }
            setCreditsMap(newCreditsMap);

            if (data && data.content) {
                setAdmins(data.content);
                setTotalItems(data.totalItems || 0);
            } else if (Array.isArray(data)) {
                // Fallback for endpoints that return just a list (like legacy org endpoint)
                setAdmins(data);
                setTotalItems(data.length);
            } else {
                setAdmins([]);
                setTotalItems(0);
            }
        } catch (error) {
            console.error("Error loading admins:", error);
            showMessage("Failed to load admins", "error");
            setAdmins([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadAdmins();
        }, 300); // 300ms debounce for search

        return () => clearTimeout(timer);
    }, [currentPage, itemsPerPage, searchTerm, adminInfo]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(0); // Reset to first page on search
    };

    const handleViewDetails = async (adminId) => {
        try {
            setLoadingDetails(true);
            setShowDetailsDrawer(true);
            const data = await adminService.getAdminFullDetails(adminId);
            setFullAdminDetails(data);
        } catch (error) {
            console.error("Error fetching admin full details:", error);
            showMessage("Failed to fetch admin details", "error");
            setShowDetailsDrawer(false);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleEditAdmin = (adminId) => {
        navigate(`/dashboard/admins/${adminId}/edit`);
    };

    const handleToggleStatus = async (adminId, currentStatus) => {
        try {
            if (currentStatus) {
                await adminService.deactivateAdmin(adminId);
                showMessage("Admin deactivated successfully");
            } else {
                await adminService.activateAdmin(adminId);
                showMessage("Admin activated successfully");
            }
            loadAdmins();
        } catch (error) {
            console.error("Error toggling admin status:", error);
            showMessage("Failed to update status", "error");
        }
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Management</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Manage system administrators</p>
                </div>
                <div className="flex items-center gap-3">
                </div>
            </div>

            {/* Standard Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                {/* Page Size Selector */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                    <label htmlFor="pageSize" className="text-xs text-gray-900 font-medium">Show</label>
                    <select
                        id="pageSize"
                        value={itemsPerPage}
                        onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(0); }}
                        className="rounded-md border-gray-300 text-xs py-1.5 px-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-sm"
                    >
                        {[10, 20, 30, 40, 50].map((val) => (<option key={val} value={val}>{val}</option>))}
                    </select>
                    <span className="text-xs text-gray-900">Entries</span>
                </div>

                {/* Search Input */}
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Search by name or email..."
                            className="w-full border border-gray-300 rounded-md pl-3 pr-3 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end flex-shrink-0">
                    <button
                        onClick={loadAdmins}
                        className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        title="Refresh Data"
                    >
                        <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                        onClick={() => navigate("/dashboard/create-admin")}
                        className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all"
                    >
                        <Plus className="-ml-0.5 h-4 w-4" aria-hidden="true" />
                        Add Admin
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="w-full mt-1">
                <div className="w-full">
                    <table className="min-w-full border-separate" style={{ borderSpacing: '0 8px' }}>
                        <thead className="sticky top-0 z-10 bg-qwikBlue shadow-sm">
                            <tr className="rounded-md h-12 mb-4">
                                <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue rounded-l-lg">User</th>
                                <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Role</th>
                                <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Status</th>
                                {/* Only show Credits column if NOT SuperAdmin */}
                                {adminInfo?.role?.name !== 'SUPERADMIN' && (
                                    <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Credits</th>
                                )}
                                <th className="px-6 py-2.5 text-center text-xs font-semibold text-white bg-qwikBlue rounded-r-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-transparent">
                            {loading ? (
                                <tr>
                                    <td colSpan={adminInfo?.role?.name !== 'SUPERADMIN' ? "5" : "4"} className="px-6 py-16">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                                            <p className="text-sm font-bold text-slate-400">Loading admins...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : admins.length === 0 ? (
                                <tr>
                                    <td colSpan={adminInfo?.role?.name !== 'SUPERADMIN' ? "5" : "4"} className="px-6 py-20 text-center text-xs text-gray-500">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <p className="text-lg font-black text-slate-900">{searchTerm ? "No admins found matching your search" : "No admins found"}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                admins.map((admin) => (
                                    <tr key={admin.id} className="bg-white shadow-sm hover:shadow-md transition-shadow group rounded-md">
                                        <td className="px-6 py-2 rounded-l-lg border-l border-y border-gray-100">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-semibold text-slate-900">{admin.fullName}</span>
                                                <span className="text-[10px] text-slate-500">{admin.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-2 border-y border-gray-100">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                                {typeof admin.role === 'object' ? admin.role.name : admin.role || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-2 border-y border-gray-100">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${admin.active
                                                ? "bg-green-50 text-green-700 border border-green-200"
                                                : "bg-red-50 text-red-700 border border-red-200"
                                                }`}>
                                                {admin.active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        {/* Only show Credits column if NOT SuperAdmin */}
                                        {adminInfo?.role?.name !== 'SUPERADMIN' && (
                                            <td className="px-6 py-2 border-y border-gray-100">
                                                {admin.isSubscription || creditsMap[admin.organizationId] ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                                        <CheckCircle size={10} /> Credits Added
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => navigate(`/dashboard/admin-subscription`, {
                                                            state: {
                                                                organizationId: admin.organizationId,
                                                                adminId: admin.id,
                                                                fullName: admin.fullName,
                                                                email: admin.email
                                                            }
                                                        })}
                                                        className="inline-flex items-center px-2.5 py-1 rounded text-[10px] font-medium bg-gold-500 text-white hover:bg-gold-600 shadow-sm transition-all"
                                                    >
                                                        Add Credits
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                        <td className="px-6 py-2 rounded-r-lg border-r border-y border-gray-100 text-xs text-center relative">
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActionMenuOpen(actionMenuOpen === admin.id ? null : admin.id);
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>

                                            {/* Dropdown Menu */}
                                            {actionMenuOpen === admin.id && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-10"
                                                        onClick={() => setActionMenuOpen(null)}
                                                    />
                                                    <div className="absolute right-8 top-8 w-32 bg-white rounded-lg shadow-xl border border-gray-100 z-20 py-1 text-left animate-in fade-in zoom-in-95 duration-100">
                                                        <button
                                                            className="w-full px-4 py-2 text-[11px] text-gray-700 hover:bg-gray-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
                                                            onClick={() => {
                                                                handleViewDetails(admin.id);
                                                                setActionMenuOpen(null);
                                                            }}
                                                        >
                                                            <Eye size={12} /> View Details
                                                        </button>
                                                        <button
                                                            className="w-full px-4 py-2 text-[11px] text-gray-700 hover:bg-gray-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
                                                            onClick={() => {
                                                                handleEditAdmin(admin.id);
                                                                setActionMenuOpen(null);
                                                            }}
                                                        >
                                                            <Edit size={12} /> Edit User
                                                        </button>
                                                        <button
                                                            className={`w-full px-4 py-2 text-[11px] hover:bg-gray-50 flex items-center gap-2 transition-colors ${admin.active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}
                                                            onClick={() => {
                                                                handleToggleStatus(admin.id, admin.active);
                                                                setActionMenuOpen(null);
                                                            }}
                                                        >
                                                            {admin.active ? <Ban size={12} /> : <CheckCircle size={12} />} {admin.active ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Details in Footer */}
                {totalItems > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs text-gray-700">
                                    Showing <span className="font-medium">{currentPage * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min((currentPage + 1) * itemsPerPage, totalItems)}</span> of <span className="font-medium">{totalItems}</span> entries
                                </p>
                            </div>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                                totalItems={totalItems}
                                itemsPerPage={itemsPerPage}
                            />
                        </div>
                    </div>
                )}
            </div>
            <SnackbarAlert
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={handleCloseSnackbar}
            />

            {/* Admin Details Drawer - Rendered via Portal to escape parent stacking contexts */}
            {showDetailsDrawer && createPortal(
                <div className="fixed inset-0 z-[10000] overflow-hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                        onClick={() => setShowDetailsDrawer(false)}
                    />

                    {/* Drawer Content */}
                    <div className="absolute inset-y-0 right-0 w-full sm:w-[500px] md:w-[600px] bg-slate-50 shadow-2xl transition-transform animate-in slide-in-from-right duration-300 border-l border-slate-200 flex flex-col">
                        {/* Header */}
                        <div className="px-6 py-5 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 leading-tight">Admin Details</h2>
                                <p className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-wider">Comprehensive View</p>
                            </div>
                            <button
                                onClick={() => setShowDetailsDrawer(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 pb-12">
                            {loadingDetails ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-4">
                                    <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                                    <p className="text-xs font-bold text-slate-400">Fetching complete details...</p>
                                </div>
                            ) : fullAdminDetails ? (
                                <>
                                    {/* Section: Admin Info */}
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Administrative Information
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <DetailItem label="Full Name" value={fullAdminDetails.admin?.fullName} />
                                            <DetailItem label="Email Address" value={fullAdminDetails.admin?.email} />
                                            <DetailItem label="Phone Number" value={fullAdminDetails.admin?.phone || "Not Provided"} />
                                            <DetailItem label="User Code" value={fullAdminDetails.admin?.userCode} />
                                            <DetailItem label="Role" value={fullAdminDetails.admin?.role} />
                                            <DetailItem label="Account Status"
                                                value={
                                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${fullAdminDetails.admin?.active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                        {fullAdminDetails.admin?.active ? 'Active' : 'Inactive'}
                                                    </span>
                                                }
                                            />
                                        </div>
                                    </div>

                                    {/* Section: Organization Info */}
                                    <div className="space-y-4 pt-2">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Organization & Infrastructure
                                        </h3>
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                                <DetailItem label="Organization Name" value={fullAdminDetails.admin?.organizationName} />
                                                <DetailItem label="Database Name" value={<code className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono text-indigo-600">{fullAdminDetails.admin?.dbName || "N/A"}</code>} />
                                                <DetailItem label="Total Students" value={<span className="font-bold text-slate-900">{fullAdminDetails.totalStudents?.toLocaleString() || 0}</span>} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section: Credits Usage */}
                                    <div className="space-y-4 pt-2">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gold-500" /> Credits & Quota Management
                                        </h3>
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600"><CheckCircle size={14} /></div>
                                                    <p className="text-[11px] font-bold text-slate-700">Interview Credits</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-black text-slate-900">{fullAdminDetails.utilizedInterviewCredits || 0} / {fullAdminDetails.totalInterviewCredits || 0}</p>
                                                    <p className="text-[9px] font-medium text-slate-500 uppercase tracking-tighter">Used</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600"><Plus size={14} /></div>
                                                    <p className="text-[11px] font-bold text-slate-700">Position Credits</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-black text-slate-900">{fullAdminDetails.utilizedPositionCredits || 0} / {fullAdminDetails.totalPositionCredits || 0}</p>
                                                    <p className="text-[9px] font-medium text-slate-500 uppercase tracking-tighter">Used</p>
                                                </div>
                                            </div>

                                            <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase">Validity Period</p>
                                                <p className="text-xs font-bold text-slate-900">{fullAdminDetails.validTill ? new Date(fullAdminDetails.validTill).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "Unlimited"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section: Payment History */}
                                    <div className="space-y-4 pt-2">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Transactional History
                                        </h3>
                                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                            <table className="min-w-full divide-y divide-slate-100">
                                                <thead className="bg-slate-50">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-[9px] font-bold text-slate-500 uppercase">Trans ID</th>
                                                        <th className="px-4 py-2 text-left text-[9px] font-bold text-slate-500 uppercase">Amount</th>
                                                        <th className="px-4 py-2 text-left text-[9px] font-bold text-slate-500 uppercase">Status</th>
                                                        <th className="px-4 py-2 text-left text-[9px] font-bold text-slate-500 uppercase">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {(() => {
                                                        const combinedPayments = [
                                                            ...(fullAdminDetails.manualPayments || []).map(p => ({ ...p, type: 'MANUAL' })),
                                                            ...(fullAdminDetails.payments || []).map(p => ({
                                                                transactionId: p.manualReferenceNumber || p.razorpayPaymentId || p.invoiceNumber,
                                                                amount: p.amount,
                                                                status: p.paymentStatus,
                                                                createdAt: p.createdAt,
                                                                type: 'AUTOMATED'
                                                            }))
                                                        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                                                        return combinedPayments.length > 0 ? (
                                                            combinedPayments.map((payment, idx) => (
                                                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                                    <td className="px-4 py-2 text-[10px] font-mono text-slate-600 truncate max-w-[80px]">{payment.transactionId}</td>
                                                                    <td className="px-4 py-2 text-[10px] font-bold text-slate-900">₹{payment.amount?.toLocaleString()}</td>
                                                                    <td className="px-4 py-2">
                                                                        <span className={`inline-flex px-1.5 py-0.5 rounded-[4px] text-[8px] font-black uppercase ${payment.status === 'APPROVED' || payment.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' :
                                                                            payment.status === 'PENDING' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                                                                            }`}>
                                                                            {payment.status}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-2 text-[9px] font-medium text-slate-500">{new Date(payment.createdAt).toLocaleDateString()}</td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="4" className="px-4 py-8 text-center text-[10px] text-slate-400 font-medium italic">No transactions recorded</td>
                                                            </tr>
                                                        );
                                                    })()}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

// Helper component for detail items
const DetailItem = ({ label, value }) => (
    <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{label}</span>
        <span className="text-xs font-semibold text-slate-800 break-words">{value || "—"}</span>
    </div>
);

export default AdminsPage;
