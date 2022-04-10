<template>
    <div class="w3-center">
    <input
      class="w3-hide"
      @change.prevent="impor($event)"
      type="file"
      accept=".js"
      ref="importerField"
    />
    <br />
    <br />
    <br />
    <br />
    <br />
         <Button 
            v-if="_STATUS" 
            :style="{width: '250px' }" 
            class="" 
            primary value="Importer" 
            type="button" 
            @trig="importerField" 
        />
        <p v-else style="font-weight: bold" class="w3-large">Import prohibited, Backup data first!</p>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex"
import Button from "../elements/Button.vue"

export default {
    name: "Impor",
    components: {
        // Importer,
        Button,
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
    computed: {
        ...mapState({
            _STATUS: state => state.Impor.status,
        }),
    }
}
</script>