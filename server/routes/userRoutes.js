import express from 'express';
import { 
    registerUser, 
    getUserProfile, 
    updateFinancialProfile 
} from '../controllers/userController.js';

const router = express.Router();

router.post('/', registerUser);
router.get('/:id', getUserProfile);
router.put('/:id/financials', updateFinancialProfile);

export default router;
