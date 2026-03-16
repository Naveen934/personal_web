import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Trash2, X, Receipt } from 'lucide-react';
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from 'framer-motion';
/* eslint-enable no-unused-vars */
import { getExpenses, createExpense, deleteExpense } from '../api';

const formatINR = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.abs(n || 0));

const PAYMENT_TYPES = ['Credit Card', 'Debit Card', 'Cash', 'UPI', 'Net Banking', 'Other'];

const EMPTY_FORM = { bill_name: '', amount: '', payment_type: 'Credit Card', notes: '' };

const AddExpenseModal = ({ onClose, onSuccess }) => {
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        setSaving(true);
        try {
            await createExpense({ ...form, amount: +form.amount });
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
                    <h2 className="font-semibold text-white">Add Expense</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Bill Name / Title *</label>
                        <input className="input-field" required placeholder="e.g. WiFi Bill" value={form.bill_name}
                            onChange={e => setForm({ ...form, bill_name: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Payment Type</label>
                            <select className="input-field" value={form.payment_type} onChange={e => setForm({ ...form, payment_type: e.target.value })}>
                                {PAYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Amount (₹) *</label>
                            <input type="number" className="input-field" required placeholder="799" min="0" step="0.01"
                                value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Notes</label>
                        <input className="input-field" placeholder="Optional details..." value={form.notes}
                            onChange={e => setForm({ ...form, notes: e.target.value })} />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 btn-ghost justify-center border border-dark-400 hover:bg-dark-600 transition-colors">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 btn-primary justify-center shadow-lg shadow-brand-500/20">
                            {saving ? 'Saving...' : 'Add Expense'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default function ExpensesTab() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const load = async () => {
        try { setEntries(await getExpenses()); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const totalExpenses = useMemo(() => {
        return entries.reduce((sum, e) => sum + (e.amount || 0), 0);
    }, [entries]);

    const handleDelete = async (entry) => {
        // Optimistic delete
        setDeleteConfirm(null);
        setEntries(prev => prev.filter(e => e.id !== entry.id));
        try {
            await deleteExpense(entry.id);
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
                <Receipt className="opacity-0" />
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
                    <h1 className="text-2xl font-bold text-white tracking-tight">Expenses</h1>
                    <p className="text-gray-500 text-sm mt-1">{entries.length} records</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setShowForm(true)} className="btn-primary shadow-lg shadow-brand-500/20"
                >
                    <Plus size={16} /> Add Expense
                </motion.button>
            </div>

            {/* Summary Layer */}
            {entries.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 mb-6"
                >
                    <div className="card border border-dark-600/50 bg-gradient-to-br from-dark-800 to-dark-900/50 shadow-xl max-w-sm">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Total Expenses</p>
                        <p className="text-xl font-bold text-red-400 tracking-tight">
                            {formatINR(totalExpenses)}
                        </p>
                    </div>
                </motion.div>
            )}

            {entries.length === 0 ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card text-center py-16 text-gray-500 border border-dark-600 border-dashed">
                    <p className="text-lg mb-2 text-gray-400 font-medium">No expenses recorded yet</p>
                    <p className="text-sm">Click "Add Expense" to get started</p>
                </motion.div>
            ) : (
                <motion.div
                    variants={containerVariants} initial="hidden" animate="show"
                    className="space-y-3"
                >
                    <AnimatePresence>
                        {entries.map(entry => {
                            return (
                                <motion.div
                                    key={entry.id} variants={itemVariants} exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }} layout
                                    className="card flex items-center gap-4 border-l-4 border-l-red-500 bg-dark-800/80 backdrop-blur-sm group hover:bg-dark-700/80 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 bg-red-900/40 text-red-400">
                                        <Receipt size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-white text-sm truncate">{entry.bill_name}</p>
                                            <span className="text-xs text-gray-500 bg-dark-600 px-2 py-0.5 rounded-full whitespace-nowrap">{entry.payment_type}</span>
                                        </div>
                                        {entry.notes && <p className="text-xs text-gray-500 mt-0.5 truncate">{entry.notes}</p>}
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-lg font-bold tracking-tight text-red-400">
                                            {formatINR(entry.amount)}
                                        </p>
                                        <p className="text-xs text-gray-600">{new Date(entry.created_at).toLocaleDateString()}</p>
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
                    <AddExpenseModal
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
                            <h3 className="font-semibold text-white mb-2 text-lg">Delete Expense?</h3>
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">Remove <strong className="text-white bg-dark-600 px-1.5 py-0.5 rounded">{deleteConfirm.bill_name}</strong>?</p>
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
