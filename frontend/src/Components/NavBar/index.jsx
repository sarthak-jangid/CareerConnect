import React, { useState, useRef, useEffect } from "react";
import styles from "./styles.module.css";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "@/redux/actions/authActions";
import { toast } from "react-toastify";

export default function NavBar() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  const { isLoggedIn, user, profileFetched } = useSelector(
    (state) => state.auth,
  );

 const handleLogout = async () => {
  try {
    await dispatch(logoutUser()).unwrap();

    //  Full page refresh + redirect
    window.location.href = "/";

  } catch (err) {
    toast.error(err?.message || "Logout failed");
  }
};;

  // ✅ CLOSE MENU WHEN CLICK OUTSIDE
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.navbar}>
      <div className={styles.navbarContainer} ref={menuRef}>
        {/* Logo */}
        <h1 onClick={() => router.push("/")}>CareerConnect</h1>

        {/* Desktop Right Section */}
        <div className={styles.desktopMenu}>
          {!profileFetched ? (
            <button className={styles.button}>Loading...</button>
          ) : isLoggedIn ? (
            <>
              <p className={styles.greetingDesktop}>
                Hey, <span>{user?.userId?.name || "User"}</span>
              </p>

              <button
                onClick={() => router.push("/profile")}
                className={styles.profileBtn}
              >
                Profile
              </button>

              <button onClick={handleLogout} className={styles.logoutBtn}>
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className={styles.button}
            >
              Be a part
            </button>
          )}
        </div>

        {/* Hamburger */}
        <div
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {" "}
          <p className={styles.greeting}>
            Hey, <span>{user?.userId?.name || "User"}</span>
          </p>
          ☰
        </div>

        {/* Mobile Dropdown */}
        <div
          className={`${styles.mobileMenu} ${menuOpen ? styles.active : ""}`}
        >
          {!profileFetched ? (
            <button className={styles.button}>Loading...</button>
          ) : isLoggedIn ? (
            <>
              <button
                onClick={() => {
                  router.push("/profile");
                  setMenuOpen(false);
                }}
                className={styles.profileBtn}
              >
                Profile
              </button>

              <button onClick={handleLogout} className={styles.logoutBtn}>
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                router.push("/login");
                setMenuOpen(false);
              }}
              className={styles.button}
            >
              Be a part
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
