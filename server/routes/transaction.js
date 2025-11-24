const express = require('express');
const { protect, adminGuard } = require('../middleware/auth');
const { createTransaction, getMyDayTransactions, getDailySummary } = require('../controllers/transactionController');

const router = express.Router();

router.use(protect); 


router.post('/', createTransaction);
router.get('/myday', getMyDayTransactions);

router.use(adminGuard); 


router.get('/summary', getDailySummary);
router.get('/recent', adminGuard, getRecentTransactions);



module.exports = router;