import React, { useEffect, useState } from 'react';
import { Plus, Trash2, X, ChevronRight, TrendingUp, Wallet } from 'lucide-react';
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

export default function CompaniesTab() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [detail, setDetail] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const load = async () => {
        try { setCompanies(await getCompanies()); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await createCompany({ ...form, monthly_revenue: +form.monthly_revenue, total_invested: +form.total_invested });
            setShowForm(false); setForm(EMPTY_FORM); await load();
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        try { await deleteCompany(id); setDeleteConfirm(null); await load(); }
        catch (e) { console.error(e); }
    };

    const handleDetail = async (id) => {
        try { setDetail(await getCompany(id)); }
        catch (e) { console.error(e); }
    };

    if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>;

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Companies</h1>
                    <p className="text-gray-500 text-sm mt-1">{companies.length} companies tracked</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn-primary">
                    <Plus size={16} /> Add Company
                </button>
            </div>

            {/* Summary */}
            {companies.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="card flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-900/40 rounded-lg flex items-center justify-center">
                            <TrendingUp size={20} className="text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Monthly Revenue</p>
                            <p className="text-xl font-bold text-emerald-400">
                                {formatINR(companies.reduce((s, c) => s + (c.monthly_revenue || 0), 0))}
                            </p>
                        </div>
                    </div>
                    <div className="card flex items-center gap-4">
                        <div className="w-10 h-10 bg-brand-900/40 rounded-lg flex items-center justify-center">
                            <Wallet size={20} className="text-brand-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Invested</p>
                            <p className="text-xl font-bold text-brand-400">
                                {formatINR(companies.reduce((s, c) => s + (c.total_invested || 0), 0))}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Companies Grid */}
            {companies.length === 0 ? (
                <div className="card text-center py-16 text-gray-500">
                    <p className="text-lg mb-2">No companies yet</p>
                    <p className="text-sm">Click "Add Company" to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {companies.map(c => (
                        <div key={c.id} className="card group hover:border-brand-500/50 transition-all duration-200 cursor-pointer relative"
                            onClick={() => handleDetail(c.id)}>
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold text-white group-hover:text-brand-300 transition-colors">{c.name}</h3>
                                    <span className={STATUS_STYLES[c.status] || 'badge-closed'}>{c.status}</span>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                    <button
                                        onClick={() => setDeleteConfirm(c)}
                                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-all"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2 mt-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Monthly Revenue</span>
                                    <span className="text-emerald-400 font-medium">{formatINR(c.monthly_revenue)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Total Invested</span>
                                    <span className="text-brand-400 font-medium">{formatINR(c.total_invested)}</span>
                                </div>
                            </div>
                            {c.notes && <p className="text-xs text-gray-600 mt-3 line-clamp-2">{c.notes}</p>}
                            <ChevronRight size={14} className="absolute bottom-4 right-4 text-gray-600 group-hover:text-brand-400 transition-colors" />
                        </div>
                    ))}
                </div>
            )}

            {/* Add Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-dark-700 border border-dark-500 rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-500">
                            <h2 className="font-semibold text-white">Add Company</h2>
                            <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }} className="text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Company Name *</label>
                                <input className="input-field" required value={form.name} placeholder="e.g. Chain Company"
                                    onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Status *</label>
                                <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Monthly Revenue (₹)</label>
                                    <input type="number" className="input-field" placeholder="9000" value={form.monthly_revenue}
                                        onChange={e => setForm({ ...form, monthly_revenue: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Total Invested (₹)</label>
                                    <input type="number" className="input-field" placeholder="300000" value={form.total_invested}
                                        onChange={e => setForm({ ...form, total_invested: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Notes</label>
                                <textarea className="input-field resize-none h-20" placeholder="Optional notes..." value={form.notes}
                                    onChange={e => setForm({ ...form, notes: e.target.value })} />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                                    className="flex-1 btn-ghost justify-center border border-dark-400">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 btn-primary justify-center">
                                    {saving ? 'Saving...' : 'Add Company'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {detail && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-dark-700 border border-dark-500 rounded-2xl w-full max-w-lg shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-500">
                            <h2 className="font-semibold text-white">{detail.name}</h2>
                            <button onClick={() => setDetail(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400 text-sm">Status:</span>
                                <span className={STATUS_STYLES[detail.status] || 'badge-closed'}>{detail.status}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-dark-600 rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Monthly Revenue</p>
                                    <p className="text-lg font-bold text-emerald-400">{formatINR(detail.monthly_revenue)}</p>
                                </div>
                                <div className="bg-dark-600 rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Total Invested</p>
                                    <p className="text-lg font-bold text-brand-400">{formatINR(detail.total_invested)}</p>
                                </div>
                            </div>
                            {detail.notes && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Notes</p>
                                    <p className="text-gray-300 text-sm bg-dark-600 rounded-lg p-3">{detail.notes}</p>
                                </div>
                            )}
                            <p className="text-xs text-gray-600">Added: {new Date(detail.created_at).toLocaleDateString('en-IN')}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-dark-700 border border-dark-500 rounded-2xl w-full max-w-sm shadow-2xl p-6">
                        <h3 className="font-semibold text-white mb-2">Delete Company?</h3>
                        <p className="text-gray-400 text-sm mb-5">Are you sure you want to delete <strong className="text-white">{deleteConfirm.name}</strong>? This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-ghost justify-center border border-dark-400">Cancel</button>
                            <button onClick={() => handleDelete(deleteConfirm.id)}
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
