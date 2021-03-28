import { createRouter, createWebHashHistory } from "vue-router";
import MainMenu from "@/views/MainMenu.vue";

const routes = [
  {
    path: "/",
    name: "main-menu",
    component: MainMenu,
  },
  {
    path: "/settings",
    name: "settings",
    component: () => import("../views/Settings.vue"),
  },
  {
    path: "/monthly",
    name: "monthly",
    component: () => import("../views/Monthly.vue"),
  },
  {
    path: "/mentoring",
    name: "mentoring",
    component: () => import("../views/Mentoring.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
