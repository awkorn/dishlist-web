import { gql } from "@apollo/client";

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile(
    $userId: ID!
    $username: String
    $bio: String
    $profilePicture: String
  ) {
    updateUserProfile(
      userId: $userId
      username: $username
      bio: $bio
      profilePicture: $profilePicture
    ) {
      id
      username
      bio
      profilePicture
    }
  }
`;