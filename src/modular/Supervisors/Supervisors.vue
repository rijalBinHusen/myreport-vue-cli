<template>
  <div class="w3-center w3-margin-top w3-row">
    <form ref="spvForm" class="margin-bottom" @submit.prevent="send">
    <p class="w3-col s2 w3-right-align w3-margin-right">Add new supervisor : </p>
    <input v-model="supervisor.name" class="w3-col s2 w3-input w3-large w3-margin-right" type="text" placeholder="Supervisor name" />
    <input v-model="supervisor.phone" class="w3-col s2 w3-input w3-large w3-margin-right" type="text" placeholder="Phone" />
    <Select 
    nomargin
    :options="warehouses" 
    class="w3-col s3"
    value="id"
    text="name"
    :inselect="supervisor.warehouse"
    @selected="supervisor.warehouse = $event"
    />
    <Button 
      primary 
      class="w3-left w3-large w3-margin-left" 
      :value="GET_EDIT.id ? 'Update' : 'Add'" 
      type="button"
    />
    <Button 
      v-if="GET_EDIT.id"
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
      :headers="['Nama', 'Warehouse']" 
      :lists="GET_SUPERVISORS" 
      :keys="['name', 'warehouseName']"
      options
      v-slot:default="slotProp"
    >
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
    </Table>
</template>

<script>
import Button from "../../components/elements/Button.vue"
import Select from "../../components/elements/Select.vue"
import { uid } from "uid"
import Table from "../../components/elements/Table.vue"
import { mapState, mapGetters, mapMutations, mapActions } from "vuex";

export default {
  components: {
    Button,
    Table,
    Select
  },
  name: "Supervisors",
  data() {
    return {
      supervisor: {}
    }
  },
  methods: {
    ...mapActions({
      APPEND: "append",
      UPDATE: "update"
    }),
    ...mapMutations({
      EDIT: "Supervisors/edit"
    }),

    send() {
      if(this.supervisor.name) {
        // if update
          if(this.GET_EDIT.id) {
            this.UPDATE({
              store: "Supervisors",
              obj: this.supervisor
            })
          }

        // else
        else {
          this.APPEND({
            store: "Supervisors",
            obj: Object.assign( { id: uid(3), disabled: false }, this.supervisor)
          })
        }
      }
      this.cancel()
    },
    edit(ev) {
      this.EDIT(ev)
      this.supervisor = this.GET_EDIT
    },
    cancel() {
      this.EDIT("null")
      this.supervisor = this.GET_EDIT
    },
    disableName(ev) {
            this.EDIT(ev)
            let record = this.GET_EDIT
            // change record disabled
            record.disabled = !record.disabled
            this.UPDATE({ store: "Supervisors", obj: record })
            this.EDIT("null")
        },
  },
  mounted() {
    this.cancel();
  },
  computed: {
    ...mapState({
      _WAREHOUSES: state => JSON.parse(JSON.stringify(state.Warehouses.lists))
    }),
    ...mapGetters({
      GET_EDIT: "Supervisors/edit",
      GET_SUPERVISORS: "Supervisors/lists"
    }),
    warehouses() {
      let rec = this._WAREHOUSES
      rec.unshift({
        id: "",
        name: "Select warehouse"
      })
      return rec
    }
  },
};
</script>
