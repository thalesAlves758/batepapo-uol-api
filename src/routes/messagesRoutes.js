import express from 'express';
import messageController from '../controllers/messageController.js';

const router = express.Router();

router.get('/', messageController.get);
router.post('/', messageController.post);
router.delete('/:messageId', messageController.delete);
router.put('/:messageId', messageController.put);

export default router;
