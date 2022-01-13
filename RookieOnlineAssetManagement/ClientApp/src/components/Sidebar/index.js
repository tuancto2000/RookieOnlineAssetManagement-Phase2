import React, { useState, useEffect } from "react";
import logo from "../../assets/img/Logo.png";
import { Link, useLocation } from "react-router-dom";

function Index(props) {
  const location = useLocation();

  const initialMenus = [
    {
      id: 1,
      name: "Home",
      to: "/",
    },
    {
      id: 2,
      name: "Manage Users",
      to: "/users",
    },
    {
      id: 3,
      name: "Manage Assets",
      to: "/assets",
    },
    {
      id: 4,
      name: "Manage Assignments",
      to: "/assignments",
    },
    {
      id: 5,
      name: "Request for Returning",
      to: "/request-for-returning",
    },
    {
      id: 6,
      name: "Report",
      to: "/report",
    },
  ];

  const [menus, setMenus] = useState(initialMenus);
  const [state, setState] = useState(1);
  useEffect(() => {
    if (location.pathname.includes("/")) setState(1);
    if (location.pathname.includes("/user")) setState(2);
    if (location.pathname.includes("/asset")) setState(3);
    if (location.pathname.includes("/assignment")) setState(4);
    if (location.pathname.includes("/request-for-returning")) setState(5);
    if (location.pathname.includes("/report")) setState(6);
  }, [location]);
  useEffect(() => {
    if (props.type != null && props.type != 2) {
      setMenus(menus.slice(0, 1));
    }
  }, [props]);

  return (
    <div>
      <img src={logo} alt="..." className="img-thumbnail" />
      <h6 style={{ padding: "10px" }}>
        <span className="text-danger">Online Asset Management</span>
      </h6>
      <div className="list-group" id="list-tab" role="tablist">
        {menus.map((menu, index) => (
          <Link to={menu.to} className={menu.id === state ? "list-group-item list-group-item-action active" : "list-group-item list-group-item-action"} key={index} onClick={() => setState(menu.id)}>
            {menu.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Index;
