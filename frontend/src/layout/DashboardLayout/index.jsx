import React, { useEffect, useState } from "react";
import styles from "./index.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrUser } from "@/redux/actions/authActions";
import { BASE_URL } from "@/config/api";

function DashboardLayout({ children }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );

  const { user, isLoading, allProfilesFetched, allUsers } = useSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrUser())
        .unwrap()
        .catch(() => router.replace("/login"));
    }
  }, [dispatch, router, user]);

  if (isLoading || user === null) {
    return <div className={styles.loader}>Loading...</div>;
  }

  return (
    <div className="container">
      <div className={styles.homeContainer}>
        {/* Mobile Hamburger */}
        {windowWidth < 808 && (
          <button
            className={styles.hamburgerBtn}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
        )}

        {/* Left Sidebar */}
        <div
          className={`${styles.homeContainer_leftBar} ${
            windowWidth < 808 && !sidebarOpen ? styles.hiddenSidebar : ""
          }`}
        >
          <div
            className={styles.sideBarOption}
            onClick={() => {
              router.push("/dashboard");
              if (windowWidth < 808) setSidebarOpen(false);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={styles.sidebarIcon}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75"
              />
            </svg>
            <p>Scroll</p>
          </div>

          <div
            className={styles.sideBarOption}
            onClick={() => {
              router.push("/discover");
              if (windowWidth < 808) setSidebarOpen(false);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={styles.sidebarIcon}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <p>Discover</p>
          </div>

          <div
            className={styles.sideBarOption}
            onClick={() => {
              router.push("/my_connections");
              if (windowWidth < 808) setSidebarOpen(false);
            }}
          >
            <svg
              style={{
                minHeight: "1.4rem",
                minWidth: "1.4rem",
              }}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={styles.sidebarIcon}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75"
              />
            </svg>
            <p>My Connections</p>
          </div>
        </div>

        {/* Feed */}
        <div className={styles.homeContainer_feedBar}>{children}</div>

        {/* Top Profiles */}
        <div className={styles.homeContainer_extraContainer}>
          <h3 className={styles.topProfilesTitle}>Top Profiles</h3>
          {allProfilesFetched &&
            allUsers.map((profile) => (
              <div
                key={profile.userId._id}
                className={styles.profileCard}
                onClick={() => router.push(`/view/${profile.userId.username}`)}
              >
                <img
                  src={`${BASE_URL}/${profile.userId.profilePicture}`}
                  alt="profile"
                  className={styles.profileImg}
                />
                <div className={styles.profileInfo}>
                  <p className={styles.profileName}>{profile.userId.name}</p>
                  <span className={styles.profileUsername}>
                    @{profile.userId.username}
                  </span>
                </div>
                <button className={styles.followBtn}>View</button>
              </div>
            ))}
        </div>

        <div className={styles.mobileNavBar}>
          <div
            onClick={() => {
              router.push("/dashboard");
            }}
            className={styles.singleNavItemHolder_mobileView}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={styles.sidebarIcon}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75"
              />
            </svg>
          </div>

          <div
            onClick={() => {
              router.push("/discover");
            }}
            className={styles.singleNavItemHolder_mobileView}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={styles.sidebarIcon}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </div>

          <div
            onClick={() => {
              router.push("/my_connections");
            }}
            className={styles.singleNavItemHolder_mobileView}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={styles.sidebarIcon}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
