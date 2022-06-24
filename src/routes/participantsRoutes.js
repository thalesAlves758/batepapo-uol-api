import express from 'express';
import participantController from '../controllers/participantController.js';

const router = express.Router();

router.post('/', participantController.post);

export default router;
