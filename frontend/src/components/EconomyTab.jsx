import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Trash2, X, Landmark } from 'lucide-react';
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from 'framer-motion';
/* eslint-enable no-unused-vars */
import { getEconomy, createEconomy, deleteEconomy } from '../api';

const formatINR = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.abs(n || 0));

const ACCOUNT_TYPES = ['Savings', 'Current', 'Fixed Deposit', 'Loan', 'Other'];

const EMPTY_FORM = { bank_name: '', account_type: 'Savings', balance: '', notes: '' };

const AddEconomyModal = ({ onClose, onSuccess }) => {
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        setSaving(true);
        try {
            await createEconomy({ ...form, balance: +form.balance });
            onSuccess();
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                className="bg-dark-700 border border-dark-500 rounded-2xl w-full max-w-md shadow-2xl"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-dark-500">
                    <h2 className="font-semibold text-white">Add Bank Account</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Bank Name *</label>
                        <input className="input-field" required placeholder="e.g. SBI, HDFC" value={form.bank_name}
                            onChange={e => setForm({ ...form, bank_name: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Account Type</label>
                            <select className="input-field" value={form.account_type} onChange={e => setForm({ ...form, account_type: e.target.value })}>
                                {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Balance (₹) *</label>
                            <input type="number" className="input-field" required placeholder="16000 (use - for loans)"
                                value={form.balance} onChange={e => setForm({ ...form, balance: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Notes</label>
                        <input className="input-field" placeholder="e.g. No active loans" value={form.notes}
                            onChange={e => setForm({ ...form, notes: e.target.value })} />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 btn-ghost justify-center border border-dark-400 hover:bg-dark-600 transition-colors">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 btn-primary justify-center shadow-lg shadow-brand-500/20">
                            {saving ? 'Saving...' : 'Add Account'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default function EconomyTab() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const load = async () => {
        try { setEntries(await getEconomy()); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const { totalBalance, totalPositive, totalNegative } = useMemo(() => {
        return {
            totalBalance: entries.reduce((sum, e) => sum + (e.balance || 0), 0),
            totalPositive: entries.filter(e => e.balance >= 0).reduce((sum, e) => sum + e.balance, 0),
            totalNegative: entries.filter(e => e.balance < 0).reduce((sum, e) => sum + e.balance, 0)
        };
    }, [entries]);

    const handleDelete = async (entry) => {
        // Optimistic delete
        setDeleteConfirm(null);
        setEntries(prev => prev.filter(e => e.id !== entry.id));
        try {
            await deleteEconomy(entry.id);
        } catch (e) {
            console.error(e);
            await load(); // Revert on failure
        }
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
                <Landmark className="opacity-0" />
                <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full" />
            </motion.div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Bank & Economy</h1>
                    <p className="text-gray-500 text-sm mt-1">{entries.length} accounts</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setShowForm(true)} className="btn-primary shadow-lg shadow-brand-500/20"
                >
                    <Plus size={16} /> Add Account
                </motion.button>
            </div>

            {/* Summary Layer */}
            {entries.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
                >
                    <div className="card border border-dark-600/50 bg-gradient-to-br from-dark-800 to-dark-900/50 shadow-xl">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Total Balance</p>
                        <p className={`text-xl font-bold ${totalBalance >= 0 ? 'text-emerald-400' : 'text-red-400'} tracking-tight`}>
                            {totalBalance < 0 ? '-' : ''}{formatINR(totalBalance)}
                        </p>
                    </div>
                    <div className="card border border-dark-600/50 bg-gradient-to-br from-dark-800 to-dark-900/50 shadow-xl">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Total Deposits</p>
                        <p className="text-xl font-bold text-emerald-400 tracking-tight">{formatINR(totalPositive)}</p>
                    </div>
                    <div className="card border border-dark-600/50 bg-gradient-to-br from-dark-800 to-dark-900/50 shadow-xl">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Total Loans</p>
                        <p className="text-xl font-bold text-red-400 tracking-tight">-{formatINR(Math.abs(totalNegative))}</p>
                    </div>
                </motion.div>
            )}

            {entries.length === 0 ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card text-center py-16 text-gray-500 border border-dark-600 border-dashed">
                    <p className="text-lg mb-2 text-gray-400 font-medium">No bank accounts yet</p>
                    <p className="text-sm">Click "Add Account" to get started</p>
                </motion.div>
            ) : (
                <motion.div
                    variants={containerVariants} initial="hidden" animate="show"
                    className="space-y-3"
                >
                    <AnimatePresence>
                        {entries.map(entry => {
                            const isPositive = entry.balance >= 0;
                            return (
                                <motion.div
                                    key={entry.id} variants={itemVariants} exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }} layout
                                    className={`card flex items-center gap-4 border-l-4 ${isPositive ? 'border-l-emerald-500' : 'border-l-red-500'} bg-dark-800/80 backdrop-blur-sm group hover:bg-dark-700/80 transition-colors`}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${isPositive ? 'bg-emerald-900/40 text-emerald-400' : 'bg-red-900/40 text-red-400'}`}>
                                        {entry.bank_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-white text-sm truncate">{entry.bank_name}</p>
                                            {entry.account_type && (
                                                <span className="text-xs text-gray-500 bg-dark-600 px-2 py-0.5 rounded-full whitespace-nowrap">{entry.account_type}</span>
                                            )}
                                        </div>
                                        {entry.notes && <p className="text-xs text-gray-500 mt-0.5 truncate">{entry.notes}</p>}
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className={`text-lg font-bold tracking-tight ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {isPositive ? '' : '-'}{formatINR(entry.balance)}
                                        </p>
                                        <p className="text-xs text-gray-600">{isPositive ? 'Credit' : 'Loan/Debit'}</p>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                        onClick={() => setDeleteConfirm(entry)}
                                        className="text-gray-600 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-900/20 p-2 rounded-lg transition-all shrink-0"
                                    >
                                        <Trash2 size={16} />
                                    </motion.button>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Add Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <AddEconomyModal
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
                            <h3 className="font-semibold text-white mb-2 text-lg">Delete Account?</h3>
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">Remove <strong className="text-white bg-dark-600 px-1.5 py-0.5 rounded">{deleteConfirm.bank_name}</strong>?</p>
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

