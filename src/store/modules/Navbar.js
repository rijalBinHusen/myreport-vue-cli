const Navbar = {
  namespaced: true,
  state: {
    active: "",
  },
  mutations: {
    toNav(state, nav) {
      state.active = nav;
    },
  },
  actions: {},
  getters: {},
};

export default Navbar;
