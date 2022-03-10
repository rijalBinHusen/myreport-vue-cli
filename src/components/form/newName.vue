<template>
<form @submit.prevent="send" class="w3-container w3-light-grey">
  <label>Masukkan nama</label>
  <input v-model="name.name" class="w3-margin-bottom w3-input w3-border-0" type="text">
  <label>Masukkan nama gudang</label>
  <input v-model="name.warehouse" class="w3-input w3-border-0" type="text">
  <label>Nomor telefon</label>
  <input v-model="name.phone" class="w3-input w3-border-0" type="text">
  <Button
    v-if="name.name && name.warehouse" primary 
    class="w3-margin-top" 
    :value="name.id ? 'Update' : 'Tambah'" 
    type="button"
   />
</form> 
</template>

<script>
import Button from "../elements/Button.vue";
export default {
    name: "newName",
    data() {
        return {
            name: {
                name: "",
                warehouse: "",
                disabled: false,
                phone: ""
            }
        }
    },
    components: { 
        Button,
    },
    methods: {
        send() {
            let objToSend = {
                store: "Name",
                id: this.$store.state.Name.lists.length > 0 
                    ? this.$store.state.Name.lists[0]["id"]
                    : "nme0000",
                obj: JSON.parse(JSON.stringify(this.name))
            }
            // if edit mode
            if(this.name.id) {
                // value = {store: 'nameOfStore', obj: {id: idOfDocument, object: 'to append to indexeddb'} }
                this.$store.dispatch("update", objToSend)
            }
            else {
                // else
                this.$store.dispatch("append", objToSend)
            }

            this.$store.commit("Modal/active")
            this.name = { name: "", warehouse: "" }
        }
    },
	mounted() {
        // if edit mode
		if (this.$store.state.Name.edit) {
            this.name = this.$store.getters["Name/edit"]
        }
        // change the button submit 
	},
}
</script>