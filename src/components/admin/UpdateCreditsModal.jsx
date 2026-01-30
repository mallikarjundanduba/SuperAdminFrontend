import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { creditService } from "../../services/creditService";

const UpdateCreditsModal = ({ org, onClose, onSuccess, showMessage, isViewMode = false }) => {
    const [formData, setFormData] = useState({
        totalInterviewCredits: 0,
        totalPositionCredits: 0,
        validTill: ""
    });

    useEffect(() => {
        if (org) {
            setFormData({
                totalInterviewCredits: org.totalInterviewCredits || 0,
                totalPositionCredits: org.totalPositionCredits || 0,
                validTill: org.validTill ? org.validTill.split('T')[0] : ""
            });
        }
    }, [org]);

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

    if (!org) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xs font-bold text-slate-900">{isViewMode ? "View Credits" : "Update Credits"}: {org.organizationName}</h2>
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
                            onChange={(e) => setFormData({ ...formData, totalInterviewCredits: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-xs font-medium text-slate-900 disabled:bg-slate-50 disabled:text-slate-500"
                            disabled={isViewMode}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-medium text-slate-500 mb-1">Total Position Credits</label>
                        <input
                            type="number"
                            required
                            value={formData.totalPositionCredits}
                            onChange={(e) => setFormData({ ...formData, totalPositionCredits: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-xs font-medium text-slate-900 disabled:bg-slate-50 disabled:text-slate-500"
                            disabled={isViewMode}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-medium text-slate-500 mb-1">Valid Till</label>
                        <input
                            type="date"
                            required
                            value={formData.validTill}
                            onChange={(e) => setFormData({ ...formData, validTill: e.target.value })}
                            className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-xs font-medium text-slate-600 disabled:bg-slate-50 disabled:text-slate-500"
                            disabled={isViewMode}
                        />
                    </div>
                    <div className="flex gap-2 pt-4">
                        {isViewMode ? (
                            <button type="button" onClick={onClose} className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition duration-200">
                                Close
                            </button>
                        ) : (
                            <>
                                <button type="submit" className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition duration-200 shadow-sm">Update Credits</button>
                                <button type="button" onClick={onClose} className="px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-slate-700 text-xs font-medium rounded-lg transition duration-200">
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateCreditsModal;
