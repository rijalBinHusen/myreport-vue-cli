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
import { mapGetters, mapActions, mapMutations, mapState } from "vuex"

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
        ...mapActions({
            UPDATE: "update",
            APPEND: "append"
        }),
        ...mapMutations({
            TOGGLE_modal: "Modal/active"
        }),
        send() {
            let objToSend = {
                store: "Name",
                id: this.listsName.length > 0 
                    ? this.listsName[0]["id"]
                    : "nme22030000",
                obj: JSON.parse(JSON.stringify(this.name))
            }
            // if edit mode
            if(this.name.id) {
                // value = {store: 'nameOfStore', obj: {id: idOfDocument, object: 'to append to indexeddb'} }
                this.UPDATE(objToSend)
            }
            else {
                // else
                this.APPEND(objToSend)
            }

            this.TOGGLE_modal()
            this.name = { name: "", warehouse: "" }
        }
    },
    computed: {
        ...mapState({
            listsName: state => state.Name.lists,
            _NAME_edit: state => state.Name.edit
        }),
        ...mapGetters({
            GET_NAME_edit: "Name/edit"
        })
    },
	mounted() {
        // if edit mode
		if (this._NAME_edit) {
            this.name = this.GET_NAME_edit
        }
        // change the button submit 
	},
}
</script>