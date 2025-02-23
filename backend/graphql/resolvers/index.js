import { mergeResolvers } from "@graphql-tools/merge";
import dishListResolvers from "./dishListResolvers.js";

const resolvers = mergeResolvers([dishListResolvers]);

export default resolvers;