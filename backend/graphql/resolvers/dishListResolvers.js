import { DishList } from "../../models/index.js";

const dishListResolvers = {
  Query: {
    getDishLists: async (_, { userId }) => {
      return await DishList.find({
        $or: [{ userId }, { followers: userId }, { collaborators: userId }],
      });
    },
  },

  Mutation: {
    addDishList: async (_, { userId, title, isPinned, collaborators }) => {
      const newDishList = new DishList({ userId, title, isPinned,  collaborators: collaborators || [], });
      return await newDishList.save();
    },

    editDishList: async (_, { id, title }) => {
      return await DishList.findByIdAndUpdate(id, { title }, { new: true });
    },

    removeDishList: async (_, { id }) => {
      await DishList.findByIdAndDelete(id);
      return "DishList deleted successfully";
    },

    pinDishList: async (_, { id }) => {
      return await DishList.findByIdAndUpdate(
        id,
        { isPinned: true },
        { new: true }
      );
    },

    unpinDishList: async (_, { id }) => {
      return await DishList.findByIdAndUpdate(
        id,
        { isPinned: false },
        { new: true }
      );
    },

    followDishList: async (_, { dishListId, userId }) => {
      return await DishList.findByIdAndUpdate(
        dishListId,
        { $addToSet: { followers: userId } }, //prevent duplicates
        { new: true }
      );
    },

    shareDishList: async (_, { dishListId, visibility }) => {
      return await DishList.findByIdAndUpdate(
        dishListId,
        { visibility },
        { new: true }
      );
    },

    inviteCollaborator: async (_, { dishListId, userId }) => {
      return await DishList.findByIdAndUpdate(
        dishListId,
        { $addToSet: { collaborators: userId } }, //prevent duplicates 
        { new: true }
      );
    },
  },
};

export default dishListResolvers;
