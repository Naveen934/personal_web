import React, { useEffect, useState, useRef } from 'react';
import { Plus, Trash2, ExternalLink, Check, X } from 'lucide-react';
import { getDocuments, createDocument, updateDocument, deleteDocument } from '../api';

const EditableCell = ({ doc, field, isLink = false, isEditing, onStartEdit, onCommitEdit, onCancelEdit }) => {
    const [localValue, setLocalValue] = useState(doc[field] || '');
    const inputRef = useRef(null);

    useEffect(() => {
        if (isEditing) {
            setLocalValue(doc[field] || '');
        }
    }, [isEditing, doc, field]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') onCommitEdit(localValue);
        if (e.key === 'Escape') {
            setLocalValue(doc[field] || ''); // reset
            onCancelEdit();
        }
    };

    const value = doc[field] || '';

    if (isEditing) {
        return (
            <div className="flex items-center gap-1">
                <input
                    ref={inputRef}
                    className="input-field text-sm py-1 px-2 h-8 flex-1"
                    value={localValue}
                    onChange={e => setLocalValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => onCommitEdit(localValue)}
                />
                <button onMouseDown={(e) => { e.preventDefault(); onCommitEdit(localValue); }} className="text-emerald-400 hover:text-emerald-300 p-1"><Check size={14} /></button>
                <button onMouseDown={(e) => { e.preventDefault(); onCancelEdit(); }} className="text-gray-500 hover:text-white p-1"><X size={14} /></button>
            </div>
        );
    }

    if (isLink && value) {
        return (
            <div className="flex items-center gap-1 group/cell cursor-pointer" onClick={onStartEdit}>
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
            onClick={onStartEdit}
        >
            <span className={value ? '' : 'text-gray-600 italic'}>{value || 'Click to edit'}</span>
        </div>
    );
};

export default function DocumentsTab() {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
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
            await load();
            // Start editing immediately on the new row by tricking local state?
            // Actually, just let them click it. Or we can set global editCell. Let's keep a global editing id & field pointer.
            setEditCell({ id: doc.id, field: 'document_name' });
        } catch (e) { console.error(e); }
        finally { setAdding(false); }
    };

    const commitEdit = async (id, field, value) => {
        setEditCell(null);
        try {
            const updated = await updateDocument(id, { [field]: value });
            setDocs(prev => prev.map(d => d.id === id ? { ...d, ...updated } : d));
        } catch (e) { console.error(e); }
    };

    const cancelEdit = () => setEditCell(null);

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
                                            <EditableCell doc={doc} field="document_name" isEditing={editCell?.id === doc.id && editCell?.field === 'document_name'} onStartEdit={() => setEditCell({ id: doc.id, field: 'document_name' })} onCommitEdit={(val) => commitEdit(doc.id, 'document_name', val)} onCancelEdit={cancelEdit} />
                                        </td>
                                        <td className="px-4 py-2 text-gray-300 font-mono text-sm">
                                            <EditableCell doc={doc} field="number" isEditing={editCell?.id === doc.id && editCell?.field === 'number'} onStartEdit={() => setEditCell({ id: doc.id, field: 'number' })} onCommitEdit={(val) => commitEdit(doc.id, 'number', val)} onCancelEdit={cancelEdit} />
                                        </td>
                                        <td className="px-4 py-2">
                                            <EditableCell doc={doc} field="drive_link" isLink isEditing={editCell?.id === doc.id && editCell?.field === 'drive_link'} onStartEdit={() => setEditCell({ id: doc.id, field: 'drive_link' })} onCommitEdit={(val) => commitEdit(doc.id, 'drive_link', val)} onCancelEdit={cancelEdit} />
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
