import { DishList, User } from "../../models/index.js";

const userResolvers = {
  Query: {
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
          { username: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } }
        ]
      })
      .select('id firebaseUid username email profilePicture') // Limited fields for privacy
      .limit(limit);
    },
    
    // Get a user's owned dishlists
    getUserOwnedDishLists: async (_, { userId }) => {
      const user = await User.findOne({ firebaseUid: userId });
      if (!user) throw new Error("User not found");
      
      return await DishList.find({ 
        _id: { $in: user.ownedDishLists } 
      });
    },
    
    // Get a user's collaborated dishlists
    getUserCollaboratedDishLists: async (_, { userId }) => {
      const user = await User.findOne({ firebaseUid: userId });
      if (!user) throw new Error("User not found");
      
      return await DishList.find({ 
        _id: { $in: user.collaboratedDishLists } 
      });
    },
    
    // Get a user's followed dishlists
    getUserFollowedDishLists: async (_, { userId }) => {
      const user = await User.findOne({ firebaseUid: userId });
      if (!user) throw new Error("User not found");
      
      return await DishList.find({ 
        _id: { $in: user.followingDishLists } 
      });
    },
    
    // Get a user's pending follow requests
    getUserPendingFollowRequests: async (_, { userId }) => {
      const user = await User.findOne({ firebaseUid: userId });
      if (!user) throw new Error("User not found");
      
      return await DishList.find({ 
        _id: { $in: user.pendingFollowRequests } 
      });
    }
  },

  Mutation: {
    createUser: async (_, { firebaseUid, email, username }) => {
      try {
        let user = await User.findOne({ firebaseUid });

        if (!user) {
          console.log("Creating new user in MongoDB:", email);
          
          // Create default empty arrays for new fields
          user = new User({ 
            firebaseUid, 
            email, 
            username, 
            followingDishLists: [],
            ownedDishLists: [],
            savedRecipes: [],
            collaboratedDishLists: [],
            pendingFollowRequests: [],
            notificationPreferences: {
              collaborationInvites: true,
              dishListShares: true,
              recipeAdditions: true,
              newFollowers: true,
              systemAnnouncements: true
            }
          });
          
          // Create a default "My Recipes" dishlist for new users
          const defaultDishList = new DishList({
            userId: firebaseUid,
            title: "My Recipes",
            isPinned: true,
            visibility: "private"
          });
          
          const savedDishList = await defaultDishList.save();
          
          // Add the default dishlist to the user's owned dishlists
          user.ownedDishLists.push(savedDishList._id);
          
          await user.save();
        }

        return user;
      } catch (error) {
        console.error("Error creating user:", error);
        throw new Error("Could not create user");
      }
    },

    saveRecipe: async (_, { userId, recipeId }) => {
      return await User.findOneAndUpdate(
        { firebaseUid: userId },
        { $addToSet: { savedRecipes: recipeId } },
        { new: true }
      );
    },
    
    unsaveRecipe: async (_, { userId, recipeId }) => {
      return await User.findOneAndUpdate(
        { firebaseUid: userId },
        { $pull: { savedRecipes: recipeId } },
        { new: true }
      );
    },
    
    updateUserProfile: async (_, { userId, username, bio, profilePicture }) => {
      const updates = {};
      if (username) updates.username = username;
      if (bio !== undefined) updates.bio = bio;
      if (profilePicture !== undefined) updates.profilePicture = profilePicture;
      
      return await User.findOneAndUpdate(
        { firebaseUid: userId },
        updates,
        { new: true }
      );
    },
    
    updateNotificationPreferences: async (_, { userId, preferences }) => {
      // Get current preferences to merge with updates
      const user = await User.findOne({ firebaseUid: userId });
      if (!user) throw new Error("User not found");
      
      // Merge existing preferences with updates
      const updatedPreferences = {
        ...user.notificationPreferences,
        ...preferences
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
      
      if (!dishList.collaborators.includes(userId)) {
        throw new Error("You are not invited to collaborate on this dishlist");
      }
      
      // Add dishlist to user's collaborated lists if not already there
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
        relatedId: dishListId
      });
      
      return updatedUser;
    },
    
    // Handle declining a collaboration invitation
    declineCollaboration: async (_, { userId, dishListId }) => {
      // Remove user from dishlist's collaborators
      const dishList = await DishList.findByIdAndUpdate(
        dishListId,
        { $pull: { collaborators: userId } },
        { new: true }
      );
      
      if (!dishList) throw new Error("DishList not found");
      
      // Notify the owner
      await Notification.create({
        userId: dishList.userId,
        type: "invite_response",
        message: `A user declined your invitation to collaborate on "${dishList.title}"`,
        relatedId: dishListId
      });
      
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
      
      // Notify the owner
      await Notification.create({
        userId: dishList.userId,
        type: "collaboration_update",
        message: `A collaborator has left your dishlist "${dishList.title}"`,
        relatedId: dishListId
      });
      
      return true;
    }
  },
};

export default userResolvers;