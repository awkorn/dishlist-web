import { mergeTypeDefs } from "@graphql-tools/merge";
import dishListTypeDefs from "./dishListTypeDefs.js";
import userTypeDefs from "./userTypeDefs.js";

const typeDefs = mergeTypeDefs([dishListTypeDefs, userTypeDefs]);

export default typeDefs;
