import dayjs from 'dayjs';
import { ObjectId } from 'mongodb';

import database from '../../database/db.js';
import httpStatus from '../utils/httpStatus.js';
import schema from '../schemas/messageSchema.js';
import sanitizeStrings from '../utils/sanitizeStrings.js';

const ZERO = 0;

function isValidLimit(limit, countCollection) {
  return limit && limit > ZERO && limit <= countCollection;
}

export default {
  post: async (req, res) => {
    const [to, text, type, user] = sanitizeStrings([
      req.body.to,
      req.body.text,
      req.body.type,
      req.get('user'),
    ]);

    try {
      const connection = await database.connectDatabase();

      const participantsCollection = connection.collection('participants');
      const messagesCollection = connection.collection('messages');

      const participants = await participantsCollection.find().toArray();

      const participantsName = participants.map(
        (participant) => participant.name
      );

      const messageSchema = schema.getSchema(participantsName);

      const validation = messageSchema.validate(
        { to, text, type, from: user },
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
        from: user,
        time: dayjs().format('HH:mm:ss'),
      });

      res.sendStatus(httpStatus.CREATED);

      await database.disconnectDatabase();
    } catch (e) {
      res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
  },
  get: async (req, res) => {
    const user = req.get('user');
    const limit = parseInt(req.query.limit);

    try {
      const connection = await database.connectDatabase();

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
  delete: async (req, res) => {
    const user = req.get('user');
    let { messageId } = req.params;

    try {
      messageId = ObjectId(messageId);
    } catch (e) {
      res.sendStatus(httpStatus.BAD_REQUEST);
      return;
    }

    try {
      const connection = await database.connectDatabase();

      const messagesCollection = connection.collection('messages');

      const message = await messagesCollection.findOne({
        _id: messageId,
      });

      if (!message) {
        res.sendStatus(httpStatus.NOT_FOUND);
        return;
      }

      if (message.from !== user) {
        res.sendStatus(httpStatus.UNAUTHORIZED);
        return;
      }

      await messagesCollection.deleteOne({ _id: messageId });

      res.sendStatus(httpStatus.NO_CONTENT);

      await database.disconnectDatabase();
    } catch (e) {
      res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
  },
  put: async (req, res) => {
    const [to, text, type, user] = sanitizeStrings([
      req.body.to,
      req.body.text,
      req.body.type,
      req.get('user'),
    ]);
    let { messageId } = req.params;

    try {
      messageId = ObjectId(messageId);
    } catch (e) {
      res.sendStatus(httpStatus.BAD_REQUEST);
      return;
    }

    try {
      const connection = await database.connectDatabase();

      const messagesCollection = connection.collection('messages');
      const participantsCollection = connection.collection('participants');

      const participants = await participantsCollection.find().toArray();

      const participantsName = participants.map(
        (participant) => participant.name
      );

      const messageSchema = schema.getSchema(participantsName);

      const validation = messageSchema.validate(
        { to, text, type, from: user },
        { abortEarly: false }
      );

      if (participantsName.length === ZERO || validation.error) {
        res.sendStatus(httpStatus.UNPROCESSABLE_ENTITY);
        return;
      }

      const message = await messagesCollection.findOne({ _id: messageId });

      if (!message) {
        res.sendStatus(httpStatus.NOT_FOUND);
        return;
      }

      if (message.from !== user) {
        res.sendStatus(httpStatus.UNAUTHORIZED);
        return;
      }

      await messagesCollection.updateOne(
        { _id: messageId },
        {
          $set: {
            to,
            text,
            type,
            from: user,
            time: dayjs().format('HH:mm:ss'),
          },
        }
      );

      res.sendStatus(httpStatus.NO_CONTENT);

      await database.disconnectDatabase();
    } catch (e) {
      res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
  },
};
