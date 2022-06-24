import { MongoClient } from 'mongodb';

let mongoClient;

export default {
  connectDatabase: async () => {
    const connection = await mongoClient.connect();

    return connection.db(process.env.DB_NAME);
  },
  disconnectDatabase: async () => {
    await mongoClient.close();
  },
  setMongoClient: () => {
    mongoClient = new MongoClient(process.env.MONGO_URI);
  },
};
