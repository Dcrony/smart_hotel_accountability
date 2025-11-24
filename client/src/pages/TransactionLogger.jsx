import React, { useState } from 'react';
import { DollarSign, LogOut, Zap } from 'lucide-react';
import apiService from '../services/apiService';

const TransactionLogger = ({ auth, setStatus }) => {
    const [formData, setFormData] = useState({
        amount: '',
        type: 'Payment',
        description: '',
        client: '',
        paymentMethod: 'Cash'
    });


    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading', 'Recording transaction...');

        try {
            const payload = {
                ...formData,
                amount: parseFloat(formData.amount),  // ensure number
                recordedBy: auth.user?._id,           // add logged-in user ID
                paymentMethod: 'Cash'                 // or let user select from a dropdown
            };

            await apiService.createTransaction(payload);

            setStatus('success', 'Transaction recorded successfully');

            // Reset fields
            setFormData({
                type: 'Payment',
                amount: '',
                description: '',
                client: ''
            });

        } catch (error) {
            console.error(error);
            setStatus(
                'error',
                error.response?.data?.message || 'Failed to record transaction'
            );
        }
    };


    const isNegative = formData.type === 'Expense' || formData.type === 'Transfer';
    const buttonClass = isNegative ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700';

    return (
        <div className="w-full max-w-lg bg-gray-900 p-6 rounded-2xl shadow-xl border border-gray-800">
            <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <DollarSign className="text-green-500" /> New Transaction
                    </h2>
                    <p className="text-xs text-gray-400">Recorded by: {auth.user?.fullName}</p>
                </div>

                <button
                    onClick={auth.signOut}
                    className="text-gray-500 hover:text-red-400 transition"
                >
                    <LogOut size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

                {/* Type + Amount */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Payment Method</label>
                        <select
                            required
                            value={formData.paymentMethod || 'Cash'}
                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                        >
                            <option value="Cash">Cash</option>
                            <option value="Transfer">Transfer</option>
                            <option value="POS">POS</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>


                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Amount</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            placeholder="0.00"
                        />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="text-sm text-gray-400 block mb-1">Description / Room No.</label>
                    <input
                        type="text"
                        required
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="e.g. Room 101 Check-in or Kitchen Supplies"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className={`w-full py-3 font-bold rounded-lg text-white transition transform active:scale-95 ${buttonClass}`}
                >
                    <span className="flex items-center justify-center gap-2">
                        <Zap size={18} />
                        {isNegative ? 'Record Expense' : 'Record Payment'}
                    </span>
                </button>
            </form>
        </div>
    );
};

export default TransactionLogger;
