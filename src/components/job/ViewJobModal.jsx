import React from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, MapPin, Briefcase, DollarSign, GraduationCap, Building2, Globe, CheckCircle, Ban } from 'lucide-react';

const ViewJobModal = ({ job, onClose }) => {
    if (!job) return null;

    return createPortal(
        <div className="fixed inset-0 z-[10000] overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Drawer Content */}
            <div className="absolute inset-y-0 right-0 w-full sm:w-[500px] md:w-[600px] bg-slate-50 shadow-2xl transition-transform animate-in slide-in-from-right duration-300 border-l border-slate-200 flex flex-col font-sans">

                {/* Header */}
                <div className="px-6 py-5 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
                                {job.jobCode}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${job.status === 'Active'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                {job.status || 'Active'}
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 leading-tight">{job.jobTitle}</h2>
                        <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-slate-500">
                            <Building2 size={12} />
                            {job.companyName}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 pb-12">

                    {/* Section: Overview */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Job Overview
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <DetailItem label="Domain/Type" value={job.jobType} icon={<Briefcase size={10} />} />
                            <DetailItem label="Package (CTC)" value={job.packageAmount} icon={<DollarSign size={10} />} />
                            <DetailItem label="Education" value={job.education} icon={<GraduationCap size={10} />} />
                            <DetailItem label="Application Link"
                                value={job.links ? (
                                    <a href={job.links} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                        Open Link <Globe size={10} />
                                    </a>
                                ) : "N/A"}
                            />
                        </div>
                    </div>

                    {/* Section: Timeline */}
                    <div className="space-y-4 pt-2">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Timeline & Status
                        </h3>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-2 gap-4">
                            <DetailItem label="Start Date" value={job.startDate} icon={<Calendar size={10} />} />
                            <DetailItem label="Deadline" value={job.lastDate} icon={<Calendar size={10} />} />
                            <DetailItem label="Current Status"
                                value={
                                    <span className={`inline-flex items-center gap-1 font-bold ${job.status === 'Active' ? 'text-green-700' : 'text-red-700'}`}>
                                        {job.status === 'Active' ? <CheckCircle size={10} /> : <Ban size={10} />}
                                        {job.status || 'Active'}
                                    </span>
                                }
                            />
                        </div>
                    </div>

                    {/* Section: Requirements */}
                    <div className="space-y-4 pt-2">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-gold-500" /> Skills & Requirements
                        </h3>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex flex-wrap gap-1.5">
                                {job.skills ? job.skills.split(',').map((skill, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-slate-50 text-slate-700 border border-slate-200"
                                    >
                                        {skill.trim()}
                                    </span>
                                )) : <span className="text-xs text-slate-400 italic">No specific skills listed.</span>}
                            </div>
                        </div>
                    </div>

                    {/* Section: Description */}
                    <div className="space-y-4 pt-2">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Job Description
                        </h3>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="prose prose-sm max-w-none text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {job.jd || "No description provided."}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
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

export default ViewJobModal;
