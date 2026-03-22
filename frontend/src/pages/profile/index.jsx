import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./index.module.css";
import clientServer, { BASE_URL } from "@/config/api";
import { fetchCurrUser } from "@/redux/actions/authActions";
import { getAllPosts } from "@/redux/actions/postActions";

export default function ProfilePage() {
  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.post);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await dispatch(fetchCurrUser()).unwrap();
        await dispatch(getAllPosts());
      } catch {
        setError("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [dispatch]);

  useEffect(() => {
    if (authState.user && postState.postFetched) {
      const posts = (postState.posts || []).filter(
        (post) => post?.userId?.username === authState.user.userId.username,
      );
      setUserPosts(posts);
    }
  }, [authState.user, postState]);

  const updateProfilePicture = async (file) => {
    try {
      if (!file) throw new Error("Select a file");

      const formData = new FormData();
      formData.append("profile_picture", file);

      const res = await clientServer.post("/update_profile_picture", formData);

      alert(res.data.message || "Updated");
      dispatch(fetchCurrUser());
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const updateUserName = async (name) => {
    if (!name.trim()) return alert("Name required");

    try {
      await clientServer.post("/user_update", { name });
      dispatch(fetchCurrUser());
      setEditingName(false);
    } catch {
      alert("Update failed");
    }
  };

  return (
    <UserLayout>
      <DashboardLayout>
        {isLoading ? (
          <div className={styles.center}>Loading...</div>
        ) : error ? (
          <div className={styles.centerError}>{error}</div>
        ) : (
          <div className={styles.container}>
            {/* BACKDROP */}
            <div className={styles.backDropContainer}>
              

              {/* PROFILE IMAGE */}
              <div className={styles.profileImageWrapper}>
                <img
                  src={`${BASE_URL}/${authState.user.userId.profilePicture}`}
                  alt="profile"
                  onError={(e) => (e.target.src = `${BASE_URL}/default.jpg`)}
                />

                {/* Overlay for profile image */}
                <label className={styles.profileOverlay}>
                  Edit
                  <input
                    type="file"
                    hidden
                    onChange={(e) => updateProfilePicture(e.target.files[0])}
                  />
                </label>
              </div>
            </div>

            {/* PROFILE */}
            <div className={styles.profileContainer}>
              <div className={styles.leftSection}>
                {/* NAME */}
                <div className={styles.nameSection}>
                  {editingName ? (
                    <div className={styles.nameEditInline}>
                      <input
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className={styles.nameInput}
                        autoFocus
                      />

                      <div className={styles.inlineActions}>
                        <button
                          onClick={() => updateUserName(tempName)}
                          className={styles.saveBtn}
                        >
                          ✔
                        </button>

                        <button
                          onClick={() => {
                            setEditingName(false);
                            setTempName("");
                          }}
                          className={styles.cancelBtn}
                        >
                          ✖
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.nameDisplay}>
                      <h2>{authState.user.userId.name}</h2>

                      <span
                        className={styles.editBtn}
                        onClick={() => {
                          setEditingName(true);
                          setTempName(authState.user.userId.name);
                        }}
                      >
                        ✏️
                      </span>
                    </div>
                  )}

                  <p className={styles.username}>
                    @{authState.user.userId.username}
                  </p>
                </div>

                {/* BIO */}
                <p className={styles.bio}>{authState.user.bio || "Add bio"}</p>
              </div>

              {/* SIDEBAR */}
              <div className={styles.sidebar}>
                <h3>Recent Activity</h3>

                {userPosts.length > 0 ? (
                  <div className={styles.activityCard}>
                    {userPosts[0].media && (
                      <img
                        src={`${BASE_URL}/${userPosts[0].media}`}
                        className={styles.activityImage}
                      />
                    )}
                    <div>
                      <p>{userPosts[0].body}</p>
                      <span className={styles.tag}>Latest</span>
                    </div>
                  </div>
                ) : (
                  <div className={styles.noActivity}>No activity</div>
                )}
              </div>
            </div>

            {/* WORK */}
            <div className={styles.workSection}>
              <h4>Work History</h4>
              <div className={styles.workGrid}>
                {(authState.user.pastWork || []).map((w, i) => (
                  <div key={i} className={styles.workCard}>
                    <p>
                      <strong>{w.company}</strong> - {w.position}
                    </p>
                    <span>{w.year}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </UserLayout>
  );
}
