import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Trash2, X, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from 'framer-motion';
/* eslint-enable no-unused-vars */
import { getSavings, createSaving, deleteSaving } from '../api';

const formatINR = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.abs(n || 0));

const CATEGORIES = ['Stock Market', 'Gold', 'Gold Chit', 'Monthly Chit', 'FD', 'Other'];

const EMPTY_FORM = { category: 'Stock Market', subcategory: '', quantity: '', value: '', type: 'asset', notes: '' };

const SavingCard = React.memo(({ item, onDelete }) => {
    const isLiability = item.type === 'liability';
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`card flex items-start justify-between gap-3 border-l-4 ${isLiability ? 'border-l-red-500' : 'border-l-emerald-500'} bg-dark-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow group`}
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    {isLiability
                        ? <TrendingDown size={14} className="text-red-400 shrink-0" />
                        : <TrendingUp size={14} className="text-emerald-400 shrink-0" />}
                    <span className="font-medium text-white text-sm truncate">{item.category}</span>
                    {item.subcategory && <span className="text-gray-500 text-xs truncate">• {item.subcategory}</span>}
                </div>
                {item.quantity && <p className="text-xs text-gray-500 mb-1">Quantity: {item.quantity}</p>}
                <p className={`text-lg font-bold tracking-tight ${isLiability ? 'text-red-400' : 'text-emerald-400'}`}>
                    {isLiability ? '-' : ''}{formatINR(item.value)}
                </p>
                {item.notes && <p className="text-xs text-gray-600 mt-1 line-clamp-1">{item.notes}</p>}
            </div>
            <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(item)}
                className="text-gray-600 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-900/20 p-2 rounded-lg transition-all shrink-0"
            >
                <Trash2 size={16} />
            </motion.button>
        </motion.div>
    );
});

