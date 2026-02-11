import React from "react";
import NavBar from "@/Components/NavBar";


function UserLayout({ children }) {
  return (
    <div>
      <NavBar />
      {children}
    </div>
  );
}

export default UserLayout;
