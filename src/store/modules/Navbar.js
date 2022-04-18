const Navbar = {
  namespaced: true,
  state: {
    active: "",
    lists: [
      { id: "Warehouses", title: "Warehouses", group: "setting" },
      { id: "Supervisors", title: "Supervisors", group: "setting" },
      { id: "Backup", title: "Backup data", group: "setting" },
      { id: "ImportData", title: "Import data", group: "setting" },
      { id: "Uncollected", title: "Uncollected report", group: "reports" },
      { id: "Collected", title: "Collected report", group: "reports" },
      { id: "Importbase", title: "Import base report", group: "reports" },
      { id: "Base", title: "Base report", group: "reports" },
      { id: "Problem", title: "Problems report", group: "reports" },
      { id: "Cases", title: "Cases report", group: "reports" },
      { id: "Complain", title: "Complain report", group: "reports" },
      { id: "Finished", title: "Finished report", group: "reports" },
      { id: "AGGrid", title: "AG grid", group: "reports" },
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
    activeTitle(state) {
      let rec = state.lists.find((val) => val.id === state.active);
      if (state.active) {
        return rec.title;
      }
    },
  },
};

export default Navbar;
