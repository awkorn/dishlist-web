import { mergeResolvers } from "@graphql-tools/merge";
import dishListResolvers from "./dishListResolvers.js";
import userResolvers from "./userResolvers.js";

const resolvers = mergeResolvers([dishListResolvers, userResolvers]);

export default resolvers;