import { createRouter, createWebHashHistory } from "vue-router";
import MainMenu from "@/views/MainMenu.vue";
import Google from "@/views/Google.vue";

const routes = [
  {
    path: "/",
    name: "main-menu",
    component: MainMenu,
  },
  {
    path: "/google",
    name: "google",
    component: Google,
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
  {
    path: "/changelog",
    name: "changelog",
    component: () => import("../views/Changelog.vue"),
  },
  {
    path: "/license",
    name: "license",
    component: () => import("../views/License.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
