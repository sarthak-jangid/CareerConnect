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
  }, []);

  //  FIX: Filter out current logged-in user from discovery list
  const filteredUsers = authState.allUsers
    ? authState.allUsers.filter(
        (user) => user.userId._id !== authState.user?.userId?._id
      )
    : [];

  return (
    <UserLayout>
      <DashboardLayout>
        <div style={{
          paddingLeft: "1.3rem"
        }}>
          <h1>Discover ...</h1>

          <div className={styles.userList}>
            {authState.allProfilesFetched && filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  onClick={() => {
                    router.push(`/view/${user.userId.username}`);
                  }}
                  key={user._id}
                  className={styles.userCard}
                >
                  <img
                    className={styles.userCardImage}
                    src={`${BASE_URL}/${user.userId.profilePicture}`}
                    alt="profile"
                  />
                  <div>
                    <h2>{user.userId.name}</h2>
                    <p>{user.userId.username}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No other users to discover</p>
            )}
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
