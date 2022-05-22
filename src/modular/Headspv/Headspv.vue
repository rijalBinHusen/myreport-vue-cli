<template>
  <div class="w3-center w3-margin-top w3-row">
    <form ref="spvForm" class="margin-bottom" @submit.prevent="send">
    <p class="w3-col s3 w3-right-align w3-margin-right">Add new head supervisor : </p>
    <input v-model="head.name" class="w3-col s3 w3-input w3-large w3-margin-right" type="text" placeholder="Supervisor name" />
    <input v-model="head.phone" class="w3-col s3 w3-input w3-large w3-margin-right" type="text" placeholder="Phone" />
    <Button 
      primary 
      class="w3-left w3-large w3-margin-left" 
      :value="editId ? 'Update' : 'Add'" 
      type="button"
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
      v-if="_HEADSPV.length > 0"
      :headers="['Nama']" 
      :lists="_HEADSPV" 
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

      <template #default="slotProp">
        <Button 
          primary 
          value="Edit" 
          :datanya="slotProp.prop.id" 
          type="button" 
          @trig="edit($event)" 
        />

        <Button
          :danger="slotProp.prop.disabled"
          :primary="!slotProp.prop.disabled"
          :value="slotProp.prop.disabled ? 'Disabled' : 'Enabled'" 
          :datanya="slotProp.prop.id" 
          type="button" 
          @trig="disableName($event)" 
        />
      </template>
    </Table>
</template>

<script>
import Button from "../../components/elements/Button.vue"
import Select from "../../components/elements/Select.vue"
import Table from "../../components/elements/Table.vue"
import { mapState, mapGetters, mapActions } from "vuex";

export default {
  components: {
    Button,
    Table,
    Select
  },
  name: "Headspv",
  data() {
    return {
      head: {},
      editId: "",
    }
  },
  methods: {
    ...mapActions({
      APPEND: "append",
      UPDATE: "update"
    }),

    changeShift(id, shift) {
      let record = this.GET_HEADID(id)
      // change shift
      record.shift = shift
      this.UPDATE({ store: "Headspv", obj: record, criteria: { id: id } })
    },

    send() {
      if(this.head.name) {
        let record = {
          store: "Headspv",
          obj: { ...this.head }
        }
        // if update
          if(this.editId) {this.UPDATE(Object.assign({ criteria: { id: this.editId } }, record )) }

        // else
        else {
          record.obj.id = this._HEADSPV[0] ? this._HEADSPV[0].id : "HSP22050000"
          record.obj.disabled = false
          record.obj.shift = 3
          this.APPEND(record)
        }
      }
      this.cancel()
    },
    edit(ev) {
      this.editId = ev
      this.head = this.GET_HEADID(ev)
    },
    cancel() {
      this.editId = ""
      this.head = {}
    },
    disableName(ev) {
            let record = this.GET_HEADID(ev)
            // change record disabled
            record.disabled = !record.disabled
            this.UPDATE({ store: "Headspv", obj: record, criteria: { id: ev } })
        },
  },
  mounted() {
    this.cancel();
  },
  computed: {
    ...mapState({
      _HEADSPV: state => [...state.Headspv.lists]
    }),
    ...mapGetters({
      GET_HEADID: "Headspv/headId",
    }),
  },
};
</script>
