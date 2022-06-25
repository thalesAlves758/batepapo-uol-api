import database from '../../database/db.js';

const ZERO = 0;
/* eslint-disable no-magic-numbers */
const TEN_SECONDS = 10 * 1000;
const FIFTEEN_SECONDS = 15 * 1000;
/* eslint-enable no-magic-numbers */

export default {
  init: () => {
    setInterval(async () => {
      try {
        const connection = await database.connectDatabase();

        const participantsCollection = connection.collection('participants');

        const inativeParticipants = await participantsCollection
          .find({ lastStatus: { $lt: Date.now() - TEN_SECONDS } })
          .toArray();

        if (inativeParticipants.length > ZERO) {
          await participantsCollection.deleteMany({
            $or: inativeParticipants.map(({ _id }) => ({
              _id,
            })),
          });
        }

        await database.disconnectDatabase();
      } catch (e) {
        console.log(e);
      }
    }, FIFTEEN_SECONDS);
  },
};
