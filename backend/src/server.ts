import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import Message from './models/Message';

const app = express();

app.use(cors());
app.use(express.json());

// connect MongoDB
void mongoose.connect('mongodb://localhost:27017/chatDB').catch((err) => {
  console.error('MongoDB connection error:', err);
});

const asyncHandler =
  (
    handler: (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => Promise<void>,
  ) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    void handler(req, res, next).catch(next);
  };

// test route
app.get('/', (req, res) => {
  res.send('server running');
});

// save message
app.post(
  '/messages',
  asyncHandler(async (req, res) => {
    const msg = new Message(req.body);
    await msg.save();
    res.send(msg);
  }),
);

// get messages
app.get(
  '/messages',
  asyncHandler(async (_req, res) => {
    const data = await Message.find();
    res.send(data);
  }),
);

app.listen(3000, () => {
  console.log('running on 3000');
});
