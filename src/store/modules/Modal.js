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
      //jika val ada isinya, modal active, ganti form
      if (val) {
        state.more = val;
        state.active = true;
      }
      // jika tidak, tutup modal, judul kosongi, form kosongi
      else {
        if (state.more.form === "Loader") {
          setTimeout(() => {
            state.active = false;
          }, 1500);
        }
        state.active = false;
      }
    },
  },
  actions: {},
  getters: {},
};

export default Modal;
