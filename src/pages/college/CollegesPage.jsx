import React, { useState, useEffect } from "react";
import { Search, Edit, Trash2, RefreshCw, Users, Mail } from "lucide-react";
import { collegeService } from "../../services/collegeService";
import Pagination from "../../components/common/Pagination";
import SnackbarAlert from "../../components/common/SnackbarAlert";

const CollegesPage = ({ adminInfo }) => {
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage] = useState(10);

    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const showMessage = (message, severity = "success") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const loadColleges = async () => {
        try {
            setLoading(true);
            const data = await collegeService.getAllColleges();
            setColleges(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error loading colleges:", error);
            showMessage("Failed to load colleges", "error");
            setColleges([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadColleges();
    }, []);

    // Filtering
    const filteredColleges = colleges.filter(college =>
        college.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.dbName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalItems = filteredColleges.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const currentColleges = filteredColleges.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Colleges</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Colleges are automatically created based on Admin Organization names</p>
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
                            placeholder="Search colleges by name, code or db..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border border-gray-300 rounded-md pl-3 pr-3 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end flex-shrink-0">
                    <button
                        onClick={loadColleges}
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
                                <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue rounded-l-lg">College Code</th>
                                <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">College Name</th>
                                <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Database</th>
                                <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Admin Emails</th>
                                <th className="px-6 py-2.5 text-center text-xs font-semibold text-white bg-qwikBlue rounded-r-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-transparent">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                                            <p className="text-sm font-bold text-slate-400">Loading colleges...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : currentColleges.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-xs text-gray-500">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <p className="text-lg font-black text-slate-900">{searchTerm ? "No colleges found matching your search" : "No colleges found"}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentColleges.map((college) => (
                                    <tr key={college.id} className="bg-white shadow-sm hover:shadow-md transition-shadow group rounded-md">
                                        <td className="px-6 py-2 rounded-l-lg border-l border-y border-gray-100">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                                {college.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-2 border-y border-gray-100">
                                            <span className="text-xs font-semibold text-slate-900">{college.name}</span>
                                        </td>
                                        <td className="px-6 py-2 border-y border-gray-100 text-xs text-slate-500 font-mono">
                                            {college.dbName}
                                        </td>
                                        <td className="px-6 py-2 border-y border-gray-100 max-w-xs">
                                            <div className="flex flex-wrap gap-1">
                                                {college.adminEmails?.length > 0 ? (
                                                    college.adminEmails.map((email, i) => (
                                                        <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200 text-[10px]">
                                                            <Mail size={10} />
                                                            {email}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 italic">No admins</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-2 rounded-r-lg border-r border-y border-gray-100 text-xs text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                <button
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
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
                                    Showing <span className="font-medium">{filteredColleges.length > 0 ? currentPage * itemsPerPage + 1 : 0}</span> to <span className="font-medium">{Math.min((currentPage + 1) * itemsPerPage, filteredColleges.length)}</span> of <span className="font-medium">{filteredColleges.length}</span> entries
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
        </div>
    );
};

export default CollegesPage;
