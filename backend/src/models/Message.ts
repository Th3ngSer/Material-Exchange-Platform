import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    senderId: String,
    receiverId: String,

    //type: String, // text | image | voice

    text: String,
    image: String,
    voice: String,
  },
  { timestamps: true },
);

export default mongoose.model('Message', messageSchema);
