import { createRouter, createWebHistory } from "vue-router";
import Main from "../components/pages/Main.vue";
// import { auth } from "../firebase";

const routes = [
  {
    path: "/admin-totalan-",
    name: "Main",
    component: Main,
    // meta: {
    //   requiresAuth: true,
    // },
  },
  // {
  //   path: "/login",
  //   name: "Login",
  //   component: () => import("../components/pages/Login.vue"),
  // },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// router.beforeEach((to, from, next) => {
//   if (to.path === "/login" && auth.currentUser) {
//     next("/");
//     return;
//   }

//   if (
//     to.matched.some((record) => record.meta.requiresAuth) &&
//     !auth.currentUser
//   ) {
//     next("/login");
//     return;
//   }

//   next();
// });

export default router;
