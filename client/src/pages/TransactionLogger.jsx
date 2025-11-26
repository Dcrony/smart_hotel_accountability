import React, { useState } from 'react';
import { DollarSign, LogOut, Zap } from 'lucide-react';
import apiService from '../services/apiService';

const TransactionLogger = ({ auth, setStatus, clients }) => {
  const [formData, setFormData] = useState({
    type: 'Payment',
    amount: '',
    description: '',
    client: '',          // optional client ID
    paymentMethod: 'Cash',
    referenceId: '',
    transactionDate: new Date().toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading', 'Recording transaction...');

    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        recordedBy: auth.user?._id
      };

      await apiService.createTransaction(payload);

      setStatus('success', 'Transaction recorded successfully');

      // Reset form
      setFormData({
        type: 'Payment',
        amount: '',
        description: '',
        client: '',
        paymentMethod: 'Cash',
        referenceId: '',
        transactionDate: new Date().toISOString().slice(0, 16)
      });

    } catch (error) {
      console.error(error);
      setStatus(
        'error',
        error.response?.data?.message || 'Failed to record transaction'
      );
    }
  };

  const isNegative = ['Expense', 'Transfer', 'Adjustment'].includes(formData.type);
  const buttonClass = isNegative ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700';

  return (
    <div className='flex justify-center item-center bg-gray-300'>
    <div className=" w-full max-w-lg bg-gray-900 p-6 rounded-2xl shadow-xl border border-gray-800">
      <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="text-green-500" /> New Transaction
          </h2>
          <p className="text-xs text-gray-400">Recorded by: {auth.user?.fullName}</p>
        </div>
        <button
          onClick={auth.signOut}
          className="text-gray-500 hover:text-red-400 transition cursor-pointer"
        >
          <LogOut size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Type */}
        <div>
          <label className="text-sm text-gray-400 block mb-1">Transaction Type</label>
          <select
            required
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="Payment">Payment</option>
            <option value="Expense">Expense</option>
            <option value="Deposit">Deposit</option>
            <option value="Adjustment">Adjustment</option>
            <option value="Transfer">Transfer</option>
          </select>
        </div>

        {/* Amount */}
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

        {/* Description */}
        <div>
          <label className="text-sm text-gray-400 block mb-1">Description</label>
          <input
            type="text"
            required
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Room 101 Check-in or Kitchen Supplies"
          />
        </div>

        {/* Client */}
        <div>
          <label className="text-sm text-gray-400 block mb-1">Client (optional)</label>
          <select
            value={formData.client}
            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="">Select client (optional)</option>
            {clients?.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Payment Method */}
        <div>
          <label className="text-sm text-gray-400 block mb-1">Payment Method</label>
          <select
            required
            value={formData.paymentMethod}
            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="Cash">Cash</option>
            <option value="Transfer">Transfer</option>
            <option value="POS">POS</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Reference ID */}
        <div>
          <label className="text-sm text-gray-400 block mb-1">Reference ID (optional)</label>
          <input
            type="text"
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
            value={formData.referenceId}
            onChange={(e) => setFormData({ ...formData, referenceId: e.target.value })}
            placeholder="e.g. Receipt #12345"
          />
        </div>

        {/* Transaction Date */}
        <div>
          <label className="text-sm text-gray-400 block mb-1">Transaction Date</label>
          <input
            type="datetime-local"
            required
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
            value={formData.transactionDate}
            onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
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
    </div>
  );
};

export default TransactionLogger;
