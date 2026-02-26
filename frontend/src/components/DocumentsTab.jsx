import React, { useEffect, useState, useRef, memo } from 'react';
import { Plus, Trash2, ExternalLink, Check, X } from 'lucide-react';
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from 'framer-motion';
/* eslint-enable no-unused-vars */
import { getDocuments, createDocument, updateDocument, deleteDocument } from '../api';

const EditableCell = memo(({ doc, field, isLink = false, isEditing, onStartEdit, onCommitEdit, onCancelEdit }) => {
    const [localValue, setLocalValue] = useState(doc[field] || '');
    const inputRef = useRef(null);

    useEffect(() => {
        if (isEditing) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
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
            setLocalValue(doc[field] || '');
            onCancelEdit();
        }
    };

    const value = doc[field] || '';

    if (isEditing) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1"
            >
                <input
                    ref={inputRef}
                    className="input-field text-sm py-1 px-2 h-8 flex-1 bg-dark-600 focus:bg-dark-500 transition-colors"
                    value={localValue}
                    onChange={e => setLocalValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => onCommitEdit(localValue)}
                />
                <button onMouseDown={(e) => { e.preventDefault(); onCommitEdit(localValue); }} className="text-emerald-400 hover:text-emerald-300 p-1 transition-colors"><Check size={14} /></button>
                <button onMouseDown={(e) => { e.preventDefault(); onCancelEdit(); }} className="text-gray-500 hover:text-white p-1 transition-colors"><X size={14} /></button>
            </motion.div>
        );
    }

    if (isLink && value) {
        return (
            <div className="flex items-center gap-1 group/cell cursor-pointer" onClick={onStartEdit}>
                <a href={value} target="_blank" rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="text-brand-400 hover:text-brand-300 flex items-center gap-1 text-sm truncate max-w-[180px] transition-colors">
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
});

export default function DocumentsTab() {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [editCell, setEditCell] = useState(null);
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
            // Add directly to state for instant feedback instead of full reload
            setDocs(prev => [doc, ...prev]);
            setEditCell({ id: doc.id, field: 'document_name' });
        } catch (e) { console.error(e); }
        finally { setAdding(false); }
    };

    const commitEdit = React.useCallback(async (id, field, value) => {
        setEditCell(null);
        // Optimistic update
        setDocs(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
        try {
            const updated = await updateDocument(id, { [field]: value });
            // Align with server if necessary
            setDocs(prev => prev.map(d => d.id === id ? { ...d, ...updated } : d));
        } catch (e) { console.error(e); }
    }, []);

    const cancelEdit = React.useCallback(() => setEditCell(null), []);

    const handleDelete = React.useCallback(async (docToDelete) => {
        setDeleteConfirm(null);
        // Optimistic UI update
        setDocs(prev => prev.filter(d => d.id !== docToDelete.id));
        try {
            await deleteDocument(docToDelete.id);
        } catch (e) {
            console.error(e);
            await load(); // Revert on failure
        }
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64 text-brand-400">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <Check className="opacity-0" /> {/* Just a spinner placeholder */}
                <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full" />
            </motion.div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Personal Documents</h1>
                    <p className="text-gray-500 text-sm mt-1">{docs.length} documents • Click any cell to edit</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddRow}
                    disabled={adding}
                    className="btn-primary shadow-lg shadow-brand-500/20"
                >
                    <Plus size={16} /> {adding ? 'Adding...' : 'Add Document'}
                </motion.button>
            </div>

            {docs.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="card text-center py-16 text-gray-500 border border-dark-600 border-dashed"
                >
                    <p className="text-lg mb-2 text-gray-400 font-medium">No documents yet</p>
                    <p className="text-sm">Click "Add Document" to add your first document</p>
                </motion.div>
            ) : (
                <div className="card overflow-hidden p-0 border border-dark-600/50 shadow-xl bg-dark-800/80 backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-dark-500 bg-dark-900/50">
                                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-4">Document Name</th>
                                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-4">Number / ID</th>
                                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-4">Drive Link</th>
                                    <th className="px-3 py-4 w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-600/50">
                                <AnimatePresence initial={false}>
                                    {docs.map((doc, idx) => (
                                        <motion.tr
                                            key={doc.id}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                                            transition={{ duration: 0.2 }}
                                            className={`hover:bg-dark-600/40 transition-colors group ${idx % 2 === 0 ? 'bg-dark-800/20' : 'bg-dark-700/10'}`}
                                        >
                                            <td className="px-5 py-3 font-medium text-white w-1/3">
                                                <EditableCell doc={doc} field="document_name" isEditing={editCell?.id === doc.id && editCell?.field === 'document_name'} onStartEdit={() => setEditCell({ id: doc.id, field: 'document_name' })} onCommitEdit={(val) => commitEdit(doc.id, 'document_name', val)} onCancelEdit={cancelEdit} />
                                            </td>
                                            <td className="px-5 py-3 text-gray-300 font-mono text-sm w-1/4">
                                                <EditableCell doc={doc} field="number" isEditing={editCell?.id === doc.id && editCell?.field === 'number'} onStartEdit={() => setEditCell({ id: doc.id, field: 'number' })} onCommitEdit={(val) => commitEdit(doc.id, 'number', val)} onCancelEdit={cancelEdit} />
                                            </td>
                                            <td className="px-5 py-3 w-1/3">
                                                <EditableCell doc={doc} field="drive_link" isLink isEditing={editCell?.id === doc.id && editCell?.field === 'drive_link'} onStartEdit={() => setEditCell({ id: doc.id, field: 'drive_link' })} onCommitEdit={(val) => commitEdit(doc.id, 'drive_link', val)} onCancelEdit={cancelEdit} />
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                    onClick={() => setDeleteConfirm(doc)}
                                                    className="text-gray-600 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </motion.button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
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
                            <h3 className="font-semibold text-white mb-2 text-lg">Delete Document?</h3>
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">Remove <strong className="text-white bg-dark-600 px-1.5 py-0.5 rounded">{deleteConfirm.document_name}</strong>?</p>
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

