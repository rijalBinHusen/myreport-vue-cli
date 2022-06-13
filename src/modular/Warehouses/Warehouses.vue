<template>
  <div class="w3-center w3-margin-top w3-row">
    <form class="margin-bottom" @submit.prevent="send">
      <p class="w3-col s4 w3-right-align w3-margin-right">Add new warehouses : </p>
      <input v-model="warehouse" class="w3-col s4 w3-input w3-large" type="text" placeholder="Warehouse name" />
      <Button 
        primary 
        class="w3-left w3-large w3-margin-left" 
        :value="editId ? 'Update' : 'Add'" 
        type="button" 
        @trig="send" 
      />
      <Button 
        v-if="editId"
        danger 
        class="w3-left w3-large" 
        value="Cancel" 
        type="button" 
        @trig="cancel" 
      />
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
      #default="{ prop }"
    >
      <Button 
        secondary 
        value="Supervisors" 
        :datanya="prop.id" 
        type="button" 
        @trig="supervisors($event)" 
        />

      <Button 
        primary 
        value="Edit" 
        :datanya="prop.id" 
        type="button" 
        @trig="edit($event)" 
        />
    </Table>
</template>

<script>
import Button from "../../components/elements/Button.vue"
import Table from "../../components/elements/Table.vue"
import { mapState, mapGetters, mapActions } from "vuex";

export default {
  name: "Warehouses",
  data() {
    return {
      warehouse: "",
      editId: "",
    }
  },
  components: {
    Button,
    Table
  },
  methods: {
    ...mapActions({
      APPEND: "append",
      UPDATE: "update"
    }),

    supervisors(ev) {
      this.$store.commit("Modal/active", {
                judul: "Edit supervisors", 
                form: "WarehouseSupervisorsForm",
                obj: { id: ev }
            });
    },

    send() {
      if(this.warehouse) {
        let record = {
              store: "Warehouses",
              obj: {
                name: this.warehouse
              }}
        this.editId ? record.criteria = { id: this.editId } : false
        // if update
        if(this.editId) { this.UPDATE(record) }
        // else
        else { this.APPEND(record) }
        this.warehouse = ""
        this.editId = ""
      }
    },
    edit(ev) {
      this.editId = ev
      this.warehouse = this.GET_WAREHOUSEID(ev).name
    },
    cancel() {
      this.editId = ""
      this.warehouse = ""
    },
  },
  computed: {
    ...mapState({
      _WAREHOUSES: state => Array.from(state.Warehouses.lists)
    }),
    ...mapGetters({
      GET_WAREHOUSEID: "Warehouses/warehouseId"
    })
  },
};
</script>
