<template>
    <div>
      <div v-if="records.length > 0" v-for="(rec, index) in records" :key="rec.item" >
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
import { uid } from "uid"
import Button from "../../components/elements/Button.vue"
import InputItem from "./InputItem.vue"

export default {
    methods: {
      kirim() {
          this.$store.dispatch("BaseReportStock/addItem", this.pickedItem)
      },
      add() {
          this.records.push(
          {
              item: null,
          })
          this.pickedItem.push(
          Object.assign({ id: uid(9), item: null, }, this.$store.getters["Modal/obj"].addOn)
          )
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
    name: "BaseStockForm"
}
</script>