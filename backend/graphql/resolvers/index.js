import { mergeResolvers } from "@graphql-tools/merge";
import dishListResolvers from "./dishListResolvers.js";
import userResolvers from "./userResolvers.js";
import recipeResolvers from "./recipeResolvers.js";
import notificationResolvers from "./notificationResolvers.js";

const resolvers = mergeResolvers([
  dishListResolvers,
  userResolvers,
  recipeResolvers,
  notificationResolvers,
]);

export default resolvers;
