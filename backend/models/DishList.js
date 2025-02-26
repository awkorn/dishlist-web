import mongoose from "mongoose";

const DishListSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Owner
  title: { type: String, required: true },
  isPinned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  followers: [{ type: String }],
  collaborators: [{ type: String }],
  visibility: {
    type: String,
    enum: ["public", "private", "shared"],
    default: "private",
  },
  sharedWith: [{ type: String }], // For "shared" visibility - track specific users with access
  followRequests: [{ type: String }], // For tracking pending follow requests
  description: { type: String }, // Optional description of the dishlist
});

const DishList = mongoose.model("DishList", DishListSchema);
export default DishList;
