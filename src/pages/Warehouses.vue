<template>
  <div class="w3-center w3-margin-top w3-row">
    <form class="margin-bottom" @submit.prevent="send">
      <p class="w3-col s4 w3-right-align w3-margin-right">Add new warehouses : </p>
      <input v-model="warehouse" class="w3-col s4 w3-input w3-large" type="text" placeholder="Warehouse name" />
      <Button 
        primary 
        class="w3-left w3-large w3-margin-left" 
        :value="idWarehouse ? 'Update' : 'Add'" 
        type="button" 
      />
      <Button 
        v-if="idWarehouse"
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
      v-if="lists.length"
      :headers="['Nama gudang']" 
      :lists="lists" 
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

        <Button
          :danger="prop?.disabled"
          :primary="!prop?.disabled"
          :value="prop?.disabled ? 'Disabled' : 'Enabled'"
          type="button" 
          @trig="disable(prop?.id, prop?.disabled)" 
        />
    </Table>
</template>

<script>
import Button from "@/components/elements/Button.vue"
import Table from "@/components/elements/Table.vue"
import { subscribeMutation } from "@/composable/piece/subscribeMutation";
import { ref } from "@firebase/storage";
import { updateWarehouse, addWarehouse, disableWarehouse, lists } from '@/composable/components/Warehouses'

export default {
  components: { Button, Table },
  setup () {
    const warehouse = ref('')
    const idWarehouse = ref('')

    const supervisors = async (ev) => {
      let res = await subscribeMutation(
        "Edit supervisors",
        "WarehouseSupervisorsForm",
        { id: ev },
        'Modal/tunnelMessage'
      )
      // this.$store.commit("Modal/active", {
      //           judul: "Edit supervisors", 
      //           form: "WarehouseSupervisorsForm",
      //           obj: { id: ev }
      //       });
    }
    const send = async () => {
      // jika update
      if(idWarehouse.value) { await updateWarehouse(idWarehouse.value, warehouse.value) }
      // jika tidak
      else { await addWarehouse(warehouse.value) }
      // reset the form
      cancel()
    }

    const cancel = () => {
      idWarehouse.value = ""
      warehouse.value = ""
    }

    const disable = async (ev, disabled) => {
      await disableWarehouse(ev, disabled)
    }

    const edit = (ev) => {
      idWarehouse.value = ev
      warehouse.value = this.GET_WAREHOUSEID(ev).name
    }

    return {
      warehouse,
      idWarehouse,
      supervisors,
      send,
      disable,
      edit,
      lists
    }

  },
}
</script>
