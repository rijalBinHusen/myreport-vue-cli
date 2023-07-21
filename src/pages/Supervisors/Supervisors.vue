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
    <DatatableVue
      v-if="lists.length"
      :datanya="lists" 
      :heads="['Nama']" 
      :keys="['name']"
      option
      id="data-table-supervisors"
    >
      <template #th>
          <th>Shift</th>
      </template>

      <template #td="{ obj }">
        <td>
          <input 
              type="number" 
              min="1" 
              class="w3-round w3-border" 
              style="width:60px" 
              max="3" 
              :value="obj?.shift" 
              @change="changeShift(obj.id, $event.target.value)" 
            >
        </td>
      </template>

      <template #default="{ prop }">
      
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
    </DatatableVue>
</template>

<script setup>
import Button from "@/components/elements/Button.vue"
import Select from "@/components/elements/Select.vue"
import DatatableVue from "@/components/parts/Datatable.vue";
import { warehouseNameBySpv } from '@/pages/Warehouses/Warehouses';
import { updateSupervisor, addSupervisor, getSupervisorId, lists, getSupervisors, updateShiftSupervisor } from './Supervisors'
import { ref, onBeforeMount } from 'vue';

    const supervisor = ref('')
    const phone = ref('')
    const idSupervisor = ref('')
    let timeout = '';

    onBeforeMount(async () => {
      await getSupervisors()
    })
    
    const disableName = async (ev, disabled) => {
      // cek dulu apakah dia sudah di pick di suatu gudang
      let warehouseName = await warehouseNameBySpv(ev)
      // kalau belum dipick
      if(!warehouseName) { 
        alert("Supervisor belum ditugaskan digudang")
        return 
      }
      await updateSupervisor(ev, { disabled: !disabled })
      
    }

    const changeShift = async (id, shift) => {
      updateShiftSupervisor(id, shift);
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

</script>