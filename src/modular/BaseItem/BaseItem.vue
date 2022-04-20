<template>
  <div class="w3-center w3-margin-top w3-row">
    <form ref="spvForm" class="margin-bottom" @submit.prevent="send">
    <p class="w3-col s2 w3-right-align w3-margin-right">Add new item : </p>
    <input 
      :disabled="_EDITSTATUS ? true : false" 
      v-model="Baseitem.id" 
      class="w3-col s2 w3-input w3-large w3-margin-right" 
      type="text" 
      placeholder="Item id" 
    />
    
    <input 
      v-model="Baseitem.name" 
      class="w3-col s5 w3-input w3-large w3-margin-right" 
      type="text" 
      placeholder="Item name" 
    />

    <Button 
      primary 
      class="w3-left w3-large w3-margin-left" 
      :value="_EDITSTATUS ? 'Update' : 'Add'" 
      type="button"
    />
    <Button 
      v-if="_EDITSTATUS"
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
      v-if="_BASEITEM.length > 0"
      :headers="['Kode item', 'Nama item']" 
      :lists="_BASEITEM" 
      :keys="['id', 'name']"
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
          danger
          value="Delete" 
          :datanya="slotProp.prop.id" 
          type="button" 
          @trig="remove($event)" 
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
  name: "Baseitem",
  data() {
    return {
      Baseitem: {}
    }
  },
  methods: {
    ...mapActions({
      APPEND: "append",
      UPDATE: "update"
    }),
    ...mapMutations({
      EDIT: "Baseitem/edit"
    }),

    send() {
      if(this.Baseitem.name) {
        // if update
          if(this._EDITSTATUS) {
            this.UPDATE({
              store: "Baseitem",
              obj: this.Baseitem
            })
          }

        // else
        else {
          this.APPEND({
            store: "Baseitem",
            obj: Object.assign( { id: uid(6), disabled: false }, this.Baseitem)
          })
        }
      }
      this.cancel()
    },
    edit(ev) {
      this.EDIT(ev)
      this.Baseitem = this.GET_EDIT
    },
    cancel() {
      this.EDIT(null)
      this.Baseitem = this.GET_EDIT
    },
    remove(ev) {
      this.$store.dispatch("delete", {store: "Baseitem", id: ev})
    },
  },
  mounted() {
    this.cancel();
  },
  computed: {
    ...mapState({
      _BASEITEM: state => JSON.parse(JSON.stringify(state.Baseitem.lists)),
      _EDITSTATUS: state => JSON.parse(JSON.stringify(state.Baseitem.edit)),
    }),
    ...mapGetters({
      GET_EDIT: "Baseitem/edit",
      GET_BASEITEM: "Baseitem/lists"
    }),
  }
};
</script>
