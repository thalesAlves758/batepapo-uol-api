import { MongoClient } from 'mongodb';

const mongoClient = new MongoClient(process.env.MONGO_URI);

export default {
  connectDatabase: async (dbName) => {
    const connection = await mongoClient.connect();

    return connection.db(dbName);
  },
  desconnectDatabase: async () => {
    await mongoClient.close();
  },
};
