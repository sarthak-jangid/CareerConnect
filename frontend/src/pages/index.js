import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.css";
import UserLayout from "@/layout/UserLayout";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.mainContainer}>
          <div className={styles.mainContainer_left}>
            <p>Connect with Friends without Exaggeration</p>
            <p>A true social media platform, with stories no blufs!</p>
            <button
              onClick={() => {
                router.push("/login");
              }}
            >
              Join Now
            </button>
          </div>
          <div className={styles.mainContainer_right}>
            <img src="/images/home_page.jpg" alt="social connect image" height={200} />
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
