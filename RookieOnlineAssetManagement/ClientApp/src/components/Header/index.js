import React from "react";
import { Link, useLocation } from "react-router-dom";
import { NavDropdown } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import { useState, useEffect } from "react";
function Index(props) {
  const location = useLocation();
  const [headerName, setHeaderName] = useState("Home");
  const [headerLink, setHeaderLink] = useState("");
  useEffect(() => {
    if (location.pathname == "/") setHeaderName("Home");
    else if (location.pathname.includes("/users/add")) setHeaderName("Manage User > Create New User");
    else if (location.pathname.includes("/users/")) setHeaderName("Manage User > Edit User");
    else if (location.pathname.includes("/users")) setHeaderName("Manage User");
    else if (location.pathname.includes("/asset/new")) setHeaderName("Manage Asset > Create New Asset");
    else if (location.pathname.includes("/asset/")) setHeaderName("Manage Asset > Edit Asset");
    else if (location.pathname.includes("/assets")) setHeaderName("Manage Asset");
    else if (location.pathname.includes("/assignment/new")) setHeaderName("Manage Assignment > Create New Assignment");
    else if (location.pathname.includes("/assignment/")) setHeaderName("Manage Assignment > Edit Assignment");
    else if (location.pathname.includes("/assignments")) setHeaderName("Manage Assignment");
    else if (location.pathname.includes("/request-for-returning")) setHeaderName("Manage Return Request");
    else if (location.pathname.includes("/report")) setHeaderName("Manage Report");
  }, [location]);
  useEffect(() => {
    if (headerName.includes("Home")) setHeaderLink("/");
    else if (headerName.includes("User")) setHeaderLink("/users");
    else if (headerName.includes("Asset")) setHeaderLink("/assets");
    else if (headerName.includes("Assignment")) setHeaderLink("/assignments");
    else if (headerName.includes("Return")) setHeaderLink("/request-for-returning");
    else if (headerName.includes("Report")) setHeaderLink("/reports");
  }, [headerName]);
  return (
    <nav className="navbar navbar-dark bg-danger">
      <Link to={headerLink} className="navbar-brand" style={{ paddingLeft: "15px", fontWeight: "bold" }}>
        {headerName}
      </Link>
      <NavDropdown
        title={
          <div>
            <FaUserCircle style={{ fontSize: "25px", color: "#FFF" }} />
            <span style={{ paddingLeft: "10px", color: "#FFF" }}>{props.fullName}</span>
          </div>
        }
      >
        <NavDropdown.Item>Profile</NavDropdown.Item>
        <NavDropdown.Item onClick={props.toggleModalChangePassword}>Change password</NavDropdown.Item>
        <NavDropdown.Item onClick={props.toggleModalLogout}>Logout</NavDropdown.Item>
      </NavDropdown>
    </nav>
  );
}

export default Index;
