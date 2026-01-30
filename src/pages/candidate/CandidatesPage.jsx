import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserPlus, Search, Edit, RefreshCw, Check, X, Users, Send } from "lucide-react";
import { candidateService } from "../../services/candidateService";
import Pagination from "../../components/common/Pagination";
import SnackbarAlert from "../../components/common/SnackbarAlert";

const CandidatesPage = ({ adminInfo }) => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage] = useState(10);
    const navigate = useNavigate();
    const location = useLocation();

    // Modals state
    const [showInviteCandidateModal, setShowInviteCandidateModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");

    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const showMessage = (message, severity = "success") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const loadCandidates = async () => {
        try {
            setLoading(true);
            const data = await candidateService.getAllCandidates();

            if (data && data.content && Array.isArray(data.content)) {
                setCandidates(data.content);
            } else if (Array.isArray(data)) {
                setCandidates(data);
            } else {
                setCandidates([]);
            }
        } catch (error) {
            console.error("Error loading candidates:", error);
            showMessage("Failed to load candidates", "error");
            setCandidates([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCandidates();
        // Check if we should open the invite modal (coming back from invitations page)
        if (location.state?.openInviteModal) {
            setShowInviteCandidateModal(true);
            // Clear state to avoid reopening on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const handleInviteCandidate = async (e) => {
        e.preventDefault();
        try {
            const isSuperAdmin = adminInfo?.role === "SUPERADMIN";
            if (isSuperAdmin) {
                await candidateService.inviteCandidateBySuperAdmin(inviteEmail);
            } else {
                await candidateService.createCandidateInvitation(inviteEmail);
            }
            showMessage("Candidate invitation sent successfully");
            setShowInviteCandidateModal(false);
            setInviteEmail("");
            loadCandidates();
        } catch (error) {
            console.error("Error inviting candidate:", error);
            const errorMessage = error?.response?.data?.error || error?.message || "Failed to invite candidate.";
            showMessage(errorMessage, "error");
        }
    };

    const handleResendInvite = async (candidateId) => {
        try {
            await candidateService.resendInvite(candidateId);
            showMessage("Invitation resent successfully");
            loadCandidates();
        } catch (error) {
            console.error("Error resending invite:", error);
            const errorMessage = error?.response?.data?.error || error?.message || "Failed to resend invite.";
            showMessage(errorMessage, "error");
        }
    };

    // Filtering
    const filteredCandidates = candidates.filter(candidate =>
        candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalItems = filteredCandidates.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const currentCandidates = filteredCandidates.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Candidates</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Manage candidates and test assignments</p>
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
                        disabled
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
                            placeholder="Search candidates by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border border-gray-300 rounded-md pl-3 pr-3 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end flex-shrink-0">
                    <button
                        onClick={loadCandidates}
                        className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        title="Refresh Data"
                    >
                        <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => navigate("/dashboard/candidate-invitations")}
                        className="inline-flex items-center gap-x-1.5 rounded-md bg-white border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all"
                    >
                        <Users className="-ml-0.5 h-4 w-4" aria-hidden="true" />
                        Invitations
                    </button>
                    <button
                        onClick={() => setShowInviteCandidateModal(true)}
                        className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all"
                    >
                        <UserPlus className="-ml-0.5 h-4 w-4" aria-hidden="true" />
                        Invite Candidate
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="w-full mt-1">
                <div className="w-full">
                    <table className="min-w-full border-separate" style={{ borderSpacing: '0 8px' }}>
                        <thead className="sticky top-0 z-10 bg-qwikBlue shadow-sm">
                            <tr className="rounded-md h-12 mb-4">
                                <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue rounded-l-lg">Candidate</th>
                                <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Contact</th>
                                <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Test Status</th>
                                <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Invite Status</th>
                                <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Payment</th>
                                <th className="px-6 py-2.5 text-center text-xs font-semibold text-white bg-qwikBlue rounded-r-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-transparent">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                                            <p className="text-sm font-bold text-slate-400">Loading candidates...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : currentCandidates.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-xs text-gray-500">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <p className="text-lg font-black text-slate-900">{searchTerm ? "No candidates found matching your search" : "No candidates found"}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentCandidates.map((candidate) => (
                                    <tr key={candidate.id} className="bg-white shadow-sm hover:shadow-md transition-shadow group rounded-md">
                                        <td className="px-6 py-2 rounded-l-lg border-l border-y border-gray-100">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-semibold text-slate-900">{candidate.fullName || "N/A"}</span>
                                                <span className="text-[10px] text-slate-500">
                                                    Joined: {new Date(candidate.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-2 border-y border-gray-100">
                                            <span className="text-xs text-slate-500">{candidate.email}</span>
                                        </td>
                                        <td className="px-6 py-2 border-y border-gray-100">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                                {candidate.testStatus || "Pending"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-2 border-y border-gray-100">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${candidate.inviteStatus === 'Invited' || candidate.inviteStatus === 'Manual Invited'
                                                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                                : candidate.inviteStatus === 'Failed'
                                                    ? "bg-red-50 text-red-700 border border-red-200"
                                                    : "bg-gray-50 text-gray-700 border border-gray-200"
                                                }`}>
                                                {candidate.inviteStatus || "Not Invited"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-2 border-y border-gray-100">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${candidate.paymentStatus === 'PAID'
                                                ? "bg-green-50 text-green-700 border border-green-200"
                                                : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                                }`}>
                                                {candidate.paymentStatus === 'PAID' && <Check size={12} className="mr-1" />}
                                                {candidate.paymentStatus || "Unpaid"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-2 rounded-r-lg border-r border-y border-gray-100 text-xs text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                <button
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                    title="View Details"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleResendInvite(candidate.id)}
                                                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                                    title="Send Invite"
                                                >
                                                    <Send size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {totalItems > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs text-gray-700">
                                    Showing <span className="font-medium">{filteredCandidates.length > 0 ? currentPage * itemsPerPage + 1 : 0}</span> to <span className="font-medium">{Math.min((currentPage + 1) * itemsPerPage, filteredCandidates.length)}</span> of <span className="font-medium">{filteredCandidates.length}</span> entries
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

            {/* Invite Candidate Modal */}
            {showInviteCandidateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity animate-in fade-in duration-200">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-sm font-bold text-slate-900">Invite Candidate</h2>
                            <button onClick={() => setShowInviteCandidateModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleInviteCandidate} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    required
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qwikBlue focus:border-qwikBlue transition text-sm"
                                    placeholder="candidate@example.com"
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="submit" className="flex-1 py-2 px-4 bg-qwikBlue hover:bg-qwikBlueDark text-white font-semibold rounded-lg transition duration-200 shadow-md text-xs">Send Invitation</button>
                                <button type="button" onClick={() => setShowInviteCandidateModal(false)} className="px-4 py-2 border border-slate-300 hover:border-slate-400 text-slate-700 font-medium rounded-lg transition duration-200 text-xs">
                                    Cancel
                                </button>
                            </div>
                        </form>
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

export default CandidatesPage;
