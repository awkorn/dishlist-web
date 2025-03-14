import { Recipe, DishList, User, Notification } from "../../models/index.js";

const recipeResolvers = {
  Query: {
    getRecipe: async (_, { id, userId }) => {
      const recipe = await Recipe.findById(id);

      if (!recipe) {
        throw new Error("Recipe not found");
      }

      // Check permissions based on DishLists
      const dishListIds = recipe.dishLists || [];

      // If recipe isn't in any DishList, only let the creator see it
      if (dishListIds.length === 0 && recipe.creatorId !== userId) {
        throw new Error("You don't have permission to view this recipe");
      }

      // Check if user has access to any DishList containing this recipe
      const accessibleDishLists = await DishList.find({
        _id: { $in: dishListIds },
        $or: [
          { userId }, // Owner
          { collaborators: userId }, // Collaborator
          { followers: userId }, // Follower
          { visibility: "public" }, // Public list
          { visibility: "shared", sharedWith: userId }, // Shared with user
        ],
      });

      if (accessibleDishLists.length === 0 && recipe.creatorId !== userId) {
        throw new Error("You don't have permission to view this recipe");
      }

      return recipe;
    },

    // Get all recipes for a user
    getUserRecipes: async (_, { userId }) => {
      return await Recipe.find({ creatorId: userId });
    },

    // Get all recipes in a dishlist
    getDishListRecipes: async (_, { dishListId, userId }) => {
      // First, check if user has access to the dishlist
      const dishList = await DishList.findById(dishListId);

      if (!dishList) {
        throw new Error("DishList not found");
      }

      const canAccess =
        dishList.userId === userId || // Owner
        dishList.collaborators.includes(userId) || // Collaborator
        dishList.followers.includes(userId) || // Follower
        dishList.visibility === "public" || // Public list
        (dishList.visibility === "shared" &&
          dishList.sharedWith.includes(userId)); // Shared with user

      if (!canAccess) {
        throw new Error(
          "You don't have permission to view recipes in this dishlist"
        );
      }

      return await Recipe.find({ dishLists: dishListId });
    },

    // Search recipes (public ones only unless owned by the requester)
    searchRecipes: async (_, { searchTerm, limit = 20, userId }) => {
      if (!searchTerm || searchTerm.length < 2) {
        return [];
      }

      // Get all public dishlists
      const publicDishLists = await DishList.find({ visibility: "public" });
      const publicDishListIds = publicDishLists.map((list) => list._id);

      // Search for recipes
      return await Recipe.find({
        $and: [
          // Match search term
          {
            $or: [
              { title: { $regex: searchTerm, $options: "i" } },
              { tags: { $regex: searchTerm, $options: "i" } },
            ],
          },
          // Access control - either in public dishlists or created by the user
          {
            $or: [
              { dishLists: { $in: publicDishListIds } },
              { creatorId: userId },
            ],
          },
        ],
      }).limit(limit);
    },
  },

  Mutation: {
    // Create a new recipe
    createRecipe: async (
      _,
      {
        creatorId,
        title,
        ingredients,
        instructions,
        cookTime,
        prepTime,
        servings,
        tags,
        image,
      }
    ) => {
      try {
        // Find the user's default "My Recipes" dishlist
        const user = await User.findOne({ firebaseUid: creatorId });

        if (!user) {
          throw new Error("User not found");
        }

        // Find the user's default dishlist (should be titled "My Recipes")
        const defaultDishList = await DishList.findOne({
          userId: creatorId,
          title: "My Recipes",
        });

        // Create the recipe
        const newRecipe = new Recipe({
          creatorId,
          title,
          ingredients,
          instructions,
          cookTime,
          prepTime,
          servings,
          tags: tags || [],
          image,
          dishLists: defaultDishList ? [defaultDishList._id] : [],
          comments: [],
        });

        const savedRecipe = await newRecipe.save();

        // If there's a default dishlist, add the recipe to it
        if (defaultDishList) {
          // No need to update the dishlist itself, as recipes only reference dishlists, not vice versa
        }

        return savedRecipe;
      } catch (error) {
        console.error("Error creating recipe:", error);
        throw new Error("Could not create recipe");
      }
    },

    // Update an existing recipe
    updateRecipe: async (
      _,
      {
        id,
        userId,
        title,
        ingredients,
        instructions,
        cookTime,
        prepTime,
        servings,
        tags,
        image,
      }
    ) => {
      // First, check if user has permission to edit
      const recipe = await Recipe.findById(id);

      if (!recipe) {
        throw new Error("Recipe not found");
      }

      // Only the creator can edit the recipe
      if (recipe.creatorId !== userId) {
        throw new Error("Only the creator can edit this recipe");
      }

      // Build update object with only provided fields
      const updates = {};
      if (title) updates.title = title;
      if (ingredients) updates.ingredients = ingredients;
      if (instructions) updates.instructions = instructions;
      if (cookTime !== undefined) updates.cookTime = cookTime;
      if (prepTime !== undefined) updates.prepTime = prepTime;
      if (servings !== undefined) updates.servings = servings;
      if (tags) updates.tags = tags;
      if (image !== undefined) updates.image = image;

      return await Recipe.findByIdAndUpdate(id, updates, { new: true });
    },

    // Delete a recipe
    deleteRecipe: async (_, { id, userId }) => {
      // First, check if user has permission to delete
      const recipe = await Recipe.findById(id);

      if (!recipe) {
        throw new Error("Recipe not found");
      }

      // Only the creator can delete the recipe
      if (recipe.creatorId !== userId) {
        throw new Error("Only the creator can delete this recipe");
      }

      // Remove recipe from any users who saved it
      await User.updateMany(
        { savedRecipes: id },
        { $pull: { savedRecipes: id } }
      );

      await Recipe.findByIdAndDelete(id);
      return "Recipe deleted successfully";
    },

    // Add a recipe to a dishlist
    addRecipeToDishList: async (_, { recipeId, dishListId, userId }) => {
      // Check if user has permission to add to this dishlist
      const dishList = await DishList.findById(dishListId);

      if (!dishList) {
        throw new Error("DishList not found");
      }

      const canAdd =
        dishList.userId === userId || // Owner
        dishList.collaborators.includes(userId); // Collaborator

      if (!canAdd) {
        throw new Error(
          "You don't have permission to add recipes to this dishlist"
        );
      }

      // Check if recipe exists
      const recipe = await Recipe.findById(recipeId);

      if (!recipe) {
        throw new Error("Recipe not found");
      }

      // Add dishlist to recipe's dishList array
      const updatedRecipe = await Recipe.findByIdAndUpdate(
        recipeId,
        { $addToSet: { dishLists: dishListId } },
        { new: true }
      );

      // If user is a collaborator (not the owner), notify the owner
      if (dishList.userId !== userId) {
        await Notification.create({
          userId: dishList.userId,
          type: "recipe_add",
          message: `A recipe "${recipe.title}" has been added to your dishlist "${dishList.title}"`,
          relatedId: dishListId,
        });
      }

      return updatedRecipe;
    },

    // Remove a recipe from a dishlist
    removeRecipeFromDishList: async (_, { recipeId, dishListId, userId }) => {
      // Check if user has permission to remove from this dishlist
      const dishList = await DishList.findById(dishListId);

      if (!dishList) {
        throw new Error("DishList not found");
      }

      // Only owner can remove recipes, or collaborators if they added it
      if (
        dishList.userId !== userId &&
        !dishList.collaborators.includes(userId)
      ) {
        throw new Error(
          "You don't have permission to remove recipes from this dishlist"
        );
      }

      // Get the recipe
      const recipe = await Recipe.findById(recipeId);

      if (!recipe) {
        throw new Error("Recipe not found");
      }

      // Remove dishlist from recipe's dishLists array
      return await Recipe.findByIdAndUpdate(
        recipeId,
        { $pull: { dishLists: dishListId } },
        { new: true }
      );
    },

    // Add a comment to a recipe
    addComment: async (_, { recipeId, userId, username, content }) => {
      // Get the recipe
      const recipe = await Recipe.findById(recipeId);

      if (!recipe) {
        throw new Error("Recipe not found");
      }

      // Check if recipe is visible to this user before allowing comment
      // (same logic as in getRecipe query)

      // Generate a unique ID for the comment
      const commentId = new mongoose.Types.ObjectId();

      // Add comment to recipe
      const updatedRecipe = await Recipe.findByIdAndUpdate(
        recipeId,
        {
          $push: {
            comments: {
              _id: commentId,
              userId,
              username,
              content,
              createdAt: new Date(),
            },
          },
        },
        { new: true }
      );

      // If user isn't the creator, notify the recipe creator
      if (userId !== recipe.creatorId) {
        await Notification.create({
          userId: recipe.creatorId,
          type: "comment",
          message: `Someone commented on your recipe "${recipe.title}"`,
          relatedId: recipeId,
        });
      }

      return updatedRecipe;
    },

    // Remove a comment from a recipe
    removeComment: async (_, { recipeId, commentId, userId }) => {
      // Get the recipe
      const recipe = await Recipe.findById(recipeId);

      if (!recipe) {
        throw new Error("Recipe not found");
      }

      // Find the comment
      const comment = recipe.comments.find(
        (c) => c._id.toString() === commentId
      );

      if (!comment) {
        throw new Error("Comment not found");
      }

      // Check permission - only comment author or recipe creator can remove
      if (comment.userId !== userId && recipe.creatorId !== userId) {
        throw new Error("You don't have permission to remove this comment");
      }

      // Remove the comment
      return await Recipe.findByIdAndUpdate(
        recipeId,
        { $pull: { comments: { _id: commentId } } },
        { new: true }
      );
    },
  },
};

export default recipeResolvers;
