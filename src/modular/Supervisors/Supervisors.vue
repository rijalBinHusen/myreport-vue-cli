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
      v-if="GET_SUPERVISORS.length > 0"
      :headers="['Nama']" 
      :lists="GET_SUPERVISORS" 
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
          :datanya="prop?.id" 
          type="button" 
          @trig="disableName($event)" 
        />

      </template>
    </Table>
</template>

<script>
import Button from "../../components/elements/Button.vue"
import Select from "../../components/elements/Select.vue"
import { uid } from "uid"
import Table from "../../components/elements/Table.vue"
import { mapState, mapGetters, mapActions } from "vuex";

export default {
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
      timeOut: "",
    }
  },
  methods: {
    ...mapActions({
      APPEND: "append",
      UPDATE: "update"
    }),

    changeShift(id, shift) {
      
      if(this.editId == id) {
        clearTimeout(this.timeOut)
      }
      this.editId = id
      this.timeOut = setTimeout(() => {
        this.$store.dispatch("Supervisors/updateShift", { id: id, shift: shift })
        this.cancel()
      }, 1000)
    },
    send() {
      if(this.supervisor.name) {
        let record = {
          store: "Supervisors",
              obj: { ...this.supervisor }
          }
        
        // if update 
        if(this.editId) { this.UPDATE(Object.assign({ criteria: { id: this.editId } }, record )) }
        // else
        else {
          record.obj.id = this.GET_SUPERVISORS[0] ? this.GET_SUPERVISORS[0].id : "SPV22050000"
          record.obj.disabled = false
          record.obj.shift = 3
          this.APPEND(record)
        }
      }
      this.cancel()
    },
    edit(ev) {
      this.editId = ev
      this.supervisor = this.GET_SUPERVISORID(ev)
    },
    cancel() {
      this.editId = ""
      this.supervisor = {
        name: "",
        phone: "",
      }
    },
    disableName(ev) {
            let record = this.GET_SUPERVISORID(ev)
            // change record disabled
            record.disabled = !record.disabled
            this.UPDATE({ store: "Supervisors", obj: record, criteria: { id: ev } })
        },
  },
  mounted() {
    this.cancel();
  },
  computed: {
    ...mapGetters({
      GET_SUPERVISORID: "Supervisors/spvId",
      GET_SUPERVISORS: "Supervisors/lists"
    }),
  },
};
</script>
