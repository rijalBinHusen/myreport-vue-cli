<template>
<form @submit.prevent="send" class="w3-container w3-light-grey">
  <Input type="text" @inp="name.name = $event" label="Masukkan nama" placeholder="Nama" :value="name.name" />
  <Input type="text" @inp="name.warehouse = $event" label="Masukkan nama gudang" placeholder="Nama gudang" :value="name.warehouse" />
  <Input type="number" @inp="name.phone = $event" label="Masukkan nomor telfon" placeholder="Nomor telfon" :value="name.phone" />
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
import Input from "../elements/Input.vue"

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
        Input,
    },
    methods: {
        send() {
            let objToSend = {
                store: "Name",
                id: this.$store.state.Name.lists.length > 0 
                    ? this.$store.state.Name.lists[0]["id"]
                    : "nme22030000",
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