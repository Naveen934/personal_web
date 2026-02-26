import React, { useEffect, useState } from 'react';
import { Plus, Trash2, X, ChevronRight, TrendingUp, Wallet } from 'lucide-react';
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from 'framer-motion';
/* eslint-enable no-unused-vars */
import { getCompanies, createCompany, deleteCompany, getCompany } from '../api';

const STATUS_STYLES = {
    'Working': 'badge-working',
    'Future Planning': 'badge-future',
    'In Process': 'badge-process',
    'Closed': 'badge-closed',
};

const formatINR = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const STATUS_OPTIONS = ['Working', 'Future Planning', 'In Process', 'Closed'];

const EMPTY_FORM = { name: '', status: 'Working', monthly_revenue: '', total_invested: '', notes: '' };

const AddCompanyModal = ({ onClose, onSuccess }) => {
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await createCompany({ ...form, monthly_revenue: +form.monthly_revenue, total_invested: +form.total_invested });
            onSuccess();
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                className="bg-dark-700 border border-dark-500 rounded-xl w-full max-w-md shadow-2xl overflow-hidden"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-dark-500 bg-dark-800/50">
                    <h2 className="font-semibold text-white">Add Company</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="text-xs font-medium text-gray-400 mb-1.5 block">Company Name <span className="text-brand-500">*</span></label>
                        <input className="input-field bg-dark-800/50 focus:bg-dark-600" required value={form.name} placeholder="e.g. Chain Company"
                            onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-400 mb-1.5 block">Status <span className="text-brand-500">*</span></label>
                        <select className="input-field bg-dark-800/50 focus:bg-dark-600" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-gray-400 mb-1.5 block">Monthly Revenue (₹)</label>
                            <input type="number" className="input-field bg-dark-800/50 focus:bg-dark-600" placeholder="9000" value={form.monthly_revenue}
                                onChange={e => setForm({ ...form, monthly_revenue: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-400 mb-1.5 block">Total Invested (₹)</label>
                            <input type="number" className="input-field bg-dark-800/50 focus:bg-dark-600" placeholder="300000" value={form.total_invested}
                                onChange={e => setForm({ ...form, total_invested: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-400 mb-1.5 block">Notes</label>
                        <textarea className="input-field bg-dark-800/50 focus:bg-dark-600 resize-none h-24" placeholder="Optional notes about this venture..." value={form.notes}
                            onChange={e => setForm({ ...form, notes: e.target.value })} />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose}
                            className="flex-1 btn-ghost justify-center border border-dark-500 hover:bg-dark-600">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 btn-primary justify-center shadow-lg shadow-brand-500/20">
                            {saving ? 'Saving...' : 'Add Company'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default function CompaniesTab() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [detail, setDetail] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const load = async () => {
        try { setCompanies(await getCompanies()); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (id) => {
        setDeleteConfirm(null);
        // Optimistic UI update
        setCompanies(prev => prev.filter(c => c.id !== id));
        try {
            await deleteCompany(id);
        } catch (e) {
            console.error(e);
            await load(); // Revert on failure
        }
    };

    const handleDetail = async (id) => {
        try { setDetail(await getCompany(id)); }
        catch (e) { console.error(e); }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64 text-brand-400">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <Wallet className="opacity-0" />
                <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full" />
            </motion.div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Companies & Ventures</h1>
                    <p className="text-gray-500 text-sm mt-1">{companies.length} active tracks</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setShowForm(true)} className="btn-primary shadow-lg shadow-brand-500/20"
                >
                    <Plus size={16} /> Add Company
                </motion.button>
            </div>

            {/* Summary Layer */}
            {companies.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
                >
                    <div className="card flex items-center gap-5 border border-dark-600/50 bg-gradient-to-br from-dark-800 to-dark-900/50 shadow-xl">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                            <TrendingUp size={24} className="text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Total Mo. Revenue</p>
                            <p className="text-2xl font-bold text-emerald-400 tracking-tight">
                                {formatINR(companies.reduce((s, c) => s + (c.monthly_revenue || 0), 0))}
                            </p>
                        </div>
                    </div>
                    <div className="card flex items-center gap-5 border border-dark-600/50 bg-gradient-to-br from-dark-800 to-dark-900/50 shadow-xl">
                        <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center border border-brand-500/20">
                            <Wallet size={24} className="text-brand-400" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Total Invested</p>
                            <p className="text-2xl font-bold text-brand-400 tracking-tight">
                                {formatINR(companies.reduce((s, c) => s + (c.total_invested || 0), 0))}
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Companies Grid */}
            {companies.length === 0 ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card text-center py-16 text-gray-500 border border-dark-600 border-dashed">
                    <p className="text-lg mb-2 text-gray-400 font-medium">No companies yet</p>
                    <p className="text-sm">Click "Add Company" to track your first venture</p>
                </motion.div>
            ) : (
                <motion.div
                    variants={containerVariants} initial="hidden" animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
                >
                    <AnimatePresence>
                        {companies.map(c => (
                            <motion.div
                                key={c.id} variants={itemVariants} exit={{ opacity: 0, scale: 0.9 }} layout
                                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                className="card group hover:border-brand-500/50 transition-all duration-300 cursor-pointer relative bg-dark-800/80 backdrop-blur-sm shadow-lg hover:shadow-brand-500/10 overflow-hidden"
                                onClick={() => handleDetail(c.id)}
                            >
                                {/* Decorative gradient blob */}
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl group-hover:bg-brand-500/10 transition-colors" />

                                <div className="flex items-start justify-between mb-4 relative z-10">
                                    <div className="pr-8">
                                        <h3 className="font-bold text-lg text-white group-hover:text-brand-300 transition-colors truncate">{c.name}</h3>
                                        <div className="mt-1.5 inline-block">
                                            <span className={`${STATUS_STYLES[c.status] || 'badge-closed'} text-[10px] px-2 py-0.5 rounded-full font-medium border border-current`}>
                                                {c.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 top-0" onClick={e => e.stopPropagation()}>
                                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                            onClick={() => setDeleteConfirm(c)}
                                            className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </motion.button>
                                    </div>
                                </div>

                                <div className="space-y-3 mt-5 relative z-10 border-t border-dark-600/50 pt-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Mo. Revenue</span>
                                        <span className="text-emerald-400 font-bold">{formatINR(c.monthly_revenue)}</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Invested</span>
                                        <span className="text-brand-400 font-bold">{formatINR(c.total_invested)}</span>
                                    </div>
                                </div>

                                {c.notes && (
                                    <p className="text-xs text-gray-400 mt-4 line-clamp-2 leading-relaxed bg-dark-900/30 p-2.5 rounded-md relative z-10">
                                        {c.notes}
                                    </p>
                                )}

                                <div className="absolute bottom-4 right-4 text-brand-500/0 group-hover:text-brand-400/50 transition-colors transform translate-x-2 group-hover:translate-x-0">
                                    <ChevronRight size={18} />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Add Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <AddCompanyModal
                        onClose={() => setShowForm(false)}
                        onSuccess={() => { setShowForm(false); load(); }}
                    />
                )}
            </AnimatePresence>

            {/* Detail Modal */}
            <AnimatePresence>
                {detail && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="bg-dark-700 border border-dark-500 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-6 py-5 border-b border-dark-500 bg-dark-800/50">
                                <h2 className="font-bold text-xl text-white tracking-tight">{detail.name}</h2>
                                <button onClick={() => setDetail(null)} className="text-gray-500 hover:text-white transition-colors bg-dark-600 hover:bg-dark-500 p-1.5 rounded-full"><X size={18} /></button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-400 text-sm font-medium">Current Status:</span>
                                    <span className={`${STATUS_STYLES[detail.status] || 'badge-closed'} text-xs font-medium px-2.5 py-1 rounded-full border border-current`}>{detail.status}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-br from-dark-800 to-dark-900 rounded-xl p-4 border border-dark-600/50 shadow-inner">
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingUp size={14} className="text-emerald-500/70" />
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Monthly Revenue</p>
                                        </div>
                                        <p className="text-2xl font-bold text-emerald-400 tracking-tight">{formatINR(detail.monthly_revenue)}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-dark-800 to-dark-900 rounded-xl p-4 border border-dark-600/50 shadow-inner">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Wallet size={14} className="text-brand-500/70" />
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Invested</p>
                                        </div>
                                        <p className="text-2xl font-bold text-brand-400 tracking-tight">{formatINR(detail.total_invested)}</p>
                                    </div>
                                </div>
                                {detail.notes && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <span className="w-1 h-3 bg-brand-500 rounded-full" /> Notes & Details
                                        </p>
                                        <div className="text-gray-300 text-sm bg-dark-800/50 border border-dark-600/50 rounded-xl p-4 leading-relaxed whitespace-pre-wrap">
                                            {detail.notes}
                                        </div>
                                    </div>
                                )}
                                <p className="text-xs text-gray-500 font-mono text-center pt-2">Added on {new Date(detail.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirm */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="bg-dark-700 border border-dark-500 rounded-2xl w-full max-w-sm shadow-2xl p-6"
                        >
                            <h3 className="font-semibold text-white mb-2 text-lg">Delete Company?</h3>
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">Are you sure you want to delete <strong className="text-white bg-dark-600 px-1.5 py-0.5 rounded">{deleteConfirm.name}</strong>? This action cannot be undone.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-ghost justify-center border border-dark-500 hover:bg-dark-600 transition-colors">Cancel</button>
                                <button onClick={() => handleDelete(deleteConfirm.id)}
                                    className="flex-1 px-4 py-2 bg-red-600/90 hover:bg-red-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-500/20">
                                    <Trash2 size={15} /> Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
