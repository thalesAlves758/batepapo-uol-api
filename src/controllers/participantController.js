import database from '../../database/db.js';
import httpStatus from '../utils/httpStatus.js';

export default {
  post: async (req, res) => {
    const { name } = req.body;

    try {
      const connection = await database.connectDatabase(process.env.DB_NAME);

      const participantsCollection = connection.collection('participants');
      const participant = await participantsCollection.findOne({ name });

      if (participant) {
        res.sendStatus(httpStatus.CONFLICT);
        return;
      }

      await participantsCollection.insertOne({
        name,
        lastStatus: Date.now(),
      });

      res.sendStatus(httpStatus.CREATED);

      await database.disconnectDatabase();
    } catch (e) {
      res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
  },
};
