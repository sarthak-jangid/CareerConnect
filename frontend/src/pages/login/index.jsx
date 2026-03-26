import UserLayout from "@/layout/UserLayout";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import styles from "./styles.module.css";
import { toast, ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  registerUser,
  loginUser,
  fetchCurrUser,
} from "@/redux/actions/authActions";

function Login() {
  const router = useRouter();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  const lastActionRef = useRef(null);

  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    remember: false,
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // FETCH USER
  useEffect(() => {
    if (!auth.profileFetched) {
      dispatch(fetchCurrUser());
    }
  }, [dispatch, auth.profileFetched]);

  // REDIRECT IF LOGGED IN
  useEffect(() => {
    if (auth.profileFetched && auth.isLoggedIn) {
      router.replace("/dashboard");
    }
  }, [auth.profileFetched, auth.isLoggedIn, router]);

  // RESET FORM ON MODE CHANGE
  useEffect(() => {
    setErrors({});
    setSubmitting(false);
    if (mode === "login") {
      setForm((s) => ({ ...s, name: "", username: "", confirm: "" }));
    } else {
      setForm((s) => ({ ...s, remember: false }));
    }
  }, [mode]);

  // ONLY ERROR TOAST
  useEffect(() => {
    if (auth.isError) {
      toast.error(auth.message || "Something went wrong");
    }
  }, [auth.isError, auth.message]);

  function validate() {
    const e = {};
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Enter a valid email";

    if (!form.password || form.password.length < 6)
      e.password = "Password must be 6+ characters";

    if (mode === "register") {
      if (!form.name || form.name.trim().length < 2) e.name = "Enter your name";

      if (!form.username || form.username.trim().length < 3)
        e.username = "Username must be at least 3 characters";

      if (form.confirm !== form.password) e.confirm = "Passwords do not match";
    }

    return e;
  }

  // FIXED TOAST LOGIC
  async function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);

    if (Object.keys(e).length) {
      const first = Object.values(e)[0];
      if (first) toast.error(first);
      return;
    }

    setSubmitting(true);
    lastActionRef.current = mode;

    try {
      if (mode === "login") {
        await dispatch(
          loginUser({ email: form.email, password: form.password }),
        ).unwrap();

        toast.success("Login successful ✅");
        router.push("/dashboard");
      } else {
        await dispatch(
          registerUser({
            name: form.name,
            username: form.username,
            email: form.email,
            password: form.password,
          }),
        ).unwrap();

        toast.success("Account created successfully 🎉");

        // Delay login to avoid toast conflict
        setTimeout(async () => {
          try {
            await dispatch(
              loginUser({ email: form.email, password: form.password }),
            ).unwrap();

            router.push("/dashboard");
          } catch {}
        }, 500);
      }
    } catch (err) {
      // handled in useEffect
    } finally {
      setSubmitting(false);
      lastActionRef.current = null;
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({
      ...s,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  if (!auth.profileFetched) {
    return (
      <UserLayout>
        <div className={styles.pageBackground}></div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className={styles.pageBackground}>
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
          transition={Slide}
          limit={1}
        />

        <div className={styles.cardContainer}>
          {/* LEFT */}
          <div className={styles.cardContainer_left}>
            <div className={styles.formWrap}>
              <h2>
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h2>

              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {mode === "register" && (
                  <label className={styles.field}>
                    <span className={styles.labelText}>Full name</span>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="Jane Doe"
                    />
                    {errors.name && (
                      <small className={styles.error}>{errors.name}</small>
                    )}
                  </label>
                )}

                {mode === "register" && (
                  <label className={styles.field}>
                    <span className={styles.labelText}>Username</span>
                    <input
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      className={`${styles.input} ${styles.usernameField}`}
                      placeholder="your-username"
                    />
                    {errors.username && (
                      <small className={styles.error}>{errors.username}</small>
                    )}
                  </label>
                )}

                <label className={styles.field}>
                  <span className={styles.labelText}>Email</span>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <small className={styles.error}>{errors.email}</small>
                  )}
                </label>

                <label className={styles.field}>
                  <span className={styles.labelText}>Password</span>
                  <div className={styles.passwordRow}>
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className={styles.showBtn}
                      onClick={() => setShowPassword((s) => !s)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.password && (
                    <small className={styles.error}>{errors.password}</small>
                  )}
                </label>

                {mode === "register" && (
                  <label className={styles.field}>
                    <span className={styles.labelText}>Confirm password</span>
                    <input
                      name="confirm"
                      type={showPassword ? "text" : "password"}
                      value={form.confirm}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="Retype password"
                    />
                    {errors.confirm && (
                      <small className={styles.error}>{errors.confirm}</small>
                    )}
                  </label>
                )}

                {/* ✅ RESTORED SECTION */}
                {/* {mode === "login" && (
                  <div className={styles.row}>
                    <label className={styles.checkboxLabel}>
                      <input
                        name="remember"
                        type="checkbox"
                        checked={form.remember}
                        onChange={handleChange}
                      />
                      Remember me
                    </label>

                    <a
                      className={styles.link}
                      onClick={(e) => {
                        e.preventDefault();
                        router.push("/forget-password");
                      }}
                    >
                      Forgot Password?
                    </a>
                  </div>
                )} */}

                <button
                  className={styles.submit}
                  type="submit"
                  disabled={submitting}
                >
                  {submitting
                    ? "Please wait…"
                    : mode === "login"
                      ? "Sign in"
                      : "Create account"}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT */}
          <div className={styles.cardContainer_right}>
            <div className={styles.brand}>
              <h1>CareerConnect</h1>
              <p>Connect with opportunities. Build your career.</p>

              <p className={styles.switchModeText}>
                {mode === "login" ? (
                  <>
                    Don't have an account?{" "}
                    <span
                      className={styles.switchLink}
                      onClick={() => setMode("register")}
                    >
                      Register
                    </span>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <span
                      className={styles.switchLink}
                      onClick={() => setMode("login")}
                    >
                      Login
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

export default Login;
