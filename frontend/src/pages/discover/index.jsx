import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import { getAllUsers } from "@/redux/actions/authActions";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function DiscoverPage() {

  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  useEffect(() => {
    if(!authState.allProfilesFetched) {
      dispatch(getAllUsers())
    }
  }, []);
  return (
    <UserLayout>
      <DashboardLayout>
        <div>
          <h1>Discover ...</h1>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
