import { ComponentType } from "react";
import Home from "@/icons/menu/Home";
import Discover from "@/icons/menu/Discover";
import Messages from "@/icons/menu/Messages";
import Notifications from "@/icons/menu/Notifications";
import AddPost from "@/icons/menu/AddPost";

type MenuItem = {
  route: string;
  icon: ComponentType;
  text: string;
  mobileIndex: number;
  requiresAuth?: boolean;
  requiredRoles?: string[];
  hideInDesktop?: boolean;
};

const menuConfig: MenuItem[] = [
  {
    route: "/",
    icon: Home,
    text: "Home",
    mobileIndex: 1,
    requiresAuth: true,
  },
  {
    route: "/discover",
    icon: Discover,
    text: "Discover",
    mobileIndex: 2,
  },
  // {
  //   route: "/messages",
  //   icon: Messages,
  //   text: "Messages",
  //   mobileIndex: 5,
  //   requiresAuth: true,
  // },
  {
    route: "/notifications",
    icon: Notifications,
    text: "Notification",
    mobileIndex: 4,
    requiresAuth: true,
  },
  {
    route: "/add-post",
    icon: AddPost,
    text: "Add post",
    mobileIndex: 3,
    requiresAuth: true,
    requiredRoles: ["creator", "admin"],
    hideInDesktop: true,
  },
];

export default menuConfig;
