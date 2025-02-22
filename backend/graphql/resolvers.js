import DishList from "../models/DishList.js";

const resolvers = {
  Query: {
    getDishLists: async (_, { userId }) => {
      return await DishList.find({ userId });
    },
  },

  Mutation: {
    addDishList: async (_, { userId, title, isPinned }) => {
      const newDishList = new DishList({ userId, title, isPinned });
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
  },
};

export default resolvers;
