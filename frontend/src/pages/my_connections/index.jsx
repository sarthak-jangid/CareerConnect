import { BASE_URL } from "@/config/api";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import {
  acceptConnectionRequest,
  getMyConnectionRequests,
} from "@/redux/actions/authActions";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./index.module.css";
import { useRouter } from "next/router";

export default function MyConnectionsPage() {
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);

  const router = useRouter();

  useEffect(() => {
    dispatch(getMyConnectionRequests());
  }, []);

  useEffect(() => {
    if (authState.connectionRequest.length !== 0) {
      console.log("Connection requests:", authState.connectionRequest);
    }   
  }, [authState.connectionRequest]);

  return (
    <UserLayout>
      <DashboardLayout>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h4>My Connections </h4>
          <div>
            {authState.connectionRequest.length === 0 ? (
              <p>No connection requests found.</p>
            ) : (
              authState.connectionRequest
                .filter((connection) => connection.status_accepted === null)
                .map((user, idx) => (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`view/${user.userId.username}`);
                    }}
                    className={styles.userCard}
                    key={idx}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1.2rem",
                        justifyContent: "space-between",
                      }}
                    >
                      <div className={styles.profilePicture}>
                        <img
                          src={`${BASE_URL}/${user.userId.profilePicture}`}
                          alt="profile picture"
                        />
                      </div>
                      <div className={styles.userInfo}>
                        <h3>{user.userId.name}</h3>
                        <p>{user.userId.username}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(
                            acceptConnectionRequest({
                              connectionId: user._id,
                              action: "accept",
                            }),
                          );
                        }}
                        className={styles.connectedButton}
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>

          <div>
            {" "}
            {authState.connectionRequest.filter(
              (connection) => connection.status_accepted !== null,
            ).length != 0 ? (
              <h4>My NetWork</h4>
            ) : (
              " "
            )}{" "}
            {authState.connectionRequest
              .filter((connection) => connection.status_accepted !== null)
              .map((user, idx) => (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`view/${user.userId.username}`);
                  }}
                  className={styles.userCard}
                  key={idx}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1.2rem",
                      justifyContent: "space-between",
                    }}
                  >
                    <div className={styles.profilePicture}>
                      <img
                        src={`${BASE_URL}/${user.userId.profilePicture}`}
                        alt="profile picture"
                      />
                    </div>
                    <div className={styles.userInfo}>
                      <h3>{user.userId.name}</h3>
                      <p>{user.userId.username}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
