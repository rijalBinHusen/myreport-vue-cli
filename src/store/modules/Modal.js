const Modal = {
  namespaced: true,
  state: {
    active: 0,
    more: {
      judul: "",
      form: "",
    },
  },
  mutations: {
    active(state, val) {
      state.active = !state.active;
      val ? (state.more = val) : (state.form = "");
    },
  },
  actions: {},
  getters: {},
};

export default Modal;
