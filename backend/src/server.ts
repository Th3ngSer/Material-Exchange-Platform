import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import Message from './models/Message';

const app = express();

app.use(cors());
app.use(express.json());

// connect MongoDB
mongoose.connect('mongodb://localhost:27017/chatDB');

// test route
app.get('/', (req, res) => {
  res.send('server running');
});

// save message
app.post('/messages', async (req, res) => {
  const msg = new Message(req.body);
  await msg.save();
  res.send(msg);
});

// get messages
app.get('/messages', async (req, res) => {
  const data = await Message.find();
  res.send(data);
});

app.listen(3000, () => {
  console.log('running on 3000');
});
