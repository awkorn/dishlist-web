import { DishList, User, Recipe, Notification } from "../../models/index.js";

const userResolvers = {
  Query: {
    getUserProfile: async (_, { userId, viewerId }) => {
      try {
        // Get the user
        const user = await User.findOne({ firebaseUid: userId });
        if (!user) throw new Error("User not found");

        // Check if viewer is profile owner
        const isOwnProfile = userId === viewerId;

        let dishListsToDisplay = [];
        let recipesToDisplay = [];
        let dishListCount = 0;
        let recipeCount = 0;

        if (isOwnProfile) {
          // Get all owned dishlists
          const ownedDishLists = await DishList.find({ userId });

          // Get all collaborated dishlists
          const collaboratedDishLists = await DishList.find({
            collaborators: { $in: [userId] },
          });

          dishListsToDisplay = [...ownedDishLists, ...collaboratedDishLists];
          dishListCount = ownedDishLists.length + collaboratedDishLists.length;

          // Get all user's dishlist IDs
          const userDishListIds = [
            ...ownedDishLists.map((list) => list._id),
            ...collaboratedDishLists.map((list) => list._id),
          ];

          // Get only recipes that are still in at least one of the user's dishlists
          recipesToDisplay = await Recipe.find({
            creatorId: userId,
            dishLists: { $elemMatch: { $in: userDishListIds } },
          });

          recipeCount = recipesToDisplay.length;
        } else {
          // Get public dishlists owned by profile user
          const publicDishLists = await DishList.find({
            userId,
            visibility: "public",
          });

          // Get dishlists where viewer is a collaborator
          const collaboratedDishLists = await DishList.find({
            userId,
            collaborators: { $in: [viewerId] },
          });

          // Get dishlists where viewer is a follower
          const followerDishLists = await DishList.find({
            userId,
            followers: { $in: [viewerId] },
          });

          const allAccessibleDishListIds = new Set();

          [
            ...publicDishLists,
            ...collaboratedDishLists,
            ...followerDishLists,
          ].forEach((list) => {
            allAccessibleDishListIds.add(list._id.toString());
          });

          // Get unique dishlist objects
          dishListsToDisplay = await DishList.find({
            _id: { $in: Array.from(allAccessibleDishListIds) },
          });

          // Count visible dishlists
          dishListCount = dishListsToDisplay.length;

          // Get all IDs viewer has access to
          const accessibleDishListIds = dishListsToDisplay.map(
            (list) => list._id
          );

          // Get recipes from those accessible dishlists
          recipesToDisplay = await Recipe.find({
            creatorId: userId,
            dishLists: { $elemMatch: { $in: accessibleDishListIds } },
          });

          recipeCount = recipesToDisplay.length;
        }

        // Return user with additional data
        return {
          id: user._id.toString(),
          firebaseUid: user.firebaseUid,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          ownedDishLists: user.ownedDishLists,
          savedRecipes: user.savedRecipes,
          followingDishLists: user.followingDishLists,
          collaboratedDishLists: user.collaboratedDishLists,
          pendingFollowRequests: user.pendingFollowRequests,
          notificationPreferences: user.notificationPreferences,
          bio: user.bio,
          profilePicture: user.profilePicture,
          visibleDishLists: dishListsToDisplay,
          visibleRecipes: recipesToDisplay,
          dishListCount,
          recipeCount,
        };
      } catch (error) {
        console.error("Error fetching user profile:", error);
        throw new Error("Could not fetch user profile");
      }
    },

    getUser: async (_, { id }) => {
      return await User.findById(id);
    },

    getUserByEmail: async (_, { email }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error("User not found");
      return user;
    },

    getUserByFirebaseUid: async (_, { firebaseUid }) => {
      const user = await User.findOne({ firebaseUid });
      if (!user) throw new Error("User not found");
      return user;
    },

    // Get users for collaboration/sharing suggestions
    searchUsers: async (_, { searchTerm, limit = 10 }) => {
      if (!searchTerm || searchTerm.length < 2) {
        return [];
      }

      // Search by username or email containing the search term
      return await User.find({
        $or: [
          { username: { $regex: searchTerm, $options: "i" } },
          { email: { $regex: searchTerm, $options: "i" } },
          { firstName: { $regex: searchTerm, $options: "i" } },
          { lastName: { $regex: searchTerm, $options: "i" } },
        ],
      })
        .select(
          "id firebaseUid username email profilePicture firstName lastName"
        )
        .limit(limit);
    },

    // Get a user's owned dishlists
    getUserOwnedDishLists: async (_, { userId }) => {
      const user = await User.findOne({ firebaseUid: userId });
      if (!user) throw new Error("User not found");

      return await DishList.find({
        _id: { $in: user.ownedDishLists },
      });
    },

    // Get a user's collaborated dishlists
    getUserCollaboratedDishLists: async (_, { userId }) => {
      const user = await User.findOne({ firebaseUid: userId });
      if (!user) throw new Error("User not found");

      return await DishList.find({
        _id: { $in: user.collaboratedDishLists },
      });
    },

    // Get a user's followed dishlists
    getUserFollowedDishLists: async (_, { userId }) => {
      const user = await User.findOne({ firebaseUid: userId });
      if (!user) throw new Error("User not found");

      return await DishList.find({
        _id: { $in: user.followingDishLists },
      });
    },

    // Get a user's pending follow requests
    getUserPendingFollowRequests: async (_, { userId }) => {
      const user = await User.findOne({ firebaseUid: userId });
      if (!user) throw new Error("User not found");

      return await DishList.find({
        _id: { $in: user.pendingFollowRequests },
      });
    },

    // Check if a username is already available
    checkUsernameAvailability: async (_, { username }) => {
      const existingUser = await User.findOne({ username });
      return !existingUser; // Returns true if username is available
    },
  },

  Mutation: {
    createUser: async (
      _,
      { firebaseUid, email, username, firstName, lastName }
    ) => {
      try {
        // Check if username is already taken
        const existingUsername = await User.findOne({ username });

        if (existingUsername) {
          throw new Error(
            "Username is already taken. Please choose another one."
          );
        }

        let user = await User.findOne({ firebaseUid });

        if (!user) {
          console.log("Creating new user in MongoDB:", email);

          user = new User({
            firebaseUid,
            email,
            username,
            firstName,
            lastName,
            followingDishLists: [],
            ownedDishLists: [],
            savedRecipes: [],
            collaboratedDishLists: [],
            pendingFollowRequests: [],
            notificationPreferences: {
              collaborationInvites: true,
              recipeAdditions: true,
              newFollowers: true,
              systemAnnouncements: true,
            },
          });

          // Create a default "My Recipes" dishlist for new users
          const defaultDishList = new DishList({
            userId: firebaseUid,
            title: "My Recipes",
            isPinned: true,
            visibility: "private",
          });

          const savedDishList = await defaultDishList.save();

          // Add the default dishlist to the user's owned dishlists
          user.ownedDishLists.push(savedDishList._id);

          await user.save();
        }

        return user;
      } catch (error) {
        console.error("Error creating user:", error);
        throw new Error(error.message || "Could not create user");
      }
    },

    saveRecipe: async (_, { userId, recipeId }) => {
      try {
        // Add to saved recipes array
        const user = await User.findOneAndUpdate(
          { firebaseUid: userId },
          { $addToSet: { savedRecipes: recipeId } },
          { new: true }
        );

        // Find My Recipes dishlist
        const myRecipesDishList = await DishList.findOne({
          userId,
          title: "My Recipes",
        });

        if (!myRecipesDishList)
          throw new Error("My Recipes dishlist not found");

        // Add recipe to the dishlist
        await Recipe.findByIdAndUpdate(
          recipeId,
          { $addToSet: { dishLists: myRecipesDishList._id } },
          { new: true }
        );

        return user;
      } catch (error) {
        console.error("Error saving recipe:", error);
        throw new Error("Failed to save recipe");
      }
    },

    unsaveRecipe: async (_, { userId, recipeId }) => {
      try {
        // Find user by firebaseUid
        const user = await User.findOneAndUpdate(
          { firebaseUid: userId },
          { $pull: { savedRecipes: recipeId } },
          { new: true }
        );

        if (!user) {
          throw new Error("User not found");
        }

        // Find user's "My Recipes" dishlist
        const myRecipesDishList = await DishList.findOne({
          userId, // This is firebaseUid
          title: "My Recipes",
        });

        if (myRecipesDishList) {
          // Remove recipe from the dishlist
          await Recipe.findByIdAndUpdate(recipeId, {
            $pull: { dishLists: myRecipesDishList._id },
          });
        }

        return user;
      } catch (error) {
        console.error("Error unsaving recipe:", error);
        throw new Error(`Failed to unsave recipe: ${error.message}`);
      }
    },

    updateUserProfile: async (_, { userId, username, bio, profilePicture }) => {
      const updates = {};
      if (username) updates.username = username;
      if (bio !== undefined) updates.bio = bio;
      if (profilePicture !== undefined) updates.profilePicture = profilePicture;

      return await User.findOneAndUpdate({ firebaseUid: userId }, updates, {
        new: true,
      });
    },

    updateNotificationPreferences: async (_, { userId, preferences }) => {
      // Get current preferences to merge with updates
      const user = await User.findOne({ firebaseUid: userId });
      if (!user) throw new Error("User not found");

      // Merge existing preferences with updates
      const updatedPreferences = {
        ...user.notificationPreferences,
        ...preferences,
      };

      return await User.findOneAndUpdate(
        { firebaseUid: userId },
        { notificationPreferences: updatedPreferences },
        { new: true }
      );
    },

    // Handle accepting a collaboration invitation
    acceptCollaboration: async (_, { userId, dishListId }) => {
      // First verify the user was actually invited
      const dishList = await DishList.findById(dishListId);
      if (!dishList) throw new Error("DishList not found");

      // Check if user is in pendingCollaborators rather than collaborators
      if (
        !dishList.pendingCollaborators ||
        !dishList.pendingCollaborators.includes(userId)
      ) {
        throw new Error(
          "You don't have a pending invitation for this dishlist"
        );
      }

      // Move user from pendingCollaborators to collaborators
      await DishList.findByIdAndUpdate(dishListId, {
        $pull: { pendingCollaborators: userId },
        $addToSet: { collaborators: userId },
      });

      // Add dishlist to user's collaborated lists
      const updatedUser = await User.findOneAndUpdate(
        { firebaseUid: userId },
        { $addToSet: { collaboratedDishLists: dishListId } },
        { new: true }
      );

      // Notify the owner
      await Notification.create({
        userId: dishList.userId,
        type: "invite_response",
        message: `A user accepted your invitation to collaborate on "${dishList.title}"`,
        relatedId: dishListId,
      });

      return updatedUser;
    },

    // Handle declining a collaboration invitation
    declineCollaboration: async (_, { userId, dishListId }) => {
      // Remove user from dishlist's pendingCollaborators (not collaborators)
      const dishList = await DishList.findByIdAndUpdate(
        dishListId,
        { $pull: { pendingCollaborators: userId } },
        { new: true }
      );

      if (!dishList) throw new Error("DishList not found");

      return true;
    },

    // Handle leaving a collaboration
    leaveCollaboration: async (_, { userId, dishListId }) => {
      // Remove user from dishlist's collaborators
      const dishList = await DishList.findByIdAndUpdate(
        dishListId,
        { $pull: { collaborators: userId } },
        { new: true }
      );

      if (!dishList) throw new Error("DishList not found");

      // Remove dishlist from user's collaborated lists
      await User.findOneAndUpdate(
        { firebaseUid: userId },
        { $pull: { collaboratedDishLists: dishListId } }
      );

      return true;
    },
  },
};

export default userResolvers;
