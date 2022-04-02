const Navbar = {
  namespaced: true,
  state: {
    active: "",
    lists: [
      { id: "warehouses", title: "Warehouses", group: "setting" },
      { id: "supervisors", title: "Supervisors", group: "setting" },
      { id: "backup", title: "Backup data", group: "setting" },
      { id: "import", title: "Import data", group: "setting" },
      { id: "uncollected", title: "Uncollected", group: "reports" },
      { id: "collected", title: "Collected", group: "reports" },
      { id: "importbase", title: "Import base report", group: "reports" },
      { id: "base", title: "Base report", group: "reports" },
      { id: "problem", title: "Problems report", group: "reports" },
      { id: "cases", title: "Cases report", group: "reports" },
      { id: "complain", title: "Complain report", group: "reports" },
      { id: "finished", title: "Finished report", group: "reports" },
    ],
  },
  mutations: {
    toNav(state, nav) {
      state.active = nav;
    },
  },
  actions: {},
  getters: {
    navbarSettings(state) {
      return state.lists.filter((val) => val.group === "setting");
    },
    navbarReports(state) {
      return state.lists.filter((val) => val.group === "reports");
    },
  },
};

export default Navbar;
