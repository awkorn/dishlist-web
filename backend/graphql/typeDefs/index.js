import { mergeTypeDefs } from "@graphql-tools/merge";
import dishListTypeDefs from "./dishListTypeDefs.js";
import userTypeDefs from "./userTypeDefs.js";
import recipeTypeDefs from "./recipeTypeDefs.js";
import notificationTypeDefs from "./notificationTypeDefs.js";

const typeDefs = mergeTypeDefs([
  dishListTypeDefs,
  userTypeDefs,
  recipeTypeDefs,
  notificationTypeDefs,
]);

export default typeDefs;
