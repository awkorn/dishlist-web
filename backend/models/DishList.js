//Defines the DishList structure in MongoDB
import mongoose from "mongoose";

const DishListSchema = new mongoose.Schema({
    userId: { type: String, required: true }, //firebase UID
    title: { type: String, required: true },
    isPinned: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const DishList = mongoose.model("DishList", DishListSchema);
export default DishList;