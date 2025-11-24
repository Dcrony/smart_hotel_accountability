const express = require('express');
const { protect, adminGuard } = require('../middleware/auth');
const { 
    createTransaction, 
    getMyDayTransactions, 
    getDailySummary,
    getRecentTransactions 
} = require('../controllers/transactionController');

const router = express.Router();

router.use(protect);

router.post('/', createTransaction);
router.get('/myday', getMyDayTransactions);

router.use(adminGuard);
router.get('/summary', getDailySummary);
router.get('/recent', getRecentTransactions); 

module.exports = router;
