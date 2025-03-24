import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useAuth } from '../../../../contexts/AuthProvider';
import { toast } from 'react-toastify';
import { CREATE_RECIPE, ADD_RECIPE_TO_DISHLIST } from '../../../../graphql/mutations/recipe';
import { GET_USER_DISHLISTS } from '../../../../graphql/queries/dishLists';
import styles from './SaveToDishListPanel.module.css';

const SaveToDishListPanel = ({ recipe, onClose }) => {
  const { currentUser } = useAuth();
  const [selectedDishList, setSelectedDishList] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDishLists, setFilteredDishLists] = useState([]);
  const [allDishLists, setAllDishLists] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch user's dishlists
  const { loading, error, data } = useQuery(GET_USER_DISHLISTS, {
    variables: { userId: currentUser?.uid },
    skip: !currentUser?.uid,
  });

  const [createRecipe] = useMutation(CREATE_RECIPE);
  const [addRecipeToDishList] = useMutation(ADD_RECIPE_TO_DISHLIST);

  // Process dishlists when data is fetched
  useEffect(() => {
    if (data) {
      const ownedLists = data.getUserOwnedDishLists || [];
      const collaboratedLists = data.getUserCollaboratedDishLists || [];

      // Add a type property to distinguish between owned and collaborated lists
      const ownedWithType = ownedLists.map((list) => ({
        ...list,
        type: 'owned',
      }));
      const collaboratedWithType = collaboratedLists.map((list) => ({
        ...list,
        type: 'collaborated',
      }));

      // Sort pinned lists first, then alphabetically
      const sortedOwnedLists = ownedWithType.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return a.title.localeCompare(b.title);
      });

      // Combine both lists
      const combinedLists = [...sortedOwnedLists, ...collaboratedWithType];
      setAllDishLists(combinedLists);
      setFilteredDishLists(combinedLists);

      // Auto-select "My Recipes" dishlist if it exists
      const myRecipes = sortedOwnedLists.find(list => list.title === 'My Recipes');
      if (myRecipes && !selectedDishList) {
        setSelectedDishList(myRecipes.id);
      } else if (sortedOwnedLists.length > 0 && !selectedDishList) {
        setSelectedDishList(sortedOwnedLists[0].id);
      }
    }
  }, [data, selectedDishList]);

  // Filter dishlists based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDishLists(allDishLists);
    } else {
      const filtered = allDishLists.filter((list) =>
        list.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDishLists(filtered);
    }
  }, [searchTerm, allDishLists]);

  // Handle saving the recipe
  const handleSaveRecipe = async () => {
    if (!selectedDishList) {
      toast.error('Please select a DishList');
      return;
    }

    try {
      setIsSaving(true);

      // Format ingredients for GraphQL
      const formattedIngredients = recipe.ingredients.map(ingredient => {
        // Check if ingredient is already an object or just a string
        if (typeof ingredient === 'string') {
          return {
            name: ingredient,
            amount: '',
            unit: ''
          };
        }
        return ingredient;
      });

      // Create the recipe first
      const { data: recipeData } = await createRecipe({
        variables: {
          creatorId: currentUser?.uid,
          title: recipe.title,
          ingredients: formattedIngredients,
          instructions: recipe.instructions,
          cookTime: recipe.cookTime || null,
          prepTime: recipe.prepTime || null,
          servings: recipe.servings || null,
          tags: recipe.tags || [],
          image: recipe.image || null
        }
      });

      if (recipeData?.createRecipe?.id) {
        // Then add it to the selected dishlist
        await addRecipeToDishList({
          variables: {
            recipeId: recipeData.createRecipe.id,
            dishListId: selectedDishList,
            userId: currentUser?.uid
          }
        });

        toast.success('Recipe saved successfully!');
        onClose();
      }
    } catch (err) {
      console.error('Error saving recipe:', err);
      toast.error('Failed to save recipe. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.overlay}>
        <div className={styles.panel}>
          <div className={styles.loadingMessage}>Loading your DishLists...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.overlay}>
        <div className={styles.panel}>
          <div className={styles.header}>
            <h3>Save to DishList</h3>
            <button className={styles.closeBtn} onClick={onClose}>×</button>
          </div>
          <div className={styles.errorMessage}>
            Error loading DishLists. Please try again.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <h3>Save to DishList</h3>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.content}>
          <p className={styles.description}>
            Choose where to save "{recipe.title}"
          </p>

          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search your DishLists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.dishlistsContainer}>
            {filteredDishLists.length > 0 ? (
              <ul className={styles.dishlistsList}>
                {filteredDishLists.map((list) => (
                  <li
                    key={list.id}
                    className={`${styles.dishlistItem} ${
                      selectedDishList === list.id ? styles.selectedDishlist : ''
                    }`}
                    onClick={() => setSelectedDishList(list.id)}
                  >
                    <span className={styles.dishlistTitle}>
                      {list.title}
                      {list.isPinned && <span className={styles.pinnedIndicator}>📌</span>}
                      {list.type === 'collaborated' && (
                        <span className={styles.collaboratorIndicator}>Collaborator</span>
                      )}
                    </span>
                    {selectedDishList === list.id && (
                      <span className={styles.selectedCheck}>✓</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.noResults}>
                No DishLists found. {searchTerm ? 'Try a different search term.' : ''}
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <button
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              className={styles.saveBtn}
              onClick={handleSaveRecipe}
              disabled={!selectedDishList || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Recipe'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveToDishListPanel;