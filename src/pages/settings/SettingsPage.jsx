import React, { useState } from "react";
import {
    Settings, Bell, CreditCard, Users, Save,
    Mail, Lock, Database, Tag, Percent, Eye, EyeOff, MessageSquare, Send, X, RefreshCw, Play
} from "lucide-react";
import { Link } from "react-router-dom";
import SnackbarAlert from "../../components/common/SnackbarAlert";
import { authService } from "../../services/authService";
import apiClient from "../../services/apiService";
import { cronJobService } from "../../services/cronJobService";
import { useEffect } from "react";

const SettingsPage = ({ adminInfo }) => {
    const [activeTab, setActiveTab] = useState("notifications");
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const [showAuthToken, setShowAuthToken] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteType, setDeleteType] = useState(null); // 'EMAIL', 'ADMIN_PLAN', 'CANDIDATE_PLAN'
    const [generatingQuiz, setGeneratingQuiz] = useState(false);
    const [generatingSkills, setGeneratingSkills] = useState(false);

    // Mock initial state - in real app, these would come from an API
    const [config, setConfig] = useState({
        // Support
        tickets: [],

        // Multi-Email Configurations
        emailConfigs: [],

        // Payments (Razorpay)
        currency: "INR",
        taxPercentage: 18,

        // Candidates
        enableRegistration: true,
        defaultRole: "CANDIDATE",
        registrationFee: 0,
        renewalFee: 0,
        subscriptionPlans: [],

        // Admin Plans
        adminPlans: []
    });

    useEffect(() => {
        const fetchCandidateConfig = async () => {
            try {
                const [feesRes, plansRes] = await Promise.all([
                    apiClient.get('/api/config/fees'),
                    apiClient.get('/api/candidate-plans')
                ]);

                setConfig(prev => ({
                    ...prev,
                    registrationFee: parseInt(feesRes.data.registrationFee || 0),
                    renewalFee: parseInt(feesRes.data.renewalFee || 0),
                    subscriptionPlans: plansRes.data || []
                }));
            } catch (error) {
                console.error("Failed to fetch candidate config", error);
            }
        };

        const fetchAdminConfig = async () => {
            try {
                const plansRes = await apiClient.get('/api/admin-plans');
                setConfig(prev => ({
                    ...prev,
                    adminPlans: plansRes.data || []
                }));
            } catch (error) {
                console.error("Failed to fetch admin plans", error);
            }
        };

        if (activeTab === 'candidates') {
            fetchCandidateConfig();
        } else if (activeTab === 'admins') {
            fetchAdminConfig();
        } else if (activeTab === 'notifications') {
            const fetchEmailConfigs = async () => {
                try {
                    const res = await apiClient.get('/api/email-configs');
                    setConfig(prev => ({
                        ...prev,
                        emailConfigs: res.data || []
                    }));
                } catch (error) {
                    console.error("Failed to fetch email configs", error);
                }
            };
            fetchEmailConfigs();
        } else if (activeTab === 'support') {
            const fetchTickets = async () => {
                try {
                    const res = await apiClient.get('/api/support/tickets');
                    setConfig(prev => ({
                        ...prev,
                        tickets: res.data || []
                    }));
                } catch (error) {
                    console.error("Failed to fetch tickets", error);
                }
            };
            fetchTickets();
        }
    }, [activeTab]);

    const handleSave = async () => {
        setLoading(true);
        try {
            if (activeTab === 'candidates') {
                // Save fees
                const feePayload = {
                    registrationFee: config.registrationFee,
                    renewalFee: config.renewalFee
                };
                await apiClient.put('/api/config/fees', feePayload);

                // Save plans
                const planPromises = config.subscriptionPlans.map(plan => {
                    if (plan.id) {
                        return apiClient.put(`/api/candidate-plans/${plan.id}`, plan);
                    } else {
                        return apiClient.post('/api/candidate-plans', plan);
                    }
                });
                await Promise.all(planPromises);
            } else if (activeTab === 'admins') {
                // Save admin plans
                const planPromises = config.adminPlans.map(plan => {
                    if (plan.id) {
                        return apiClient.put(`/api/admin-plans/${plan.id}`, plan);
                    } else {
                        return apiClient.post('/api/admin-plans', plan);
                    }
                });
                await Promise.all(planPromises);
            } else if (activeTab === 'notifications') {
                // Individual saves are handled by modal actions, but we could trigger a refresh or no-op here
                // For simplicity, we'll rely on the modal "Save" for email configs
            } else if (activeTab === 'support') {
                // Support is read-only + reply actions, no global "Save"
            }


            setSnackbar({ open: true, message: "Settings saved successfully", severity: "success" });
        } catch (error) {
            console.error("Failed to save settings", error);
            setSnackbar({ open: true, message: "Failed to save settings", severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const tabs = [
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "admins", label: "Admins", icon: CreditCard },
        { id: "candidates", label: "Candidates", icon: Users },
        { id: "discounts", label: "Discounts", icon: Tag },
        { id: "support", label: "Support Inbox", icon: MessageSquare },
        { id: "cronjobs", label: "Cron Jobs", icon: Settings },
    ];

    // Support Reply State
    const [replyingTicket, setReplyingTicket] = useState(null);
    const [replyMessage, setReplyMessage] = useState("");

    const handleSendReply = async () => {
        if (!replyingTicket || !replyMessage.trim()) return;
        try {
            await apiClient.post(`/api/support/tickets/${replyingTicket.id}/reply`, { reply: replyMessage });
            setSnackbar({ open: true, message: "Reply sent successfully", severity: "success" });
            setReplyingTicket(null);
            setReplyMessage("");
            // Refresh tickets
            const res = await apiClient.get('/api/support/tickets');
            setConfig(prev => ({ ...prev, tickets: res.data || [] }));
        } catch (error) {
            console.error(error);
            setSnackbar({ open: true, message: "Failed to send reply", severity: "error" });
        }
    };

    // Generic State for Email Modal
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [editingEmailConfig, setEditingEmailConfig] = useState(null); // null = create new
    const [emailForm, setEmailForm] = useState({
        name: "",
        provider: "ZEPTOMAIL",
        apiUrl: "https://api.zeptomail.in/v1.1/email",
        authToken: "",
        smtpHost: "",
        smtpPort: 587,
        smtpUsername: "",
        fromName: "",
        fromEmail: ""
    });

    // Discount State
    const [discountGroups, setDiscountGroups] = useState([]);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [showCouponModal, setShowCouponModal] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [newGroupExpiry, setNewGroupExpiry] = useState("");
    const [newGroupSettings, setNewGroupSettings] = useState({
        forCandidates: true,
        forAdmins: false,
        totalLimit: ""
    });
    const [newCoupon, setNewCoupon] = useState({ code: "", percentage: "" });

    useEffect(() => {
        if (activeTab === 'discounts') {
            fetchDiscountGroups();
        }
    }, [activeTab]);

    const fetchDiscountGroups = async () => {
        try {
            const response = await apiClient.get('/api/discounts/groups');
            setDiscountGroups(response.data || []);
        } catch (error) {
            console.error("Failed to fetch discount groups", error);
        }
    };

    const handleCreateGroup = async () => {
        try {
            await apiClient.post('/api/discounts/groups', {
                expiresAt: newGroupExpiry,
                forCandidates: newGroupSettings.forCandidates,
                forAdmins: newGroupSettings.forAdmins,
                totalLimit: newGroupSettings.totalLimit ? parseInt(newGroupSettings.totalLimit) : null
            });
            setSnackbar({ open: true, message: "Group created successfully", severity: "success" });
            setShowGroupModal(false);
            fetchDiscountGroups();
        } catch (error) {
            setSnackbar({ open: true, message: "Failed to create group", severity: "error" });
        }
    };

    const handleAddCoupon = async () => {
        try {
            await apiClient.post(`/api/discounts/groups/${selectedGroupId}/coupons`, {
                code: newCoupon.code,
                percentage: parseInt(newCoupon.percentage)
            });
            setSnackbar({ open: true, message: "Coupon added successfully", severity: "success" });
            setShowCouponModal(false);
            setNewCoupon({ code: "", percentage: "" });
            fetchDiscountGroups();
        } catch (error) {
            setSnackbar({ open: true, message: "Failed to add coupon: " + (error.response?.data?.message || error.message), severity: "error" });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Manage global configurations and preferences</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm font-semibold shadow-sm"
                >
                    <Save size={16} />
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-2 ${activeTab === tab.id
                                    ? "bg-blue-50 text-blue-700 border-blue-600"
                                    : "text-slate-600 hover:bg-slate-50 border-transparent"
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 min-h-[500px]">



                    {/* Notification Settings */}
                    {activeTab === "notifications" && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Mail size={20} className="text-slate-500" /> Email Services
                                </h3>
                                <button
                                    onClick={() => {
                                        setEditingEmailConfig(null);
                                        setEmailForm({
                                            name: "",
                                            provider: "ZEPTOMAIL",
                                            apiUrl: "https://api.zeptomail.in/v1.1/email",
                                            authToken: "",
                                            smtpHost: "",
                                            smtpPort: 587,
                                            smtpUsername: "",
                                            fromName: "",
                                            fromEmail: ""
                                        });
                                        setShowEmailModal(true);
                                    }}
                                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700 transition"
                                >
                                    + Add Service
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {config.emailConfigs.map((service) => (
                                    <div
                                        key={service.id}
                                        onClick={() => {
                                            setEditingEmailConfig(service);
                                            setEmailForm({
                                                name: service.name || "",
                                                provider: service.provider || "ZEPTOMAIL",
                                                apiUrl: service.apiUrl || "",
                                                authToken: service.authToken || "",
                                                smtpHost: service.smtpHost || "",
                                                smtpPort: service.smtpPort || 587,
                                                smtpUsername: service.smtpUsername || "",
                                                fromName: service.fromName || "",
                                                fromEmail: service.fromEmail || ""
                                            });
                                            setShowEmailModal(true);
                                        }}
                                        className="border border-slate-200 rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow relative group cursor-pointer"
                                    >
                                        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition z-10">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingEmailConfig(service);
                                                    setEmailForm({
                                                        name: service.name || "",
                                                        provider: service.provider || "ZEPTOMAIL",
                                                        apiUrl: service.apiUrl || "",
                                                        authToken: service.authToken || "",
                                                        smtpHost: service.smtpHost || "",
                                                        smtpPort: service.smtpPort || 587,
                                                        smtpUsername: service.smtpUsername || "",
                                                        fromName: service.fromName || "",
                                                        fromEmail: service.fromEmail || ""
                                                    });
                                                    setShowEmailModal(true);
                                                }}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                                                title="Edit Configuration"
                                            >
                                                <Settings size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setItemToDelete(service);
                                                    setDeleteType('EMAIL');
                                                    setShowDeleteConfirm(true);
                                                }}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                                                title="Delete Configuration"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                            </button>
                                        </div>

                                        <div className="mb-3">
                                            <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase tracking-wider">{service.provider}</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-800 mb-1">{service.name}</h4>
                                        <div className="text-xs text-slate-500 space-y-1">
                                            <p className="flex items-center gap-1"><span className="font-semibold">From:</span> {service.fromName}</p>
                                            <p className="flex items-center gap-1"><span className="font-semibold">Email:</span> {service.fromEmail}</p>
                                        </div>
                                    </div>
                                ))}
                                {config.emailConfigs.length === 0 && (
                                    <div className="col-span-full text-center py-10 text-slate-400 text-sm">
                                        No email services configured. Add one to get started.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Admin/Organization Settings (Formerly Payments) */}
                    {activeTab === "admins" && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                                <CreditCard size={20} className="text-slate-500" /> Admin/Organization Plans
                            </h3>

                            <div className="flex justify-between items-center mb-4">
                                <p className="text-sm text-slate-500">Configure subscription packages for Organizations/Admins.</p>
                                <button
                                    onClick={() => {
                                        const newPlan = {
                                            name: "New Admin Plan",
                                            interviewCreditCost: 50,
                                            positionCreditCost: 100,
                                            minInterviewCredits: 10,
                                            minPositionCredits: 5
                                        };
                                        setConfig({ ...config, adminPlans: [...config.adminPlans, newPlan] });
                                    }}
                                    className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition"
                                >
                                    + Add Plan
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {config.adminPlans.map((plan, index) => (
                                    <div key={plan.id || index} className="border border-slate-200 rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow relative group flex flex-col gap-4">
                                        <button
                                            onClick={() => {
                                                setItemToDelete({ ...plan, index });
                                                setDeleteType('ADMIN_PLAN');
                                                setShowDeleteConfirm(true);
                                            }}
                                            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1 rounded-full hover:bg-slate-100"
                                            title="Delete Plan"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                        </button>

                                        {/* Plan Name Header */}
                                        <div className="text-center border-b border-slate-100 pb-3">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Plan Name</label>
                                            <input
                                                type="text"
                                                value={plan.name}
                                                onChange={(e) => {
                                                    const updatedPlans = [...config.adminPlans];
                                                    updatedPlans[index].name = e.target.value;
                                                    setConfig({ ...config, adminPlans: updatedPlans });
                                                }}
                                                className="w-full text-lg font-bold text-slate-800 text-center bg-transparent border-b border-transparent hover:border-blue-300 focus:border-blue-500 focus:bg-blue-50/50 outline-none transition-all px-2 py-0.5 rounded"
                                                placeholder="Plan Name"
                                            />
                                        </div>

                                        {/* Costs Section */}
                                        <div className="space-y-4">
                                            {/* Interview Credits */}
                                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="p-1 bg-blue-100 text-blue-600 rounded">
                                                        <Users size={14} />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-700">Interview Credits</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-[9px] text-slate-500 uppercase font-semibold">Cost / Credit</label>
                                                        <div className="relative">
                                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">₹</span>
                                                            <input
                                                                type="number"
                                                                value={plan.interviewCreditCost}
                                                                onChange={(e) => {
                                                                    const updatedPlans = [...config.adminPlans];
                                                                    updatedPlans[index].interviewCreditCost = e.target.value;
                                                                    setConfig({ ...config, adminPlans: updatedPlans });
                                                                }}
                                                                className="w-full pl-5 pr-2 py-1 text-sm font-semibold border border-slate-200 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] text-slate-500 uppercase font-semibold">Min Qty</label>
                                                        <input
                                                            type="number"
                                                            value={plan.minInterviewCredits}
                                                            onChange={(e) => {
                                                                const updatedPlans = [...config.adminPlans];
                                                                updatedPlans[index].minInterviewCredits = parseInt(e.target.value);
                                                                setConfig({ ...config, adminPlans: updatedPlans });
                                                            }}
                                                            className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Position Credits */}
                                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="p-1 bg-purple-100 text-purple-600 rounded">
                                                        <CreditCard size={14} />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-700">Position Credits</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-[9px] text-slate-500 uppercase font-semibold">Cost / Credit</label>
                                                        <div className="relative">
                                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">₹</span>
                                                            <input
                                                                type="number"
                                                                value={plan.positionCreditCost}
                                                                onChange={(e) => {
                                                                    const updatedPlans = [...config.adminPlans];
                                                                    updatedPlans[index].positionCreditCost = e.target.value;
                                                                    setConfig({ ...config, adminPlans: updatedPlans });
                                                                }}
                                                                className="w-full pl-5 pr-2 py-1 text-sm font-semibold border border-slate-200 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] text-slate-500 uppercase font-semibold">Min Qty</label>
                                                        <input
                                                            type="number"
                                                            value={plan.minPositionCredits}
                                                            onChange={(e) => {
                                                                const updatedPlans = [...config.adminPlans];
                                                                updatedPlans[index].minPositionCredits = parseInt(e.target.value);
                                                                setConfig({ ...config, adminPlans: updatedPlans });
                                                            }}
                                                            className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Candidate Settings */}
                    {activeTab === "candidates" && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                                <Users size={20} className="text-slate-500" /> Candidate Defaults
                            </h3>
                            <div className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Registration Fee (₹)</label>
                                        <input
                                            type="number"
                                            value={config.registrationFee}
                                            onChange={(e) => setConfig({ ...config, registrationFee: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Renewal Fee (₹)</label>
                                        <input
                                            type="number"
                                            value={config.renewalFee}
                                            onChange={(e) => setConfig({ ...config, renewalFee: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 pt-6">
                                        <input
                                            type="checkbox"
                                            id="registration"
                                            checked={config.enableRegistration}
                                            onChange={(e) => setConfig({ ...config, enableRegistration: e.target.checked })}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="registration" className="text-sm text-slate-700 font-medium">Allow New Candidate Registration</label>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-md font-bold text-slate-800">Subscription Plans</h4>
                                        <button
                                            onClick={() => {
                                                const newPlan = {
                                                    name: "New Plan",
                                                    durationMonths: 1,
                                                    price: 0,
                                                    features: ["Feature 1"]
                                                };
                                                setConfig({ ...config, subscriptionPlans: [...config.subscriptionPlans, newPlan] });
                                            }}
                                            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition"
                                        >
                                            + Add Plan
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {config.subscriptionPlans.map((plan, index) => (
                                            <div key={plan.id || index} className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex flex-col gap-3 relative group">
                                                <button
                                                    onClick={() => {
                                                        setItemToDelete({ ...plan, index });
                                                        setDeleteType('CANDIDATE_PLAN');
                                                        setShowDeleteConfirm(true);
                                                    }}
                                                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                                                    title="Delete Plan"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                                </button>

                                                <div className="text-center border-b pb-2">
                                                    <input
                                                        type="text"
                                                        value={plan.name}
                                                        onChange={(e) => {
                                                            const updatedPlans = [...config.subscriptionPlans];
                                                            updatedPlans[index].name = e.target.value;
                                                            setConfig({ ...config, subscriptionPlans: updatedPlans });
                                                        }}
                                                        className="font-bold text-slate-700 text-center bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none w-full"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-[10px] font-semibold text-slate-500 uppercase">Duration (Months)</label>
                                                        <input
                                                            type="number"
                                                            value={plan.durationMonths}
                                                            onChange={(e) => {
                                                                const updatedPlans = [...config.subscriptionPlans];
                                                                updatedPlans[index].durationMonths = parseInt(e.target.value);
                                                                setConfig({ ...config, subscriptionPlans: updatedPlans });
                                                            }}
                                                            className="w-full mt-1 px-2 py-1 text-sm border border-slate-300 rounded"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-semibold text-slate-500 uppercase">Price (₹)</label>
                                                        <input
                                                            type="number"
                                                            value={plan.price}
                                                            onChange={(e) => {
                                                                const updatedPlans = [...config.subscriptionPlans];
                                                                updatedPlans[index].price = parseInt(e.target.value);
                                                                setConfig({ ...config, subscriptionPlans: updatedPlans });
                                                            }}
                                                            className="w-full mt-1 px-2 py-1 text-sm border border-slate-300 rounded"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-xs font-semibold text-slate-500">Features</label>
                                                    <div className="flex flex-col gap-2 mt-1">
                                                        {plan.features.map((feature, fIdx) => (
                                                            <div key={fIdx} className="flex gap-1">
                                                                <input
                                                                    type="text"
                                                                    value={feature}
                                                                    onChange={(e) => {
                                                                        const updatedPlans = [...config.subscriptionPlans];
                                                                        updatedPlans[index].features[fIdx] = e.target.value;
                                                                        setConfig({ ...config, subscriptionPlans: updatedPlans });
                                                                    }}
                                                                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                                                                />
                                                                <button
                                                                    onClick={() => {
                                                                        const updatedPlans = [...config.subscriptionPlans];
                                                                        updatedPlans[index].features = plan.features.filter((_, i) => i !== fIdx);
                                                                        setConfig({ ...config, subscriptionPlans: updatedPlans });
                                                                    }}
                                                                    className="text-slate-400 hover:text-red-500"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <button
                                                            onClick={() => {
                                                                const updatedPlans = [...config.subscriptionPlans];
                                                                updatedPlans[index].features.push("New Feature");
                                                                setConfig({ ...config, subscriptionPlans: updatedPlans });
                                                            }}
                                                            className="text-xs text-blue-600 hover:underline text-left mt-1"
                                                        >
                                                            + Add Feature
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Discount Settings */}
                    {activeTab === "discounts" && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Tag size={20} className="text-slate-500" /> Discount Groups
                                </h3>
                                <button
                                    onClick={() => setShowGroupModal(true)}
                                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700 transition"
                                >
                                    + Add Group
                                </button>
                            </div>

                            <div className="grid gap-6">
                                {discountGroups.length === 0 ? (
                                    <p className="text-center text-slate-500 text-sm py-10">No discount groups found. Create one to get started.</p>
                                ) : (
                                    discountGroups.map(group => (
                                        <div key={group.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-800">Group: {group.id.substring(0, 8)}...</h4>
                                                    <div className="flex flex-col gap-0.5 mt-1">
                                                        <p className="text-xs text-slate-500">Expires: {new Date(group.expiresAt).toLocaleString()}</p>
                                                        <div className="flex gap-2 text-[10px] text-slate-400">
                                                            <span>Audience: {group.forCandidates ? 'Candidates' : ''} {group.forAdmins ? 'Admins' : ''}</span>
                                                            <span>•</span>
                                                            <span>Used: {group.usedCount} / {group.totalLimit || '∞'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => { setSelectedGroupId(group.id); setShowCouponModal(true); }}
                                                    className="px-2 py-1 bg-white border border-slate-300 text-slate-700 text-xs rounded hover:bg-slate-50 transition"
                                                >
                                                    + Add Coupon
                                                </button>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {group.discounts && group.discounts.length > 0 ? (
                                                    group.discounts.map(coupon => (
                                                        <div key={coupon.id} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-dashed border-slate-300 shadow-sm">
                                                            <Tag size={12} className="text-blue-500" />
                                                            <span className="text-sm font-mono font-bold text-slate-700">{coupon.coupon}</span>
                                                            <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 rounded">{coupon.percentage}%</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-xs text-slate-400 italic">No coupons in this group</p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Modals Implemented as simple conditional rendering for speed */}
                            {showGroupModal && (
                                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                                    <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
                                        <h3 className="text-lg font-bold mb-4">Create Discount Group</h3>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium mb-1">Expiration Date</label>
                                            <input
                                                type="datetime-local"
                                                className="w-full border rounded px-3 py-2 text-sm"
                                                onChange={(e) => setNewGroupExpiry(e.target.value)}
                                            />
                                        </div>

                                        <div className="mb-4 space-y-3">
                                            <label className="block text-sm font-medium">Audience</label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-2 text-sm text-slate-700">
                                                    <input
                                                        type="checkbox"
                                                        checked={newGroupSettings.forCandidates}
                                                        onChange={(e) => setNewGroupSettings({ ...newGroupSettings, forCandidates: e.target.checked })}
                                                        className="rounded text-blue-600 focus:ring-blue-500"
                                                    />
                                                    Candidates
                                                </label>
                                                <label className="flex items-center gap-2 text-sm text-slate-700">
                                                    <input
                                                        type="checkbox"
                                                        checked={newGroupSettings.forAdmins}
                                                        onChange={(e) => setNewGroupSettings({ ...newGroupSettings, forAdmins: e.target.checked })}
                                                        className="rounded text-blue-600 focus:ring-blue-500"
                                                    />
                                                    Admins
                                                </label>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium mb-1">Total Usage Limit (Optional)</label>
                                            <input
                                                type="number"
                                                placeholder="e.g. 100"
                                                className="w-full border rounded px-3 py-2 text-sm"
                                                value={newGroupSettings.totalLimit}
                                                onChange={(e) => setNewGroupSettings({ ...newGroupSettings, totalLimit: e.target.value })}
                                            />
                                            <p className="text-xs text-slate-400 mt-1">Leave empty for unlimited usage</p>
                                        </div>

                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setShowGroupModal(false)} className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
                                            <button onClick={handleCreateGroup} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Create Group</button>
                                        </div>
                                    </div>
                                </div>
                            )}



                            {/* Coupon Modal */}
                            {showCouponModal && (
                                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                                    <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
                                        <h3 className="text-lg font-bold mb-4">Add Coupon</h3>
                                        <div className="space-y-3 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Coupon Code</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. WELCOME10"
                                                    className="w-full border rounded px-3 py-2 text-sm uppercase"
                                                    value={newCoupon.code}
                                                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Percentage (%)</label>
                                                <input
                                                    type="number"
                                                    placeholder="10"
                                                    className="w-full border rounded px-3 py-2 text-sm"
                                                    value={newCoupon.percentage}
                                                    onChange={(e) => setNewCoupon({ ...newCoupon, percentage: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-3">
                                            <button onClick={() => setShowCouponModal(false)} className="px-4 py-2 text-slate-600 text-sm">Cancel</button>
                                            <button onClick={handleAddCoupon} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-semibold">Add Coupon</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {/* Cron Jobs Management */}
                    {activeTab === "cronjobs" && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Settings size={20} className="text-slate-500" /> Manual Cron Job Triggers
                                </h3>
                                <p className="text-xs text-slate-500">These jobs run automatically at midnight. Use these buttons to trigger manually.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Daily Quiz Generation */}
                                <div className="border border-slate-200 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg">
                                            <Play size={24} className="text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-800">Daily Quiz Generation</h4>
                                            <p className="text-xs text-slate-500">Generate new quiz questions for today</p>
                                        </div>
                                    </div>
                                    
                                    <p className="text-sm text-slate-600 mb-4">
                                        This will generate 5 new quiz questions (mix of technical and general) using AI. 
                                        Existing quiz for today will be replaced.
                                    </p>

                                    <button
                                        onClick={async () => {
                                            setGeneratingQuiz(true);
                                            try {
                                                const result = await cronJobService.generateDailyQuiz();
                                                if (result.success) {
                                                    setSnackbar({ 
                                                        open: true, 
                                                        message: `Quiz generated successfully! ${result.questionsCount || 0} questions created.`, 
                                                        severity: "success" 
                                                    });
                                                } else {
                                                    setSnackbar({ 
                                                        open: true, 
                                                        message: result.message || "Failed to generate quiz", 
                                                        severity: "error" 
                                                    });
                                                }
                                            } catch (error) {
                                                console.error("Error generating quiz:", error);
                                                setSnackbar({ 
                                                    open: true, 
                                                    message: error.response?.data?.message || "Failed to generate quiz. Please try again.", 
                                                    severity: "error" 
                                                });
                                            } finally {
                                                setGeneratingQuiz(false);
                                            }
                                        }}
                                        disabled={generatingQuiz}
                                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-sm"
                                    >
                                        {generatingQuiz ? (
                                            <>
                                                <RefreshCw size={18} className="animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Play size={18} />
                                                Generate Daily Quiz
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Trending Skills Generation */}
                                <div className="border border-slate-200 rounded-lg p-6 bg-gradient-to-br from-purple-50 to-pink-50">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center shadow-lg">
                                            <RefreshCw size={24} className="text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-800">Trending Skills Generation</h4>
                                            <p className="text-xs text-slate-500">Generate new trending skills for today</p>
                                        </div>
                                    </div>
                                    
                                    <p className="text-sm text-slate-600 mb-4">
                                        This will generate trending IT and Non-IT skills using AI. 
                                        Existing skills for today will be replaced.
                                    </p>

                                    <button
                                        onClick={async () => {
                                            setGeneratingSkills(true);
                                            try {
                                                const result = await cronJobService.generateTrendingSkills();
                                                if (result.success) {
                                                    setSnackbar({ 
                                                        open: true, 
                                                        message: `Trending skills generated successfully! ${result.itSkillsCount || 0} IT skills, ${result.nonItSkillsCount || 0} Non-IT skills.`, 
                                                        severity: "success" 
                                                    });
                                                } else {
                                                    setSnackbar({ 
                                                        open: true, 
                                                        message: result.message || "Failed to generate trending skills", 
                                                        severity: "error" 
                                                    });
                                                }
                                            } catch (error) {
                                                console.error("Error generating trending skills:", error);
                                                setSnackbar({ 
                                                    open: true, 
                                                    message: error.response?.data?.message || "Failed to generate trending skills. Please try again.", 
                                                    severity: "error" 
                                                });
                                            } finally {
                                                setGeneratingSkills(false);
                                            }
                                        }}
                                        disabled={generatingSkills}
                                        className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-sm"
                                    >
                                        {generatingSkills ? (
                                            <>
                                                <RefreshCw size={18} className="animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw size={18} />
                                                Generate Trending Skills
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <h5 className="text-sm font-bold text-slate-700 mb-2">ℹ️ Information</h5>
                                <ul className="text-xs text-slate-600 space-y-1">
                                    <li>• These cron jobs run automatically every day at midnight (12:00 AM)</li>
                                    <li>• Manual triggers will replace existing data for today</li>
                                    <li>• Quiz generation creates 5 questions (mix of technical and general)</li>
                                    <li>• Trending skills generates both IT and Non-IT skills</li>
                                    <li>• Changes will be reflected immediately in the Candidate Dashboard</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Support Ticket Inbox */}
                    {activeTab === "support" && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                                <MessageSquare size={20} className="text-slate-500" /> Support Inbox
                            </h3>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="py-3 px-2 text-xs font-bold text-slate-500 uppercase">Status</th>
                                            <th className="py-3 px-2 text-xs font-bold text-slate-500 uppercase">Target</th>
                                            <th className="py-3 px-2 text-xs font-bold text-slate-500 uppercase">From</th>
                                            <th className="py-3 px-2 text-xs font-bold text-slate-500 uppercase">Subject</th>
                                            <th className="py-3 px-2 text-xs font-bold text-slate-500 uppercase">Date</th>
                                            <th className="py-3 px-2 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {config.tickets?.length > 0 ? (
                                            config.tickets.map((ticket) => (
                                                <tr key={ticket.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                                                    <td className="py-3 px-2">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${ticket.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                                                            }`}>
                                                            {ticket.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${ticket.target === 'EXTERNAL' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'
                                                            }`}>
                                                            {ticket.target || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <div className="text-sm font-semibold text-slate-800">{ticket.name || 'Unknown'}</div>
                                                        <div className="text-xs text-slate-500">{ticket.email}</div>
                                                        <div className="text-[10px] text-blue-600 bg-blue-50 inline-block px-1 rounded mt-0.5">{ticket.userType}</div>
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <div className="text-sm text-slate-700 font-medium">{ticket.subject}</div>
                                                        <div className="text-xs text-slate-500 truncate max-w-xs">{ticket.message}</div>
                                                    </td>
                                                    <td className="py-3 px-2 text-xs text-slate-500">
                                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-3 px-2 text-right">
                                                        {ticket.status === 'OPEN' ? (
                                                            <button
                                                                onClick={() => setReplyingTicket(ticket)}
                                                                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition"
                                                            >
                                                                Reply
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-slate-400 italic">Replied</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="py-8 text-center text-slate-400 text-sm">
                                                    No support tickets found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}


                </div>
            </div>


            {/* Email Service Modal - Moved to root level */}
            {showEmailModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold mb-4">{editingEmailConfig ? 'Edit' : 'Add'} Email Service</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Service Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. NoReply, Support"
                                    className="w-full border rounded px-3 py-2 text-sm"
                                    value={emailForm.name}
                                    onChange={(e) => setEmailForm({ ...emailForm, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Provider</label>
                                <select
                                    className="w-full border rounded px-3 py-2 text-sm bg-white"
                                    value={emailForm.provider}
                                    onChange={(e) => setEmailForm({ ...emailForm, provider: e.target.value })}
                                >
                                    <option value="ZEPTOMAIL">ZeptoMail (REST API)</option>
                                    <option value="SMTP">SMTP (General)</option>
                                </select>
                            </div>

                            <div className="border-t pt-4 mt-4">
                                <h4 className="text-sm font-bold text-slate-800 mb-3">ZeptoMail REST Settings</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">API URL</label>
                                        <input
                                            type="text"
                                            className="w-full border rounded px-3 py-2 text-sm"
                                            value={emailForm.apiUrl}
                                            onChange={(e) => setEmailForm({ ...emailForm, apiUrl: e.target.value })}
                                            placeholder="https://api.zeptomail.in/v1.1/email"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4 mt-4">
                                <h4 className="text-sm font-bold text-slate-800 mb-3">SMTP Settings</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">SMTP Host</label>
                                        <input
                                            type="text"
                                            placeholder="smtp.zeptomail.in"
                                            className="w-full border rounded px-3 py-2 text-sm"
                                            value={emailForm.smtpHost}
                                            onChange={(e) => setEmailForm({ ...emailForm, smtpHost: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Port</label>
                                        <input
                                            type="number"
                                            placeholder="587"
                                            className="w-full border rounded px-3 py-2 text-sm"
                                            value={emailForm.smtpPort}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setEmailForm({ ...emailForm, smtpPort: val === "" ? "" : parseInt(val) });
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
                                        <input
                                            type="text"
                                            placeholder="emailapikey"
                                            className="w-full border rounded px-3 py-2 text-sm"
                                            value={emailForm.smtpUsername}
                                            onChange={(e) => setEmailForm({ ...emailForm, smtpUsername: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                    Auth Token / Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showAuthToken ? "text" : "password"}
                                        className="w-full border rounded px-3 py-2 text-sm font-mono pr-10"
                                        value={emailForm.authToken}
                                        onChange={(e) => setEmailForm({ ...emailForm, authToken: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        onClick={() => setShowAuthToken(!showAuthToken)}
                                    >
                                        {showAuthToken ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="border-t pt-4 mt-4">
                                <h4 className="text-sm font-bold text-slate-800 mb-3">Sender Details</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">From Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Support Team"
                                            className="w-full border rounded px-3 py-2 text-sm"
                                            value={emailForm.fromName}
                                            onChange={(e) => setEmailForm({ ...emailForm, fromName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">From Email</label>
                                        <input
                                            type="email"
                                            placeholder="e.g. support@..."
                                            className="w-full border rounded px-3 py-2 text-sm"
                                            value={emailForm.fromEmail}
                                            onChange={(e) => setEmailForm({ ...emailForm, fromEmail: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setShowEmailModal(false)} className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
                            <button
                                onClick={async () => {
                                    try {
                                        if (editingEmailConfig) {
                                            const res = await apiClient.put(`/api/email-configs/${editingEmailConfig.id}`, emailForm);
                                            setConfig(prev => ({
                                                ...prev,
                                                emailConfigs: prev.emailConfigs.map(c => c.id === editingEmailConfig.id ? res.data : c)
                                            }));
                                        } else {
                                            const res = await apiClient.post('/api/email-configs', emailForm);
                                            setConfig(prev => ({
                                                ...prev,
                                                emailConfigs: [...prev.emailConfigs, res.data]
                                            }));
                                        }
                                        setShowEmailModal(false);
                                        setSnackbar({ open: true, message: "Email service saved", severity: "success" });
                                    } catch (e) {
                                        console.error(e);
                                        setSnackbar({ open: true, message: "Failed to save email service", severity: "error" });
                                    }
                                }}
                                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                {editingEmailConfig ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 text-center">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">
                            {deleteType === 'EMAIL' ? 'Delete Email Service?' : 'Delete Plan?'}
                        </h3>
                        <p className="text-slate-500 text-sm mb-6">
                            Are you sure you want to delete <strong>{itemToDelete?.name}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-slate-600 text-sm hover:bg-slate-100 rounded-lg transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    if (!itemToDelete) return;
                                    try {
                                        if (deleteType === 'EMAIL') {
                                            await apiClient.delete(`/api/email-configs/${itemToDelete.id}`);
                                            setConfig(prev => ({
                                                ...prev,
                                                emailConfigs: prev.emailConfigs.filter(c => c.id !== itemToDelete.id)
                                            }));
                                        } else if (deleteType === 'ADMIN_PLAN') {
                                            if (itemToDelete.id) await apiClient.delete(`/api/admin-plans/${itemToDelete.id}`);
                                            setConfig(prev => ({
                                                ...prev,
                                                adminPlans: prev.adminPlans.filter((_, i) => i !== itemToDelete.index)
                                            }));
                                        } else if (deleteType === 'CANDIDATE_PLAN') {
                                            if (itemToDelete.id) await apiClient.delete(`/api/candidate-plans/${itemToDelete.id}`);
                                            setConfig(prev => ({
                                                ...prev,
                                                subscriptionPlans: prev.subscriptionPlans.filter((_, i) => i !== itemToDelete.index)
                                            }));
                                        }
                                        setSnackbar({ open: true, message: "Deleted successfully", severity: "success" });
                                    } catch (e) {
                                        console.error("Failed to delete", e);
                                        setSnackbar({ open: true, message: "Failed to delete", severity: "error" });
                                    } finally {
                                        setShowDeleteConfirm(false);
                                        setItemToDelete(null);
                                        setDeleteType(null);
                                    }
                                }}
                                className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition shadow-sm hover:shadow"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reply Modal */}
            {replyingTicket && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold">Reply to {replyingTicket.name}</h3>
                            <button onClick={() => setReplyingTicket(null)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="bg-slate-50 p-3 rounded mb-4 text-sm text-slate-700 border border-slate-100">
                            <strong>Subject:</strong> {replyingTicket.subject}
                            <div className="mt-1 pt-1 border-t border-slate-200">
                                {replyingTicket.message}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Your Reply</label>
                            <textarea
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                rows={5}
                                className="w-full border rounded-md p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Type your response here..."
                            ></textarea>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setReplyingTicket(null)}
                                className="px-4 py-2 text-slate-600 text-sm hover:bg-slate-100 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendReply}
                                disabled={!replyMessage.trim()}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                <Send size={14} /> Send Reply
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <SnackbarAlert
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={handleCloseSnackbar}
            />
        </div>
    );
};

export default SettingsPage;
