<template>
  <div class="w3-center w3-margin-top w3-row">
    <form ref="spvForm" class="margin-bottom" @submit.prevent="send">
    <p class="w3-col s3 w3-right-align w3-margin-right">Add new head Head name : </p>
    <input v-model="head.name" class="w3-col s3 w3-input w3-large w3-margin-right" type="text" placeholder="Head name" />
    <input v-model="head.phone" class="w3-col s3 w3-input w3-large w3-margin-right" type="text" placeholder="Phone" />
    <Button 
      primary 
      class="w3-left w3-large w3-margin-left" 
      :value="editId && head?.name ? 'Update' : 'Add'" 
      type="button"
    />
    <Button 
      v-if="editId && head?.name"
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
      :lists="$store.state.Headspv.lists" 
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

      <template #default="{ prop }">
        <Button 
          primary 
          value="Edit" 
          :datanya="prop.id" 
          type="button" 
          @trig="edit($event)" 
        />

        <Button
          :danger="prop.disabled"
          :primary="!prop.disabled"
          :value="prop.disabled ? 'Disabled' : 'Enabled'" 
          :datanya="prop.id" 
          type="button" 
          @trig="disableName($event, prop?.disabled)" 
        />
      </template>
    </Table>
</template>

<script>
import Button from "../../components/elements/Button.vue"
import Select from "../../components/elements/Select.vue"
import Table from "../../components/elements/Table.vue"

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
    changeShift(id, shift) {
      if(this.editId == id) {
        clearTimeout(this.timeOut)
      }

      this.editId = id

      this.timeOut = setTimeout(() => {
        this.$store.dispatch("Headspv/updateParam", { id: id, param: { shift: shift } })
        this.cancel()
      }, 1000)
    },
    send() {  // jika update
      if(this.editId) {
        this.$store.dispatch("Headspv/update",{ ...this.head, id: this.editId })
      }
      // jika tidak
      else {
        this.$store.dispatch("Headspv/append", { ...this.head })
      }
      this.cancel()
    },
    edit(ev) {
      this.editId = ev
      this.head = this.$store.getters["Headspv/headId"](ev)
    },
    cancel() {
      this.editId = ""
      this.head = {}
    },
    disableName(ev, disabled) {
      this.$store.dispatch("Headspv/updateParam", { 
        id: ev, 
        param: { disabled: !disabled } 
      })
    },
  },
  mounted() {
    this.cancel();
  },
};
</script>
