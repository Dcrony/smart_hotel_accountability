const Transaction = require('../models/Transaction');
const { Types } = require('mongoose');


exports.createTransaction = async (req, res) => {
    try {
        const recordedBy = req.user._id; 
        const { type, amount, description, referenceId, paymentMethod } = req.body;

        const transaction = await Transaction.create({
            type,
            amount: parseFloat(amount), 
            description,
            referenceId,
            paymentMethod,
            recordedBy,
        });

        res.status(201).json({ 
            message: 'Transaction recorded successfully.', 
            transaction 
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ 
                message: 'Validation failed.',
                errors: errors 
            });
        }
        console.error('Error creating transaction:', error);
        res.status(500).json({ message: 'Server error while recording transaction.' });
    }
};


exports.getMyDayTransactions = async (req, res) => {
    try {
        const userId = req.user._id;

        
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        const transactions = await Transaction.find({
            recordedBy: userId,
            createdAt: { 
                $gte: startOfDay, 
                $lt: endOfDay 
            }
        })
        .sort({ createdAt: -1 })
        .populate('recordedBy', 'fullName username role'); 

       
        const totals = Transaction.calculateTotals(transactions);

        res.status(200).json({
            message: `Found ${transactions.length} transactions recorded by you today.`,
            transactions,
            summary: totals
        });

    } catch (error) {
        console.error('Error fetching staff transactions:', error);
        res.status(500).json({ message: 'Server error fetching daily transactions.' });
    }
};



exports.getDailySummary = async (req, res) => {
    try {
        
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        
        const allTransactions = await Transaction.find({
            createdAt: { 
                $gte: startOfDay, 
                $lt: endOfDay 
            }
        })
        .populate('recordedBy', 'fullName username role')
        .sort({ createdAt: 1 });

        const aggregateTotals = Transaction.calculateTotals(allTransactions);

        const staffSummaryMap = new Map();
        
        allTransactions.forEach(t => {
            const userId = t.recordedBy._id.toString();
            if (!staffSummaryMap.has(userId)) {
                staffSummaryMap.set(userId, {
                    staff: {
                        id: userId,
                        fullName: t.recordedBy.fullName,
                        role: t.recordedBy.role
                    },
                    transactions: [],
                    totals: { totalRevenue: 0, totalExpenses: 0, totalCash: 0, netCashFlow: 0 }
                });
            }

            const staffRecord = staffSummaryMap.get(userId);
            staffRecord.transactions.push(t);
            
            if (t.type.includes('Payment') && t.paymentMethod === 'Cash') {
                staffRecord.totals.totalCash += t.amount;
            } else if (t.type.includes('Payment')) {
                staffRecord.totals.totalRevenue += t.amount;
            } else if (t.type.includes('Expense')) {
                staffRecord.totals.totalExpenses += t.amount;
            }
        });
        
        const detailedStaffSummaries = Array.from(staffSummaryMap.values()).map(staffData => {
            const staffTotals = Transaction.calculateTotals(staffData.transactions);
            return {
                staff: staffData.staff,
                summary: staffTotals,
            };
        });


        res.status(200).json({
    message: `Comprehensive summary for ${allTransactions.length} transactions recorded today.`,
    date: startOfDay.toISOString().split('T')[0],
    aggregate: aggregateTotals,
    staffSummaries: detailedStaffSummaries,
    allTransactions: allTransactions 
});


    } catch (error) {
        console.error('Error fetching daily summary:', error);
        res.status(500).json({ message: 'Server error fetching daily summary report.' });
    }
};

exports.getRecentTransactions = async (req, res) => {
    try {
        const recentTransactions = await Transaction.find()
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('recordedBy', 'fullName username role');

        res.status(200).json(recentTransactions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching recent transactions' });
    }
};

