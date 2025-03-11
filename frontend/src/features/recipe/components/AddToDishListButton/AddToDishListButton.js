import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { ADD_RECIPE_TO_DISHLIST } from '../../../graphql/mutations/recipe';
import DishListSelector from './DishListSelector/DishListSelector';
import styles from './AddToDishListButton.module.css';

const AddToDishListButton = ({ recipeId, currentUserId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDishList, setSelectedDishList] = useState('');

  const [addRecipeToDishList, { loading }] = useMutation(ADD_RECIPE_TO_DISHLIST, {
    onCompleted: () => {
      toast.success('Recipe added to DishList successfully!');
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error(`Error adding recipe to DishList: ${error.message}`);
    }
  });

  const handleAddToDishList = () => {
    if (!selectedDishList) {
      toast.error('Please select a DishList first');
      return;
    }

    addRecipeToDishList({
      variables: {
        recipeId,
        dishListId: selectedDishList,
        userId: currentUserId
      }
    });
  };

  return (
    <>
      <button 
        className={styles.addToDishlistBtn}
        onClick={() => setIsModalOpen(true)}
      >
        Add to DishList
      </button>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.addToDishlistModal}>
            <div className={styles.modalHeader}>
              <h3>Add to DishList</h3>
              <button 
                className={styles.closeModalBtn}
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <p>Select a DishList to add this recipe to:</p>
              
              <div className={styles.dishlistSelectionContainer}>
                <DishListSelector 
                  currentUserId={currentUserId} 
                  onChange={setSelectedDishList}
                  value={selectedDishList}
                />
              </div>
              
              <div className={styles.modalActions}>
                <button 
                  className={styles.cancelBtn}
                  onClick={() => setIsModalOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  className={styles.confirmBtn}
                  onClick={handleAddToDishList}
                  disabled={loading || !selectedDishList}
                >
                  {loading ? 'Adding...' : 'Add Recipe'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddToDishListButton;