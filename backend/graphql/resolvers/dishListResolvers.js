import { DishList, User, Notification, Recipe } from "../../models/index.js";

const dishListResolvers = {
  Query: {
    getDishLists: async (_, { userId }) => {
      return await DishList.find({
        $or: [
          { userId }, // Owner
          { followers: userId }, // Follower
          { collaborators: userId }, // Collaborator
        ],
      });
    },

    // Get public dishlists for discovery
    getPublicDishLists: async (_, { limit = 20, offset = 0 }) => {
      return await DishList.find({ visibility: "public" })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);
    },

    // Get dishlist by ID (with permission check)
    getDishList: async (_, { id, userId }) => {
      const dishList = await DishList.findById(id);

      if (!dishList) {
        throw new Error("DishList not found");
      }

      // Check permissions
      const canView =
        dishList.userId === userId || // Owner
        dishList.collaborators.includes(userId) || // Collaborator
        dishList.followers.includes(userId) || // Follower
        dishList.visibility === "public"; // Public list

      if (!canView) {
        throw new Error("You don't have permission to view this DishList");
      }

      return dishList;
    },

    dishListsRecipeCounts: async (_, { dishListIds, userId }) => {
      try {
        // Check which dishlists the user has access to
        const accessibleDishLists = await DishList.find({
          _id: { $in: dishListIds },
          $or: [
            { userId }, // Owner
            { collaborators: userId }, // Collaborator
            { followers: userId }, // Follower
            { visibility: "public" }, // Public list
          ],
        });

        if (!accessibleDishLists.length) {
          return [];
        }

        const accessibleIds = accessibleDishLists.map((list) => list._id);

        // Find all recipes that belong to any of these dishlists
        const recipes = await Recipe.find({
          dishLists: { $in: accessibleIds },
        });

        // Count recipes for each dishlist
        const countMap = {};
        accessibleIds.forEach((id) => {
          countMap[id.toString()] = 0;
        });

        // Count recipes per dishlist
        recipes.forEach((recipe) => {
          recipe.dishLists.forEach((listId) => {
            const listIdStr = listId.toString();
            if (countMap[listIdStr] !== undefined) {
              countMap[listIdStr]++;
            }
          });
        });

        // Format the response
        return accessibleIds.map((id) => ({
          dishListId: id.toString(),
          count: countMap[id.toString()] || 0,
        }));
      } catch (error) {
        console.error("Error getting dishlist recipe counts:", error);
        throw new Error("Failed to get recipe counts");
      }
    },
  },

  Mutation: {
    addDishList: async (
      _,
      { userId, title, isPinned, collaborators, description, visibility }
    ) => {
      // Validate visibility
      if (visibility !== "public" && visibility !== "private") {
        visibility = "private"; // Default to private if invalid value
      }

      // Create the new dishlist
      const newDishList = new DishList({
        userId,
        title,
        isPinned,
        description: description || "",
        visibility,
        collaborators: collaborators || [],
      });

      const savedDishList = await newDishList.save();

      // Update user's ownedDishLists
      await User.findOneAndUpdate(
        { firebaseUid: userId },
        { $addToSet: { ownedDishLists: savedDishList._id } }
      );

      // Create notifications for collaborators if any
      if (collaborators && collaborators.length > 0) {
        const notifications = collaborators.map((collabId) => ({
          userId: collabId,
          type: "invite",
          message: `You've been invited to collaborate on the dishlist "${title}"`,
          relatedId: savedDishList._id.toString(),
        }));

        await Notification.insertMany(notifications);
      }

      return savedDishList;
    },

    editDishList: async (_, { id, title, description, userId, visibility }) => {
      // First, check if user has permission to edit
      const dishList = await DishList.findById(id);

      if (!dishList) {
        throw new Error("DishList not found");
      }

      if (dishList.userId !== userId) {
        throw new Error("Only the owner can edit dishlist details");
      }

      // Validate visibility
      if (visibility !== "public" && visibility !== "private") {
        visibility = "private"; // Default to private if invalid value
      }

      const updates = {};
      if (title) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (visibility) updates.visibility = visibility;

      return await DishList.findByIdAndUpdate(id, updates, { new: true });
    },

    removeDishList: async (_, { id, userId }) => {
      // First, check if user has permission to delete
      const dishList = await DishList.findById(id);

      if (!dishList) {
        throw new Error("DishList not found");
      }

      if (dishList.userId !== userId) {
        throw new Error("Only the owner can delete this dishlist");
      }

      // Check if this is the "My Recipes" dishlist
      if (dishList.title === "My Recipes") {
        throw new Error("The 'My Recipes' dishlist cannot be deleted");
      }

      // Remove dishlist from owner's ownedDishLists
      await User.findOneAndUpdate(
        { firebaseUid: userId },
        { $pull: { ownedDishLists: id } }
      );

      // Remove dishlist from collaborators' collaboratedDishLists
      if (dishList.collaborators.length > 0) {
        await User.updateMany(
          { firebaseUid: { $in: dishList.collaborators } },
          { $pull: { collaboratedDishLists: id } }
        );
      }

      // Remove dishlist from followers' followingDishLists
      if (dishList.followers.length > 0) {
        await User.updateMany(
          { firebaseUid: { $in: dishList.followers } },
          { $pull: { followingDishLists: id } }
        );
      }

      await DishList.findByIdAndDelete(id);
      return "DishList deleted successfully";
    },

    pinDishList: async (_, { id, userId }) => {
      // Check if user has permission (should be owner)
      const dishList = await DishList.findById(id);

      if (!dishList) {
        throw new Error("DishList not found");
      }

      if (dishList.userId !== userId) {
        throw new Error("Only the owner can pin this dishlist");
      }

      return await DishList.findByIdAndUpdate(
        id,
        { isPinned: true },
        { new: true }
      );
    },

    unpinDishList: async (_, { id, userId }) => {
      // Check if user has permission (should be owner)
      const dishList = await DishList.findById(id);

      if (!dishList) {
        throw new Error("DishList not found");
      }

      if (dishList.title === "My Recipes") {
        throw new Error("This dishlist cannot be unpinned");
      }

      if (dishList.userId !== userId) {
        throw new Error("Only the owner can unpin this dishlist");
      }

      return await DishList.findByIdAndUpdate(
        id,
        { isPinned: false },
        { new: true }
      );
    },

    followDishList: async (_, { dishListId, userId }) => {
      // Check if the dishlist exists and is public
      const dishList = await DishList.findById(dishListId);

      if (!dishList) {
        throw new Error("DishList not found");
      }

      // Make sure the user can follow this list
      const canFollow = dishList.visibility === "public";

      if (!canFollow) {
        throw new Error(
          "You cannot follow this dishlist due to its visibility settings"
        );
      }

      // Add dishlist to user's following lists
      await User.findOneAndUpdate(
        { firebaseUid: userId },
        { $addToSet: { followingDishLists: dishListId } }
      );

      // Add user to dishlist's followers
      const updatedDishList = await DishList.findByIdAndUpdate(
        dishListId,
        { $addToSet: { followers: userId } },
        { new: true }
      );

      // Create notification for dishlist owner
      await Notification.create({
        userId: dishList.userId,
        type: "follow",
        message: `A user started following your dishlist "${dishList.title}"`,
        relatedId: dishListId,
      });

      return updatedDishList;
    },

    unfollowDishList: async (_, { dishListId, userId }) => {
      // Remove user from dishlist's followers
      await DishList.findByIdAndUpdate(dishListId, {
        $pull: { followers: userId },
      });

      // Remove dishlist from user's following lists
      await User.findOneAndUpdate(
        { firebaseUid: userId },
        { $pull: { followingDishLists: dishListId } }
      );

      return true;
    },

    updateVisibility: async (_, { id, visibility, userId }) => {
      // Check if user has permission (should be owner)
      const dishList = await DishList.findById(id);

      if (!dishList) {
        throw new Error("DishList not found");
      }

      if (dishList.userId !== userId) {
        throw new Error("Only the owner can change visibility settings");
      }

      // Validate visibility
      if (visibility !== "public" && visibility !== "private") {
        visibility = "private"; // Default to private if invalid value
      }

      return await DishList.findByIdAndUpdate(
        id,
        { visibility },
        { new: true }
      );
    },

    inviteCollaborator: async (_, { dishListId, targetUserId, userId }) => {
      // Check if user has permission (should be owner)
      const dishList = await DishList.findById(dishListId);

      if (!dishList) {
        throw new Error("DishList not found");
      }

      if (dishList.userId !== userId) {
        throw new Error("Only the owner can invite collaborators");
      }

      // Check if user is already a collaborator
      if (dishList.collaborators.includes(targetUserId)) {
        throw new Error("User is already a collaborator");
      }

      // Check if user already has a pending invite
      if (
        dishList.pendingCollaborators &&
        dishList.pendingCollaborators.includes(targetUserId)
      ) {
        throw new Error("User already has a pending invitation");
      }

      // Add user to dishlist's pendingCollaborators instead of collaborators
      const updatedDishList = await DishList.findByIdAndUpdate(
        dishListId,
        { $addToSet: { pendingCollaborators: targetUserId } },
        { new: true }
      );

      // Create notification for the invited user
      await Notification.create({
        userId: targetUserId,
        type: "invite",
        message: `You've been invited to collaborate on the dishlist "${dishList.title}"`,
        relatedId: dishListId,
      });

      return updatedDishList;
    },

    removeCollaborator: async (_, { dishListId, targetUserId, userId }) => {
      // Check if user has permission (should be owner)
      const dishList = await DishList.findById(dishListId);

      if (!dishList) {
        throw new Error("DishList not found");
      }

      if (dishList.userId !== userId) {
        throw new Error("Only the owner can remove collaborators");
      }

      // Remove user from dishlist's collaborators
      const updatedDishList = await DishList.findByIdAndUpdate(
        dishListId,
        { $pull: { collaborators: targetUserId } },
        { new: true }
      );

      // Remove dishlist from user's collaborated lists
      await User.findOneAndUpdate(
        { firebaseUid: targetUserId },
        { $pull: { collaboratedDishLists: dishListId } }
      );

      return updatedDishList;
    },

    requestToFollow: async (_, { dishListId, userId }) => {
      // Check if the dishlist exists
      const dishList = await DishList.findById(dishListId);

      if (!dishList) {
        throw new Error("DishList not found");
      }

      // Only need to request for private dishlists
      if (dishList.visibility === "public") {
        // For public dishlists, directly follow instead of requesting
        return await dishListResolvers.Mutation.followDishList(_, {
          dishListId,
          userId,
        });
      }

      // Add request to dishlist's followRequests
      await DishList.findByIdAndUpdate(dishListId, {
        $addToSet: { followRequests: userId },
      });

      // Update user's pending follow requests
      await User.findOneAndUpdate(
        { firebaseUid: userId },
        { $addToSet: { pendingFollowRequests: dishListId } }
      );

      // Create notification for dishlist owner
      await Notification.create({
        userId: dishList.userId,
        type: "follow_request",
        message: `A user requested to follow your dishlist "${dishList.title}"`,
        relatedId: dishListId,
      });

      return true;
    },

    approveFollowRequest: async (_, { dishListId, targetUserId, userId }) => {
      // Check if user has permission (should be owner)
      const dishList = await DishList.findById(dishListId);

      if (!dishList) {
        throw new Error("DishList not found");
      }

      if (dishList.userId !== userId) {
        throw new Error("Only the owner can approve follow requests");
      }

      // Remove from follow requests
      await DishList.findByIdAndUpdate(dishListId, {
        $pull: { followRequests: targetUserId },
      });

      // Add to followers
      const updatedDishList = await DishList.findByIdAndUpdate(
        dishListId,
        { $addToSet: { followers: targetUserId } },
        { new: true }
      );

      // Update user's lists
      await User.findOneAndUpdate(
        { firebaseUid: targetUserId },
        {
          $pull: { pendingFollowRequests: dishListId },
          $addToSet: { followingDishLists: dishListId },
        }
      );

      // Create notification for the user
      await Notification.create({
        userId: targetUserId,
        type: "follow_approved",
        message: `Your request to follow the dishlist "${dishList.title}" has been approved`,
        relatedId: dishListId,
      });

      return updatedDishList;
    },

    rejectFollowRequest: async (_, { dishListId, targetUserId, userId }) => {
      // Check if user has permission (should be owner)
      const dishList = await DishList.findById(dishListId);

      if (!dishList) {
        throw new Error("DishList not found");
      }

      if (dishList.userId !== userId) {
        throw new Error("Only the owner can reject follow requests");
      }

      // Remove from follow requests
      await DishList.findByIdAndUpdate(dishListId, {
        $pull: { followRequests: targetUserId },
      });

      // Update user's lists
      await User.findOneAndUpdate(
        { firebaseUid: targetUserId },
        { $pull: { pendingFollowRequests: dishListId } }
      );

      // Create notification for the user
      await Notification.create({
        userId: targetUserId,
        type: "follow_rejected",
        message: `Your request to follow the dishlist "${dishList.title}" has been declined`,
        relatedId: dishListId,
      });

      return true;
    },
  },
};

export default dishListResolvers;
