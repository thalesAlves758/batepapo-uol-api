import dayjs from 'dayjs';
import database from '../../database/db.js';
import httpStatus from '../utils/httpStatus.js';

export default {
  post: async (req, res) => {
    const { to, text, type } = req.body;
    const from = req.get('user');

    try {
      const connection = await database.connectDatabase(process.env.DB_NAME);

      const messagesCollection = connection.collection('messages');

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
      res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
  },
};
