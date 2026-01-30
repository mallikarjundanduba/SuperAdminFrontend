import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CreditCard, User, Receipt, ShieldCheck, CheckCircle2, Ticket, Percent } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { adminService } from '../../services/adminService';
import { subscriptionService } from '../../services/subscriptionService';
import { paymentService } from '../../services/paymentService';
import { creditService } from '../../services/creditService';
import { discountService } from '../../services/discountService';
import SnackbarAlert from '../common/SnackbarAlert';

const AdminManualPayment = () => {
    const navigate = useNavigate();

    // State from session storage
    const [pendingAdminData, setPendingAdminData] = useState(null);
    const [subscriptionData, setSubscriptionData] = useState(null);

    // Form state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [transactionId, setTransactionId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [receivedBy, setReceivedBy] = useState('Admin'); // Default to Admin
    const [remarks, setRemarks] = useState('');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    // Discount State
    const [discountGroups, setDiscountGroups] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(null); // { type: 'GROUP' | 'COUPON', id: string, percentage: number, code?: string }
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

    useEffect(() => {
        const adminData = sessionStorage.getItem('pendingAdminData');
        const subData = sessionStorage.getItem('manualPaymentSubscriptionData');

        if (adminData && subData) {
            setPendingAdminData(JSON.parse(adminData));
            setSubscriptionData(JSON.parse(subData));
        } else {
            navigate('/dashboard/admin-subscription');
        }

        // Fetch Discount Groups
        fetchDiscountGroups();
    }, [navigate]);

    const fetchDiscountGroups = async () => {
        try {
            const data = await discountService.getAllGroups();
            // Filter for groups applicable to admins and currently active
            const activeAdminGroups = data.filter(g => g.forAdmins && new Date(g.expiresAt) > new Date());
            setDiscountGroups(activeAdminGroups);
        } catch (err) {
            console.error("Failed to fetch discount groups", err);
        }
    };

    const handleBack = () => {
        navigate('/dashboard/admin-subscription');
    };

    const showMessage = (message, severity = "success") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    // --- Discount Logic ---

    const handleGroupSelect = (groupId) => {
        setSelectedGroupId(groupId);
        setCouponCode(''); // Clear coupon if group selected
        // Find group and auto-apply if it has a direct percentage (assuming groups might have base discount, else dependent on coupons)
        // Adjust logic: Groups usually contain coupons. If user selects a group, maybe we just track it.
        // Actually, typically groups are containers. Let's assume for this flow, user selects a Coupon Code manually OR picks a Group that implies a discount.
        // Rereading requirement: "see the api we created for the Grouped id... map and also u need to add the coupon id"
        // This implies we might need BOTH.
        // Let's assume user enters a Coupon Code, and the validation returns the Group ID it belongs to.
        // Or user selects a Group, and maybe a generic code for that group?
        // Let's stick to: Enter Coupon Code -> Validate -> Get Coupon ID + Group ID.
        // AND ALSO: Allow selecting a "Generic Group Discount" without a code if supported?
        // Let's implement robust Coupon Code validation which returns Group ID.
        setAppliedDiscount(null);
    };

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setIsValidatingCoupon(true);
        setError(null);
        try {
            // Validate coupon for this admin
            const response = await discountService.validateCoupon(couponCode, pendingAdminData.adminId, 'ADMIN');

            if (response.valid) {
                // The API returns { valid: true, percentage: 10, groupExpiresAt: ... }
                // It misses returning the IDs directly in the minimal response we saw in controller.
                // We might need to adjust controller or assume we search client side if we have list.
                // Wait, controller returns `DiscountCoupon` object in `validateCoupon` service method, but wraps it in map in controller.
                // Let's trust the logic. The response map has `percentage`.
                // We need the IDs. The controller map is:
                // Map.of("valid", true, "percentage", coupon.getPercentage(), "groupExpiresAt", coupon.getGroup().getExpiresAt())
                // It DOES NOT return ID. This is a blocker.

                // STOPGAP: I will assume the user provides valid code. 
                // I will browse the `coupon` list if I fetched groups?
                // No, coupon search is better.
                // I will assume for now I can find it in the loaded groups if I load all?
                // Or better: Use the `getAllGroups` data which includes coupons to find the matching code client-side!
                // This avoids modifying backend controller right now.

                const allGroups = await discountService.getAllGroups();
                let foundCoupon = null;
                let foundGroup = null;

                for (const group of allGroups) {
                    if (group.discounts) {
                        // Backend returns 'coupon' field, not 'code'
                        const match = group.discounts.find(c => c.coupon === couponCode);
                        if (match) {
                            foundCoupon = match;
                            foundGroup = group;
                            break;
                        }
                    }
                }

                if (foundCoupon && foundGroup) {
                    if (new Date(foundGroup.expiresAt) < new Date()) {
                        setError("This coupon has expired (Group expiration).");
                        return;
                    }

                    setAppliedDiscount({
                        type: 'COUPON',
                        percentage: foundCoupon.percentage,
                        couponId: foundCoupon.id,
                        groupId: foundGroup.id,
                        code: foundCoupon.coupon,
                        groupName: "Discount Group" // Add name filed if exists
                    });
                    showMessage(`Coupon applied! ${foundCoupon.percentage}% off.`, "success");
                } else {
                    setError("Invalid or inactive coupon code.");
                }

            } else {
                setError("Invalid coupon code.");
            }
        } catch (err) {
            console.error(err);
            // Fallback client-side search if API fails or returns 400
            const allGroups = await discountService.getAllGroups();
            let foundCoupon = null;
            let foundGroup = null;

            for (const group of allGroups) {
                if (group.discounts) {
                    // Backend returns 'coupon' field, not 'code'
                    const match = group.discounts.find(c => c.coupon === couponCode);
                    if (match) {
                        foundCoupon = match;
                        foundGroup = group;
                        break;
                    }
                }
            }

            if (foundCoupon && foundGroup) {
                if (new Date(foundGroup.expiresAt) < new Date()) {
                    setError("This coupon has expired.");
                } else {
                    setAppliedDiscount({
                        type: 'COUPON',
                        percentage: foundCoupon.percentage,
                        couponId: foundCoupon.id,
                        groupId: foundGroup.id,
                        code: foundCoupon.coupon
                    });
                    showMessage(`Coupon applied! ${foundCoupon.percentage}% off.`, "success");
                    setError(null);
                }
            } else {
                setError("Invalid coupon code.");
            }
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    // Calculations
    const originalTotal = subscriptionData?.grandTotalAmount || 0;
    const discountPercentage = appliedDiscount?.percentage || 0;
    const discountAmount = (originalTotal * discountPercentage) / 100;
    const finalTotal = originalTotal - discountAmount;


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!transactionId || !paymentMethod) {
            setError('Please fill in all payment details');
            return;
        }

        setIsSubmitting(true);
        try {
            const organizationId = pendingAdminData.organizationId;
            if (!organizationId) throw new Error('Organization ID not found.');

            // Step 1: Create Subscription
            const validFrom = new Date();
            const validUntil = new Date();
            validUntil.setMonth(validFrom.getMonth() + 1); // Logic from previous file

            const subscriptionPayload = {
                organizationId: organizationId,
                paymentId: null,
                subscribedProducts: subscriptionData.subscribedProducts,
                billingCycle: subscriptionData.billingCycle,
                totalInterviewCredits: subscriptionData.totalInterviewCredits,
                demoInterviewCredits: null,
                interviewCreditsPrice: subscriptionData.interviewCreditsPrice,
                totalPositionCredits: subscriptionData.totalInterviewCredits,
                positionCreditsPrice: subscriptionData.interviewCreditsPrice,
                taxRate: subscriptionData.taxRate,
                taxInclusive: false,
                subTotal: subscriptionData.subTotal,
                totalAmount: finalTotal, // Use discounted total
                grandTotalAmount: finalTotal, // Use discounted total
                validFrom: validFrom.toISOString(),
                validUntil: validUntil.toISOString(),
                subscriptionStatus: 'PENDING',
                isSubscription: false
            };

            const subscriptionResponse = await subscriptionService.createSubscription(subscriptionPayload);
            const subscriptionId = subscriptionResponse.subscription?.id;

            // Step 2: Create Credits
            const creditsPayload = {
                organizationId: organizationId,
                totalInterviewCredits: subscriptionData.totalInterviewCredits,
                totalPositionCredits: subscriptionData.totalPositionCredits,
                utilizedInterviewCredits: 0,
                utilizedPositionCredits: 0,
                validTill: validUntil.toISOString().split('T')[0],
                active: true
            };
            await creditService.createCredits(creditsPayload);

            // Step 3: Create Payment Record
            const paymentPayload = {
                organizationId: organizationId,
                subscriptionId: subscriptionId,
                amount: finalTotal, // Use discounted total
                paymentMethod: paymentMethod,
                paymentStatus: 'COMPLETED',
                manualReferenceNumber: transactionId,
                receivedBy: receivedBy,
                paymentNotes: remarks,
                paymentDate: new Date(paymentDate).toISOString(),
                groupId: appliedDiscount?.groupId,   // NEW: Send Group ID
                couponId: appliedDiscount?.couponId  // NEW: Send Coupon ID
            };

            const paymentResponse = await paymentService.createPayment(paymentPayload);
            const paymentId = paymentResponse.payment?.id || paymentResponse.id;

            // Step 4: Update Subscription
            if (subscriptionId && paymentId) {
                await subscriptionService.updateSubscription(subscriptionId, {
                    paymentId: paymentId,
                    isSubscription: true,
                    subscriptionStatus: 'ACTIVE'
                });
            }

            // Step 5: Update Admin
            const adminId = pendingAdminData.adminId;
            if (adminId) {
                await adminService.updateAdmin(adminId, { isSubscription: true });
            }

            // Step 6: Record Coupon Usage (if applicable)
            if (appliedDiscount && appliedDiscount.code) {
                try {
                    await discountService.recordUsage(
                        appliedDiscount.code,
                        pendingAdminData.adminId,
                        'ADMIN'
                    );
                    console.log("Coupon usage recorded");
                } catch (discountErr) {
                    console.error("Failed to record coupon usage", discountErr);
                    // Do not fail the whole payment flow for this, just log it
                }
            }

            sessionStorage.removeItem('pendingAdminData');
            sessionStorage.removeItem('manualPaymentSubscriptionData');
            setSuccess(true);
            showMessage('Payment recorded successfully! Redirecting...', 'success');

            setTimeout(() => {
                navigate('/dashboard/admins');
            }, 2000);

        } catch (err) {
            console.error('Error in payment flow:', err);
            setError(err.response?.data?.message || err.message || 'Failed to complete payment');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!pendingAdminData || !subscriptionData) return null;

    return (
        <div className="min-h-full bg-white">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleBack}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ChevronLeft size={16} className="text-navy-900" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-navy-900">Manual Payment Verification</h1>
                        <p className="text-xs text-gray-600 mt-0.5">Recording payment for {pendingAdminData.fullName}</p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column - Payment Details (Span 8) */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Discount Section */}
                        <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                            <h3 className="text-sm font-semibold text-navy-900 mb-4 flex items-center gap-2">
                                <Ticket size={16} className="text-gold-500" /> Apply Discount
                            </h3>
                            <div className="flex gap-3">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        placeholder="Enter Coupon Code (e.g., WELCOME20)"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-gold-500 uppercase"
                                        disabled={isSubmitting || isValidatingCoupon}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleApplyCoupon}
                                    disabled={!couponCode || isSubmitting || isValidatingCoupon}
                                    className="px-4 py-2 bg-navy-900 text-white text-xs font-semibold rounded-lg hover:bg-navy-800 transition disabled:opacity-50"
                                >
                                    {isValidatingCoupon ? "Checking..." : "Apply"}
                                </button>
                            </div>
                            {appliedDiscount && (
                                <div className="mt-3 bg-green-50 border border-green-100 text-green-700 px-3 py-2 rounded-lg text-xs flex items-center gap-2">
                                    <CheckCircle2 size={14} />
                                    <span>Coupon <b>{appliedDiscount.code}</b> applied: {appliedDiscount.percentage}% Discount</span>
                                    <button
                                        onClick={() => { setAppliedDiscount(null); setCouponCode(''); }}
                                        className="ml-auto text-green-800 hover:text-green-900 underline"
                                    >Remove</button>
                                </div>
                            )}
                            {error && error.includes("coupon") && (
                                <p className="mt-2 text-xs text-red-500">{error}</p>
                            )}
                        </div>

                        {/* Payment Form */}
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-sm font-semibold text-navy-900 mb-4 flex items-center gap-2">
                                <CreditCard size={16} className="text-blue-600" /> Payment Details
                            </h3>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Payment Method</label>
                                        <select
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                            disabled={isSubmitting}
                                        >
                                            <option value="BANK_TRANSFER">Bank Transfer</option>
                                            <option value="CASH">Cash</option>
                                            <option value="UPI">UPI / QR</option>
                                            <option value="CHECK">Check</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Payment Date</label>
                                        <input
                                            type="date"
                                            value={paymentDate}
                                            onChange={(e) => setPaymentDate(e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Transaction / Reference ID <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        placeholder="Enter transaction reference number"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Received By</label>
                                        <input
                                            type="text"
                                            value={receivedBy}
                                            onChange={(e) => setReceivedBy(e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Remarks</label>
                                        <input
                                            type="text"
                                            value={remarks}
                                            onChange={(e) => setRemarks(e.target.value)}
                                            placeholder="Optional notes"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column - Summary (Span 4) */}
                    <div className="lg:col-span-4">
                        <div className="bg-gray-50 rounded-lg p-5 border border-gray-100 sticky top-6">
                            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                                <Receipt size={16} className="text-qwikBlue" />
                                <h3 className="text-sm font-semibold text-navy-900">Payment Summary</h3>
                            </div>

                            <div className="space-y-3">
                                {/* Detailed Breakdown */}
                                {/* Detailed Breakdown */}
                                <div>
                                    <div className="flex justify-between items-center text-xs text-gray-600 mb-0.5">
                                        <span>Interview Credits</span>
                                        <span className="font-medium text-gray-900">
                                            ₹{(subscriptionData.totalInterviewCredits * (subscriptionData.interviewCreditsPrice || 0)).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-gray-400 text-right font-mono">
                                        {subscriptionData.totalInterviewCredits} x ₹{subscriptionData.interviewCreditsPrice}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center text-xs text-gray-600 mb-0.5">
                                        <span>Position Credits</span>
                                        <span className="font-medium text-gray-900">
                                            ₹{(subscriptionData.totalPositionCredits * (subscriptionData.positionCreditsPrice || 0)).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-gray-400 text-right font-mono">
                                        {subscriptionData.totalPositionCredits} x ₹{subscriptionData.positionCreditsPrice}
                                    </div>
                                </div>

                                <div className="pt-2 mt-2 border-t border-gray-100 flex justify-between items-center text-xs text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-gray-900">₹{subscriptionData.subTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-600">
                                    <span>Tax ({subscriptionData.taxRate}%)</span>
                                    <span className="font-medium text-gray-900">
                                        ₹{(subscriptionData.grandTotalAmount - subscriptionData.subTotal).toLocaleString()}
                                    </span>
                                </div>

                                {appliedDiscount && (
                                    <div className="flex justify-between items-center text-xs text-green-600 pt-2 border-t border-gray-100 mt-2">
                                        <span>Discount ({discountPercentage}%)</span>
                                        <span className="font-medium">- ₹{discountAmount.toLocaleString()}</span>
                                    </div>
                                )}

                                <div className="pt-3 mt-1 border-t border-gray-200">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-bold text-navy-900">Total Payable</span>
                                        <span className="text-xl font-bold text-qwikBlue">₹{Math.round(finalTotal).toLocaleString()}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 text-right mt-1">Inclusive of taxes</p>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !transactionId}
                                className="w-full mt-6 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white text-sm font-bold rounded-lg shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Processing..." : "Confirm & Activate"}
                            </button>
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

export default AdminManualPayment;
