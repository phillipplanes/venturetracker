import React, { useState } from 'react';
import { Plus, FileText, DollarSign, TrendingUp, TrendingDown, Edit2 } from 'lucide-react';
import EditTransactionModal from './EditTransactionModal';

const FinanceDashboard = ({ teamId, transactions, onAddTransaction, onUpdateTransaction, onDeleteTransaction }) => {
    const [amount, setAmount] = useState('');
    const [desc, setDesc] = useState('');
    const [type, setType] = useState('expense'); 
    const [editingTransaction, setEditingTransaction] = useState(null);

    // Calculate Totals
    const totalRaised = transactions
        .filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalSpent = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);
    const currentBalance = totalRaised - totalSpent;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!amount || !desc) return;
        onAddTransaction({
            type,
            amount: parseFloat(amount),
            description: desc
        });
        setAmount('');
        setDesc('');
    };

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
                    <p className="text-neutral-400 text-xs uppercase font-bold tracking-wider mb-1">Current Balance</p>
                    <div className="text-3xl font-bold text-white flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-yellow-500" />
                        {currentBalance.toFixed(2)}
                    </div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
                    <p className="text-neutral-400 text-xs uppercase font-bold tracking-wider mb-1">Total Raised</p>
                    <div className="text-2xl font-bold text-green-500 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        {totalRaised.toFixed(2)}
                    </div>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
                    <p className="text-neutral-400 text-xs uppercase font-bold tracking-wider mb-1">Total Spent</p>
                    <div className="text-2xl font-bold text-red-500 flex items-center gap-2">
                        <TrendingDown className="w-5 h-5" />
                        {totalSpent.toFixed(2)}
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Transaction Form */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 h-fit">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-yellow-500" />
                        Log Transaction
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Description</label>
                            <input 
                                className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white outline-none focus:border-yellow-500"
                                value={desc}
                                onChange={e => setDesc(e.target.value)}
                                placeholder="e.g. Website Hosting"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={!amount || !desc}
                            className="w-full bg-yellow-600 text-black font-bold py-2 rounded hover:bg-yellow-500 disabled:opacity-50 transition"
                        >
                            Add Transaction
                        </button>
                    </form>
                </div>

                {/* Ledger List */}
                <div className="md:col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-neutral-800 bg-neutral-950/50">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <FileText className="w-4 h-4 text-neutral-500" />
                            Ledger History
                        </h3>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                        <table className="w-full text-left text-sm text-neutral-400">
                            <thead className="bg-neutral-950 text-neutral-500 uppercase text-xs font-bold">
                                <tr>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4 text-right">Amount</th>
                                    <th className="w-8"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800">
                                {transactions.map(t => (
                                    <tr 
                                        key={t.id} 
                                        onClick={() => setEditingTransaction(t)}
                                        className="hover:bg-neutral-800/50 cursor-pointer group transition-colors"
                                    >
                                        <td className="p-4 whitespace-nowrap">
                                            {new Date(t.date || t.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 w-full">{t.description}</td>
                                        <td className={`p-4 text-right font-mono font-medium ${t.type === 'deposit' ? 'text-green-500' : 'text-red-400'}`}>
                                            {t.type === 'deposit' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                                        </td>
                                        <td className="p-4 text-center">
                                            <Edit2 className="w-3 h-3 text-neutral-600 group-hover:text-yellow-500" />
                                        </td>
                                    </tr>
                                ))}
                                {transactions.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-neutral-600 italic">
                                            No transactions recorded yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingTransaction && (
                <EditTransactionModal 
                    transaction={editingTransaction}
                    onSave={(updatedTx) => {
                        onUpdateTransaction(updatedTx);
                        setEditingTransaction(null);
                    }}
                    onDelete={(id) => {
                        onDeleteTransaction(id);
                        setEditingTransaction(null);
                    }}
                    onCancel={() => setEditingTransaction(null)}
                />
            )}
        </div>
    );
};

export default FinanceDashboard;