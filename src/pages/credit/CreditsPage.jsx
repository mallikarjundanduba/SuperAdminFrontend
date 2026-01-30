import React, { useState, useEffect } from "react";
import { Search, RefreshCw, Edit, MoreVertical, Eye } from "lucide-react";
import { useLocation } from "react-router-dom";
import { adminService } from "../../services/adminService";
import Pagination from "../../components/common/Pagination";
import SnackbarAlert from "../../components/common/SnackbarAlert";
import UpdateCreditsModal from "../../components/admin/UpdateCreditsModal";

const CreditsPage = ({ adminInfo }) => {
    const [creditsList, setCreditsList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage] = useState(10);
    const location = useLocation();

    // Modal State
    const [showUpdateCreditsModal, setShowUpdateCreditsModal] = useState(false);
    const [selectedOrgForCredits, setSelectedOrgForCredits] = useState(null);
    const [activeDropdownId, setActiveDropdownId] = useState(null);
    const [isViewMode, setIsViewMode] = useState(false);

    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const showMessage = (message, severity = "success") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const loadCreditsData = async () => {
        try {
            setLoading(true);
            // Use getAllCredits which returns the enriched DTO with organizationName and adminName
            if (adminService.getAllCredits) {
                const response = await adminService.getAllCredits();
                let data = [];
                // Check format { status: 'success', data: [...] } or just [...]
                if (response?.data) {
                    data = response.data;
                } else if (Array.isArray(response)) {
                    data = response;
                }
                setCreditsList(data);
            } else {
                setCreditsList([]);
            }
        } catch (error) {
            console.error("Error loading credit data:", error);
            showMessage("Failed to load credits", "error");
            setCreditsList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCreditsData();
    }, []);

    // Handle auto-open modal from navigation state
    useEffect(() => {
        if (location.state?.openUpdateCreditsModal && location.state?.organizationId && creditsList.length > 0) {
            const org = creditsList.find(c => c.organizationId === location.state.organizationId);
            if (org) {
                setSelectedOrgForCredits(org);
                setShowUpdateCreditsModal(true);
                setIsViewMode(false); // Default to edit mode if opening from nav? Or check requirement. Assuming edit.
                // Optional: clear state to prevent reopening on reload, but keeping it simple for now
            }
        }
    }, [location.state, creditsList]);

    // Filtering
    const filteredCredits = creditsList.filter(item => {
        const orgName = item.organizationName?.toLowerCase() || '';
        const adminName = item.adminName?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();
        return orgName.includes(search) || adminName.includes(search);
    });

    const totalItems = filteredCredits.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const currentCredits = filteredCredits.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Credits Management</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Monitor assigned and utilized credits for Admins</p>
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
                            placeholder="Search by Admin or Organization..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border border-gray-300 rounded-md pl-3 pr-3 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end flex-shrink-0">
                    <button
                        onClick={loadCreditsData}
                        className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        title="Refresh Data"
                    >
                        <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="w-full mt-1">
                <div className="w-full">
                    <table className="min-w-full border-separate" style={{ borderSpacing: '0 8px' }}>
                        <thead className="sticky top-0 z-10 bg-qwikBlue shadow-sm">
                            <tr className="rounded-md h-12 mb-4">
                                <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue rounded-l-lg">Admin / Organization</th>
                                <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Interview Credits (Used/Total)</th>
                                <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Position Credits (Used/Total)</th>
                                <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Valid Till</th>
                                <th className="px-6 py-2.5 text-center text-xs font-semibold text-white bg-qwikBlue rounded-r-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-transparent">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                                            <p className="text-sm font-bold text-slate-400">Loading credits...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : currentCredits.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-xs text-gray-500">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <p className="text-lg font-black text-slate-900">No credits information found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentCredits.map((credit) => (
                                    <tr key={credit.id || credit.organizationId} className="bg-white shadow-sm hover:shadow-md transition-shadow group rounded-md">
                                        <td className="px-6 py-2 rounded-l-lg border-l border-y border-gray-100">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-semibold text-slate-900">{credit.adminName || "Unknown Admin"}</span>
                                                <span className="text-[10px] text-slate-500">{credit.organizationName || "Unknown Org"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-2 border-y border-gray-100 text-xs text-slate-900">
                                            <span className="font-medium text-blue-700">{credit.utilizedInterviewCredits || 0}</span>
                                            <span className="text-slate-400 mx-1">/</span>
                                            <span>{credit.totalInterviewCredits || 0}</span>
                                        </td>
                                        <td className="px-6 py-2 border-y border-gray-100 text-xs text-slate-900">
                                            <span className="font-medium text-blue-700">{credit.utilizedPositionCredits || 0}</span>
                                            <span className="text-slate-400 mx-1">/</span>
                                            <span>{credit.totalPositionCredits || 0}</span>
                                        </td>
                                        <td className="px-6 py-2 border-y border-gray-100 text-xs text-slate-500">
                                            {credit.validTill || "-"}
                                        </td>
                                        <td className="px-6 py-2 rounded-r-lg border-r border-y border-gray-100 text-xs text-center relative">
                                            <div className="flex justify-center items-center gap-2">
                                                <button
                                                    onClick={() => setActiveDropdownId(activeDropdownId === credit.organizationId ? null : credit.organizationId)}
                                                    className={`p-1.5 rounded-full transition-colors ${activeDropdownId === credit.organizationId ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-blue-600 hover:bg-slate-50'}`}
                                                    title="Actions"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                                {activeDropdownId === credit.organizationId && (
                                                    <>
                                                        <div
                                                            className="fixed inset-0 z-10"
                                                            onClick={() => setActiveDropdownId(null)}
                                                        />
                                                        <div className="absolute right-8 top-2 w-32 bg-white rounded-lg shadow-xl border border-slate-100 z-20 py-1 text-left animate-in fade-in zoom-in-95 duration-200">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedOrgForCredits(credit);
                                                                    setIsViewMode(true);
                                                                    setShowUpdateCreditsModal(true);
                                                                    setActiveDropdownId(null);
                                                                }}
                                                                className="w-full px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2"
                                                            >
                                                                <Eye size={14} /> View
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedOrgForCredits(credit);
                                                                    setIsViewMode(false);
                                                                    setShowUpdateCreditsModal(true);
                                                                    setActiveDropdownId(null);
                                                                }}
                                                                className="w-full px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2"
                                                            >
                                                                <Edit size={14} /> Edit
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
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
                                    Showing <span className="font-medium">{filteredCredits.length > 0 ? currentPage * itemsPerPage + 1 : 0}</span> to <span className="font-medium">{Math.min((currentPage + 1) * itemsPerPage, filteredCredits.length)}</span> of <span className="font-medium">{filteredCredits.length}</span> entries
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

            {showUpdateCreditsModal && selectedOrgForCredits && (
                <UpdateCreditsModal
                    org={selectedOrgForCredits}
                    isViewMode={isViewMode}
                    onClose={() => {
                        setShowUpdateCreditsModal(false);
                        setSelectedOrgForCredits(null);
                    }}
                    onSuccess={() => {
                        loadCreditsData();
                        setShowUpdateCreditsModal(false);
                        setSelectedOrgForCredits(null);
                    }}
                    showMessage={showMessage}
                />
            )}
        </div>
    );
};

export default CreditsPage;
