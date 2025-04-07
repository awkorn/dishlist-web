import { gql } from "@apollo/client";

export const REMOVE_RECIPE_FROM_DISHLIST = gql`
  mutation RemoveRecipeFromDishList(
    $recipeId: ID!
    $userId: String!
    $dishListId: ID
  ) {
    removeRecipeFromDishList(
      recipeId: $recipeId
      dishListId: $dishListId
      userId: $userId
    ) {
      id
    }
  }
`;

export const LEAVE_COLLABORATION = gql`
  mutation LeaveCollaboration($userId: String!, $dishListId: ID!) {
    leaveCollaboration(userId: $userId, dishListId: $dishListId)
  }
`;

export const INVITE_COLLABORATOR = gql`
  mutation InviteCollaborator(
    $dishListId: ID!
    $targetUserId: String!
    $userId: String!
  ) {
    inviteCollaborator(
      dishListId: $dishListId
      targetUserId: $targetUserId
      userId: $userId
    ) {
      id
      collaborators
    }
  }
`;

export const UPDATE_VISIBILITY = gql`
  mutation UpdateVisibility($id: ID!, $visibility: String!, $userId: String!) {
    updateVisibility(id: $id, visibility: $visibility, userId: $userId) {
      id
      visibility
    }
  }
`;
