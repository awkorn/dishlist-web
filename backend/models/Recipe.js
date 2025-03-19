import mongoose from "mongoose";

const RecipeSchema = new mongoose.Schema(
  {
    creatorId: { type: String, required: true },
    title: { type: String, required: true },
    ingredients: [
      {
        name: String,
        amount: String,
        unit: String,
      },
    ],
    instructions: [{ type: String }],
    cookTime: { type: Number },
    prepTime: { type: Number },
    servings: { type: Number },
    tags: [{ type: String }],
    dishLists: [{ type: mongoose.Schema.Types.ObjectId, ref: "DishList" }], // Which lists include this recipe
    comments: [
      {
        userId: String,
        username: String,
        content: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    image: {
      url: { type: String, required: false },
      rotation: { type: Number, default: 0 }
    },
  },
  { timestamps: true }
);

const Recipe = mongoose.model("Recipe", RecipeSchema);
export default Recipe;
