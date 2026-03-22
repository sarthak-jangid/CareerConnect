import React from "react";
import styles from "./styles.module.css";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "@/redux/actions/authActions";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function NavBar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      dispatch(logoutUser()).unwrap();
      window.location.href = "/login";
    } catch (err) {
      toast.error(err?.message || "Logout failed");
    } finally {
      router.push("/");
    }
  };

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
                Hey, <span>{authState.user?.userId?.name || "User"}</span>
              </p>

              <button
                onClick={() => {
                  router.push("/profile");
                }}
                className={styles.profileBtn}
              >
                Profile
              </button>

              <button onClick={handleLogout} className={styles.logoutBtn}>
                Logout
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
