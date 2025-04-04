import { gql } from "@apollo/client";

export const GET_USER_PROFILE = gql`
  query GetUserProfile($userId: String!, $viewerId: String!) {
    getUserProfile(userId: $userId, viewerId: $viewerId) {
      id
      firebaseUid
      email
      username
      bio
      profilePicture
      ownedDishLists
      collaboratedDishLists
      savedRecipes
      followingDishLists
      dishListCount
      recipeCount
      visibleDishLists {
        id
        title
        isPinned
        collaborators
        followers
        userId
        visibility
        description
      }
      visibleRecipes {
        id
        title
        ingredients {
          name
          amount
          unit
        }
        instructions
        cookTime
        prepTime
        servings
        tags
        image {
          url
          rotation
        }
        creatorId
      }
    }
  }
`;
