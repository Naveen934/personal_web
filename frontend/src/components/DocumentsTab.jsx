import React, { useEffect, useState } from 'react';
import { Plus, Trash2, ExternalLink, Check, X } from 'lucide-react';
import { getDocuments, createDocument, updateDocument, deleteDocument } from '../api';

const EditableCell = ({ doc, field, isLink = false, editCell, editValue, setEditValue, commitEdit, cancelEdit, handleKeyDown, startEdit }) => {
    const isEditing = editCell?.id === doc.id && editCell?.field === field;
    const value = doc[field] || '';

    if (isEditing) {
        return (
            <div className="flex items-center gap-1">
                <input
                    autoFocus
                    className="input-field text-sm py-1 px-2 h-8 flex-1"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={commitEdit}
                />
                <button onMouseDown={(e) => { e.preventDefault(); commitEdit(); }} className="text-emerald-400 hover:text-emerald-300 p-1"><Check size={14} /></button>
                <button onMouseDown={(e) => { e.preventDefault(); cancelEdit(); }} className="text-gray-500 hover:text-white p-1"><X size={14} /></button>
            </div>
        );
    }

    if (isLink && value) {
        return (
            <div className="flex items-center gap-1 group/cell cursor-pointer" onClick={() => startEdit(doc, field)}>
                <a href={value} target="_blank" rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="text-brand-400 hover:text-brand-300 flex items-center gap-1 text-sm truncate max-w-[180px]">
                    Open Link <ExternalLink size={12} />
                </a>
                <span className="text-gray-600 text-xs ml-1 opacity-0 group-hover/cell:opacity-100 transition-opacity">(edit)</span>
            </div>
        );
    }

    return (
        <div
            className="cursor-pointer py-1 px-1 rounded hover:bg-dark-600 transition-colors text-sm text-gray-300 hover:text-white group/cell flex items-center gap-1 min-h-[32px]"
            onClick={() => startEdit(doc, field)}
        >
            <span className={value ? '' : 'text-gray-600 italic'}>{value || 'Click to edit'}</span>
        </div>
    );
};


export default function DocumentsTab() {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [editCell, setEditCell] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const load = async () => {
        try { setDocs(await getDocuments()); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);


    const handleAddRow = async () => {
        setAdding(true);
        try {
            const doc = await createDocument({ document_name: 'New Document', number: '', drive_link: '' });
            setDocs(prev => [doc, ...prev]);
            setEditCell({ id: doc.id, field: 'document_name' });
            setEditValue('New Document');
        } catch (e) { console.error(e); }
        finally { setAdding(false); }
    };

    const startEdit = (doc, field) => {
        setEditCell({ id: doc.id, field });
        setEditValue(doc[field] || '');
    };

    const commitEdit = async () => {
        if (!editCell) return;
        const { id, field } = editCell;
        const newValue = editValue;
        setDocs(prev => prev.map(d => d.id === id ? { ...d, [field]: newValue } : d));
        setEditCell(null);
        try {
            await updateDocument(id, { [field]: newValue });
        } catch (e) { console.error(e); }
    };

    const cancelEdit = () => setEditCell(null);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') commitEdit();
        if (e.key === 'Escape') cancelEdit();
    };

    const handleDelete = async (doc) => {
        setDocs(prev => prev.filter(d => d.id !== doc.id));
        setDeleteConfirm(null);
        try { await deleteDocument(doc.id); }
        catch (e) { console.error(e); await load(); }
    };


    if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Personal Documents</h1>
                    <p className="text-gray-500 text-sm mt-1">{docs.length} documents • Click any cell to edit</p>
                </div>
                <button onClick={handleAddRow} disabled={adding} className="btn-primary">
                    <Plus size={16} /> Add Document
                </button>
            </div>

            {docs.length === 0 ? (
                <div className="card text-center py-16 text-gray-500">
                    <p className="text-lg mb-2">No documents yet</p>
                    <p className="text-sm">Click "Add Document" to add your first document</p>
                </div>
            ) : (
                <div className="card overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-dark-500 bg-dark-800">
                                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">Document Name</th>
                                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">Number / ID</th>
                                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">Drive Link</th>
                                    <th className="px-3 py-3 w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-600">
                                {docs.map((doc, idx) => (
                                    <tr key={doc.id} className={`hover:bg-dark-600/30 transition-colors ${idx % 2 === 0 ? '' : 'bg-dark-700/50'}`}>
                                        <td className="px-4 py-2 font-medium text-white">
                                            <EditableCell doc={doc} field="document_name" editCell={editCell} editValue={editValue} setEditValue={setEditValue} commitEdit={commitEdit} cancelEdit={cancelEdit} handleKeyDown={handleKeyDown} startEdit={startEdit} />
                                        </td>
                                        <td className="px-4 py-2 text-gray-300 font-mono text-sm">
                                            <EditableCell doc={doc} field="number" editCell={editCell} editValue={editValue} setEditValue={setEditValue} commitEdit={commitEdit} cancelEdit={cancelEdit} handleKeyDown={handleKeyDown} startEdit={startEdit} />
                                        </td>
                                        <td className="px-4 py-2">
                                            <EditableCell doc={doc} field="drive_link" isLink editCell={editCell} editValue={editValue} setEditValue={setEditValue} commitEdit={commitEdit} cancelEdit={cancelEdit} handleKeyDown={handleKeyDown} startEdit={startEdit} />
                                        </td>
                                        <td className="px-3 py-2">
                                            <button onClick={() => setDeleteConfirm(doc)}
                                                className="text-gray-600 hover:text-red-400 hover:bg-red-900/20 p-1.5 rounded-lg transition-all">
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-dark-700 border border-dark-500 rounded-2xl w-full max-w-sm shadow-2xl p-6">
                        <h3 className="font-semibold text-white mb-2">Delete Document?</h3>
                        <p className="text-gray-400 text-sm mb-5">Remove <strong className="text-white">{deleteConfirm.document_name}</strong>?</p>
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
