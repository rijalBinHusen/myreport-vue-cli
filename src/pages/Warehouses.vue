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
      :lists="warehouseLists" 
      :keys="['name']"
      options
    > 

    <!-- Warehouse group -->
    <template #th>
        <th>Group gudang</th>
    </template>

    <template #td="{ obj }">
       
      <div class="w3-round-large w3-small">
        <SelectWarehouse 
        :inSelectWarehouse="obj.group"
        @selectedWarehouse="setGroup(obj.id, $event)"
        :noLabel="true"
        />
      </div>
            
    </template>
    <!-- End of warehouse group -->
    <!-- Button button -->
        <template #default="{ prop }">
        <div class="w3-margin-top w3-margin-bottom">
          <Button 
            secondary 
            value="Supervisors" 
            :datanya="prop.id" 
            type="button" 
            @trig="supervisors($event)" 
            />

          <Button 
            secondary 
            value="Head" 
            :datanya="prop.id" 
            type="button" 
            @trig="head($event)" 
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
          </div>
        </template>
      <!-- End of button button -->
    </Table>
</template>

<script>
import Button from "@/components/elements/Button.vue"
import Table from "@/components/elements/Table.vue"
import { subscribeMutation } from "@/composable/piece/subscribeMutation";
import { ref, onMounted } from "vue";
import { updateWarehouse, addWarehouse, disableWarehouse, lists, warehouseId, updateWarehouseVariable } from '@/composable/components/Warehouses'
import SelectWarehouse from "@/components/parts/SelectWarehouse.vue";

export default {
  components: { Button, Table, SelectWarehouse },
  setup () {
    const warehouse = ref('')
    const idWarehouse = ref('')
    const warehouseLists = ref([])

    const supervisors = async (ev) => {
      let res = await subscribeMutation(
        "Edit supervisors",
        "WarehouseSupervisorsForm",
        { id: ev },
        'Modal/tunnelMessage'
      )
      if(res) {
        renewLists()
      }
    }

    const head = async (ev) => {
      let res = await subscribeMutation(
        "Edit Head",
        "WarehouseHeadForm",
        { id: ev },
        'Modal/tunnelMessage'
      )
      if(res) {
        renewLists()
      }
    }

    const send = async () => {
      // jika update
      if(idWarehouse.value) { await updateWarehouse(idWarehouse.value, warehouse.value) }
      // jika tidak
      else { await addWarehouse(warehouse.value) }
      // reset the form
      cancel()
      renewLists()
    }

    const renewLists = () => {
      warehouseLists.value = lists
    }

    const cancel = () => {
      idWarehouse.value = ""
      warehouse.value = ""
    }

    const disable = async (ev, disabled) => {
      await disableWarehouse(ev, !disabled)
      renewLists()
    }

    const edit = async (ev) => {
      idWarehouse.value = ev
      warehouse.value = await warehouseId(ev)?.name
    }
    const setGroup = async (idWarehouse, idWarehouseGroup) => {
      await updateWarehouseVariable(idWarehouse, { group: idWarehouseGroup })
      renewLists()
    }

    onMounted(() => {
      renewLists()
    })

    return {
      warehouse,
      idWarehouse,
      supervisors,
      send,
      disable,
      edit,
      lists,
      cancel,
      warehouseLists,
      setGroup,
      head
    }

  },
}
</script>
