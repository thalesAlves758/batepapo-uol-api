import dayjs from 'dayjs';

import database from '../../database/db.js';
import httpStatus from '../utils/httpStatus.js';
import schema from '../schemas/messageSchema.js';

const ZERO = 0;

function isValidLimit(limit, countCollection) {
  return limit && limit > ZERO && limit <= countCollection;
}

export default {
  post: async (req, res) => {
    const { to, text, type } = req.body;
    const from = req.get('user');

    try {
      const connection = await database.connectDatabase(process.env.DB_NAME);

      const participantsCollection = connection.collection('participants');
      const messagesCollection = connection.collection('messages');

      const participants = await participantsCollection.find().toArray();

      const participantsName = participants.map(
        (participant) => participant.name
      );

      const messageSchema = schema.getSchema(participantsName);

      const validation = messageSchema.validate(
        { to, text, type, from },
        { abortEarly: false }
      );

      if (participantsName.length === ZERO || validation.error) {
        res.sendStatus(httpStatus.UNPROCESSABLE_ENTITY);
        return;
      }

      await messagesCollection.insertOne({
        to,
        text,
        type,
        from,
        time: dayjs().format('HH:mm:ss'),
      });

      res.sendStatus(httpStatus.CREATED);

      await database.disconnectDatabase();
    } catch (e) {
      console.log(e);
      res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
  },
  get: async (req, res) => {
    const user = req.get('user');
    const limit = parseInt(req.query.limit);

    try {
      const connection = await database.connectDatabase(process.env.DB_NAME);

      const messagesCollection = connection.collection('messages');

      const countMessages = await messagesCollection.countDocuments();

      const messages = await messagesCollection
        .find({
          $or: [
            { to: 'Todos' },
            { type: 'message' },
            { from: user },
            { to: user },
          ],
        })
        .skip(isValidLimit(limit, countMessages) ? countMessages - limit : ZERO)
        .toArray();

      res.send(messages);

      await database.disconnectDatabase();
    } catch (e) {
      res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
  },
};
