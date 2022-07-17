import { createRouter, createWebHistory } from "vue-router";
import Main from "../components/pages/Main.vue";
import NotFound from "../components/pages/NotFound.vue";
import { auth } from "../firebase/firebaseApp";

const requiredAuth = (to, from, next) => {
  const user = auth.currentUser;
  console.log(user);
  if (!user) {
    next("/login");
    return;
  }
  next();
};

const routes = [
  {
    path: "/admin-totalan-",
    name: "Main",
    component: Main,
    beforeEnter: requiredAuth,
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../components/pages/Login.vue"),
  },
  {
    path: "/:catchAll(.*)",
    name: "NotFound",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
