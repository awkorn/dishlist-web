import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { UNFOLLOW_DISHLIST, REQUEST_TO_FOLLOW } from "../../../../graphql/mutations/dishLists";
import { 
  LEAVE_COLLABORATION, 
  INVITE_COLLABORATOR, 
  UPDATE_VISIBILITY 
} from "../../../../graphql/mutations/dishListDetail";
import { useAuth } from "../../../../contexts/AuthProvider";
import "./DishListActions.css";

const DishListActions = ({ dishList, userRole, currentUserId }) => {
  const navigate = useNavigate();
  const { refreshUserData } = useAuth();
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);
  const [selectedVisibility, setSelectedVisibility] = useState(dishList.visibility);
  
  // Mutations
  const [unfollowDishList, { loading: unfollowLoading }] = useMutation(UNFOLLOW_DISHLIST, {
    onCompleted: () => {
      toast.success("Unfollowed DishList");
      refreshUserData();
      navigate("/dishlists");
    },
    onError: (error) => {
      toast.error(`Error unfollowing: ${error.message}`);
    }
  });
  
  const [requestToFollow, { loading: requestLoading }] = useMutation(REQUEST_TO_FOLLOW, {
    onCompleted: () => {
      toast.success("Follow request sent");
      refreshUserData();
    },
    onError: (error) => {
      toast.error(`Error requesting to follow: ${error.message}`);
    }
  });
  
  const [leaveCollaboration, { loading: leaveLoading }] = useMutation(LEAVE_COLLABORATION, {
    onCompleted: () => {
      toast.success("Left collaboration");
      refreshUserData();
      navigate("/dishlists");
    },
    onError: (error) => {
      toast.error(`Error leaving collaboration: ${error.message}`);
    }
  });
  
  const [inviteCollaborator, { loading: inviteLoading }] = useMutation(INVITE_COLLABORATOR, {
    onCompleted: () => {
      toast.success("Collaborator invited");
      setShowCollaboratorModal(false);
      setCollaboratorEmail("");
    },
    onError: (error) => {
      toast.error(`Error inviting collaborator: ${error.message}`);
    }
  });
  
  const [updateVisibility, { loading: visibilityLoading }] = useMutation(UPDATE_VISIBILITY, {
    onCompleted: () => {
      toast.success("Visibility updated");
      setShowVisibilityModal(false);
    },
    onError: (error) => {
      toast.error(`Error updating visibility: ${error.message}`);
    }
  });
  
  const handleUnfollow = () => {
    if (unfollowLoading) return;
    
    if (window.confirm("Are you sure you want to unfollow this DishList?")) {
      unfollowDishList({
        variables: {
          dishListId: dishList.id,
          userId: currentUserId
        }
      });
    }
  };
  
  const handleRequestFollow = () => {
    if (requestLoading) return;
    
    requestToFollow({
      variables: {
        dishListId: dishList.id,
        userId: currentUserId
      }
    });
  };
  
  const handleLeaveCollaboration = () => {
    if (leaveLoading) return;
    
    if (window.confirm("Are you sure you want to leave this collaboration?")) {
      leaveCollaboration({
        variables: {
          userId: currentUserId,
          dishListId: dishList.id
        }
      });
    }
  };
  
  const handleInviteCollaborator = () => {
    if (inviteLoading || !collaboratorEmail.trim()) return;
    
    // Here you would typically search for a user by email first
    // For simplicity, we'll just call the mutation directly
    // In a real implementation, you'd use a query to find the user's ID first
    
    inviteCollaborator({
      variables: {
        dishListId: dishList.id,
        targetUserId: collaboratorEmail, // This would be the user's ID in reality
        userId: currentUserId
      }
    });
  };
  
  const handleUpdateVisibility = () => {
    if (visibilityLoading) return;
    
    updateVisibility({
      variables: {
        id: dishList.id,
        visibility: selectedVisibility,
        userId: currentUserId
      }
    });
  };
  
  return (
    <div className="dishlist-actions">
      {/* Follower actions */}
      {userRole === "follower" && (
        <button 
          className="action-btn unfollow-btn" 
          onClick={handleUnfollow}
          disabled={unfollowLoading}
        >
          {unfollowLoading ? "Unfollowing..." : "Unfollow DishList"}
        </button>
      )}
      
      {/* Visitor actions */}
      {userRole === "visitor" && (
        <button 
          className="action-btn follow-btn" 
          onClick={handleRequestFollow}
          disabled={requestLoading}
        >
          {requestLoading ? "Requesting..." : (
            dishList.visibility === "public" ? "Follow DishList" : "Request to Follow"
          )}
        </button>
      )}
      
      {/* Collaborator actions */}
      {userRole === "collaborator" && (
        <button 
          className="action-btn leave-btn" 
          onClick={handleLeaveCollaboration}
          disabled={leaveLoading}
        >
          {leaveLoading ? "Leaving..." : "Leave Collaboration"}
        </button>
      )}
      
      {/* Owner actions */}
      {userRole === "owner" && (
        <div className="owner-actions">
          <button 
            className="action-btn" 
            onClick={() => setShowCollaboratorModal(true)}
          >
            Invite Collaborator
          </button>
          
          <button 
            className="action-btn" 
            onClick={() => setShowVisibilityModal(true)}
          >
            Manage Visibility
          </button>
        </div>
      )}
      
      {/* Invite Collaborator Modal */}
      {showCollaboratorModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Invite Collaborator</h3>
            <p>Collaborators can add recipes to this DishList.</p>
            
            <div className="input-group">
              <label htmlFor="collaborator-email">Collaborator Email</label>
              <input
                type="email"
                id="collaborator-email"
                value={collaboratorEmail}
                onChange={(e) => setCollaboratorEmail(e.target.value)}
                placeholder="Enter email address"
              />
            </div>
            
            <div className="modal-actions">
              <button 
                className="cancel-btn" 
                onClick={() => setShowCollaboratorModal(false)}
                disabled={inviteLoading}
              >
                Cancel
              </button>
              <button 
                className="invite-btn" 
                onClick={handleInviteCollaborator}
                disabled={inviteLoading || !collaboratorEmail.trim()}
              >
                {inviteLoading ? "Inviting..." : "Send Invitation"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Visibility Modal */}
      {showVisibilityModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Manage Visibility</h3>
            <p>Control who can see and interact with your DishList.</p>
            
            <div className="visibility-options">
              <div className="visibility-option">
                <input 
                  type="radio" 
                  id="private" 
                  name="visibility" 
                  value="private"
                  checked={selectedVisibility === "private"}
                  onChange={() => setSelectedVisibility("private")}
                />
                <label htmlFor="private">
                  <strong>Private</strong>
                  <p>Only you and collaborators can view</p>
                </label>
              </div>
              
              <div className="visibility-option">
                <input 
                  type="radio" 
                  id="shared" 
                  name="visibility" 
                  value="shared"
                  checked={selectedVisibility === "shared"}
                  onChange={() => setSelectedVisibility("shared")}
                />
                <label htmlFor="shared">
                  <strong>Shared</strong>
                  <p>Only specific people you invite can view</p>
                </label>
              </div>
              
              <div className="visibility-option">
                <input 
                  type="radio" 
                  id="public" 
                  name="visibility" 
                  value="public"
                  checked={selectedVisibility === "public"}
                  onChange={() => setSelectedVisibility("public")}
                />
                <label htmlFor="public">
                  <strong>Public</strong>
                  <p>Anyone can view and follow</p>
                </label>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="cancel-btn" 
                onClick={() => setShowVisibilityModal(false)}
                disabled={visibilityLoading}
              >
                Cancel
              </button>
              <button 
                className="save-btn" 
                onClick={handleUpdateVisibility}
                disabled={visibilityLoading || selectedVisibility === dishList.visibility}
              >
                {visibilityLoading ? "Updating..." : "Update Visibility"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DishListActions;