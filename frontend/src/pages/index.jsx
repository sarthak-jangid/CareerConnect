import styles from "@/styles/Home.module.css";
import UserLayout from "@/layout/UserLayout";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCurrUser } from "@/redux/actions/authActions";

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { profileFetched, isLoggedIn } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isLoggedIn && !profileFetched) {
      dispatch(fetchCurrUser());
    }
  }, [dispatch, isLoggedIn, profileFetched]);

  const handleAction = () => {
    if (profileFetched) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  const buttonText = profileFetched ? "Go to Dashboard" : "Join Now";
  const subText = profileFetched
    ? "Welcome back! Continue building your network."
    : "A true social media platform, with stories no blufs!";

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.mainContainer}>
          <div className={styles.mainContainer_left}>
            <p>Connect with Friends without Exaggeration</p>
            <p>{subText}</p>
            <button onClick={handleAction}>{buttonText}</button>
          </div>
          <div className={styles.mainContainer_right}>
            <img
              src="/images/home_page.jpg"
              alt="social connect image"
              height="200"
            />
          </div>
        </div>
      </div>
    </UserLayout>
  );
}