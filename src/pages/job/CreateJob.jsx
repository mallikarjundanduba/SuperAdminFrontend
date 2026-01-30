import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, X, FileText, Upload } from 'lucide-react';
import { jobService } from '../../services/jobService';
import SnackbarAlert from '../../components/common/SnackbarAlert';

const CreateJob = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const jobId = searchParams.get('id');
    const isEditMode = !!jobId;

    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const [formData, setFormData] = useState({
        jobCode: '',
        companyName: '',
        jobTitle: '',
        mandatorySkills: [],
        optionalSkills: [],
        packageAmount: '',
        links: '',
        jd: '',
        jobType: '',
        education: '',
        lastDate: ''
    });

    const [skillInputs, setSkillInputs] = useState({ mandatory: '', optional: '' });
    const [uploadedFileName, setUploadedFileName] = useState('');

    useEffect(() => {
        if (isEditMode) {
            fetchJobDetails(jobId);
        }
    }, [isEditMode, jobId]);

    const fetchJobDetails = async (id) => {
        try {
            setLoading(true);
            const job = await jobService.getJobById(id);
            if (job) {
                // Parse skills assuming comma separated string from backend if needed, 
                // but frontend uses array for inputs.
                // The backend returns a string "skill1, skill2".
                const skillsArray = job.skills ? job.skills.split(',').map(s => s.trim()) : [];
                // Simple split logic: if we don't distinguish mandatory/optional in backend, 
                // load all into mandatory for now or improved later.
                // For now, load all into mandatory.

                setFormData({
                    jobCode: job.jobCode || '',
                    companyName: job.companyName || '',
                    jobTitle: job.jobTitle || '',
                    mandatorySkills: skillsArray,
                    optionalSkills: [],
                    packageAmount: job.packageAmount || '',
                    links: job.links || '',
                    jd: job.jd || '',
                    jobType: job.jobType || '',
                    education: job.education || '',
                    lastDate: job.lastDate || ''
                });
            }
        } catch (error) {
            console.error('Error fetching job details:', error);
            showMessage('Failed to load job details', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddSkill = (type, e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const inputKey = type === 'mandatory' ? 'mandatory' : 'optional';
            const value = skillInputs[inputKey].trim();
            const listKey = type === 'mandatory' ? 'mandatorySkills' : 'optionalSkills';

            if (value && !formData[listKey].includes(value)) {
                setFormData(prev => ({
                    ...prev,
                    [listKey]: [...prev[listKey], value]
                }));
                setSkillInputs(prev => ({ ...prev, [inputKey]: '' }));
            }
        }
    };

    const handleRemoveSkill = (type, skillToRemove) => {
        const listKey = type === 'mandatory' ? 'mandatorySkills' : 'optionalSkills';
        setFormData(prev => ({
            ...prev,
            [listKey]: prev[listKey].filter(skill => skill !== skillToRemove)
        }));
    };

    const handleFileUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadedFileName(file.name);
            showMessage(`File "${file.name}" selected`, 'success');
            // Here you would typically handle the file upload or read it
        }
    };

    const validateForm = () => {
        if (!formData.jobCode.trim()) {
            showMessage('Job Code is required', 'error');
            return false;
        }
        if (!formData.companyName.trim()) {
            showMessage('Company Name is required', 'error');
            return false;
        }
        if (!formData.jobTitle.trim()) {
            showMessage('Job Title is required', 'error');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const allSkills = [...formData.mandatorySkills, ...formData.optionalSkills].join(', ');
            const payload = {
                ...formData,
                skills: allSkills
            };

            if (isEditMode) {
                await jobService.updateJob(jobId, payload);
                showMessage('Job updated successfully!', 'success');
            } else {
                await jobService.createJob(payload);
                showMessage('Job created successfully!', 'success');
            }

            setTimeout(() => {
                navigate('/dashboard/jobs');
            }, 1000);
        } catch (error) {
            console.error('Error saving job:', error);
            showMessage(error.response?.data?.error || error.message || 'Failed to save job', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-500 pb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                {/* Header Section */}
                <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/dashboard/jobs')}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ChevronLeft size={20} className="text-gray-900" />
                        </button>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 leading-tight">{isEditMode ? 'Edit Job' : 'Create Job'}</h2>
                            <p className="text-[11px] text-gray-400 font-medium">{isEditMode ? 'Update existing job details' : 'Add a new job listing to your organization'}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-4 font-sans">
                    {/* Input Grid - Further Reduced Gaps */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2.5">

                        {/* Job Title */}
                        <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-gray-700">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="jobTitle"
                                value={formData.jobTitle}
                                onChange={handleInputChange}
                                placeholder="Select or type a title"
                                className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
                            />
                        </div>

                        {/* Domain Type */}
                        <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-gray-700">
                                Domain Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="jobType"
                                value={formData.jobType}
                                onChange={handleInputChange}
                                className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-gray-600"
                            >
                                <option value="">Select domain</option>
                                <option value="On-site">On-site</option>
                                <option value="Remote">Remote</option>
                                <option value="Hybrid">Hybrid</option>
                                <option value="Contract">Contract</option>
                            </select>
                        </div>

                        {/* Package Amount */}
                        <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-gray-700">
                                Package Amount (CTC)
                            </label>
                            <input
                                type="text"
                                name="packageAmount"
                                value={formData.packageAmount}
                                onChange={handleInputChange}
                                className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>

                        {/* Company Name */}
                        <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-gray-700">
                                Company Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleInputChange}
                                className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>

                        {/* Job Code */}
                        <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-gray-700">
                                Job Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="jobCode"
                                value={formData.jobCode}
                                onChange={handleInputChange}
                                className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>

                        {/* Application Deadline */}
                        <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-gray-700">
                                Application Deadline
                            </label>
                            <input
                                type="date"
                                name="lastDate"
                                value={formData.lastDate}
                                onChange={handleInputChange}
                                className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-500"
                            />
                        </div>

                        {/* Minimum Education */}
                        <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-gray-700">
                                Minimum Education
                            </label>
                            <input
                                type="text"
                                name="education"
                                value={formData.education}
                                onChange={handleInputChange}
                                className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>

                        {/* External Links */}
                        <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-gray-700">
                                External Links (Application URL)
                            </label>
                            <input
                                type="text"
                                name="links"
                                value={formData.links}
                                onChange={handleInputChange}
                                placeholder="http://..."
                                className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="mt-4 space-y-4">
                        {/* Mandatory Skills */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2.5">
                            <div className="space-y-1">
                                <label className="block text-[11px] font-bold text-gray-700">
                                    Mandatory Skills <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={skillInputs.mandatory}
                                    onChange={(e) => setSkillInputs(prev => ({ ...prev, mandatory: e.target.value }))}
                                    onKeyDown={(e) => handleAddSkill('mandatory', e)}
                                    placeholder="Select or type a skill, then press Enter"
                                    className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
                                />
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {formData.mandatorySkills.map((skill, index) => (
                                        <span key={index} className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold border border-blue-100">
                                            {skill}
                                            <button type="button" onClick={() => handleRemoveSkill('mandatory', skill)} className="hover:text-blue-900"><X size={12} /></button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-[11px] font-bold text-gray-700">
                                    Optional Skills
                                </label>
                                <input
                                    type="text"
                                    value={skillInputs.optional}
                                    onChange={(e) => setSkillInputs(prev => ({ ...prev, optional: e.target.value }))}
                                    onKeyDown={(e) => handleAddSkill('optional', e)}
                                    placeholder="Select or type a skill, then press Enter"
                                    className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
                                />
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {formData.optionalSkills.map((skill, index) => (
                                        <span key={index} className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 text-gray-600 rounded-full text-[10px] font-bold border border-gray-100">
                                            {skill}
                                            <button type="button" onClick={() => handleRemoveSkill('optional', skill)} className="hover:text-gray-900"><X size={12} /></button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Job Description with Integrated Upload */}
                        <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-gray-700">
                                Job Description <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group">
                                <textarea
                                    name="jd"
                                    rows={8}
                                    value={formData.jd}
                                    onChange={handleInputChange}
                                    placeholder="Enter detailed job description or upload a document..."
                                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-gray-300 leading-relaxed pr-10"
                                />
                                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                    {uploadedFileName && (
                                        <span className="text-[10px] text-blue-600 font-bold max-w-[150px] truncate bg-blue-50 px-2 py-0.5 rounded border border-blue-100 animate-in fade-in zoom-in-95">
                                            {uploadedFileName}
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={handleFileUploadClick}
                                        className="p-1.5 bg-gray-50 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md border border-gray-200 transition-all shadow-sm flex items-center gap-1.5"
                                        title="Upload JD Document"
                                    >
                                        <Upload size={14} />
                                        <span className="text-[10px] font-bold">Upload</span>
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.txt"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="flex items-center gap-3 mt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[5] flex items-center justify-center gap-2 bg-[#1D4ED8] hover:bg-blue-800 text-white py-2 rounded-md font-bold transition-all shadow-sm disabled:opacity-50 text-[11px]"
                        >
                            <FileText size={14} />
                            {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Job' : 'Create Job')}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/jobs')}
                            className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-md font-bold hover:bg-gray-50 transition-all text-[11px] text-center"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
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

export default CreateJob;
