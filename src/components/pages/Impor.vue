<template>
    <h1 class="w3-center">Export / Import data</h1>
    <Button primary value="Export" type="button" @trig="expor" />
</template>

<script>
import Button from "../elements/Button.vue"

export default {
    name: "Impor",
    components: {
        Button
    },
    methods: {
        expor() {
      // tutup Loader
    //   this.$store.dispatch("Modal/loading", "close");
      //append time to export record
    //   this.$store.dispatch("ExIm/exportAppend");
    this.$store.dispatch("Expor/expor").then(() => {
        this.download(this.$store.state.Expor.lists)
    })
    // .then((val) => {
        // console.log(val)
        // var a = document.createElement("a");
        // var file = new Blob(
        //   [JSON.stringify(val)],
        //   {
        //     type: "text/plain",
        //   }
        // );
        // a.href = URL.createObjectURL(file);
        // a.download =
        //   "All data absensi.js";
        // a.click();

    // })
      //destroy data collect
    //   this.$store.dispatch("ExIm/destroyDataCollect");
        },
        download(val) {
            var a = document.createElement("a");
        var file = new Blob(
          [JSON.stringify(val)],
          {
            type: "text/plain",
          }
        );
        a.href = URL.createObjectURL(file);
        a.download =
          "All data absensi.js";
        a.click();
        }
    }
}
</script>