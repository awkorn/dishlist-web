//api routes for dishlists
const express = require("express");
const router = express.Router();
const DishList = require("../models/DishList");

//get dishlists for user
router.get("/", async (req, res) => {
  const userId = req.headers.authorization?.split("Bearer ")[1];
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const dishLists = await DishList.find({ userId });
    res.json(dishLists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//add a dishlist
router.post("/", async (req, res) => {
  const userId = req.headers.authorization?.split("Bearer")[1];
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const { title } = req.body;
  const newDishList = new DishList({ userId, title });

  try {
    const savedDishList = await newDishList.save();
    res.status(201).json(savedDishList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//delete a dishlist
router.delete("/:id", async (req, res) => {
  try {
    await DishList.findByIdAndDelete(req.params.id);
    res.json({ message: "Dishlist deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
