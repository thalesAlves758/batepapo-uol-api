import express from 'express';
import participantController from '../controllers/participantController.js';

const router = express.Router();

router.get('/', participantController.get);
router.post('/', participantController.post);

export default router;
