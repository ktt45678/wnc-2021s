import { connect, connection, Connection } from 'mongoose';

import { MONGO_URL } from '../config';

let db: Connection;

(async () => {
  await connect(MONGO_URL);
  db = connection;
  db.on('error', console.error.bind(console, 'Database connection error:'));
})();

export default db;