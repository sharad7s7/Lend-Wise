import express from 'express';
import { 
    createInvestment, 
    getLenderPortfolio 
} from '../controllers/investmentController.js';

const router = express.Router();

router.post('/', createInvestment);
router.get('/my-portfolio/:userId', getLenderPortfolio);

export default router;
