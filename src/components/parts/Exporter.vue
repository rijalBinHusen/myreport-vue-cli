<template>
  <div>
    <!-- <p class="w3-xlarge">Export Data</p>
    <span class="w3-jumbo w3-button w3-white w3-hover-white">
      <a @click.prevent="exportDataCollect('start')">
        <font-awesome-icon style="color: teal" icon="cloud-download-alt" />
      </a>
    </span>
    <p class="w3-xlarge">Exported :</p>
    <ul class="">
      <li :key="expor.time" v-for="expor in exportData">
        {{ new Date(expor.time) }}
      </li>
    </ul> -->
    <Button primary value="Export" type="button" @trig="exportDataCollect('start')" />
  </div>
</template>

<script>

import Button from "../elements/Button.vue"

export default {
  name: "Exporter",
  methods: {
    //trigeer methods untuk collect data
    exportDataCollect(cond) {
    // bring up the loader
    this.$store.commit("Modal/active", {judul: "", form: "Loader"});
      if (cond == "start") {
        //buka loader
        // this.$store.dispatch("Modal/loading", "open");
        //trigger methods divuex untuk collect data
        this.$store.dispatch("Expor/expor")
        //periksa apakah sudah tercollect atau tidak
        this.checkDataCollect();
      } else {
        //cek apakah progres suda selessai atau tidak
        this.checkDataCollect();
      }
    },
    //periksa apakah collect data sudah selelsai
    checkDataCollect() {
      // status: this.$store.getters["ExIm/statusExport"]
      this.$store.state.Expor.lists.status
        ? //jika sudah
          this.download(`Backup myreport ${
            this.$store.getters["dateFormat"]({format: "full"})
          }`, "text/plain")
        : //jike belum jalankan lagi exportDataCollect
          setTimeout(() => {
            this.exportDataCollect();
          }, 3000);
    },
    download(fileName, contentType) {
      // tutup Loader
      this.$store.commit("Modal/active")
      
      var a = document.createElement("a");
      var file = new Blob(
        [JSON.stringify(this.$store.state.Expor.lists)],
        {
          type: contentType,
        }
      );
      a.href = URL.createObjectURL(file);
      a.download = fileName;
      a.click();
      //destroy data collect
    //   this.$store.dispatch("ExIm/destroyDataCollect");
    },
    // download(jsonData, 'json.txt', 'text/plain');
  },
  components: {
      Button,
  }
};
</script>
