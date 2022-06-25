import dayjs from 'dayjs';
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
        const messagesCollection = connection.collection('messages');

        const inativeParticipants = await participantsCollection
          .find({ lastStatus: { $lt: Date.now() - TEN_SECONDS } })
          .toArray();

        if (inativeParticipants.length > ZERO) {
          await participantsCollection.deleteMany({
            $or: inativeParticipants.map(({ _id }) => ({
              _id,
            })),
          });

          await messagesCollection.insertMany(
            inativeParticipants.map((participant) => ({
              from: participant.name,
              to: 'Todos',
              text: 'sai da sala...',
              type: 'status',
              time: dayjs().format('HH:mm:ss'),
            }))
          );
        }

        await database.disconnectDatabase();
      } catch (e) {
        console.log(e);
      }
    }, FIFTEEN_SECONDS);
  },
};
