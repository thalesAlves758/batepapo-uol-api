import database from '../../database/db.js';
import httpStatus from '../utils/httpStatus.js';

export default {
  post: async (req, res) => {
    const user = req.get('user');

    try {
      const connection = await database.connectDatabase();

      const participantsCollection = connection.collection('participants');
      const participant = await participantsCollection.findOne({ name: user });

      if (!participant) {
        res.sendStatus(httpStatus.NOT_FOUND);
        return;
      }

      await participantsCollection.updateOne(
        { name: user },
        { $set: { lastStatus: Date.now() } }
      );

      res.send('ok');
    } catch (e) {
      res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
  },
};
