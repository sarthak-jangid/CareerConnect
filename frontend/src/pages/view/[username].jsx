import clientServer, { BASE_URL } from "@/config/api";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import React, { useState, useEffect } from "react";
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
  const dispatch = useDispatch();

  const postReducer = useSelector((state) => state.postReducer);
  const authState = useSelector((state) => state.auth);

  const [userPosts, setUserPosts] = useState([]);
  const [isCurrentUserInConnection, setIsCurrentUserInConnection] =
    useState(false);
  const [isConnectionNull, setIsConnectionNull] = useState(true);

  // ✅ BIO LIMIT STATE
  const [showFullBio, setShowFullBio] = useState(false);
  const BIO_LIMIT = 120;

  const isOwnProfile =
    authState.user?.userId?._id === userProfile?.userId?._id;

  const getUsersPost = async () => {
    await dispatch(getMyConnectionRequests());
    await dispatch(getConnectionsRequest());
    await dispatch(getAllPosts());
  };

  useEffect(() => {
    if (!userProfile?.userId?._id) return;

    const allPosts = postReducer?.posts || [];

    const filtered = allPosts.filter(
      (post) => post?.userId?._id === userProfile.userId._id
    );

    setUserPosts(filtered);
  }, [postReducer, userProfile]);

  useEffect(() => {
    if (!userProfile?.userId?._id) return;

    const connectionExists =
      authState.connections?.some(
        (c) => c.connectionId?._id === userProfile.userId._id
      ) ||
      authState.connectionRequest?.some(
        (c) => c.userId?._id === userProfile.userId._id
      );

    setIsCurrentUserInConnection(connectionExists);

    const accepted =
      authState.connections?.find(
        (c) => c.connectionId?._id === userProfile.userId._id
      )?.status_accepted ||
      authState.connectionRequest?.find(
        (c) => c.userId?._id === userProfile.userId._id
      )?.status_accepted;

    if (accepted) setIsConnectionNull(false);
  }, [authState, userProfile]);

  useEffect(() => {
    getUsersPost();
  }, []);

  if (!userProfile) {
    return <p style={{ padding: "2rem" }}>Profile not found 🚫</p>;
  }

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          {/* BACKDROP */}
          <div className={styles.backDropContainer}>
            <div className={styles.profileImageWrapper}>
              <img
                src={`${BASE_URL}/${userProfile?.userId?.profilePicture}`}
                alt="profile"
              />
            </div>
          </div>

          {/* PROFILE */}
          <div className={styles.profileContainer}>
            {/* LEFT */}
            <div className={styles.leftSection}>
              <div className={styles.nameSection}>
                <div className={styles.nameDisplay}>
                  <h2>{userProfile?.userId?.name}</h2>
                  <span className={styles.username}>
                    @{userProfile?.userId?.username}
                  </span>
                </div>

                {!isOwnProfile && (
                  <div>
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
                            sendConnectionRequest(userProfile.userId._id)
                          );
                          await dispatch(getConnectionsRequest());
                        }}
                      >
                        {authState.connectionLoading
                          ? "Sending..."
                          : "Connect"}
                      </button>
                    )}
                  </div>
                )}

                {/* ✅ BIO WITH LIMIT */}
                <p className={styles.bio}>
                  {showFullBio
                    ? userProfile?.bio
                    : userProfile?.bio?.slice(0, BIO_LIMIT)}

                  {userProfile?.bio?.length > BIO_LIMIT && (
                    <span
                      className={styles.seeMore}
                      onClick={() => setShowFullBio(!showFullBio)}
                    >
                      {showFullBio ? " See less" : "... See more"}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <div className={styles.sidebar}>
              <h3>Recent Activity</h3>

              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <div key={post._id} className={styles.activityCard}>
                    {post.media && (
                      <img
                        src={`${BASE_URL}/${post.media}`}
                        className={styles.activityImage}
                      />
                    )}
                    <div>
                      <p>{post.body}</p>
                      <span className={styles.tag}>Post</span>
                    </div>
                  </div>
                ))
              ) : (
                <p>No activity</p>
              )}
            </div>
          </div>

          {/* WORK */}
          <div className={styles.workSection}>
            <h3>Work History</h3>

            <div className={styles.workGrid}>
              {userProfile?.pastWork?.map((work, index) => (
                <div key={index} className={styles.workCard}>
                  <strong>
                    {work.company} - {work.position}
                  </strong>
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
  try {
    const res = await clientServer.get(
      "user/get_profile_based_on_username",
      {
        params: {
          username: context.query.username,
        },
      }
    );

    return {
      props: {
        userProfile: res.data.userProfile || null,
      },
    };
  } catch (error) {
    console.log("PROFILE ERROR:", error.message);

    return {
      props: {
        userProfile: null,
      },
    };
  }
}