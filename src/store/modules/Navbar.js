const Navbar = {
  namespaced: true,
  state: {
    active: "",
    lists: [
      { id: 'Documents', title: 'Documents', group: 'reports'},
      { id: "Warehouses", title: "Warehouses", group: "setting" },
      { id: "BaseReportFile", title: "Base report file", group: "reports" },
      { id: "Supervisors", title: "Supervisors", group: "setting" },
      { id: "Base", title: "Base report", group: "reports" },
      { id: "ProblemReport", title: "Problems report", group: "reports" },
      { id: "Cases", title: "Cases report", group: "reports" },
      { id: "Complains", title: "Complain report", group: "reports" },
      { id: "Finished", title: "Finished report", group: "reports" },
      { id: "DateExpired", title: "Expired date", group: "reports" },
      { id: "FollowUp", title: "Follow up", group: "reports" },
      { id: "Headspv", title: "Head division", group: "setting" },
      { id: "BaseItem", title: "Base item", group: "setting" },
      { id: "Backup", title: "Backup data", group: "setting" },
      { id: "ImportData", title: "Import data", group: "setting" },
      { id: "ReportExport", title: "Report export", group: "setting" },
      { id: "EditDocument", title: "Edit document", group: "setting" },
      { id: "FieldProblemVue", title: "Kendala lapangan", group: "reports" },
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
    active(state) {
      let rec = state.lists.find((val) => val.id === state.active);
      if (state.active) {
        return rec;
      }
      return { id: "kosong", title: "Welcome" };
    },
  },
};

export default Navbar;
