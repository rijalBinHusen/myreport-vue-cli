<template>
  <div class="w3-center w3-margin-top w3-row">
    <form ref="spvForm" class="margin-bottom" @submit.prevent="send">
    <p class="w3-col s3 w3-right-align w3-margin-right">Add new head supervisor : </p>
    <input v-model="head.name" class="w3-col s3 w3-input w3-large w3-margin-right" type="text" placeholder="Supervisor name" />
    <input v-model="head.phone" class="w3-col s3 w3-input w3-large w3-margin-right" type="text" placeholder="Phone" />
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
      v-if="_HEADSPV.length > 0"
      :headers="['Nama']" 
      :lists="_HEADSPV" 
      :keys="['name']"
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
  name: "Headspv",
  data() {
    return {
      head: {}
    }
  },
  methods: {
    ...mapActions({
      APPEND: "append",
      UPDATE: "update"
    }),
    ...mapMutations({
      EDIT: "Headspv/edit"
    }),

    send() {
      if(this.head.name) {
        // if update
          if(this.GET_EDIT.id) {
            this.UPDATE({
              store: "Headspv",
              obj: this.head
            })
          }

        // else
        else {
          this.APPEND({
            store: "Headspv",
            obj: Object.assign( { id: uid(3), disabled: false }, this.head)
          })
        }
      }
      this.cancel()
    },
    edit(ev) {
      this.EDIT(ev)
      this.head = this.GET_EDIT
    },
    cancel() {
      this.EDIT("null")
      this.head = this.GET_EDIT
    },
    disableName(ev) {
            this.EDIT(ev)
            let record = this.GET_EDIT
            // change record disabled
            record.disabled = !record.disabled
            this.UPDATE({ store: "Headspv", obj: record })
            this.EDIT("null")
        },
  },
  mounted() {
    this.cancel();
  },
  computed: {
    ...mapState({
      _HEADSPV: state => JSON.parse(JSON.stringify(state.Headspv.lists))
    }),
    ...mapGetters({
      GET_EDIT: "Headspv/edit",
    }),
  },
};
</script>
