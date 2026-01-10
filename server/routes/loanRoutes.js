import express from 'express';
import { 
    createLoanRequest, 
    getExploreLoans, 
    getMyLoans 
} from '../controllers/loanController.js';

const router = express.Router();

router.post('/', createLoanRequest);
router.get('/explore', getExploreLoans);
router.get('/my-loans/:userId', getMyLoans);

export default router;
