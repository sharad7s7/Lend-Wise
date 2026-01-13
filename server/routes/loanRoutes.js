import express from 'express';
import { 
    createLoanRequest, 
    getExploreLoans, 
    getMyLoans,
    submitCertificate
} from '../controllers/loanController.js';

const router = express.Router();

router.post('/', createLoanRequest);
router.get('/explore', getExploreLoans);
router.get('/my-loans/:userId', getMyLoans);
router.put('/:loanId/certificate', submitCertificate);

export default router;
