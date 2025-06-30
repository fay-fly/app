import { ComponentType } from "react";
import Home from "@/icons/menu/Home";
import Discover from "@/icons/menu/Discover";
import AddPost from "@/icons/menu/AddPost";
import Notifications from "@/icons/menu/Notifications";
import Messages from "@/icons/menu/Messages";

type MenuItem = {
  route: string;
  icon: ComponentType;
  text: string;
  mobileIndex: number;
  requiresAuth?: boolean;
};

const menuConfig: MenuItem[] = [
  {
    route: "/",
    icon: Home,
    text: "Home",
    mobileIndex: 1,
  },
  {
    route: "/discover",
    icon: Discover,
    text: "Discover",
    mobileIndex: 2,
  },
  {
    route: "/messages",
    icon: Messages,
    text: "Messages",
    mobileIndex: 5,
    requiresAuth: true,
  },
  {
    route: "/notifications",
    icon: Notifications,
    text: "Notifications",
    mobileIndex: 4,
    requiresAuth: true,
  },
  {
    route: "/add-post",
    icon: AddPost,
    text: "Add post",
    mobileIndex: 3,
    requiresAuth: true,
  },
];

export default menuConfig;
