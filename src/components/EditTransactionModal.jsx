import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';

const EditTransactionModal = ({ transaction, onSave, onDelete, onCancel }) => {
    const [amount, setAmount] = useState(transaction.amount);
    const [desc, setDesc] = useState(transaction.description);
    const [type, setType] = useState(transaction.type);

    const handleSubmit = () => {
        onSave({
            ...transaction,
            amount: parseFloat(amount),
            description: desc,
            type: type
        });
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-4">Edit Transaction</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Type</label>
                        <div className="flex bg-neutral-950 p-1 rounded-lg border border-neutral-800">
                            <button 
                                type="button"
                                onClick={() => setType('expense')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition ${type === 'expense' ? 'bg-red-900/50 text-red-200' : 'text-neutral-400 hover:text-white'}`}
                            >
                                Expense
                            </button>
                            <button 
                                type="button"
                                onClick={() => setType('deposit')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition ${type === 'deposit' ? 'bg-green-900/50 text-green-200' : 'text-neutral-400 hover:text-white'}`}
                            >
                                Deposit
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Amount ($)</label>
                        <input 
                            type="number" 
                            step="0.01"
                            className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white outline-none focus:border-yellow-500"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Description</label>
                        <input 
                            className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white outline-none focus:border-yellow-500"
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-between gap-3 mt-6">
                    <button onClick={() => onDelete(transaction.id)} className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1">
                        <Trash2 className="w-4 h-4" /> Delete
                    </button>
                    <div className="flex gap-2">
                        <button 
                            onClick={onCancel}
                            className="px-4 py-2 text-neutral-400 hover:text-white text-sm"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSubmit}
                            disabled={!amount || !desc}
                            className="bg-yellow-600 text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-500 disabled:opacity-50"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditTransactionModal;