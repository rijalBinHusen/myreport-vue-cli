<template>
  <div>
    <input
      class="w3-hide"
      @change.prevent="impor($event)"
      type="file"
      accept=".js"
      ref="importerField"
    /><br />
    <Button primary value="Importer" type="button" @trig="importerField" />
  </div>
</template>

<script>

import Button from "../elements/Button.vue"

export default {
  name: "ImporterForm",
  components: {
    Button
  },
  methods: {
    importerField() {
      this.$refs.importerField.click();
    },
    impor(ev) {
      //buka loader
      this.$store.commit("Modal/active", {judul: "", form: "Loader"});
      // console.log(ev);
      const reader = new FileReader();

      //when reading is completed load
      reader.onload = (event) => this.send(JSON.parse(event.target.result));

      reader.readAsText(ev.target.files[0]);
    },
    send(val) {
      //send data to vuex
      this.$store.commit("Impor/impor", val);
      // bring the importer form
      this.$store.commit("Modal/active", {judul: "Pilih store", form: "ImporterForm"});
    },
  },
};
</script>
