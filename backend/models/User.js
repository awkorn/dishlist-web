import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    firebaseUid: { type: String, unique: true, required: true }, // Firebase UID
    email: { type: String, unique: true, required: true }, // User's email
    username: { type: String, required: true }, // Display name
    followingDishLists: [{ type: mongoose.Schema.Types.ObjectId, ref: "DishList" }], // Lists user follows
    ownedDishLists: [{ type: mongoose.Schema.Types.ObjectId, ref: "DishList" }], // Lists user owns
    savedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }], // Recipes user saved
}, { timestamps: true }); // Auto-adds createdAt & updatedAt fields

const User = mongoose.model("User", UserSchema);
export default User;

