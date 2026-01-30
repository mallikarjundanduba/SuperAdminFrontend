import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, PlusCircle, Receipt } from 'lucide-react';
import { creditService } from '../../services/creditService';
import SnackbarAlert from '../common/SnackbarAlert';

const AdminSubscription = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Get pending admin data from sessionStorage
    const [pendingAdminData, setPendingAdminData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const showMessage = (message, severity = "success") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    // UI state for calculations
    const [interviewCredits, setInterviewCredits] = useState(10);
    const [positionCredits, setPositionCredits] = useState(5);

    // Separate prices for each credit type
    const [interviewPrice, setInterviewPrice] = useState(84); // ₹84 per interview credit
    const [positionPrice, setPositionPrice] = useState(50);   // Default value for position credit

    const [gstPercentage, setGstPercentage] = useState(18); // Default 18%
    const [demoTrials, setDemoTrials] = useState(2);

    // Billing Cycle State
    const [billingCycle, setBillingCycle] = useState(1); // Default 1 month
    const billingCycles = [
        { label: 'Monthly', value: 1 },
        { label: 'Quarterly', value: 3 },
        { label: 'Half-Yearly', value: 6 },
        { label: 'Yearly', value: 12 }
    ];

    // Calculated amounts
    const interviewCost = interviewCredits * interviewPrice;
    const positionCost = positionCredits * positionPrice;
    const subtotal = interviewCost + positionCost;
    const gstAmount = (subtotal * gstPercentage) / 100;
    const total = subtotal + gstAmount;

    // Load pending admin data or existing admin from location state
    useEffect(() => {
        // Option 1: Adding credits to EXISTING admin (from AdminsPage)
        if (location.state?.adminId && location.state?.organizationId) {
            setPendingAdminData({
                ...location.state,
                isExistingAdmin: true
            });
            return;
        }

        // Option 2: Creating NEW admin (from CreateAdmin flow)
        const storedData = sessionStorage.getItem('pendingAdminData');
        if (storedData) {
            try {
                setPendingAdminData(JSON.parse(storedData));
            } catch (err) {
                console.error('Error parsing pendingAdminData:', err);
                navigate('/dashboard/create-admin');
            }
        } else {
            navigate('/dashboard/create-admin');
        }
    }, [navigate, location.state]);

    const handleBack = () => {
        if (pendingAdminData?.isExistingAdmin) {
            navigate('/dashboard/admins');
        } else {
            navigate('/dashboard/create-admin');
        }
    };

    const handleAddCredits = async () => {
        if (!pendingAdminData) {
            setError('No admin data found. Please go back and complete the form.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const organizationId = pendingAdminData.organizationId;
            if (!organizationId) {
                throw new Error('Organization ID not found in admin data.');
            }

            console.log('Adding credits for Org ID:', organizationId);

            // Calculate validUntil based on selected Billing Cycle
            const validUntil = new Date();
            validUntil.setMonth(validUntil.getMonth() + billingCycle);

            const creditsPayload = {
                organizationId: organizationId,
                totalInterviewCredits: interviewCredits,
                totalPositionCredits: positionCredits,
                utilizedInterviewCredits: 0,
                utilizedPositionCredits: 0,
                validTill: validUntil.toISOString().split('T')[0],
                active: true
            };

            await creditService.createCredits(creditsPayload);
            console.log('Credits added successfully');

            sessionStorage.removeItem('pendingAdminData');
            setSuccess(true);
            showMessage('Credits added successfully! Admin account is ready.', 'success');

            setTimeout(() => {
                navigate('/dashboard/admins');
            }, 2000);

        } catch (err) {
            console.error('Error adding credits:', err);
            setError(err.response?.data?.message || err.message || 'Failed to add credits');
            showMessage(err.response?.data?.message || err.message || 'Failed to add credits', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleManualPaymentNavigation = () => {
        if (!pendingAdminData) return;

        // Map numeric billing cycle to enum string
        const billingCycleMap = {
            1: 'MONTHLY',
            3: 'QUARTERLY',
            6: 'HALF_YEARLY',
            12: 'YEARLY'
        };

        const subscriptionData = {
            totalInterviewCredits: interviewCredits,
            interviewCreditsPrice: interviewPrice,
            totalPositionCredits: positionCredits,
            positionCreditsPrice: positionPrice,
            billingCycle: billingCycleMap[billingCycle] || 'MONTHLY',
            taxRate: gstPercentage,
            subTotal: subtotal,
            totalAmount: total,
            grandTotalAmount: total,
            subscribedProducts: 'BASIC' // Default
        };

        // Ensure pendingAdminData is in session storage (it might be only in state if from AdminsPage)
        sessionStorage.setItem('pendingAdminData', JSON.stringify(pendingAdminData));
        sessionStorage.setItem('manualPaymentSubscriptionData', JSON.stringify(subscriptionData));

        navigate('/dashboard/admin-manual-payment');
    };

    if (!pendingAdminData) return null;

    return (
        <div className="min-h-full bg-white">
            {/* Header */}
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleBack}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ArrowLeft size={16} className="text-navy-900" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-navy-900">Subscription Setup</h1>
                        <p className="text-xs text-gray-600 mt-0.5">Configure credits for {pendingAdminData.fullName}</p>
                    </div>
                </div>
                <button
                    onClick={handleManualPaymentNavigation}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gold-500 hover:bg-gold-600 transition-all shadow-sm"
                >
                    <Receipt size={14} />
                    Manual Payment
                </button>
            </div>

            {/* Main Content */}
            <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column - Form Inputs (Span 8) */}
                    <div className="lg:col-span-8">
                        <div className="space-y-6">

                            {/* Interview Credits Section */}
                            <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                                <h3 className="text-sm font-semibold text-navy-900 mb-3">Interview Credits</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Interview Credits Input */}
                                    <div>
                                        <label className="block text-xs font-medium text-navy-700 mb-1">
                                            Quantity <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="1"
                                                value={interviewCredits}
                                                onChange={(e) => setInterviewCredits(parseInt(e.target.value) || 0)}
                                                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 transition"
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                    </div>
                                    {/* Interview Price Input */}
                                    <div>
                                        <label className="block text-xs font-medium text-navy-700 mb-1">
                                            Price per Credit (₹) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                value={interviewPrice}
                                                onChange={(e) => setInterviewPrice(parseInt(e.target.value) || 0)}
                                                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 transition"
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Position Credits Section */}
                            <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                                <h3 className="text-sm font-semibold text-navy-900 mb-3">Position Credits</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Position Credits Input */}
                                    <div>
                                        <label className="block text-xs font-medium text-navy-700 mb-1">
                                            Quantity <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                value={positionCredits}
                                                onChange={(e) => setPositionCredits(parseInt(e.target.value) || 0)}
                                                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 transition"
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                    </div>
                                    {/* Position Price Input */}
                                    <div>
                                        <label className="block text-xs font-medium text-navy-700 mb-1">
                                            Price per Credit (₹) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                value={positionPrice}
                                                onChange={(e) => setPositionPrice(parseInt(e.target.value) || 0)}
                                                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 transition"
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Settings Section (GST, Billing, Demo) */}
                            <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                                <h3 className="text-sm font-semibold text-navy-900 mb-3">Settings</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    {/* GST Percentage */}
                                    <div>
                                        <label className="block text-xs font-medium text-navy-700 mb-1">
                                            GST Percentage (%) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={gstPercentage}
                                                onChange={(e) => setGstPercentage(parseFloat(e.target.value) || 0)}
                                                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 transition"
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                    </div>

                                    {/* Billing Cycle */}
                                    <div>
                                        <label className="block text-xs font-medium text-navy-700 mb-1">
                                            Billing Cycle <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={billingCycle}
                                                onChange={(e) => setBillingCycle(parseInt(e.target.value))}
                                                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 transition"
                                                disabled={isSubmitting}
                                            >
                                                {billingCycles.map(cycle => (
                                                    <option key={cycle.value} value={cycle.value}>{cycle.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Demo Trials */}
                                    <div>
                                        <label className="block text-xs font-medium text-navy-700 mb-1">
                                            Demo Trials <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={demoTrials}
                                                onChange={(e) => setDemoTrials(parseInt(e.target.value))}
                                                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 transition"
                                                disabled={isSubmitting}
                                            >
                                                {[1, 2, 3, 5, 10].map(val => (
                                                    <option key={val} value={val}>{val} Trials</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Right Column - Summary Details (Span 4) */}
                    <div className="lg:col-span-4">
                        <div className="bg-gray-50 rounded-lg p-5 border border-gray-100 sticky top-4">
                            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                                <Receipt size={16} className="text-qwikBlue" />
                                <h3 className="text-sm font-semibold text-navy-900">Payment Summary</h3>
                            </div>

                            <div className="space-y-3">
                                {/* Interview Breakdown */}
                                <div className="flex justify-between items-center text-xs text-gray-600">
                                    <span>Interview ({interviewCredits} x ₹{interviewPrice})</span>
                                    <span className="font-medium text-gray-900">₹{interviewCost.toLocaleString()}</span>
                                </div>
                                {/* Position Breakdown */}
                                <div className="flex justify-between items-center text-xs text-gray-600">
                                    <span>Position ({positionCredits} x ₹{positionPrice})</span>
                                    <span className="font-medium text-gray-900">₹{positionCost.toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between items-center text-xs text-gray-600 border-t border-gray-100 pt-2">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-gray-900">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-600">
                                    <span>GST ({gstPercentage}%)</span>
                                    <span className="font-medium text-gray-900">₹{gstAmount.toLocaleString()}</span>
                                </div>

                                <div className="pt-3 mt-1 border-t border-gray-200">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-xs text-gray-500">Billing Cycle</span>
                                        <span className="text-xs font-semibold text-gray-700">
                                            {billingCycles.find(c => c.value === billingCycle)?.label}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-bold text-navy-900">Total Payable</span>
                                        <span className="text-xl font-bold text-qwikBlue">₹{Math.round(total).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex gap-3 px-6 py-4 border-t border-gray-200 mt-auto">
                <button
                    type="button"
                    onClick={handleAddCredits}
                    disabled={isSubmitting}
                    className="flex-1 py-2 px-4 text-xs bg-gradient-to-r from-blue-600 to-qwikBlue hover:from-blue-700 hover:to-qwikBlueDark text-white font-semibold rounded-lg transition duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <PlusCircle size={16} />
                    {isSubmitting ? "Processing..." : "Add Credits"}
                </button>
                <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2 text-xs border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition duration-200"
                    disabled={isSubmitting}
                >
                    Cancel
                </button>
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
export default AdminSubscription;
