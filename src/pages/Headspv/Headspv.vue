<template>
  <div class="w3-center w3-margin-top w3-row">
    <form ref="spvForm" class="margin-bottom" @submit.prevent="send">
    <p class="w3-col s3 w3-right-align w3-margin-right">Add new head Head name : </p>
    <input v-model="head" class="w3-col s3 w3-input w3-large w3-margin-right" type="text" placeholder="Head name" />
    <input v-model="phone" class="w3-col s3 w3-input w3-large w3-margin-right" type="text" placeholder="Phone" />
    <Button 
      primary 
      class="w3-left w3-large w3-margin-left" 
      :value="idHeadspv && head ? 'Update' : 'Add'" 
      type="button"
    />
    <Button 
      v-if="idHeadspv && head"
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
      :lists="headLists" 
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
import { ref, onMounted } from "vue";
import Button from "@/components/elements/Button.vue"
import Select from "@/components/elements/Select.vue"
import Table from "@/components/elements/Table.vue"
import { updateHeadspv, addHeadspv, getHeadspvId, lists } from './Headspv'

export default {
  components: {
    Button,
    Table,
    Select
  },
  setup() {
    const head = ref('')
    const phone = ref('')
    const idHeadspv = ref('')
    const headLists = ref([])
    let timeout = ''

    const renewLists = () => {
      headLists.value = lists
    }

    onMounted(() => {
      renewLists()
    })

    const changeShift = (id, shift) => {
      if(idHeadspv.value == id) {
        clearTimeout(timeout)
      }
  
      idHeadspv.value = id
  
      timeout = setTimeout(() => {
        updateHeadspv(id, { shift })
        cancel()
      }, 1000)
    }
    
    const  cancel = () => {
      idHeadspv.value = ""
      phone.value = ""
      head.value = ''
    }

    const send = async () => {  
      // jika update
      if(idHeadspv.value) {
        await updateHeadspv(idHeadspv.value, { name: head.value, phone: phone.value})
      }
      // jika tidak
      else {
        await addHeadspv(head.value, phone.value)
      }
      renewLists()
      cancel()
    }

    const edit = async (ev) => {
      idHeadspv.value = ev
      let getHead = await getHeadspvId(ev)
      head.value = getHead.name
      phone.value = getHead.phone
    }

    const disableName = async (ev, disabled) => {
      await updateHeadspv(ev, { disabled: !disabled})
      renewLists()
    }

    return {
      head, phone, idHeadspv, headLists, changeShift, cancel, send, edit, disableName,
    }

  }
};
</script>
