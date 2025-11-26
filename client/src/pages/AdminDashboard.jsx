import React, { useState, useEffect, useCallback } from 'react';
import {
    LayoutDashboard, RefreshCw, LogOut, TrendingUp, Zap, DollarSign, Clock
} from 'lucide-react';
import apiService from '../services/apiService';
import { formatCurrency, formatTime } from '../utils/formatters';
import KPICard from '../components/KPICard';
import { useNavigate } from "react-router-dom";


const AdminDashboard = ({ auth, setStatus }) => {
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();


    const refreshData = useCallback(async () => {
    setIsLoading(true);
    setStatus('loading', 'Syncing data...');

    try {
        const [recent, summaryData] = await Promise.all([
            apiService.fetchRecent(),
            apiService.fetchSummary()
        ]);

        setTransactions(recent || []);
        setSummary(summaryData?.aggregate || {});

        setStatus('success', 'Dashboard updated');
        console.log("SUMMARY:", summaryData?.aggregate);

    } catch (error) {
        console.error(error);
        setStatus('error', 'Failed to fetch dashboard data');
    } finally {
        setIsLoading(false);
    }
}, [setStatus]);


    useEffect(() => {
        refreshData();
    }, []);


    if (isLoading && !summary) {
        return (
            <div className="text-white text-center mt-20">
                Loading Dashboard...
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
            {/* Header */}
            <header className="flex justify-between items-center bg-gray-900 p-4 rounded-xl border border-gray-800">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <LayoutDashboard className="text-blue-500" /> Owner Dashboard
                    </h1>
                    <p className="text-gray-400 text-sm">Welcome, {auth.user?.fullName}</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate("/admin/users")}
                        className="w-full p-3 bg-green-600 hover:bg-green-400 rounded-lg cursor-pointer"
                    >
                        Manage Users
                    </button>

                    <button
                        onClick={refreshData}
                        className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 text-white transition cursor-pointer"
                    >
                        <RefreshCw size={20} />
                    </button>
                    <button
                        onClick={auth.signOut}
                        className="p-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition cursor-pointer"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2  gap-4">
                <KPICard
                    title="Net Balance"
                    value={summary ? formatCurrency(summary.netBalance) : '...'}
                    icon={TrendingUp}
                    color="text-green-400"
                />
                <KPICard
                    title="Total Income"
                    value={summary ? formatCurrency(summary.totalIncome) : '...'}
                    icon={DollarSign}
                    color="text-blue-400"
                />
                <KPICard
                    title="Total Expenses"
                    value={summary ? formatCurrency(summary.totalExpenditure) : '...'}
                    icon={RefreshCw}
                    color="text-red-400"
                />
                <KPICard
                    title="Transactions"
                    value={summary ? summary.transactionCount : '...'}
                    icon={Zap}
                    color="text-yellow-400"
                />
                
            </div>
            

            {/* Recent Transactions */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="p-4 border-b border-gray-800">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <Clock size={18} /> Recent Activity
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-gray-800 text-gray-200 uppercase font-medium">
                            <tr>
                                <th className="p-4">Type</th>
                                <th className="p-4">Description</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Recorded By</th>
                                <th className="p-4">Date</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-800">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">
                                        No recent transactions found.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx._id} className="hover:bg-gray-800/50 transition">
                                        <td className="p-4">
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-bold ${['Payment', 'Deposit'].includes(tx.type)
                                                        ? 'bg-green-900/30 text-green-400'
                                                        : 'bg-red-900/30 text-red-400'
                                                    }`}
                                            >
                                                {tx.type}
                                            </span>
                                        </td>

                                        <td className="p-4 text-white font-medium">
                                            {tx.description}
                                        </td>

                                        <td
                                            className={`p-4 font-bold ${['Payment', 'Deposit'].includes(tx.type)
                                                    ? 'text-green-400'
                                                    : 'text-red-400'
                                                }`}
                                        >
                                            {formatCurrency(tx.amount)}
                                        </td>

                                        <td className="p-4">
                                            {tx.recordedBy?.fullName || 'Unknown'}
                                        </td>

                                        <td className="p-4">
                                            {formatTime(tx.transactionDate)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
