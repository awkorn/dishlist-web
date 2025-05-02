import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    username: { type: String, unique: true, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },

    followingDishLists: [
      { type: mongoose.Schema.Types.ObjectId, ref: "DishList" },
    ],

    ownedDishLists: [{ type: mongoose.Schema.Types.ObjectId, ref: "DishList" }],
    savedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],

    collaboratedDishLists: [
      { type: mongoose.Schema.Types.ObjectId, ref: "DishList" },
    ],

    pendingFollowRequests: [
      { type: mongoose.Schema.Types.ObjectId, ref: "DishList" },
    ],

    notificationPreferences: {
      collaborationInvites: { type: Boolean, default: true },
      recipeAdditions: { type: Boolean, default: true },
      newFollowers: { type: Boolean, default: true },
      systemAnnouncements: { type: Boolean, default: true },
    },

    bio: { type: String },
    profilePicture: { type: String },
  },
  { timestamps: true } // Auto-adds createdAt & updatedAt fields
);

// Text index for searching for user
UserSchema.index({
  username: "text",
  email: "text",
  firstName: "text",
  lastName: "text",
});

const User = mongoose.model("User", UserSchema);
export default User;
