import React, { useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { getEconomy, createEconomy, deleteEconomy } from '../api';

const formatINR = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.abs(n || 0));

const ACCOUNT_TYPES = ['Savings', 'Current', 'Fixed Deposit', 'Loan', 'Other'];

const EMPTY_FORM = { bank_name: '', account_type: 'Savings', balance: '', notes: '' };

export default function EconomyTab() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const load = async () => {
        try { setEntries(await getEconomy()); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const totalBalance = entries.reduce((sum, e) => sum + (e.balance || 0), 0);
    const totalPositive = entries.filter(e => e.balance >= 0).reduce((sum, e) => sum + e.balance, 0);
    const totalNegative = entries.filter(e => e.balance < 0).reduce((sum, e) => sum + e.balance, 0);

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        setSaving(true);
        try {
            await createEconomy({ ...form, balance: +form.balance });
            setShowForm(false); setForm(EMPTY_FORM); await load();
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    const handleDelete = async (entry) => {
        try { await deleteEconomy(entry.id); setDeleteConfirm(null); await load(); }
        catch (e) { console.error(e); }
    };

    if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Bank & Economy</h1>
                    <p className="text-gray-500 text-sm mt-1">{entries.length} accounts</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn-primary">
                    <Plus size={16} /> Add Account
                </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="card">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Balance</p>
                    <p className={`text-xl font-bold ${totalBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {totalBalance < 0 ? '-' : ''}{formatINR(totalBalance)}
                    </p>
                </div>
                <div className="card">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Deposits</p>
                    <p className="text-xl font-bold text-emerald-400">{formatINR(totalPositive)}</p>
                </div>
                <div className="card">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Loans</p>
                    <p className="text-xl font-bold text-red-400">-{formatINR(Math.abs(totalNegative))}</p>
                </div>
            </div>

            {entries.length === 0 ? (
                <div className="card text-center py-16 text-gray-500">
                    <p className="text-lg mb-2">No bank accounts yet</p>
                    <p className="text-sm">Click "Add Account" to get started</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {entries.map(entry => {
                        const isPositive = entry.balance >= 0;
                        return (
                            <div key={entry.id} className={`card flex items-center gap-4 border-l-4 ${isPositive ? 'border-l-emerald-500' : 'border-l-red-500'}`}>
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${isPositive ? 'bg-emerald-900/40 text-emerald-400' : 'bg-red-900/40 text-red-400'}`}>
                                    {entry.bank_name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-white text-sm">{entry.bank_name}</p>
                                        {entry.account_type && (
                                            <span className="text-xs text-gray-500 bg-dark-600 px-2 py-0.5 rounded-full">{entry.account_type}</span>
                                        )}
                                    </div>
                                    {entry.notes && <p className="text-xs text-gray-500 mt-0.5 truncate">{entry.notes}</p>}
                                </div>
                                <div className="text-right shrink-0">
                                    <p className={`text-lg font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {isPositive ? '' : '-'}{formatINR(entry.balance)}
                                    </p>
                                    <p className="text-xs text-gray-600">{isPositive ? 'Credit' : 'Loan/Debit'}</p>
                                </div>
                                <button onClick={() => setDeleteConfirm(entry)}
                                    className="text-gray-600 hover:text-red-400 hover:bg-red-900/20 p-1.5 rounded-lg transition-all shrink-0">
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-dark-700 border border-dark-500 rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-500">
                            <h2 className="font-semibold text-white">Add Bank Account</h2>
                            <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }} className="text-gray-500 hover:text-white"><X size={20} /></button>
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
                                <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                                    className="flex-1 btn-ghost justify-center border border-dark-400">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 btn-primary justify-center">
                                    {saving ? 'Saving...' : 'Add Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-dark-700 border border-dark-500 rounded-2xl w-full max-w-sm shadow-2xl p-6">
                        <h3 className="font-semibold text-white mb-2">Delete Account?</h3>
                        <p className="text-gray-400 text-sm mb-5">Remove <strong className="text-white">{deleteConfirm.bank_name}</strong>?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-ghost justify-center border border-dark-400">Cancel</button>
                            <button onClick={() => handleDelete(deleteConfirm)}
                                className="flex-1 px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2">
                                <Trash2 size={15} /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
