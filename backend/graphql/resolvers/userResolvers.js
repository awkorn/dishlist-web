import User from "../../models/User.js";

const userResolvers = {
  Query: {
    getUser: async (_, { id }) => {
      return await User.findById(id);
    },
    getUserByEmail: async (_, { email }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error("User not found");
      return { id: user.id };
    },
  },

  Mutation: {
    followDishList: async (_, { userId, dishListId }) => {
      return await User.findByIdAndUpdate(
        userId,
        { $addToSet: { followingDishLists: dishListId } },
        { new: true }
      );
    },
    saveRecipe: async (_, { userId, recipeId }) => {
      return await User.findByIdAndUpdate(
        userId,
        { $addToSet: { savedRecipes: recipeId } },
        { new: true }
      );
    },
  },
};

export default userResolvers;
