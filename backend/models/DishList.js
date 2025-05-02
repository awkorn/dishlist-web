import mongoose from "mongoose";

const DishListSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Owner
  title: { type: String, required: true },
  isPinned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  followers: [{ type: String }],
  collaborators: [{ type: String }],
  pendingCollaborators: [{ type: String }],
  visibility: {
    type: String,
    enum: ["public", "private"],
    default: "private",
  },
  followRequests: [{ type: String }], // For tracking pending follow requests
  description: { type: String },
});

const DishList = mongoose.model("DishList", DishListSchema);
export default DishList;
