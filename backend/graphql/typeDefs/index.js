import { mergeTypeDefs } from "@graphql-tools/merge";
import dishListTypeDefs from "./dishListTypeDefs.js";

const typeDefs = mergeTypeDefs([dishListTypeDefs]);

export default typeDefs;
