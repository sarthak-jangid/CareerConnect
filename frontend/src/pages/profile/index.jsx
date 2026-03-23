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

  // NAME
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  // BIO
  const [editingBio, setEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState("");
  const [showFullBio, setShowFullBio] = useState(false);

  const BIO_LIMIT = 120;
  const BIO_MAX = 200;

  // WORK
  const [addingWork, setAddingWork] = useState(false);
  const [workForm, setWorkForm] = useState({
    company: "",
    position: "",
    year: "",
  });

  const dispatch = useDispatch();

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
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
      console.log(posts);
      setUserPosts(posts);
    }
  }, [authState.user, postState]);

  // ================= WORK =================
  const addWork = async () => {
    const { company, position, year } = workForm;

    if (!company || !position || !year) {
      return alert("All fields required");
    }

    try {
      setIsLoading(true);

      await clientServer.post("/update_profile_data", {
        pastWork: [
          ...(authState.user.pastWork || []),
          { company, position, year },
        ],
      });

      await dispatch(fetchCurrUser());

      setAddingWork(false);
      setWorkForm({ company: "", position: "", year: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add work");
    } finally {
      setIsLoading(false);
    }
  };

  // ================= NAME =================
  const updateUserName = async (name) => {
    if (!name.trim()) return alert("Name required");

    try {
      setIsLoading(true);
      await clientServer.post("/user_update", { name });
      await dispatch(fetchCurrUser());
      setEditingName(false);
    } catch {
      alert("Update failed");
    } finally {
      setIsLoading(false);
    }
  };

  // ================= BIO =================
  const updateBio = async (bio) => {
    try {
      setIsLoading(true);
      await clientServer.post("/update_profile_data", { bio });
      await dispatch(fetchCurrUser());
      setEditingBio(false);
    } catch (err) {
      alert(err.response?.data?.message || "Bio update failed");
    } finally {
      setIsLoading(false);
    }
  };

  // ================= PROFILE PIC =================
  const updateProfilePicture = async (file) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("profile_picture", file);

      await clientServer.post("/update_profile_picture", formData);
      await dispatch(fetchCurrUser());
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    } finally {
      setIsLoading(false);
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
              <div className={styles.profileImageWrapper}>
                <img
                  src={
                    authState.user?.userId?.profilePicture
                      ? `${BASE_URL}/${authState.user.userId.profilePicture}`
                      : `${BASE_URL}/default.jpg`
                  }
                  alt="profile"
                  onError={(e) => (e.target.src = `${BASE_URL}/default.jpg`)}
                />
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
                          Save
                        </button>

                        <button
                          onClick={() => {
                            setEditingName(false);
                            setTempName("");
                          }}
                          className={styles.cancelBtn}
                        >
                          Cancel
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
                <div className={styles.bioSection}>
                  {editingBio ? (
                    <div className={styles.bioEditInline}>
                      <textarea
                        value={tempBio}
                        onChange={(e) => {
                          if (e.target.value.length <= BIO_MAX) {
                            setTempBio(e.target.value);
                          }
                        }}
                        className={styles.bioInput}
                        rows={3}
                      />

                      <small className={styles.charCount}>
                        {tempBio.length}/{BIO_MAX}
                      </small>

                      <div className={styles.inlineActions}>
                        <button
                          onClick={() => updateBio(tempBio)}
                          className={styles.saveBtn}
                        >
                          Save
                        </button>

                        <button
                          onClick={() => {
                            setEditingBio(false);
                            setTempBio("");
                          }}
                          className={styles.cancelBtn}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.bioDisplay}>
                      <p className={styles.bio}>
                        {authState.user.bio
                          ? showFullBio
                            ? authState.user.bio
                            : authState.user.bio.slice(0, BIO_LIMIT)
                          : "Add bio"}

                        {authState.user.bio &&
                          authState.user.bio.length > BIO_LIMIT && (
                            <span
                              className={styles.seeMore}
                              onClick={() => setShowFullBio(!showFullBio)}
                            >
                              {showFullBio ? " See less" : "... See more"}
                            </span>
                          )}
                      </p>

                      <span
                        className={styles.editBtn}
                        onClick={() => {
                          setEditingBio(true);
                          setTempBio(authState.user.bio || "");
                        }}
                      >
                        ✏️
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* SIDEBAR */}
              <div className={styles.sidebar}>
                <h3 style={{ marginBottom: "0.5rem" }}>Recent Activity</h3>

                {/* {console.log(authState.posts)} */}

                {userPosts.length > 0 ? (
                  <div className={styles.activityCard}>
                    {userPosts[0]?.media && userPosts[0].media !== "text_post" && (
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
              <div className={styles.workHeader}>
                <h4>Work History</h4>

                <button
                  className={styles.addWorkBtn}
                  onClick={() => setAddingWork(!addingWork)}
                >
                  + Add Work
                </button>
              </div>

              {addingWork && (
                <div className={styles.workForm}>
                  <input
                    placeholder="Company"
                    value={workForm.company}
                    onChange={(e) =>
                      setWorkForm({
                        ...workForm,
                        company: e.target.value,
                      })
                    }
                  />

                  <input
                    placeholder="Position"
                    value={workForm.position}
                    onChange={(e) =>
                      setWorkForm({
                        ...workForm,
                        position: e.target.value,
                      })
                    }
                  />

                  <input
                    type="text"
                    placeholder="Year"
                    maxLength={4}
                    value={workForm.year}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      setWorkForm({
                        ...workForm,
                        year: value,
                      });
                    }}
                  />

                  <div className={styles.formActions}>
                    <button onClick={addWork} className={styles.saveBtn}>
                      Save
                    </button>

                    <button
                      onClick={() => setAddingWork(false)}
                      className={styles.cancelBtn}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className={styles.workGrid}>
                {(authState.user.pastWork || []).map((w, i) => (
                  <div key={i} className={styles.workCard}>
                    <div className={styles.workTop}>
                      <h5>{w.position}</h5>
                      <span>{w.year}</span>
                    </div>
                    <p className={styles.company}>{w.company}</p>
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
