import { gql } from "@apollo/client";

export const GET_USER_PROFILE = gql`
  query GetUserProfile($userId: String!) {
    getUserProfile(userId: $userId) {
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
      publicDishLists {
        id
        title
        isPinned
        collaborators
        followers
        userId
        visibility
        description
      }
      publicRecipes {
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
