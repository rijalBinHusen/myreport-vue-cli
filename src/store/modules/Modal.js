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
    // we use this as alternative to catch a message before we close the modal
    tunnelMessage(val) {
      return val
    },
    active(state, val) {
      //jika val ada isinya, modal active, ganti form
      if (val) {
        state.more = val;
        state.active = true;
      }
      // jika tidak, tutup modal, judul kosongi, form kosongi
      else {
        this.commit('Modal/tunnelMessage', false)
        if (state.more.form === "Loader") {
          setTimeout(() => {
            state.active = false;
            state.more = { judul: "", form: "" };
          }, 500);
          return;
        }
        state.active = false;
        state.more = { judul: "", form: "" };
      }
    },
  },
  actions: {},
  getters: {
    obj(state) {
      return JSON.parse(JSON.stringify(state.more));
    },
  },
};

export default Modal;
