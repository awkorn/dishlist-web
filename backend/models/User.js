import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    firebaseUid: { type: String, unique: true, required: true }, // Firebase UID
    email: { type: String, unique: true, required: true }, // User's email
    username: { type: String, required: true }, // Display name
    followingDishLists: [{ type: mongoose.Schema.Types.ObjectId, ref: "DishList" }], // Lists user follows
    ownedDishLists: [{ type: mongoose.Schema.Types.ObjectId, ref: "DishList" }], // Lists user owns
    savedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }], // Recipes user saved
    
    collaboratedDishLists: [{ type: mongoose.Schema.Types.ObjectId, ref: "DishList" }], // Lists where user is a collaborator
    pendingFollowRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "DishList" }], // DishLists user has requested to follow
    notificationPreferences: {
        collaborationInvites: { type: Boolean, default: true },
        dishListShares: { type: Boolean, default: true },
        recipeAdditions: { type: Boolean, default: true },
        newFollowers: { type: Boolean, default: true },
        systemAnnouncements: { type: Boolean, default: true }
    },
    bio: { type: String }, // Brief user description/profile
    profilePicture: { type: String }, // URL to profile image
}, { timestamps: true }); // Auto-adds createdAt & updatedAt fields

const User = mongoose.model("User", UserSchema);
export default User;
