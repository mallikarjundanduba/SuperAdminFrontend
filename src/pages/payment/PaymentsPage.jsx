import React, { useState, useEffect } from "react";
import { Search, RefreshCw, DollarSign, Calendar, TrendingUp, CreditCard, Filter, ChevronDown, MoreVertical, Eye, Download, Printer } from "lucide-react";
import ViewPaymentModal from "../../components/payment/ViewPaymentModal";
import { paymentService } from "../../services/paymentService";
import Pagination from "../../components/common/Pagination";
import SnackbarAlert from "../../components/common/SnackbarAlert";

const PaymentsPage = ({ adminInfo }) => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    // Action Menu State
    const [activeMenu, setActiveMenu] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);

    // Filter State
    const [showFilter, setShowFilter] = useState(false);
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        status: "",
        paymentMethods: "",
        payerType: "",
    });

    const statusOptions = ["PENDING", "COMPLETED", "FAILED", "REFUNDED"];
    const methodOptions = ["BANK_TRANSFER", "UPI", "CARD", "NET_BANKING", "WALLET", "MANUAL"];
    const payerOptions = ["ORGANIZATION", "STUDENT"];

    const toggleFilter = (type, value) => {
        // Switch to single select behavior for Backend compatibility
        setFilters(prev => ({
            ...prev,
            [type]: prev[type] === value ? "" : value
        }));
    };

    const clearFilters = () => {
        setFilters({
            startDate: "",
            endDate: "",
            status: "",
            paymentMethods: ""
        });
        setSearchTerm("");
    };

    // Stats State
    const [stats, setStats] = useState({
        totalRevenue: 0,
        monthlyRevenue: 0,
        weeklyRevenue: 0,
        todayRevenue: 0
    });

    const showMessage = (message, severity = "success") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const loadStats = async () => {
        try {
            // Re-use logic for mapping filters
            const backendFilters = {
                startDate: filters.startDate,
                endDate: filters.endDate,
                status: filters.status,
                paymentMethod: filters.paymentMethods,
                payerType: filters.payerType
            };
            const data = await paymentService.getPaymentStats(backendFilters);
            if (data && data.stats) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error("Failed to load stats", error);
        }
    }

    const loadPayments = async () => {
        try {
            setLoading(true);

            // Map frontend specific filter names to backend params
            // Backend expects: startDate, endDate, status, search
            const backendFilters = {
                startDate: filters.startDate,
                endDate: filters.endDate,
                status: filters.status,
                paymentMethod: filters.paymentMethods,
                payerType: filters.payerType,
                search: searchTerm
            };

            const data = await paymentService.getAllPayments(backendFilters);

            let paymentArray = [];
            if (Array.isArray(data)) {
                paymentArray = data;
            } else if (data && Array.isArray(data.payments)) {
                paymentArray = data.payments;
            } else if (data && data.data && Array.isArray(data.data)) {
                paymentArray = data.data;
            }

            setPayments(paymentArray);
        } catch (error) {
            console.error("Error loading payments:", error);
            // showMessage("Failed to load payments", "error"); 
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPayments();
        loadStats();
    }, [filters, searchTerm]); // Reload when filters change

    // Frontend Pagination logic (Data is already filtered by backend, but we might receive all matches and paginate locally 
    // OR backend paginates. Controller return 'all payments with filters'. So it returns LIST.
    // So we paginate that list locally.

    const totalItems = payments.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const currentPayments = payments.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Handle Actions
    const handleActionClick = (e, paymentId) => {
        e.stopPropagation();
        setActiveMenu(activeMenu === paymentId ? null : paymentId);
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenu(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleViewPayment = (payment) => {
        setSelectedPayment(payment);
        setShowViewModal(true);
        setActiveMenu(null);
    };

    const handleDownloadReceipt = (payment) => {
        setSelectedPayment(payment);
        setShowViewModal(true); // Open modal which has the print button
        setActiveMenu(null);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payments</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Manage and track all payment transactions</p>
                </div>
                <div className="flex items-center gap-3 relative">
                    <button
                        onClick={() => setShowFilter(!showFilter)}
                        className={`inline-flex items-center gap-x-1.5 rounded-md px-3 py-2 text-xs font-semibold shadow-sm ring-1 ring-inset transition-all ${showFilter || filters.status || filters.startDate || filters.paymentMethods || filters.payerType
                            ? 'bg-blue-50 text-blue-700 ring-blue-200'
                            : 'bg-white text-slate-700 ring-slate-300 hover:bg-slate-50'}`}
                    >
                        <Filter className="-ml-0.5 h-4 w-4" />
                        Filter
                        <ChevronDown className="h-3 w-3 ml-1" />
                    </button>

                    {/* Filter Dropdown */}
                    {showFilter && (
                        <div className="absolute right-0 top-10 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-50 p-4 animate-in fade-in zoom-in-95 origin-top-right text-left">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-slate-800">Advanced Filters</h3>
                                <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline">Clear All</button>
                            </div>

                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                                {/* Date Range */}
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Date Range</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="date"
                                            value={filters.startDate}
                                            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                                            className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <input
                                            type="date"
                                            value={filters.endDate}
                                            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                                            className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Payer Type (Org vs Student) */}
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Payer Type</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['ALL', ...payerOptions].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => toggleFilter('payerType', type === 'ALL' ? "" : type)}
                                                className={`px-2 py-1 rounded text-[10px] font-medium border transition-colors ${(type === 'ALL' && !filters.payerType) || filters.payerType === type
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                {type === 'ALL' ? 'All' : type === 'ORGANIZATION' ? 'Organization' : 'Student'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Status</label>
                                    <div className="flex flex-wrap gap-2">
                                        {statusOptions.map(status => (
                                            <button
                                                key={status}
                                                onClick={() => toggleFilter('status', status)}
                                                className={`px-2 py-1 rounded text-[10px] font-medium border transition-colors ${filters.status === status
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment Method (Type) */}
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Payment Method</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {methodOptions.map(method => (
                                            <button
                                                key={method}
                                                onClick={() => toggleFilter('paymentMethods', method)}
                                                className={`px-2 py-1.5 rounded text-[10px] font-medium border transition-colors text-center ${filters.paymentMethods === method
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                {method.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>



            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Revenue"
                    value={formatCurrency(stats.totalRevenue)}
                    icon={DollarSign}
                    color="blue"
                    subtitle="All time earnings"
                />
                <StatsCard
                    title="Monthly Revenue"
                    value={formatCurrency(stats.monthlyRevenue)}
                    icon={TrendingUp}
                    color="green"
                    subtitle="Current month"
                />
                <StatsCard
                    title="Weekly Revenue"
                    value={formatCurrency(stats.weeklyRevenue)}
                    icon={Calendar}
                    color="purple"
                    subtitle="Current week"
                />
                <StatsCard
                    title="Today's Revenue"
                    value={formatCurrency(stats.todayRevenue)}
                    icon={CreditCard}
                    color="orange"
                    subtitle="Today so far"
                />
            </div>

            {/* Controls */}
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
                        {[15, 25, 50, 100].map((val) => (<option key={val} value={val}>{val}</option>))}
                    </select>
                    <span className="text-xs text-gray-900">Entries</span>
                </div>

                {/* Search Input */}
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search invoice, ref..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Actions & Filters */}
                <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end flex-shrink-0 relative">
                    <button
                        onClick={() => { loadPayments(); loadStats(); }}
                        className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        title="Refresh Data"
                    >
                        <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline">Clear Filters</button>
                </div>
            </div>

            {/* Table */}
            <div className="w-full mt-1">
                <div className="w-full">
                    <table className="min-w-full border-separate" style={{ borderSpacing: '0 8px' }}>
                        <thead className="sticky top-0 z-10 bg-qwikBlue shadow-sm">
                            <tr className="rounded-md h-12 mb-4">
                                <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue rounded-l-lg">Invoice / Ref</th>
                                <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Amount</th>
                                <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Date</th>
                                <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Method</th>
                                <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Status</th>
                                <th className="px-6 py-2.5 text-center text-xs font-semibold text-white bg-qwikBlue rounded-r-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-transparent">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                                            <p className="text-sm font-bold text-slate-400">Loading payments...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : currentPayments.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-xs text-gray-500">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <p className="text-lg font-black text-slate-900">{searchTerm ? "No payments found matching your search" : "No payments found"}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentPayments.map((payment, index) => (
                                    <tr key={payment.id || index} className="bg-white shadow-sm hover:shadow-md transition-shadow group rounded-md">
                                        <td className="px-6 py-2 rounded-l-lg border-l border-y border-gray-100">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-900">{payment.invoiceNumber || payment.manualReferenceNumber || "-"}</span>
                                                <span className="text-[10px] text-slate-500">
                                                    {payment.candidateName || payment.adminName || payment.userName || (payment.organizationId ? "Organization Payment" : "Unknown User")}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-2 border-y border-gray-100">
                                            <span className="text-xs font-bold text-slate-900">
                                                {formatCurrency(payment.amount || 0)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-2 border-y border-gray-100 text-xs text-slate-500">
                                            {formatDate(payment.createdAt || payment.paymentDate)}
                                        </td>
                                        <td className="px-6 py-2 border-y border-gray-100">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 capitalize">
                                                {(payment.paymentMethod || "General").replace('_', ' ').toLowerCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-2 border-y border-gray-100">
                                            <StatusBadge status={payment.paymentStatus || payment.status} />
                                        </td>

                                        {/* Actions Column */}
                                        <td className="px-6 py-2 rounded-r-lg border-r border-y border-gray-100 text-xs text-center relative">
                                            <button
                                                onClick={(e) => handleActionClick(e, payment.id)}
                                                className="p-1.5 text-gray-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                                            >
                                                <MoreVertical size={16} />
                                            </button>

                                            {activeMenu === payment.id && (
                                                <div className="absolute right-8 top-8 w-40 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right text-left">
                                                    <button
                                                        onClick={() => handleViewPayment(payment)}
                                                        className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                                    >
                                                        <Eye size={14} className="text-blue-500" /> View Details
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownloadReceipt(payment)}
                                                        className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                                    >
                                                        <Download size={14} className="text-green-500" /> Download
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {totalItems > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs text-gray-700">
                                    Showing <span className="font-medium">{payments.length > 0 ? currentPage * itemsPerPage + 1 : 0}</span> to <span className="font-medium">{Math.min((currentPage + 1) * itemsPerPage, payments.length)}</span> of <span className="font-medium">{payments.length}</span> entries
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

            {/* View Payment Modal */}
            <ViewPaymentModal
                payment={selectedPayment}
                onClose={() => setShowViewModal(false)}
            />
        </div>
    );
};

// Helper Components
const StatsCard = ({ title, value, icon: Icon, color, subtitle }) => {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        purple: "bg-purple-50 text-purple-600",
        orange: "bg-orange-50 text-orange-600"
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                    <Icon size={18} />
                </div>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">{subtitle}</span>
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{value}</h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">{title}</p>
            </div>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'success':
            case 'completed':
            case 'paid':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'pending':
            case 'processing':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'failed':
            case 'cancelled':
            case 'refunded':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusStyle(status)} capitalize`}>
            {status || "Unknown"}
        </span>
    );
};

export default PaymentsPage;
