import React, { useEffect } from "react";
import styles from "./index.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrUser } from "@/redux/actions/authActions";
import { BASE_URL } from "@/config/api";

function DashboardLayout({ children }) {
  const router = useRouter();
  const dispatch = useDispatch();

  const { user, isLoading, allProfilesFetched, allUsers } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrUser())
        .unwrap()
        .catch(() => {
          router.replace("/login");
        });
    }
  }, [dispatch, router, user]);

  if (isLoading || user === null) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container">
      <div className={styles.homeContainer}>
        
        {/* LEFT SIDEBAR */}
        <div className={styles.homeContainer_leftBar}>
          <div
            onClick={() => router.push("/dashboard")}
            className={styles.sideBarOption}
          >
            <p>Scroll</p>
          </div>

          <div
            onClick={() => router.push("/discover")}
            className={styles.sideBarOption}
          >
            <p>Discover</p>
          </div>

          <div
            onClick={() => router.push("/my_connections")}
            className={styles.sideBarOption}
          >
            <p>My Connections</p>
          </div>
        </div>

        {/* FEED */}
        <div className={styles.homeContainer_feedBar}>
          {children}
        </div>

        {/* RIGHT SIDEBAR (TOP PROFILES) */}
        <div className={styles.homeContainer_extraContainer}>
          <h3 className={styles.topProfilesTitle}>Top Profiles</h3>

          {allProfilesFetched &&
            allUsers.map((profile) => (
              <div
                key={profile.userId._id}
                className={styles.profileCard}
                onClick={() =>
                  router.push(`/view/${profile.userId.username}`)
                }
              >
                <img
                  src={`${BASE_URL}/${profile.userId.profilePicture}`}
                  alt="profile"
                  className={styles.profileImg}
                />

                <div className={styles.profileInfo}>
                  <p className={styles.profileName}>
                    {profile.userId.name}
                  </p>
                  <span className={styles.profileUsername}>
                    @{profile.userId.username}
                  </span>
                </div>

                <button className={styles.followBtn}>
                  View
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;