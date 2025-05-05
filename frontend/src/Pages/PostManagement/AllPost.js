import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IoSend } from "react-icons/io5";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { BiSolidLike, BiSolidHeart } from "react-icons/bi";
import Modal from "react-modal";
import NavBar from "../../Components/NavBar/NavBar";
import { IoIosCreate } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { GrUpdate } from "react-icons/gr";
import { FiSave } from "react-icons/fi";
import { TbPencilCancel } from "react-icons/tb";
import { FaCommentAlt } from "react-icons/fa";
import { BsGrid, BsListUl } from "react-icons/bs";
import { FaUserCircle } from "react-icons/fa";
import "./AllPost.css";
Modal.setAppElement("#root");

function AllPost() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [postOwners, setPostOwners] = useState({});
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [newComment, setNewComment] = useState({});
  const [editingComment, setEditingComment] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [expandedPosts, setExpandedPosts] = useState({});
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const navigate = useNavigate();
  const loggedInUserID = localStorage.getItem("userID");

  useEffect(() => {
    // Fetch all posts from the backend
    const fetchPosts = async () => {
      try {
        const response = await axios.get("http://localhost:8080/posts");
        setPosts(response.data);
        setFilteredPosts(response.data);

        // Fetch post owners' names
        const userIDs = [...new Set(response.data.map((post) => post.userID))];
        const ownerPromises = userIDs.map((userID) =>
          axios
            .get(`http://localhost:8080/user/${userID}`)
            .then((res) => ({
              userID,
              fullName: res.data.fullname,
            }))
            .catch((error) => {
              if (error.response && error.response.status === 404) {
                // Handle case where user is deleted
                console.warn(
                  `User with ID ${userID} not found. Removing their posts.`
                );
                setPosts((prevPosts) =>
                  prevPosts.filter((post) => post.userID !== userID)
                );
                setFilteredPosts((prevFilteredPosts) =>
                  prevFilteredPosts.filter((post) => post.userID !== userID)
                );
              } else {
                console.error(
                  `Error fetching user details for userID ${userID}:`,
                  error
                );
              }
              return { userID, fullName: "Anonymous" };
            })
        );
        const owners = await Promise.all(ownerPromises);
        const ownerMap = owners.reduce((acc, owner) => {
          acc[owner.userID] = owner.fullName;
          return acc;
        }, {});
        setPostOwners(ownerMap);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    const fetchFollowedUsers = async () => {
      const userID = localStorage.getItem("userID");
      if (userID) {
        try {
          const response = await axios.get(
            `http://localhost:8080/user/${userID}/followedUsers`
          );
          setFollowedUsers(response.data);
        } catch (error) {
          console.error("Error fetching followed users:", error);
        }
      }
    };

    fetchFollowedUsers();
  }, []);

  const handleDelete = async (postId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/posts/${postId}`);
      setPosts(posts.filter((post) => post.id !== postId));
      setFilteredPosts(filteredPosts.filter((post) => post.id !== postId));
      showToast("Post deleted successfully!");
    } catch (error) {
      console.error("Error deleting post:", error);
      showToast("Failed to delete post.");
    }
  };

  const showToast = (message) => {
    // Simple toast implementation - you can replace with a proper toast library
    const toast = document.createElement("div");
    toast.className = "toast-message";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  };

  const handleUpdate = (postId) => {
    navigate(`/updatePost/${postId}`);
  };

  const handleMyPostsToggle = () => {
    if (showMyPosts) {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter((post) => post.userID === loggedInUserID));
    }
    setShowMyPosts(!showMyPosts);
  };

  const handleLike = async (postId) => {
    const userID = localStorage.getItem("userID");
    if (!userID) {
      showToast("Please log in to like a post.");
      return;
    }
    try {
      const response = await axios.put(
        `http://localhost:8080/posts/${postId}/like`,
        null,
        {
          params: { userID },
        }
      );

      // Update the specific post's likes in the state
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, likes: response.data.likes } : post
        )
      );

      setFilteredPosts((prevFilteredPosts) =>
        prevFilteredPosts.map((post) =>
          post.id === postId ? { ...post, likes: response.data.likes } : post
        )
      );
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleFollowToggle = async (postOwnerID) => {
    const userID = localStorage.getItem("userID");
    if (!userID) {
      showToast("Please log in to follow/unfollow users.");
      return;
    }
    try {
      if (followedUsers.includes(postOwnerID)) {
        // Unfollow logic
        await axios.put(`http://localhost:8080/user/${userID}/unfollow`, {
          unfollowUserID: postOwnerID,
        });
        setFollowedUsers(followedUsers.filter((id) => id !== postOwnerID));
        showToast("User unfollowed successfully");
      } else {
        // Follow logic
        await axios.put(`http://localhost:8080/user/${userID}/follow`, {
          followUserID: postOwnerID,
        });
        setFollowedUsers([...followedUsers, postOwnerID]);
        showToast("User followed successfully");
      }
    } catch (error) {
      console.error("Error toggling follow state:", error);
    }
  };

  const handleAddComment = async (postId) => {
    const userID = localStorage.getItem("userID");
    if (!userID) {
      showToast("Please log in to comment.");
      return;
    }
    const content = newComment[postId] || "";
    if (!content.trim()) {
      showToast("Comment cannot be empty.");
      return;
    }
    try {
      const response = await axios.post(
        `http://localhost:8080/posts/${postId}/comment`,
        {
          userID,
          content,
        }
      );

      // Update the specific post's comments in the state
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: response.data.comments }
            : post
        )
      );

      setFilteredPosts((prevFilteredPosts) =>
        prevFilteredPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: response.data.comments }
            : post
        )
      );

      setNewComment({ ...newComment, [postId]: "" });
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    const userID = localStorage.getItem("userID");
    try {
      await axios.delete(
        `http://localhost:8080/posts/${postId}/comment/${commentId}`,
        {
          params: { userID },
        }
      );

      // Update state to remove the deleted comment
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.filter(
                  (comment) => comment.id !== commentId
                ),
              }
            : post
        )
      );

      setFilteredPosts((prevFilteredPosts) =>
        prevFilteredPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.filter(
                  (comment) => comment.id !== commentId
                ),
              }
            : post
        )
      );

      showToast("Comment deleted successfully");
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleSaveComment = async (postId, commentId, content) => {
    try {
      const userID = localStorage.getItem("userID");
      await axios.put(
        `http://localhost:8080/posts/${postId}/comment/${commentId}`,
        {
          userID,
          content,
        }
      );

      // Update the comment in state
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.map((comment) =>
                  comment.id === commentId ? { ...comment, content } : comment
                ),
              }
            : post
        )
      );

      setFilteredPosts((prevFilteredPosts) =>
        prevFilteredPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.map((comment) =>
                  comment.id === commentId ? { ...comment, content } : comment
                ),
              }
            : post
        )
      );

      setEditingComment({});
      showToast("Comment updated successfully");
    } catch (error) {
      console.error("Error saving comment:", error);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter posts based on title, description, or category
    const filtered = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query) ||
        (post.category && post.category.toLowerCase().includes(query))
    );
    setFilteredPosts(filtered);
  };

  const togglePostDetails = (postId) => {
    setExpandedPosts({
      ...expandedPosts,
      [postId]: !expandedPosts[postId],
    });
  };

  const toggleDescriptionExpand = (postId) => {
    setExpandedDescriptions({
      ...expandedDescriptions,
      [postId]: !expandedDescriptions[postId],
    });
  };

  const openModal = (mediaUrl) => {
    setSelectedMedia(mediaUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedMedia(null);
    setIsModalOpen(false);
  };

  // Function to truncate description for display
  const truncateText = (text, maxLength = 150) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <div className="social-app-container">
      <NavBar />

      <div className="main-content">
        <div className="filter-controls">
          <div className="search-section">
            <input
              type="text"
              placeholder="Search posts by title, description, or category"
              value={searchQuery}
              onChange={handleSearch}
              className="search-input"
            />
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <BsGrid />
              </button>
              <button
                className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
              >
                <BsListUl />
              </button>
            </div>
          </div>

          <button
            className={`my-posts-toggle ${showMyPosts ? "active" : ""}`}
            onClick={handleMyPostsToggle}
          >
            {showMyPosts ? "Show All Posts" : "Show My Posts"}
          </button>
        </div>

        <div className={`posts-container ${viewMode}`}>
          {filteredPosts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"></div>
              <p className="empty-state-message">
                No posts found. Be the first to create one!
              </p>
              <button
                className="create-post-btn"
                onClick={() => (window.location.href = "/addNewPost")}
              >
                Create New Post
              </button>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} className="post-card-list">
                <div className="post-header">
                  <div className="user-info">
                    <FaUserCircle className="user-avatar" />
                    <div className="user-details">
                      <h3 className="username">
                        {postOwners[post.userID] || "Anonymous"}
                      </h3>
                      <span className="post-category">
                        {post.category || "Uncategorized"}
                      </span>
                    </div>
                  </div>

                  <div className="post-actions">
                    {post.userID === loggedInUserID ? (
                      <div className="owner-actions">
                        <button
                          className="action-btn edit"
                          onClick={() => handleUpdate(post.id)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(post.id)}
                        >
                          <RiDeleteBin6Fill />
                        </button>
                      </div>
                    ) : (
                      <button
                        className={`follow-btn ${
                          followedUsers.includes(post.userID) ? "following" : ""
                        }`}
                        onClick={() => handleFollowToggle(post.userID)}
                      >
                        {followedUsers.includes(post.userID)
                          ? "Following"
                          : "Follow"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="post-content">
                  <h2 className="post-title">{post.title}</h2>
                  <div className="post-description">
                    <p className="description-text">
                      {expandedDescriptions[post.id]
                        ? post.description
                        : truncateText(post.description)}
                    </p>
                    {post.description && post.description.length > 150 && (
                      <button
                        className="read-more-btn"
                        onClick={() => toggleDescriptionExpand(post.id)}
                      >
                        {expandedDescriptions[post.id]
                          ? "Read Less"
                          : "Read More"}
                      </button>
                    )}
                  </div>
                </div>

                {(post.ingredients || post.recipe) && (
                  <div className="recipe-toggle-section">
                    <button
                      className="recipe-toggle-btn"
                      onClick={() => togglePostDetails(post.id)}
                    >
                      {expandedPosts[post.id] ? "Hide Recipe" : "View Recipe"}
                    </button>

                    {expandedPosts[post.id] && (
                      <div className="recipe-details-panel">
                        {post.ingredients && (
                          <div className="ingredients-section">
                            <h4>Ingredients</h4>
                            <p>{post.ingredients}</p>
                          </div>
                        )}
                        {post.recipe && (
                          <div className="recipe-steps">
                            <h4>Instructions</h4>
                            <p>{post.recipe}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {post.media && post.media.length > 0 && (
                  <div className="media-gallery">
                    {post.media && post.media.length > 0 ? (
                      post.media.slice(0, 4).map((mediaUrl, index) => (
                        <div
                          key={index}
                          className={`media-item ${
                            post.media.length > 4 && index === 3
                              ? "with-overlay"
                              : ""
                          }`}
                          onClick={() => openModal(mediaUrl)}
                        >
                          {mediaUrl.endsWith(".mp4") ? (
                            <video>
                              <source
                                src={`http://localhost:8080${mediaUrl}`}
                                type="video/mp4"
                              />
                            </video>
                          ) : (
                            <img
                              src={`http://localhost:8080${mediaUrl}`}
                              onError={(e) =>
                                (e.target.src =
                                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiubMYRUyjf1CTtydSNKlHSl2Zwn8CUgCk9g&s")
                              }
                              alt={`Post media ${index + 1}`}
                            />
                          )}
                          {post.media.length > 4 && index === 3 && (
                            <div className="more-media-overlay">
                              <span>+{post.media.length - 4}</span>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="media-item default-media">
                        <img
                          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiubMYRUyjf1CTtydSNKlHSl2Zwn8CUgCk9g&s"
                          alt="Default Post"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="post-interaction">
                  <div className="interaction-stats">
                    <div
                      className={`like-btn ${
                        post.likes?.[loggedInUserID] ? "liked" : ""
                      }`}
                      onClick={() => handleLike(post.id)}
                    >
                      <BiSolidHeart className="icon" />
                      <span>
                        {
                          Object.values(post.likes || {}).filter(
                            (liked) => liked
                          ).length
                        }
                      </span>
                    </div>
                    <div className="comment-count">
                      <FaCommentAlt className="icon" />
                      <span>{post.comments?.length || 0}</span>
                    </div>
                  </div>

                  <div className="comment-section">
                    <div className="add-comment">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={newComment[post.id] || ""}
                        onChange={(e) =>
                          setNewComment({
                            ...newComment,
                            [post.id]: e.target.value,
                          })
                        }
                      />
                      <button
                        className="send-comment-btn"
                        onClick={() => handleAddComment(post.id)}
                      >
                        <IoSend />
                      </button>
                    </div>

                    <div className="comments-list">
                      {post.comments?.map((comment) => (
                        <div key={comment.id} className="comment-item">
                          <div className="comment-content">
                            <div className="comment-header">
                              <span className="commenter-name">
                                {comment.userFullName}
                              </span>
                              {(comment.userID === loggedInUserID ||
                                post.userID === loggedInUserID) && (
                                <div className="comment-actions">
                                  {comment.userID === loggedInUserID && (
                                    <>
                                      {editingComment.id === comment.id ? (
                                        <>
                                          <button
                                            className="comment-action-btn save"
                                            onClick={() =>
                                              handleSaveComment(
                                                post.id,
                                                comment.id,
                                                editingComment.content
                                              )
                                            }
                                          >
                                            <FiSave />
                                          </button>
                                          <button
                                            className="comment-action-btn cancel"
                                            onClick={() =>
                                              setEditingComment({})
                                            }
                                          >
                                            <TbPencilCancel />
                                          </button>
                                        </>
                                      ) : (
                                        <button
                                          className="comment-action-btn edit"
                                          onClick={() =>
                                            setEditingComment({
                                              id: comment.id,
                                              content: comment.content,
                                            })
                                          }
                                        >
                                          <GrUpdate />
                                        </button>
                                      )}
                                    </>
                                  )}
                                  {(comment.userID === loggedInUserID ||
                                    post.userID === loggedInUserID) && (
                                    <button
                                      className="comment-action-btn delete"
                                      onClick={() =>
                                        handleDeleteComment(post.id, comment.id)
                                      }
                                    >
                                      <MdDelete />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>

                            {editingComment.id === comment.id ? (
                              <input
                                type="text"
                                className="edit-comment-input"
                                value={editingComment.content}
                                onChange={(e) =>
                                  setEditingComment({
                                    ...editingComment,
                                    content: e.target.value,
                                  })
                                }
                                autoFocus
                              />
                            ) : (
                              <p className="comment-text">{comment.content}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          className="floating-action-btn"
          onClick={() => (window.location.href = "/addNewPost")}
        >
          <IoIosCreate />
        </button>
      </div>

      {/* Modal for displaying full media */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Media Modal"
        className="media-modal"
        overlayClassName="media-modal-overlay"
      >
        <button className="close-modal-btn" onClick={closeModal}>
          ×
        </button>
        {selectedMedia && selectedMedia.endsWith(".mp4") ? (
          <video controls className="modal-media">
            <source
              src={`http://localhost:8080${selectedMedia}`}
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={`http://localhost:8080${selectedMedia}`}
            alt="Full Media"
            className="modal-media"
          />
        )}
      </Modal>
    </div>
  );
}

export default AllPost;
