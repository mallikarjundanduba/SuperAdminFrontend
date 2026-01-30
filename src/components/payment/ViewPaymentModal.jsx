import React from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, DollarSign, CreditCard, Hash, User, FileText, CheckCircle, Ban, Download, Printer } from 'lucide-react';

const ViewPaymentModal = ({ payment, onClose }) => {
    if (!payment) return null;

    const handlePrint = () => {
        window.print();
    };

    return createPortal(
        <div className="fixed inset-0 z-[10000] overflow-hidden print:static print:inset-auto print:z-auto print:overflow-visible">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300 print:hidden"
                onClick={onClose}
            />

            {/* Drawer/Modal Content */}
            <div className="absolute inset-y-0 right-0 w-full sm:w-[500px] md:w-[600px] bg-slate-50 shadow-2xl transition-transform animate-in slide-in-from-right duration-300 border-l border-slate-200 flex flex-col font-sans print:relative print:w-full print:shadow-none print:border-none print:transform-none">

                {/* Header */}
                <div className="px-6 py-5 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-10 print:border-none">
                    <div>
                        <div className="flex items-center gap-2 mb-1 print:hidden">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
                                Payment
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${(payment.paymentStatus || payment.status) === 'COMPLETED' || payment.status === 'SUCCESS'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                {payment.paymentStatus || payment.status || 'Pending'}
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 leading-tight flex items-center gap-2">
                            Invoice #{payment.invoiceNumber || "N/A"}
                        </h2>
                        <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-slate-500">
                            <Calendar size={12} /> {new Date(payment.createdAt || payment.paymentDate).toLocaleString()}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 print:hidden">
                        <button
                            onClick={handlePrint}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                            title="Print / Download PDF"
                        >
                            <Printer size={20} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 pb-12 print:overflow-visible print:p-0">

                    {/* Receipt-like Summary */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 print:border-none print:shadow-none">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                            <span className="text-sm font-semibold text-slate-500">Total Amount</span>
                            <span className="text-2xl font-bold text-slate-900 flex items-center">
                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(payment.amount || 0)}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <DetailItem label="Payment Method" value={(payment.paymentMethod || "Manual").replace('_', ' ')} icon={<CreditCard size={12} />} />
                            <DetailItem label="Transaction ID" value={payment.razorpayPaymentId || "N/A"} icon={<Hash size={12} />} />
                            <DetailItem label="Order ID" value={payment.razorpayOrderId || "N/A"} icon={<FileText size={12} />} />
                            <DetailItem label="Manual Ref" value={payment.manualReferenceNumber || "-"} icon={<Hash size={12} />} />
                        </div>
                    </div>

                    {/* Section: User Details */}
                    <div className="space-y-4 pt-2">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 print:text-black">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 print:hidden" /> Payer Details
                        </h3>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 gap-4 print:border border-slate-300 print:shadow-none">
                            <DetailItem label="Name" value={payment.candidateName || payment.adminName || payment.userName || "Unknown"} icon={<User size={12} />} />
                            {/* Add Email or Phone if available in DTO */}
                            {payment.organizationId && <DetailItem label="Organization ID" value={payment.organizationId} icon={<Hash size={12} />} />}
                        </div>
                    </div>

                    {/* Additional Metadata if needed */}
                    <div className="text-[10px] text-slate-400 text-center pt-8 print:block hidden">
                        <p>Generated by SystemMinds Admin Portal</p>
                        <p>{new Date().toLocaleString()}</p>
                    </div>

                </div>
            </div>
            {/* Print Styles */}
            <style>{`
                @media print {
                    @page { margin: 2cm; }
                    body * {
                        visibility: hidden;
                    }
                    .fixed.inset-0.z-\\[10000\\] * {
                        visibility: visible;
                    }
                    .fixed.inset-0.z-\\[10000\\] {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: auto;
                        background: white;
                    }
                    /* Hide scrollbars and backdrops */
                    .custom-scrollbar::-webkit-scrollbar { display: none; }
                }
            `}</style>
        </div>,
        document.body
    );
};

const DetailItem = ({ label, value, icon }) => (
    <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1">
            {icon}{label}
        </span>
        <span className="text-xs font-semibold text-slate-800 break-words">{value || "—"}</span>
    </div>
);

export default ViewPaymentModal;
