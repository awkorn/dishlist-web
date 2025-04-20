import { gql } from "@apollo/client";

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile(
    $userId: ID!
    $username: String
    $firstName: String
    $lastName: String
    $bio: String
    $profilePicture: String
  ) {
    updateUserProfile(
      userId: $userId
      username: $username
      firstName: $firstName
      lastName: $lastName
      bio: $bio
      profilePicture: $profilePicture
    ) {
      id
      username
      firstName
      lastName
      bio
      profilePicture
    }
  }
`;