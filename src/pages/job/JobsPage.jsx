import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Edit, Trash2, RefreshCw, Upload, MoreVertical, Eye, CheckCircle, XCircle } from "lucide-react";
import { jobService } from "../../services/jobService";
import Pagination from "../../components/common/Pagination";
import SnackbarAlert from "../../components/common/SnackbarAlert";
import ViewJobModal from "../../components/job/ViewJobModal";

const JobsPage = ({ adminInfo }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const navigate = useNavigate();

    // Modals state
    const [showUploadCsvModal, setShowUploadCsvModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);

    // Menu state
    const [activeMenu, setActiveMenu] = useState(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenu(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleActionClick = (e, jobId) => {
        e.stopPropagation();
        setActiveMenu(activeMenu === jobId ? null : jobId);
    };

    const handleToggleStatus = async (job) => {
        try {
            await jobService.toggleJobStatus(job.jobId);
            showMessage(`Job marked as ${job.status === 'Active' ? 'Inactive' : 'Active'}`, "success");
            loadJobs();
        } catch (error) {
            showMessage("Failed to update status", "error");
        }
    };

    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const showMessage = (message, severity = "success") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const loadJobs = async () => {
        try {
            setLoading(true);
            let data = [];
            const organizationId = adminInfo?.organization?.organizationId || localStorage.getItem('organizationId');

            if (organizationId) {
                // Determine if getJobsByOrganizationId exists or just use getAllJobs
                if (jobService.getJobsByOrganizationId) {
                    data = await jobService.getJobsByOrganizationId(organizationId);
                } else {
                    data = await jobService.getAllJobs();
                }
            } else {
                data = await jobService.getAllJobs();
            }

            setJobs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error loading jobs:", error);
            // Don't alert immediately on load, just set empty
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadJobs();
    }, [adminInfo]);

    // Filtering
    const filteredJobs = jobs.filter(job =>
        job.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.jobCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalItems = filteredJobs.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const currentJobs = filteredJobs.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Jobs</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Manage job listings and requirements</p>
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
                        // Simplification: static value for now as setter logic differs. 
                        // To properly implement show entries, we would need setItemsPerPage state and onChange handler
                        // matching AdminsPage. For correctness with the approved UI, I'll stick to fixed 10 or copy the logic if strict parity needed. 
                        // The user asked "make it completely like these only", so I should respect the selector UI even if non-functional or I'll implement it properly.
                        // I will implement it properly.
                        // Wait, previous file had itemsPerPage state but no setter exposed in render.
                        // I will add onChange logic here.
                        onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(0); }}
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
                            placeholder="Search jobs, codes, companies..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border border-gray-300 rounded-md pl-3 pr-3 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end flex-shrink-0">
                    <button
                        onClick={loadJobs}
                        className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        title="Refresh Data"
                    >
                        <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => setShowUploadCsvModal(true)}
                        className="inline-flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-all"
                    >
                        <Upload className="-ml-0.5 h-4 w-4 text-slate-500" aria-hidden="true" />
                        Upload CSV
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/create-job')}
                        className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all"
                    >
                        <Plus className="-ml-0.5 h-4 w-4" aria-hidden="true" />
                        Create Job
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="w-full mt-1">
                <div className="w-full">
                    <table className="min-w-full border-separate" style={{ borderSpacing: '0 8px' }}>
                        <thead className="sticky top-0 z-10 bg-qwikBlue shadow-sm">
                            <tr className="rounded-md h-12 mb-4">
                                <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue rounded-l-lg">Job Code</th>
                                <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Company</th>
                                <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Job Title</th>
                                <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Skills</th>
                                <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Package</th>
                                <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">External Link</th>
                                <th className="px-6 py-2.5 text-left text-xs font-semibold text-white bg-qwikBlue">Status</th>
                                <th className="px-6 py-2.5 text-center text-xs font-semibold text-white bg-qwikBlue rounded-r-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-transparent">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-16">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                                            <p className="text-sm font-bold text-slate-400">Loading jobs...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : currentJobs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center text-xs text-gray-500">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <p className="text-lg font-black text-slate-900">{searchTerm ? "No jobs found matching your search" : "No jobs found"}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentJobs.map((job) => (
                                    <tr key={job.jobId} className="bg-white shadow-sm hover:shadow-md transition-shadow group rounded-md">
                                        <td className="px-6 py-2 rounded-l-lg border-l border-y border-gray-100">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                                {job.jobCode}
                                            </span>
                                        </td>
                                        <td className="px-6 py-2 border-y border-gray-100 text-xs text-slate-900">
                                            {job.companyName}
                                        </td>
                                        <td className="px-6 py-2 border-y border-gray-100 text-xs font-medium text-slate-900">
                                            {job.jobTitle}
                                        </td>
                                        <td className="px-6 py-2 border-y border-gray-100 text-xs text-slate-500">
                                            <div className="max-w-xs truncate" title={job.skills}>
                                                {job.skills || "-"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-2 border-y border-gray-100 text-xs text-slate-900 font-medium">
                                            {job.packageAmount || "-"}
                                        </td>
                                        <td className="px-6 py-2 border-y border-gray-100 text-xs text-blue-600 font-medium">
                                            {job.links ? (
                                                <a href={job.links} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                    Link
                                                </a>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-2 border-y border-gray-100">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${job.status === 'Active'
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-red-50 text-red-700 border-red-200'
                                                }`}>
                                                {job.status === 'Active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-2 rounded-r-lg border-r border-y border-gray-100 text-xs text-center relative">
                                            <button
                                                onClick={(e) => handleActionClick(e, job.jobId)}
                                                className="p-1.5 text-gray-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                                            >
                                                <MoreVertical size={16} />
                                            </button>

                                            {activeMenu === job.jobId && (
                                                <div className="absolute right-8 top-8 w-40 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right text-left">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedJob(job);
                                                            setShowViewModal(true);
                                                            setActiveMenu(null);
                                                        }}
                                                        className="w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <Eye size={14} className="text-blue-500" /> View Details
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/dashboard/create-job?id=${job.jobId}`)}
                                                        className="w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <Edit size={14} className="text-orange-500" /> Edit Job
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(job)}
                                                        className="w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        {job.status === 'Active' ? (
                                                            <>
                                                                <XCircle size={14} className="text-red-500" /> Deactivate
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircle size={14} className="text-green-500" /> Activate
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
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
                                    Showing <span className="font-medium">{filteredJobs.length > 0 ? currentPage * itemsPerPage + 1 : 0}</span> to <span className="font-medium">{Math.min((currentPage + 1) * itemsPerPage, filteredJobs.length)}</span> of <span className="font-medium">{filteredJobs.length}</span> entries
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

            {showViewModal && (
                <ViewJobModal
                    job={selectedJob}
                    onClose={() => setShowViewModal(false)}
                />
            )}
        </div>
    );
};

export default JobsPage;
