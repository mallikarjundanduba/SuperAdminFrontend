import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    ChevronLeft, Save, X, User, Phone, CheckCircle, Plus,
    Database, ArrowLeft, RefreshCw, Eye, Pencil, Check, ChevronDown, Calendar, Hash, IndianRupee, Search
} from "lucide-react";
import { adminService } from "../../services/adminService";
import { paymentService } from "../../services/paymentService";
import SnackbarAlert from "../../components/common/SnackbarAlert";

const PaymentItem = ({ payment, onUpdate }) => {
    const [editData, setEditData] = useState({
        transactionId: payment.transactionId || "",
        paymentMethod: payment.paymentMethod || "",
        paymentNotes: payment.paymentNotes || ""
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        try {
            setSaving(true);
            await onUpdate(editData);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-4 space-y-3 bg-white border-b border-slate-50 last:border-0">
            <div className="flex justify-between items-center mb-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Transaction Info</span>
                <p className="text-xs font-bold text-slate-900 bg-slate-50 px-2 py-1 rounded-lg">₹{payment.amount?.toLocaleString()}</p>
            </div>

            <div className="space-y-2.5">
                <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Transaction ID / Ref</label>
                    <input
                        className="w-full text-[10px] font-mono p-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        value={editData.transactionId}
                        onChange={e => setEditData(d => ({ ...d, transactionId: e.target.value }))}
                        placeholder="e.g. TXN123456"
                    />
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Payment Method</label>
                        <select
                            className="w-full text-[10px] p-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            value={editData.paymentMethod}
                            onChange={e => setEditData(d => ({ ...d, paymentMethod: e.target.value }))}
                        >
                            <option value="MANUAL">MANUAL</option>
                            <option value="RAZORPAY">RAZORPAY</option>
                            <option value="BANK_TRANSFER">BANK TRANSFER</option>
                            <option value="CASH">CASH</option>
                            <option value="OTHER">OTHER</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Status</label>
                        <div className={`text-[10px] font-bold p-1.5 text-center rounded-lg border flex items-center justify-center uppercase ${payment.status === 'APPROVED' || payment.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            payment.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                            }`}>
                            {payment.status}
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Notes</label>
                    <textarea
                        className="w-full text-[10px] p-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:ring-1 focus:ring-blue-500 outline-none transition-all h-14 resize-none"
                        value={editData.paymentNotes}
                        onChange={e => setEditData(d => ({ ...d, paymentNotes: e.target.value }))}
                        placeholder="Add internal notes..."
                    />
                </div>

                <div className="flex justify-between items-center pt-0.5">
                    <p className="text-[9px] font-medium text-slate-400">Recorded: {new Date(payment.createdAt).toLocaleDateString()}</p>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg transition-all shadow-sm shadow-blue-200 disabled:opacity-50"
                    >
                        {saving ? <RefreshCw size={10} className="animate-spin" /> : <Save size={10} />}
                        Save Details
                    </button>
                </div>
            </div>
        </div>
    );
};

const EditAdmin = ({ adminInfo }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [adminData, setAdminData] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        active: true,
        accountType: "SUBSCRIPTION",
        isFreeDemo: false,
        demoCreditsLimit: 0,
        totalInterviewCredits: 0,
        totalPositionCredits: 0,
        validTill: ""
    });

    const [selectedPaymentIndex, setSelectedPaymentIndex] = useState(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [paymentSearchTerm, setPaymentSearchTerm] = useState("");
    const [fetchingPayments, setFetchingPayments] = useState(false);
    const [hasFetchedPayments, setHasFetchedPayments] = useState(false);

    const showMessage = (message, severity = "success") => {
        setSnackbar({ open: true, message, severity });
    };

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const data = await adminService.getAdminFullDetails(id);
                setAdminData(data);

                // Initialize form
                setFormData({
                    fullName: data.admin?.fullName || "",
                    phone: data.admin?.phone || "",
                    active: data.admin?.active ?? true,
                    accountType: data.admin?.accountType || "SUBSCRIPTION",
                    isFreeDemo: data.admin?.isFreeDemo || false,
                    demoCreditsLimit: data.admin?.demoCreditsLimit || 0,
                    totalInterviewCredits: data.totalInterviewCredits || 0,
                    totalPositionCredits: data.totalPositionCredits || 0,
                    validTill: data.validTill ? data.validTill.split('T')[0] : ""
                });
            } catch (error) {
                console.error("Error fetching admin details:", error);
                showMessage("Failed to load admin details", "error");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDetails();
    }, [id]);

    const handleDropdownClick = async () => {
        setIsDropdownOpen(!isDropdownOpen);
        if (!isDropdownOpen && !hasFetchedPayments && adminData?.admin?.organizationId) {
            try {
                setFetchingPayments(true);
                const response = await paymentService.getPaymentsByOrganization(adminData.admin.organizationId);
                // Handle both direct array and wrapped response
                const payments = Array.isArray(response) ? response : (response?.payments || response?.data || []);

                setAdminData(prev => ({
                    ...prev,
                    payments: payments
                }));
                setHasFetchedPayments(true);
            } catch (error) {
                console.error("Error fetching payments:", error);
                showMessage("Failed to refresh payments", "error");
            } finally {
                setFetchingPayments(false);
            }
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const orgId = adminData.admin.organizationId;

            // 1. Update Basic Info
            await adminService.updateAdmin(id, {
                fullName: formData.fullName,
                phone: formData.phone,
                active: formData.active,
                accountType: formData.accountType,
                isFreeDemo: formData.accountType === 'DEMO' ? formData.isFreeDemo : false,
                demoCreditsLimit: (formData.accountType === 'DEMO' && formData.isFreeDemo) ? parseInt(formData.demoCreditsLimit) : 0
            });

            // 2. Update Credits (if organization admin)
            if (orgId) {
                await adminService.updateCredits(orgId, {
                    totalInterviewCredits: parseInt(formData.totalInterviewCredits),
                    totalPositionCredits: parseInt(formData.totalPositionCredits),
                    validTill: formData.validTill,
                    active: formData.active
                });
            }

            showMessage("Administrator updated successfully");
            setTimeout(() => {
                navigate("/dashboard/admins");
            }, 1500);
        } catch (error) {
            console.error("Error saving admin:", error);
            showMessage(error.response?.data?.message || "Failed to update administrator", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Fetching admin details...</p>
            </div>
        );
    }

    const getPaymentsArray = (data) => Array.isArray(data) ? data : [];

    const combinedPayments = [
        ...getPaymentsArray(adminData?.manualPayments).map(p => ({ ...p, type: 'MANUAL' })),
        ...getPaymentsArray(adminData?.payments).map(p => ({
            id: p.id,
            transactionId: p.manualReferenceNumber || p.razorpayPaymentId || p.invoiceNumber,
            amount: p.amount,
            status: p.paymentStatus,
            createdAt: p.createdAt,
            paymentMethod: p.paymentMethod,
            paymentNotes: p.paymentNotes,
            type: 'AUTOMATED'
        }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Breadcrumbs & Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        Edit Admin Profile
                    </h1>
                    <p className="text-sm font-medium text-slate-500">Update profile, credits and transaction details</p>
                </div>
                <button
                    onClick={() => navigate("/dashboard/admins")}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-all"
                >
                    <ArrowLeft size={14} /> Back to List
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
                {/* Left Column: Form Sections */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Section: Basic Information */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><User size={20} /></div>
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900">Primary Information</h2>
                                    <p className="text-[10px] text-slate-500">Update general account details</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${formData.active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {formData.active ? 'Active' : 'Inactive'}
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer scale-90">
                                    <input
                                        type="checkbox"
                                        name="active"
                                        checked={formData.active}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Phone Number</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Email Address</label>
                                <div className="w-full text-xs font-semibold text-slate-400 bg-slate-50/50 border border-slate-100 rounded-lg px-3 py-2 cursor-not-allowed">
                                    {adminData.admin?.email}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Organization</label>
                                <div className="w-full text-xs font-semibold text-slate-400 bg-slate-50/50 border border-slate-100 rounded-lg px-3 py-2 cursor-not-allowed">
                                    {adminData.admin?.organizationName || 'N/A'}
                                </div>
                            </div>
                        </div>

                        {/* Account Type Configuration */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight block mb-2">Account Type</label>
                                    <div className="flex space-x-4">
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name="accountType"
                                                value="SUBSCRIPTION"
                                                checked={formData.accountType === 'SUBSCRIPTION'}
                                                onChange={handleChange}
                                                className="form-radio text-blue-600 w-4 h-4 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-xs font-medium text-slate-700">Subscription</span>
                                        </label>
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name="accountType"
                                                value="DEMO"
                                                checked={formData.accountType === 'DEMO'}
                                                onChange={handleChange}
                                                className="form-radio text-blue-600 w-4 h-4 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-xs font-medium text-slate-700">Demo</span>
                                        </label>
                                    </div>
                                </div>

                                {formData.accountType === 'DEMO' && (
                                    <div className="md:col-span-2 bg-white p-3 rounded-xl border border-slate-200 mt-2">
                                        <div className="flex items-center mb-3">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="isFreeDemo"
                                                    checked={formData.isFreeDemo}
                                                    onChange={handleChange}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                                <span className="ml-2 text-xs font-bold text-slate-700">Enable Free Demo Credits</span>
                                            </label>
                                        </div>

                                        {formData.isFreeDemo && (
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Demo Credit Limit</label>
                                                <input
                                                    type="number"
                                                    name="demoCreditsLimit"
                                                    value={formData.demoCreditsLimit}
                                                    onChange={handleChange}
                                                    className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                    min="0"
                                                />
                                                <div className="flex justify-between items-center px-1">
                                                    <p className="text-[9px] text-slate-400 italic">Max credits for this demo</p>
                                                    <p className="text-[10px] font-bold text-slate-600">Used: {adminData.admin?.demoCreditsUsed || 0}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section: Credits (if org admin) */}
                    {adminData.admin?.organizationId && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="p-2 bg-gold-50 text-gold-600 rounded-lg"><CheckCircle size={20} /></div>
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900">Credits & Quota Management</h2>
                                    <p className="text-[10px] text-slate-500">Manage organization usage limits</p>
                                </div>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Interview Credits</label>
                                        <input
                                            type="number"
                                            name="totalInterviewCredits"
                                            value={formData.totalInterviewCredits}
                                            onChange={handleChange}
                                            className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-all"
                                            min="0"
                                        />
                                        <div className="flex justify-between items-center px-1">
                                            <p className="text-[9px] text-slate-400 italic font-medium">Accumulated</p>
                                            <p className="text-[10px] font-bold text-slate-600">Used: {adminData.utilizedInterviewCredits || 0}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Position Credits</label>
                                        <input
                                            type="number"
                                            name="totalPositionCredits"
                                            value={formData.totalPositionCredits}
                                            onChange={handleChange}
                                            className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-all"
                                            min="0"
                                        />
                                        <div className="flex justify-between items-center px-1">
                                            <p className="text-[9px] text-slate-400 italic font-medium">Accumulated</p>
                                            <p className="text-[10px] font-bold text-slate-600">Used: {adminData.utilizedPositionCredits || 0}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1 max-w-xs">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Validity Till</label>
                                    <input
                                        type="date"
                                        name="validTill"
                                        value={formData.validTill}
                                        onChange={handleChange}
                                        className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Transaction View */}
                <div className="flex flex-col">
                    {/* Section: Editable Payments List */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-tighter">Transaction Details</h2>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{combinedPayments.length} Recs</span>
                        </div>

                        {combinedPayments.length > 0 ? (
                            <>
                                {/* Selection Dropdown */}
                                <div className="p-4 bg-slate-50/50 border-b border-slate-100 relative">
                                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1.5 ml-1">Select Transaction</label>
                                    <button
                                        type="button"
                                        onClick={handleDropdownClick}
                                        className="w-full flex items-center justify-between px-3 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-blue-400 transition-all text-left shadow-sm group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                                {fetchingPayments ? <RefreshCw size={14} className="animate-spin" /> : <Hash size={14} />}
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-slate-900 leading-none">
                                                    {combinedPayments[selectedPaymentIndex]?.transactionId || "No Transaction"}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[9px] font-semibold text-slate-500 flex items-center gap-1">
                                                        <Calendar size={10} /> {combinedPayments[selectedPaymentIndex]?.createdAt ? new Date(combinedPayments[selectedPaymentIndex].createdAt).toLocaleDateString() : "N/A"}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-blue-600 flex items-center gap-0.5">
                                                        <IndianRupee size={10} /> {combinedPayments[selectedPaymentIndex]?.amount?.toLocaleString() || "0"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isDropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-20" onClick={() => setIsDropdownOpen(false)} />
                                            <div className="absolute left-4 right-4 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                {/* Search Input */}
                                                <div className="p-2 border-b border-slate-100 bg-slate-50/30">
                                                    <div className="relative">
                                                        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                        <input
                                                            type="text"
                                                            placeholder="Search invoices..."
                                                            value={paymentSearchTerm}
                                                            onChange={(e) => setPaymentSearchTerm(e.target.value)}
                                                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
                                                    {(() => {
                                                        const filtered = combinedPayments.filter(p =>
                                                            (p.transactionId || "").toLowerCase().includes(paymentSearchTerm.toLowerCase())
                                                        );

                                                        return filtered.length > 0 ? (
                                                            filtered.map((p, idx) => {
                                                                const originalIdx = combinedPayments.findIndex(orig => orig.id === p.id && orig.type === p.type);
                                                                return (
                                                                    <button
                                                                        key={p.id || idx}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setSelectedPaymentIndex(originalIdx);
                                                                            setIsDropdownOpen(false);
                                                                            setPaymentSearchTerm("");
                                                                        }}
                                                                        className={`w-full px-2.5 py-2 flex flex-col hover:bg-slate-50 transition-colors text-left ${selectedPaymentIndex === originalIdx ? 'bg-blue-50/30' : ''}`}
                                                                    >
                                                                        <div className="flex justify-between items-start">
                                                                            <p className={`text-[10px] font-bold ${selectedPaymentIndex === originalIdx ? 'text-blue-600' : 'text-slate-900'} truncate`}>
                                                                                {p.transactionId || "No ID"}
                                                                            </p>
                                                                            <span className={`text-[7px] font-black px-1 py-0.5 rounded border uppercase flex-shrink-0 ${p.status === 'APPROVED' || p.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                                p.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                                                                                }`}>
                                                                                {p.status}
                                                                            </span>
                                                                        </div>
                                                                        <div className="mt-1 flex flex-col gap-0.5 text-[9px]">
                                                                            <div className="flex items-center gap-1 text-slate-500">
                                                                                <Calendar size={10} /> {new Date(p.createdAt).toLocaleDateString()}
                                                                            </div>
                                                                            <div className="flex items-center gap-1 font-bold text-slate-800">
                                                                                <IndianRupee size={10} /> {p.amount?.toLocaleString()}
                                                                            </div>
                                                                        </div>
                                                                    </button>
                                                                );
                                                            })
                                                        ) : (
                                                            <div className="p-4 text-center">
                                                                <p className="text-[10px] text-slate-400 italic font-medium">No results found</p>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex-1 overflow-y-auto">
                                    <PaymentItem
                                        key={combinedPayments[selectedPaymentIndex].id || selectedPaymentIndex}
                                        payment={combinedPayments[selectedPaymentIndex]}
                                        onUpdate={async (updates) => {
                                            try {
                                                const p = combinedPayments[selectedPaymentIndex];
                                                if (p.type === 'MANUAL') {
                                                    await adminService.updateManualPayment(p.id, updates);
                                                } else {
                                                    await adminService.updatePayment(p.id, {
                                                        manualReferenceNumber: updates.transactionId,
                                                        paymentMethod: updates.paymentMethod,
                                                        paymentNotes: updates.paymentNotes
                                                    });
                                                }
                                                showMessage("Transaction updated");
                                                const data = await adminService.getAdminFullDetails(id);
                                                setAdminData(data);
                                            } catch (err) {
                                                showMessage(err.response?.data?.message || "Failed to update transaction", "error");
                                            }
                                        }}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="p-8 text-center">
                                <p className="text-[10px] font-medium text-slate-400 italic">No payments recorded</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Action Buttons: Full Width */}
                <div className="lg:col-span-3 flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                        {saving ? <><RefreshCw size={18} className="animate-spin" /> Saving Changes...</> : <><Save size={18} /> Save All Changes</>}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/admins")}
                        className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-sm font-bold rounded-2xl transition-all"
                    >
                        Discard Changes
                    </button>
                </div>
            </form>

            <SnackbarAlert
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={() => setSnackbar(p => ({ ...p, open: false }))}
            />
        </div>
    );
};

export default EditAdmin;
