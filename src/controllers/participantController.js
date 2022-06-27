import dayjs from 'dayjs';

import database from '../../database/db.js';
import httpStatus from '../utils/httpStatus.js';
import schema from '../schemas/participantSchema.js';

import sanitizeStrings from '../utils/sanitizeStrings.js';

export default {
  post: async (req, res) => {
    const [name] = sanitizeStrings([req.body.name]);

    try {
      const connection = await database.connectDatabase();

      const participantsCollection = connection.collection('participants');
      const participant = await participantsCollection.findOne({ name });

      if (participant) {
        res.sendStatus(httpStatus.CONFLICT);
        return;
      }

      const participantSchema = schema.getSchema();
      const validation = participantSchema.validate({ name });

      if (validation.error) {
        res.sendStatus(httpStatus.UNPROCESSABLE_ENTITY);
        return;
      }

      const newParticipant = await participantsCollection.insertOne({
        name,
        lastStatus: Date.now(),
      });

      const messagesCollection = connection.collection('messages');

      await messagesCollection.insertOne({
        from: name,
        to: 'Todos',
        text: 'entra na sala...',
        type: 'status',
        time: dayjs(newParticipant.lastStatus).format('HH:mm:ss'),
      });

      res.sendStatus(httpStatus.CREATED);

      await database.disconnectDatabase();
    } catch (e) {
      res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
  },
  get: async (req, res) => {
    try {
      const connection = await database.connectDatabase();

      const participantsCollection = connection.collection('participants');

      const participants = await participantsCollection.find().toArray();

      res.send(participants);

      await database.disconnectDatabase();
    } catch (e) {
      res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
  },
};
