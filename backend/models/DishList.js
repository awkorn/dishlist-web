import mongoose from "mongoose";

const DishListSchema = new mongoose.Schema({
  userId: { type: String, required: true },
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
});

const DishList = mongoose.model("DishList", DishListSchema);
export default DishList;
