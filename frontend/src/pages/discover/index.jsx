import { BASE_URL } from "@/config/api";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import { getAllUsers } from "@/redux/actions/authActions";
import React, { useEffect } from "react";
import styles from "./styles.module.css";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";

export default function DiscoverPage() {
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!authState.allProfilesFetched) {
      dispatch(getAllUsers());
    }
  }, [dispatch, authState.allProfilesFetched]);

  const filteredUsers = authState.allUsers
    ? authState.allUsers.filter(
        (user) => user.userId._id !== authState.user?.userId?._id
      )
    : [];

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          <h1 className={styles.heading}>Discover People</h1>

          <div className={styles.userGrid}>
            {authState.allProfilesFetched && filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className={styles.userCard}
                  onClick={() =>
                    router.push(`/view/${user.userId.username}`)
                  }
                >
                  <img
                    className={styles.avatar}
                    src={`${BASE_URL}/${user.userId.profilePicture}`}
                    alt="profile"
                    loading="lazy"
                    onError={(e) =>
                      (e.target.src = `${BASE_URL}/default.jpg`)
                    }
                  />

                  <h3 className={styles.name}>
                    {user.userId.name}
                  </h3>

                  <p className={styles.username}>
                    @{user.userId.username}
                  </p>

                  {user.bio && (
                    <p className={styles.bio}>
                      {user.bio.length > 60
                        ? user.bio.slice(0, 60) + "..."
                        : user.bio}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className={styles.empty}>
                No users to discover 🚀
              </p>
            )}
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}