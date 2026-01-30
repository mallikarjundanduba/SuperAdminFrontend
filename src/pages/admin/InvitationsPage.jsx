import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Users,
    Search,
    RefreshCw,
    ChevronLeft,
    Mail,
    Calendar,
    CheckCircle2,
    Clock,
    ExternalLink,
    Filter,
    Plus,
    User,
    Phone
} from "lucide-react";
import { adminService } from "../../services/adminService";
import Pagination from "../../components/common/Pagination";
import SnackbarAlert from "../../components/common/SnackbarAlert";

const InvitationsPage = ({ adminInfo }) => {
    const navigate = useNavigate();
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalItems: 0,
        totalPages: 0
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const fetchInvitations = async (page = 0, query = search) => {
        try {
            setLoading(true);
            const response = await adminService.getAllAdmins(page, pagination.size, "createdAt", "desc", query);

            // Filter for non-SUPERADMIN users (invited admins)
            const allAdmins = response.content || [];
            const invitedAdmins = allAdmins.filter(admin => admin.role !== "SUPERADMIN");

            setInvitations(invitedAdmins);
            setPagination({
                page: response.currentPage,
                size: response.size,
                totalItems: response.totalItems,
                totalPages: response.totalPages
            });
        } catch (error) {
            console.error("Error fetching invitations:", error);
            showMessage("Failed to fetch invitations", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvitations();
    }, []);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchInvitations(0, search);
    };

    const handlePageChange = (newPage) => {
        fetchInvitations(newPage);
    };

    const showMessage = (message, severity = "success") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-2 cursor-pointer group" onClick={() => navigate("/dashboard/admins")}>
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Back to Admins</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Invitations</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Track status of invited system administrators</p>
                </div>
            </div>

            {/* Stats Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Invited</p>
                        <p className="text-xl font-black text-slate-900">{pagination.totalItems}</p>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <Users size={20} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Registered</p>
                        <p className="text-xl font-black text-slate-900">{invitations.filter(i => i.registered).length}</p>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                        <CheckCircle2 size={20} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Pending</p>
                        <p className="text-xl font-black text-slate-900">{invitations.filter(i => !i.registered).length}</p>
                    </div>
                    <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                        <Clock size={20} />
                    </div>
                </div>
            </div>

            {/* Controls Section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-2 flex-shrink-0">
                    <label htmlFor="pageSize" className="text-xs text-gray-900 font-medium">Show</label>
                    <select
                        id="pageSize"
                        value={pagination.size}
                        disabled
                        className="rounded-md border-gray-300 text-xs py-1.5 px-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-sm"
                    >
                        {[10, 20, 30, 40, 50].map((val) => (<option key={val} value={val}>{val}</option>))}
                    </select>
                    <span className="text-xs text-gray-900">Entries</span>
                </div>

                <div className="flex-1 max-w-2xl flex items-center justify-end gap-2">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={handleSearchChange}
                            onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit(e)}
                            className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <button
                        onClick={() => fetchInvitations(pagination.page)}
                        className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm bg-white border border-gray-200"
                        title="Refresh Data"
                    >
                        <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
                    </button>

                    <button className="p-1.5 border border-gray-300 rounded-md bg-white text-gray-500 hover:bg-gray-50 transition shadow-sm">
                        <Filter size={16} />
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

            {/* Table Section */}
            <div className="w-full mt-1">
                <div className="w-full overflow-x-auto">
                    <table className="min-w-full border-separate" style={{ borderSpacing: "0 8px" }}>
                        <thead className="sticky top-0 z-10 bg-qwikBlue shadow-sm">
                            <tr className="rounded-md h-12">
                                <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue rounded-l-lg">Administrator</th>
                                <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Contact</th>
                                <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Invitation Date</th>
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
                                            <p className="text-sm font-bold text-slate-400">Loading invitations...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : invitations.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-xs text-gray-500 bg-white rounded-lg shadow-sm">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <Users size={48} className="text-slate-400" />
                                            <p className="text-lg font-black text-slate-900">{search ? "No matches found" : "No invitations found"}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                invitations.map((inv) => (
                                    <tr key={inv.id} className="bg-white shadow-sm hover:shadow-md transition-shadow group rounded-md">
                                        <td className="px-6 py-2 rounded-l-lg border-l border-y border-gray-100">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-semibold text-slate-900">{inv.fullName || "N/A"}</span>
                                                <span className="text-[10px] text-slate-500 font-mono mt-0.5">{inv.userCode}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-2 border-y border-gray-100">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                                                    <Mail size={10} className="text-slate-400" />
                                                    {inv.email}
                                                </div>
                                                {inv.phone && (
                                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                                                        <Phone size={10} className="text-slate-400" />
                                                        {inv.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-2 border-y border-gray-100 font-medium">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] text-slate-700">
                                                    {new Date(inv.createdAt).toLocaleDateString(undefined, {
                                                        year: "numeric", month: "short", day: "numeric"
                                                    })}
                                                </span>
                                                <span className="text-[9px] text-slate-400 uppercase tracking-tighter">
                                                    {new Date(inv.createdAt).toLocaleTimeString(undefined, {
                                                        hour: "2-digit", minute: "2-digit"
                                                    })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-2 border-y border-gray-100">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight border ${inv.registered
                                                ? "bg-green-50 text-green-700 border-green-200"
                                                : "bg-amber-50 text-amber-700 border-amber-200"
                                                }`}>
                                                {inv.registered ? "Registered" : "Pending"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-2 rounded-r-lg border-r border-y border-gray-100 text-center">
                                            <button
                                                onClick={() => navigate(`/dashboard/admins/${inv.id}/edit`)}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                                                title="View Details"
                                            >
                                                <ExternalLink size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Section */}
                {invitations.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs text-gray-700">
                                    Showing <span className="font-medium">{pagination.page * pagination.size + 1}</span> to <span className="font-medium">{Math.min((pagination.page + 1) * pagination.size, pagination.totalItems)}</span> of <span className="font-medium">{pagination.totalItems}</span> entries
                                </p>
                            </div>
                            <Pagination
                                currentPage={pagination.page}
                                totalPages={pagination.totalPages}
                                onPageChange={handlePageChange}
                                totalItems={pagination.totalItems}
                                itemsPerPage={pagination.size}
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
        </div>
    );
};

export default InvitationsPage;
