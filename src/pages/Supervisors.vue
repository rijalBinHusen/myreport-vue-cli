<template>
  <div class="w3-center w3-margin-top w3-row">
    <form ref="spvForm" class="margin-bottom" @submit.prevent="send">
    <p class="w3-col s2 w3-right-align w3-margin-right">Add new supervisor : </p>
    <input v-model="supervisor" class=" w3-round-large w3-col s2 w3-input w3-large w3-margin-right" type="text" placeholder="Supervisor name" />
    <input v-model="phone" class="w3-round-large w3-col s2 w3-input w3-large w3-margin-right" type="text" placeholder="Phone" />
    
    <Button 
      primary 
      class="w3-left w3-large w3-margin-left" 
      :value="idSupervisor && supervisor ? 'Update' : 'Add'" 
      type="button"
    />
    <Button 
      v-if="idSupervisor && supervisor"
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
      v-if="renderTable"
      :headers="['Nama']" 
      :lists="listSupervisors" 
      :keys="['name']"
      options
    >
      <template #th>
          <th>Shift</th>
      </template>

      <template #td="{ obj }">
        <td>
          <input type="number" min="1" class="w3-round w3-border" style="width:60px" max="3" :value="obj.shift ? obj.shift : 1" @change="changeShift(obj.id, $event.target.value)" >
          <!-- {{ obj }} -->
        </td>
      </template>

      <template v-slot:default="{ prop }">
      
      <Button 
        primary 
        value="Edit" 
        :datanya="prop?.id" 
        type="button" 
        @trig="edit($event)" 
        />

        <Button
          :danger="prop?.disabled"
          :primary="!prop?.disabled"
          :value="prop?.disabled ? 'Disabled' : 'Enabled'"
          type="button" 
          @trig="disableName(prop?.id, prop?.disabled)" 
        />

      </template>
    </Table>
</template>

<script>
import Button from "@/components/elements/Button.vue"
import Select from "@/components/elements/Select.vue"
import Table from "@/components/elements/Table.vue"
import { warehouseNameBySpv } from '@/composable/components/Warehouses';
import { updateSupervisor, addSupervisor, getSupervisorId, lists } from '@/composable/components/Supervisors'
import { ref, onMounted } from 'vue';

export default {
  components: {
    Button,
    Table,
    Select
  },
  setup() {
    const renderTable = ref(false)
    const supervisor = ref('')
    const phone = ref('')
    const idSupervisor = ref('')
    const listSupervisors = ref([])
    let timeout = ''

    const renewLists = () => {
      renderTable.value = false
      listSupervisors.value = lists
      renderTable.value = true
    }

    onMounted(() => {
      renewLists()
    })
    
    const disableName = async (ev, disabled) => {
      // cek dulu apakah dia sudah di pick di suatu gudang
      let warehouseName = warehouseNameBySpv(ev)
      // kalau belum dipick
      if(!warehouseName) { 
        alert("Supervisor belum ditugaskan digudang")
        return 
      }
      await updateSupervisor(ev, { disabled: !disabled })
      renewLists()
    }

    const changeShift = async (id, shift) => {
      
      if(idSupervisor.value == id) { clearTimeout(timeout) }
      idSupervisor.value = id
      timeout = setTimeout(() => {
        updateSupervisor(id, { shift: shift })
        cancel()
      }, 1000)
    }

    const send = async () => {
      // jika update
      if(idSupervisor.value) {
        await updateSupervisor(idSupervisor.value, { name: supervisor.value, phone: phone.value})
      }
      // jika tidak
      else {
        await addSupervisor(supervisor.value, phone.value)
      }
      renewLists()
      cancel()
    }

    const cancel = () => {
      idSupervisor.value = ""
      supervisor.value = ""
      phone.value = ""
    }
    
    const edit = async (ev) => {
      let getSupervisor = await getSupervisorId(ev)
      idSupervisor.value = ev
      supervisor.value = getSupervisor?.name
      phone.value = getSupervisor?.phone
    }

    return { 
      disableName,
      supervisor,
      phone,
      idSupervisor,
      listSupervisors,
      edit,
      changeShift,
      send,
      cancel,
      renderTable
     }

  },
};
</script>
