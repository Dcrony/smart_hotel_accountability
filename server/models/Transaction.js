const mongoose = require('mongoose');

// Defines the structure for Financial Transactions
const transactionSchema = new mongoose.Schema({
    // Categorizes the transaction (essential for reporting)
    type: {
        type: String,
        required: [true, 'Transaction type is required.'],
        enum: ['Payment', 'Expense', 'Deposit', 'Adjustment', 'Transfer'],
    },
    // The monetary value (always positive; 'type' determines if it's income or expense)
    amount: {
        type: Number,
        required: [true, 'Amount is required.'],
        min: [0.01, 'Amount must be greater than zero.'],
    },
    // Description for accountability (e.g., "Room 102 Check-in" or "Kitchen Supplies")
    description: {
        type: String,
        trim: true,
        maxlength: 255,
        required: [true, 'Description is required.'],
    },
    // Links the transaction to the specific Staff member who recorded it
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // References the User model
        required: [true, 'Staff ID is required to record a transaction.'],
    },
    // Optional: Links to a client if your system tracks them
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        default: null,
    },
    // Payment method (important for cash vs non-cash reporting)
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Transfer', 'POS', 'Other'],
        required: [true, 'Payment method is required.'],
    },
    // Optional reference id (e.g., payment reference, receipt, or transaction id)
    referenceId: {
        type: String,
        trim: true,
        default: null,
    },
    // The date the transaction applies to (defaults to now)
    transactionDate: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true // Adds createdAt (audit log) and updatedAt
});

// --- STATIC METHOD: Reporting ---
// Calculates totals based on filtering criteria (e.g., date range, specific user)
// Accepts a MongoDB match object (e.g., { recordedBy, createdAt: { $gte, $lt } })
transactionSchema.statics.calculateTotals = async function(matchCriteria) {
    try {
        // Ensure matchCriteria is always an object
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
