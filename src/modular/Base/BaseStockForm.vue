<template>
    <div>
      <div v-for="(rec, index) in records" :key="rec.item" >
        <label>Masukkan kode item</label>
        <InputItem  @chose="item(index, $event)" placeholder="Kode item" class="w3-input w3-border w3-margin-top" />
      </div>
      <div class="w3-row">
        <Button 
            value="+" 
            class="w3-right w3-margin-top"
            type="button" 
            secondary
            @trig="add"
        />
      </div>
      <div class="w3-row">
        <Button 
            value="Submit" 
            class="w3-margin-top"
            type="button" 
            primary
            :nomargin="true"
            @trig="kirim"
        />
      </div>
    </div>
</template>

<script>
import Input from "../../components/elements/Input.vue"
import Button from "../../components/elements/Button.vue"
import InputItem from "./InputItem.vue"
import { appendData } from "@/composable/components/BaseReportStock"

export default {
    methods: {
      async kirim() {
          // OPEN LOADER
          this.$store.commit("Modal/active", {judul: "", form: "Loader"})
          // ITERATE AND WAIT THE PROCESS
            for(let item of this.pickedItem) {
              await appendData(
                item.parent,
                Number(item.shift),
                item.item,
                0,
                0,
                0,
                0
              )
            }
          this.$store.commit("Modal/tunnelMessage", true)
          // CLOSE LOADER
          this.$store.commit("Modal/active")
          // this.$store.dispatch("BaseReportStock/addItem", this.pickedItem)
      },
      add() {
          this.records.push({ item: null })
          this.pickedItem.push({ item: null,  ...this.$store.getters["Modal/obj"].obj })
      },
      item(index, value) {
        this.pickedItem[index].item = value
      },
    },
    data() {
        return {
          records: [],
          pickedItem: [],
        }
    },
    components: {
        Input,
        Button,
        InputItem,
    },
}
</script>