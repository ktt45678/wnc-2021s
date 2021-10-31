import 'dotenv/config';
import 'reflect-metadata';
import './modules/mongo.module';
import './modules/redis.module';
import { createServer } from 'http';
import express from 'express';
import { Server } from 'socket.io';
import morgan from 'morgan';
import path from 'path';

import routes from './routing';
import initSocket from './socket';
import initCron from './cron';
import cors from './middlewares/cors.middleware';
import socket from './middlewares/socket.middleware';
import { PORT, STATIC_DIR } from './config';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  transports: ['websocket']
});
initSocket(io);
initCron(io);

// Set up middleware
app.use(cors);
app.use(socket(io));
app.use(morgan('short'));

// Set up middleware for request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(STATIC_DIR, express.static(path.join(__dirname, '..', 'public')));

// Load up the routes
app.use(routes);

// Start the API
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});