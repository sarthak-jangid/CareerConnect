import clientServer, { BASE_URL } from "@/config/api";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import React, { useState } from "react";
import { useEffect } from "react";
import styles from "./index.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { getAllPosts } from "@/redux/actions/postActions";
import {
  getConnectionsRequest,
  getMyConnectionRequests,
  sendConnectionRequest,
} from "@/redux/actions/authActions";

export default function ViewProfilePage({ userProfile }) {
  const router = useRouter();
  const postReducer = useSelector((state) => state.postReducer);
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);

  const [userPosts, setUserPosts] = useState([]);

  const [isCurrentUserInConnection, setIsCurrentUserInConnection] =
    useState(false);

  const [isConnectionNull, setIsConnectionNull] = useState(true);

  //  CHECK: Is this the current user's own profile?
  const isOwnProfile = authState.user?.userId?._id === userProfile.userId._id;

  /**
   * Fetch all posts and load them into Redux store
   * This populates the posts that will be filtered by username
   */
  const getUsersPost = async () => {
    await dispatch(getMyConnectionRequests());
    await dispatch(getConnectionsRequest());
    await dispatch(getAllPosts());
    // Note: sendConnectionRequest is NOT called here
    // It will be called when user clicks "Connect" button
  };

  useEffect(() => {
    // Filter posts by current user's username
    // Safely handle undefined/null postReducer.posts
    const allPosts = postReducer?.posts || [];
    console.log(allPosts);
    let post = allPosts.filter((post) => {
      return post?.userId?._id === userProfile.userId._id;
    });

    console.log(post);

    setUserPosts(post);
  }, [postReducer, router.query.username]);

  useEffect(() => {
    console.log(authState.connections, userProfile.userId._id);
    if (
      authState.connections.some(
        (user) => user.connectionId._id === userProfile.userId._id,
      )
    ) {
      setIsCurrentUserInConnection(true);
      if (
        authState.connections.find(
          (user) => user.connectionId._id === userProfile.userId._id,
        ).status_accepted === true
      ) {
        setIsConnectionNull(false);
      }
    }

    if (
      authState.connectionRequest.some(
        (user) => user.userId._id === userProfile.userId._id,
      )
    ) {
      setIsCurrentUserInConnection(true);
      if (
        authState.connectionRequest.find(
          (user) => user.userId._id === userProfile.userId._id,
        ).status_accepted === true
      ) {
        setIsConnectionNull(false);
      }
    }
  }, [
    authState.connections,
    authState.connectionRequest,
    userProfile.userId._id,
  ]);

  useEffect(() => {
    getUsersPost();
  }, []);

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.backDropContainer}>
            <img
              className={styles.backDrop}
              src={`${BASE_URL}/${userProfile.userId.profilePicture}`}
              alt={userProfile.name}
            />
          </div>

          <div className={styles.profileContainer_details}>
            <div style={{ display: "flex", gap: "0.79rem" }}>
              <div style={{ flex: "0.8", paddingLeft: "1.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    width: "fit-content",
                    alignItems: "center",
                    gap: "0.8rem",
                    marginBottom: "0.4rem",
                  }}
                >
                  <h2>{userProfile.userId.name}</h2>
                  <p style={{ color: "grey" }}>
                    @{userProfile.userId.username}
                  </p>
                </div>

                {/* FIX: Hide connect button if viewing own profile */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1.2rem",
                  }}
                >
                  {!isOwnProfile && (
                    <>
                      {isCurrentUserInConnection ? (
                        <button className={styles.connectedButton}>
                          {isConnectionNull ? "Pending" : "Connected"}
                        </button>
                      ) : (
                        <button
                          className={styles.connectButton}
                          disabled={authState.connectionLoading}
                          onClick={async () => {
                            await dispatch(
                              sendConnectionRequest(userProfile.userId._id),
                            );
                            await dispatch(getConnectionsRequest());
                          }}
                        >
                          {authState.connectionLoading
                            ? "Sending..."
                            : "Connect"}
                        </button>
                      )}
                    </>
                  )}

                  <div
                    style={{ cursor: "pointer" }}
                    onClick={async () => {
                      const responce = await clientServer.get(
                        `/user/download_resume?id=${userProfile.userId._id}`,
                      );
                      window.open(
                        `${BASE_URL}/${responce.data.message}`,
                        "_blank",
                      );
                    }}
                  >
                    <svg
                      style={{ width: "1.2rem" }}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                  </div>
                </div>

                <div>
                  <p>{userProfile.bio}</p>
                </div>
              </div>
              <div style={{ flex: "0.2" }}>
                <h3>Recent Activity</h3>

                {userPosts.length > 0 ? (
                  userPosts.map((post) => (
                    <div key={post._id} className={styles.postCard}>
                      <div className={styles.card}>
                        <div className={styles.cardContent}>
                          {post.media !== "" ? (
                            <img
                              src={`${BASE_URL}/${post.media}`}
                              alt="Post Media"
                            />
                          ) : (
                            <div
                              style={{ width: "3.4rem", height: "3.4rem" }}
                            ></div>
                          )}
                        </div>
                        <p>{post.body}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No recent activity</p>
                )}
              </div>
            </div>
          </div>

          <div className="workHistory">
            <h4>Work History</h4>
            <div className={styles.workHistoryContainer}>
              {userProfile.pastWork.map((work, index) => (
                <div key={index} className={styles.workHistoryCard}>
                  <p
                    style={{
                      fontWeight: "bold",
                      alignItems: "center",
                      gap: "0.8rem",
                    }}
                  >
                    {work.company} - {work.position}
                  </p>
                  <p>{work.year}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}

export async function getServerSideProps(context) {
  console.log("getServerSideProps called for view profile page");
  console.log(context.query.username); // Logs the query parameters, including username

  const request = await clientServer.get("user/get_profile_based_on_username", {
    params: {
      username: context.query.username,
    },
  });

  const response = await request.data;
  console.log("API response for user profile:", response); // Log the API response
  return {
    props: {
      userProfile: response.userProfile, // Pass the user profile data as a prop to the page component
    },
  };
}
