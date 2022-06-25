import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import database from './database/db.js';

import participantsRoutes from './src/routes/participantsRoutes.js';
import messagesRoutes from './src/routes/messagesRoutes.js';
import statusRoutes from './src/routes/statusRoutes.js';

import deleteInativeParticipants from './src/utils/deleteInativeParticipants.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/participants', participantsRoutes);
app.use('/messages', messagesRoutes);
app.use('/status', statusRoutes);

app.listen(process.env.PORT, () => {
  database.initMongoClient();
  deleteInativeParticipants.init();

  console.log(`Server is running on port ${process.env.PORT}`);
});
