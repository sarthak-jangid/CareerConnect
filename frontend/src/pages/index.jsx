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

  //  FIX: only call once when not fetched
  useEffect(() => {
    const fetchUser = async () => {
      if (!profileFetched) {
        await dispatch(fetchCurrUser());
      }
    };
    fetchUser();
  }, [dispatch, profileFetched]);

  //  ACTION HANDLER
  const handleAction = () => {
    if (!profileFetched) return;

    if (isLoggedIn) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  // ✅ UI STATE
  const buttonText = !profileFetched
    ? "Loading..."
    : isLoggedIn
      ? "Go to Dashboard"
      : "Join Now";

  const subText = !profileFetched
    ? "Checking authentication..."
    : isLoggedIn
      ? "Welcome back! Continue building your network."
      : "A true social media platform, with stories no blufs!";

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.mainContainer}>
          {/* LEFT */}
          <div className={styles.mainContainer_left}>
            <p>Connect with Friends without Exaggeration</p>
            <p>{subText}</p>

            <button
              onClick={handleAction}
              disabled={!profileFetched} //  prevents wrong click
            >
              {buttonText}
            </button>
          </div>

          {/* RIGHT */}
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
