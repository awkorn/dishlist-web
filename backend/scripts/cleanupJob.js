import cron from 'node-cron';
import { User, DishList, Recipe } from '../models/index.js';

export const startCleanupJobs = () => {
  // Schedule DishList cleanup to run once a day at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running cleanup jobs...');
    
    try {
      // Clean up orphaned DishLists
      await cleanupOrphanedDishLists();
      
      // Clean up orphaned Recipes
      await cleanupOrphanedRecipes();
      
    } catch (error) {
      console.error('Error during cleanup jobs:', error);
    }
  });
  
  console.log('Cleanup jobs scheduled');
};

// Function to clean up DishLists not associated with any user
const cleanupOrphanedDishLists = async () => {
  console.log('Cleaning up orphaned DishLists...');
  
  try {
    const users = await User.find({}, 'firebaseUid');
    const validUserIds = users.map(user => user.firebaseUid);
    
    const result = await DishList.deleteMany({
      userId: { $nin: validUserIds }
    });
    
    console.log(`DishList cleanup complete. Deleted ${result.deletedCount} orphaned DishLists`);
    return result.deletedCount;
  } catch (error) {
    console.error('Error during DishList cleanup:', error);
    throw error;
  }
};

// Function to clean up Recipes not associated with any DishList
const cleanupOrphanedRecipes = async () => {
  console.log('Cleaning up orphaned Recipes...');
  
  try {
    // Find recipes that have empty dishLists array or dishLists that don't exist anymore
    const allDishLists = await DishList.find({}, '_id');
    const validDishListIds = allDishLists.map(dishList => dishList._id.toString());
    
    // Find recipes where:
    // 1. The dishLists array is empty, OR
    // 2. None of the dishLists in the array exist in the database anymore
    const orphanedRecipes = await Recipe.find({
      $or: [
        { dishLists: { $size: 0 } },
        { dishLists: { $not: { $elemMatch: { $in: validDishListIds } } } }
      ]
    });
    
    console.log(`Found ${orphanedRecipes.length} orphaned recipes`);
    
    // Delete the orphaned recipes
    const result = await Recipe.deleteMany({
      $or: [
        { dishLists: { $size: 0 } },
        { dishLists: { $not: { $elemMatch: { $in: validDishListIds } } } }
      ]
    });
    
    console.log(`Recipe cleanup complete. Deleted ${result.deletedCount} orphaned recipes`);
    return result.deletedCount;
  } catch (error) {
    console.error('Error during Recipe cleanup:', error);
    throw error;
  }
};