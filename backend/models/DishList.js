//Defines the DishList structure in MongoDB
const mongoose = require("mongoose");

const DishListSchema = new mongoose.Schema({
    userId: { type: String, required: true }, //firebase UID
    title: { type: String, required: true },
    isPinned: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("DishList", DishListSchema);