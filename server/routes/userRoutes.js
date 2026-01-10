import express from 'express';
import { 
    registerUser, 
    loginUser,
    getUserProfile, 
    updateFinancialProfile 
} from '../controllers/userController.js';

const router = express.Router();

router.post('/', registerUser);
router.post('/login', loginUser);
router.get('/:id', getUserProfile);
router.put('/:id/financials', updateFinancialProfile);

export default router;
