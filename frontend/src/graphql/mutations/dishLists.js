import { gql } from "@apollo/client";

export const ADD_DEFAULT_DISHLIST = gql`
  mutation AddDishList(
    $userId: String!
    $title: String!
    $isPinned: Boolean!
    $visibility: String!
  ) {
    addDishList(
      userId: $userId
      title: $title
      isPinned: $isPinned
      visibility: $visibility
    ) {
      id
      title
      isPinned
      visibility
    }
  }
`;

export const ADD_DISHLIST = gql`
mutation AddDishList(
  $userId: String!
  $title: String!
  $isPinned: Boolean!
  $description: String
  $visibility: String!
) {
  addDishList(
    userId: $userId
    title: $title
    isPinned: $isPinned
    description: $description
    visibility: $visibility
  ) {
    id
    userId
    title
    isPinned
    description
    visibility
  }
}
`;

export const DELETE_DISHLIST = gql`
mutation RemoveDishList($id: ID!, $userId: String!) {
  removeDishList(id: $id, userId: $userId) {
    id
  }
}
`;

export const EDIT_DISHLIST = gql`
  mutation EditDishList(
    $id: ID!
    $title: String!
    $userId: String!
    $description: String
  ) {
    editDishList(
      id: $id
      title: $title
      userId: $userId
      description: $description
    ) {
      id
      title
      userId
      description
    }
  }
`;

export const PIN_DISHLIST = gql`
  mutation PinDishList($id: ID!, $userId: String!) {
    pinDishList(id: $id, userId: $userId) {
      id
      isPinned
    }
  }
`;

export const UNPIN_DISHLIST = gql`
  mutation UnpinDishList($id: ID!, $userId: String!) {
    unpinDishList(id: $id, userId: $userId) {
      id
      isPinned
    }
  }
`;


export const FOLLOW_DISHLIST = gql`
  mutation FollowDishList($dishListId: ID!, $userId: String!) {
    followDishList(dishListId: $dishListId, userId: $userId) {
      id
      followers
    }
  }
`;

export const UNFOLLOW_DISHLIST = gql`
  mutation UnfollowDishList($dishListId: ID!, $userId: String!) {
    unfollowDishList(dishListId: $dishListId, userId: $userId)
  }
`;

export const REQUEST_TO_FOLLOW = gql`
  mutation RequestToFollow($dishListId: ID!, $userId: String!) {
    requestToFollow(dishListId: $dishListId, userId: $userId)
  }
`;
