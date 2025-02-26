import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Recipient
  type: { 
    type: String, 
    enum: ["invite", "share", "recipe_add", "follow", "invite_response", "system"],
    required: true 
  },
  message: { type: String, required: true },
  relatedId: { type: String }, // ID of dishlist, recipe, etc.
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;