const AddSavingsModal = ({ onClose, onSuccess }) => {
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await createSaving({ ...form, value: +form.value });
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
                className="bg-dark-700 border border-dark-500 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-dark-500 bg-dark-800/50">
                    <h2 className="font-semibold text-white">Add Savings Entry</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-gray-400 mb-1.5 block">Category <span className="text-brand-500">*</span></label>
                            <select className="input-field bg-dark-800/50 focus:bg-dark-600" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-400 mb-1.5 block">Type <span className="text-brand-500">*</span></label>
                            <select className="input-field bg-dark-800/50 focus:bg-dark-600" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                <option value="asset">Asset</option>
                                <option value="liability">Liability</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-400 mb-1.5 block">Subcategory</label>
                        <input className="input-field bg-dark-800/50 focus:bg-dark-600" placeholder="e.g. Holdings, Loan" value={form.subcategory}
                            onChange={e => setForm({ ...form, subcategory: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-gray-400 mb-1.5 block">Quantity / Grams</label>
                            <input className="input-field bg-dark-800/50 focus:bg-dark-600" placeholder="e.g. 6g, 10 units" value={form.quantity}
                                onChange={e => setForm({ ...form, quantity: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-400 mb-1.5 block">Value (₹) <span className="text-brand-500">*</span></label>
                            <input type="number" className="input-field bg-dark-800/50 focus:bg-dark-600" required placeholder="65000" value={form.value}
                                onChange={e => setForm({ ...form, value: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-400 mb-1.5 block">Notes</label>
                        <input className="input-field bg-dark-800/50 focus:bg-dark-600" placeholder="Any additional info" value={form.notes}
                            onChange={e => setForm({ ...form, notes: e.target.value })} />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose}
                            className="flex-1 btn-ghost justify-center border border-dark-500 hover:bg-dark-600 transition-colors">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 btn-primary justify-center shadow-lg shadow-brand-500/20">
                            {saving ? 'Saving...' : 'Add Entry'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default function SavingsTab() {
    const [savings, setSavings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const load = async () => {
        try { setSavings(await getSavings()); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const { totalAssets, totalLiabilities, netWorth, grouped } = useMemo(() => {
        const assets = savings.filter(s => s.type === 'asset').reduce((sum, s) => sum + (s.value || 0), 0);
        const liabilities = savings.filter(s => s.type === 'liability').reduce((sum, s) => sum + Math.abs(s.value || 0), 0);

        const groups = savings.reduce((acc, s) => {
            const key = s.category;
            if (!acc[key]) acc[key] = [];
            acc[key].push(s);
            return acc;
        }, {});

        return {
            totalAssets: assets,
            totalLiabilities: liabilities,
            netWorth: assets - liabilities,
            grouped: groups
        };
    }, [savings]);

    const handleDelete = async (item) => {
        // Optimistic delete
        setDeleteConfirm(null);
        setSavings(prev => prev.filter(s => s.id !== item.id));
        try {
            await deleteSaving(item.id);
        } catch (e) {
            console.error(e);
            await load(); // Revert on failure
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64 text-brand-400">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <PiggyBank className="opacity-0" />
                <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full" />
            </motion.div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
        >
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Savings & Assets</h1>
                    <p className="text-gray-500 text-sm mt-1">{savings.length} total entries</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setShowForm(true)} className="btn-primary shadow-lg shadow-brand-500/20"
                >
                    <Plus size={16} /> Add Entry
                </motion.button>
            </div>

            {/* Summary */}
            {savings.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
                >
                    <div className="card border border-dark-600/50 bg-gradient-to-br from-dark-800 to-dark-900/50 shadow-xl">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Total Assets</p>
                        <p className="text-2xl font-bold text-emerald-400 tracking-tight">{formatINR(totalAssets)}</p>
                    </div>
                    <div className="card border border-dark-600/50 bg-gradient-to-br from-dark-800 to-dark-900/50 shadow-xl">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Total Liabilities</p>
                        <p className="text-2xl font-bold text-red-400 tracking-tight">-{formatINR(totalLiabilities)}</p>
                    </div>
                    <div className="card border border-brand-500/20 bg-gradient-to-br from-dark-800 to-brand-900/10 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
                        <p className="text-xs text-brand-500/80 uppercase tracking-wider mb-1 font-bold relative z-10">Net Worth</p>
                        <p className={`text-3xl font-bold tracking-tight relative z-10 ${netWorth >= 0 ? 'text-white' : 'text-red-400'}`}>
                            {netWorth >= 0 ? '' : '-'}{formatINR(netWorth)}
                        </p>
                    </div>
                </motion.div>
            )}

            {savings.length === 0 ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card text-center py-16 text-gray-500 border border-dark-600 border-dashed">
                    <p className="text-lg mb-2 text-gray-400 font-medium">No savings entries yet</p>
                    <p className="text-sm">Click "Add Entry" to track your assets and liabilities</p>
                </motion.div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(grouped).map(([category, items], sectionIndex) => (
                        <motion.div
                            key={category}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: sectionIndex * 0.1 }}
                        >
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-brand-500 inline-block shadow-[0_0_8px_rgba(var(--brand-500),0.8)]" /> {category}
                                <div className="flex-1 h-px bg-dark-600/50 ml-2" />
                            </h2>
                            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                <AnimatePresence>
                                    {items.map(item => (
                                        <SavingCard key={item.id} item={item} onDelete={setDeleteConfirm} />
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Add Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <AddSavingsModal
                        onClose={() => setShowForm(false)}
                        onSuccess={() => { setShowForm(false); load(); }}
                    />
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
                            <h3 className="font-semibold text-white mb-2 text-lg">Delete Entry?</h3>
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">Remove <strong className="text-white bg-dark-600 px-1.5 py-0.5 rounded">{deleteConfirm.category} – {deleteConfirm.subcategory || formatINR(deleteConfirm.value)}</strong>?</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-ghost justify-center border border-dark-500 hover:bg-dark-600 transition-colors">Cancel</button>
                                <button onClick={() => handleDelete(deleteConfirm)}
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
