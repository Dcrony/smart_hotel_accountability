const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        required: [true, 'Transaction type is required.'],
        enum: ['Payment', 'Expense', 'Deposit', 'Adjustment', 'Transfer'],
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required.'],
        min: [0.01, 'Amount must be greater than zero.'],
    },
    description: {
        type: String,
        trim: true,
        maxlength: 255,
        required: [true, 'Description is required.'],
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: [true, 'Staff ID is required to record a transaction.'],
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        default: null,
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Transfer', 'POS', 'Other'],
        required: [true, 'Payment method is required.'],
    },
    referenceId: {
        type: String,
        trim: true,
        default: null,
    },
    transactionDate: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true 
});


transactionSchema.statics.calculateTotals = async function(matchCriteria) {
    try {
        if (!matchCriteria || typeof matchCriteria !== 'object' || Array.isArray(matchCriteria)) {
            matchCriteria = {};
        }

        const result = await this.aggregate([
            { $match: matchCriteria },
            {
                $group: {
                    _id: null,
                    totalIncome: {
                        $sum: {
                            $cond: [{ $in: ['$type', ['Payment', 'Deposit']] }, '$amount', 0]
                        }
                    },
                    totalExpenditure: {
                        $sum: {
                            $cond: [{ $in: ['$type', ['Expense', 'Transfer', 'Adjustment']] }, '$amount', 0]
                        }
                    },
                    totalCash: {
                        $sum: {
                            $cond: [
                                { $and: [{ $in: ['$type', ['Payment', 'Deposit']] }, { $eq: ['$paymentMethod', 'Cash'] }] },
                                '$amount',
                                0
                            ]
                        }
                    },
                    transactionCount: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalIncome: 1,
                    totalExpenditure: 1,
                    totalCash: 1,
                    transactionCount: 1,
                    netBalance: { $subtract: ['$totalIncome', '$totalExpenditure'] }
                }
            }
        ]);

        return result.length > 0 ? result[0] : {
            totalIncome: 0,
            totalExpenditure: 0,
            totalCash: 0,
            transactionCount: 0,
            netBalance: 0
        };

    } catch (error) {
        console.error("Error calculating totals:", error);
        throw new Error("Failed to calculate financial totals.");
    }
};


const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
