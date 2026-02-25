import React, { useEffect, useState } from 'react';
import { Plus, Trash2, X, TrendingUp, TrendingDown } from 'lucide-react';
import { getSavings, createSaving, deleteSaving } from '../api';

const formatINR = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.abs(n || 0));

const CATEGORIES = ['Stock Market', 'Gold', 'Gold Chit', 'Monthly Chit', 'FD', 'Other'];

const EMPTY_FORM = { category: 'Stock Market', subcategory: '', quantity: '', value: '', type: 'asset', notes: '' };

function SavingCard({ item, onDelete }) {
    const isLiability = item.type === 'liability';
    return (
        <div className={`card flex items-start justify-between gap-3 border-l-4 ${isLiability ? 'border-l-red-500' : 'border-l-emerald-500'}`}>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    {isLiability
                        ? <TrendingDown size={14} className="text-red-400 shrink-0" />
                        : <TrendingUp size={14} className="text-emerald-400 shrink-0" />}
                    <span className="font-medium text-white text-sm">{item.category}</span>
                    {item.subcategory && <span className="text-gray-500 text-xs">• {item.subcategory}</span>}
                </div>
                {item.quantity && <p className="text-xs text-gray-500 mb-1">Quantity: {item.quantity}</p>}
                <p className={`text-lg font-bold ${isLiability ? 'text-red-400' : 'text-emerald-400'}`}>
                    {isLiability ? '-' : ''}{formatINR(item.value)}
                </p>
                {item.notes && <p className="text-xs text-gray-600 mt-1 line-clamp-1">{item.notes}</p>}
            </div>
            <button onClick={() => onDelete(item)} className="text-gray-600 hover:text-red-400 hover:bg-red-900/20 p-1.5 rounded-lg transition-all shrink-0">
                <Trash2 size={14} />
            </button>
        </div>
    );
}

export default function SavingsTab() {
    const [savings, setSavings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const load = async () => {
        try { setSavings(await getSavings()); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const totalAssets = savings.filter(s => s.type === 'asset').reduce((sum, s) => sum + (s.value || 0), 0);
    const totalLiabilities = savings.filter(s => s.type === 'liability').reduce((sum, s) => sum + Math.abs(s.value || 0), 0);
    const netWorth = totalAssets - totalLiabilities;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const added = await createSaving({ ...form, value: +form.value });
            setSavings(prev => [added, ...prev]);
            setShowForm(false); setForm(EMPTY_FORM);
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    const handleDelete = async (item) => {
        setSavings(prev => prev.filter(s => s.id !== item.id));
        setDeleteConfirm(null);
        try { await deleteSaving(item.id); }
        catch (e) { console.error(e); await load(); }
    };

    const grouped = savings.reduce((acc, s) => {
        const key = s.category;
        if (!acc[key]) acc[key] = [];
        acc[key].push(s);
        return acc;
    }, {});

    if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Savings</h1>
                    <p className="text-gray-500 text-sm mt-1">{savings.length} entries</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn-primary">
                    <Plus size={16} /> Add Entry
                </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="card">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Assets</p>
                    <p className="text-xl font-bold text-emerald-400">{formatINR(totalAssets)}</p>
                </div>
                <div className="card">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Liabilities</p>
                    <p className="text-xl font-bold text-red-400">-{formatINR(totalLiabilities)}</p>
                </div>
                <div className="card">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Net Worth</p>
                    <p className={`text-xl font-bold ${netWorth >= 0 ? 'text-brand-400' : 'text-red-400'}`}>
                        {netWorth >= 0 ? '' : '-'}{formatINR(netWorth)}
                    </p>
                </div>
            </div>

            {savings.length === 0 ? (
                <div className="card text-center py-16 text-gray-500">
                    <p className="text-lg mb-2">No savings entries yet</p>
                    <p className="text-sm">Click "Add Entry" to track your savings</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(grouped).map(([category, items]) => (
                        <div key={category}>
                            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" /> {category}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                {items.map(item => (
                                    <SavingCard key={item.id} item={item} onDelete={setDeleteConfirm} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-dark-700 border border-dark-500 rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-500">
                            <h2 className="font-semibold text-white">Add Savings Entry</h2>
                            <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }} className="text-gray-500 hover:text-white"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Category *</label>
                                    <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Type *</label>
                                    <select className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                        <option value="asset">Asset</option>
                                        <option value="liability">Liability</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Subcategory</label>
                                <input className="input-field" placeholder="e.g. Holdings, Loan" value={form.subcategory}
                                    onChange={e => setForm({ ...form, subcategory: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Quantity / Grams</label>
                                    <input className="input-field" placeholder="e.g. 6g, 10 units" value={form.quantity}
                                        onChange={e => setForm({ ...form, quantity: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Value (₹) *</label>
                                    <input type="number" className="input-field" required placeholder="65000" value={form.value}
                                        onChange={e => setForm({ ...form, value: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Notes</label>
                                <input className="input-field" placeholder="Any additional info" value={form.notes}
                                    onChange={e => setForm({ ...form, notes: e.target.value })} />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                                    className="flex-1 btn-ghost justify-center border border-dark-400">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 btn-primary justify-center">
                                    {saving ? 'Saving...' : 'Add Entry'}
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
                        <h3 className="font-semibold text-white mb-2">Delete Entry?</h3>
                        <p className="text-gray-400 text-sm mb-5">Remove <strong className="text-white">{deleteConfirm.category} – {deleteConfirm.subcategory || formatINR(deleteConfirm.value)}</strong>?</p>
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
