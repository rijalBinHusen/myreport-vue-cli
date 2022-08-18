<template>
  <div class="w3-center w3-margin-top w3-row">
    <form ref="spvForm" class="margin-bottom" @submit.prevent="send">
    <p class="w3-col s2 w3-right-align w3-margin-right">Add new supervisor : </p>
    <input v-model="supervisor.name" class=" w3-round-large w3-col s2 w3-input w3-large w3-margin-right" type="text" placeholder="Supervisor name" />
    <input v-model="supervisor.phone" class="w3-round-large w3-col s2 w3-input w3-large w3-margin-right" type="text" placeholder="Phone" />
    
    <Button 
      primary 
      class="w3-left w3-large w3-margin-left" 
      :value="editId && supervisor?.name ? 'Update' : 'Add'" 
      type="button"
    />
    <Button 
      v-if="editId && supervisor?.name"
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
      :headers="['Nama']" 
      :lists="$store.state.Supervisors.lists" 
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
import { useStore } from 'vuex';
import Button from "../../components/elements/Button.vue"
import Select from "../../components/elements/Select.vue"
import Table from "../../components/elements/Table.vue"

export default {
  setup() {
    // 
    const store = useStore()
    
    const disableName = (ev, disabled) => {
      // cek dulu apakah dia sudah di pick di suatu gudang
      let warehouseName = store.getters['Warehouses/warehouseNameBySpv'](ev)
      // kalau belum dipick
      if(!warehouseName) { 
        alert("Supervisor belum ditugaskan digudang")
        return 
      }

      store.dispatch("Supervisors/updateParam", { 
        id: ev, 
        param: { disabled: !disabled } 
      })
    }

    return { disableName }
  },
  components: {
    Button,
    Table,
    Select
  },
  name: "Supervisors",
  data() {
    return {
      supervisor: {},
      editId: "",
      lists: [],
      timeOut: "",
    }
  },
  methods: {
    changeShift(id, shift) {
      
      if(this.editId == id) {
        clearTimeout(this.timeOut)
      }
      this.editId = id
      this.timeOut = setTimeout(() => {
        this.$store.dispatch("Supervisors/updateParam", { id: id, param: { shift: shift } })
        this.cancel()
      }, 1000)
    },
    send() {
      // jika update
      if(this.editId) {
        this.$store.dispatch("Supervisors/update",{ ...this.supervisor, id: this.editId })
      }
      // jika tidak
      else {
        this.$store.dispatch("Supervisors/append", { ...this.supervisor, disabled: true })
      }
      this.cancel()
    },
    edit(ev) {
      this.editId = ev
      this.supervisor = this.$store.getters["Supervisors/spvId"](ev)
    },
    cancel() {
      this.editId = ""
      this.supervisor = {
        name: "",
        phone: "",
      }
    },
  },
  mounted() {
    this.cancel();
  },
};
</script>
