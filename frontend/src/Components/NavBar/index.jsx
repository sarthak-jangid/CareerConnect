import React from "react";
import styles from "./styles.module.css";
import { useRouter } from "next/router";
import { reset } from "@/redux/reducers/authReducers";
import { useSelector, useDispatch } from "react-redux";

export default function NavBar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  return (
    <div className={styles.navbar}>
      <div className={styles.navbarContainer}>
        <h1
          style={{
            cursor: "pointer",
            fontSize: "1.4rem",
            fontWeight: "700",
          }}
          onClick={() => {
            router.push("/");
          }}
        >
          CareerConnect
        </h1>
        <div>
          {authState.profileFetched ? (
            <div className={styles.userBox}>
              <p className={styles.greeting}>
                Hey, <span>{authState.user.userId.name}</span>
              </p>

              <button onClick={() => {
                router.push("/dashboard")
              }} className={styles.profileBtn}>
                Profile
              </button>
            </div>
          ) : (
            <div>
              <button
                onClick={() => {
                  router.push("/login");
                }}
                className={styles.button}
              >
                Be a part
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
