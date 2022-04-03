<template>
  <div class="w3-center w3-margin-top w3-row">
    <form class="margin-bottom" @submit.prevent="send">
    <p class="w3-col s4 w3-right-align w3-margin-right">Add new warehouses : </p>
    <input v-model="warehouse" class="w3-col s4 w3-input w3-large" type="text" placeholder="Warehouse name" />
    <Button primary class="w3-left w3-large w3-margin-left" value="Add" type="button" @trig="send" />
    </form>
  </div>
    <br />
    <br />
    <Table 
      v-if="_WAREHOUSES.length > 0"
      :headers="['Nama gudang']" 
      :lists="_WAREHOUSES" 
      :keys="['name']"
      options
      v-slot:default="slotProp"
    >
      <Button 
        primary 
        value="Edit" 
        :datanya="slotProp.prop.id" 
        type="button" 
        @trig="editName($event)" 
        />
    </Table>
</template>

<script>
import Button from "../elements/Button.vue"
import { uid } from "uid"
import Table from "../elements/Table.vue"
import { mapState } from "vuex";

export default {
  name: "Warehouses",
  data() {
    return {
      warehouse: ""
    }
  },
  components: {
    Button,
    Table
  },
  methods: {
    send() {
      if(this.warehouse) {
          this.$store.dispatch("append", {
            store: "Warehouses",
            obj: {
              id: uid(3),
              name: this.warehouse
            }
        })
      this.warehouse = ""
      }
    }
  },
  computed: {
    ...mapState({
      _WAREHOUSES: state => state.Warehouses.lists
    })
  },
};
</script>
