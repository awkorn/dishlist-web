import User from "../../models/User.js";

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
  },

  Mutation: {
    createUser: async (_, { firebaseUid, email, username }) => {
      try {
        let user = await User.findOne({ firebaseUid });

        if (!user) {
          console.log("Creating new user in MongoDB:", email);
          user = new User({ firebaseUid, email, username });
          await user.save();
        }

        return user;
      } catch (error) {
        console.error("Error creating user:", error);
        throw new Error("Could not create user");
      }
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
