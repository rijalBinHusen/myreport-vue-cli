<template>
<div class="w3-container">
    <h1>Daftar Nama</h1>
    <Button primary class="w3-right" value="Tambah" type="button" datanya="Tambah" @trig="tambahNama" />
    <Table v-if="listsName.length > 0"
            :headers="['Nama', 'Gudang']" 
            :lists="listsName" 
            :keys="['name', 'warehouse']"
			v-slot:default="slotProp"
			options
            >

				<Button 
                primary 
                value="Edit" 
                :datanya="slotProp.prop.id" 
                type="button" 
                @trig="editName($event)" 
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
</div>
</template>

<script>

import Button from "../elements/Button.vue"
import Table from "../elements/Table.vue"
import { mapState, mapMutations, mapGetters, mapActions } from "vuex"

export default {
    name: "Name",
    components: {
        Button,
        Table
    },
    methods: {
        ...mapMutations({
            //the modal
            TOGGLE_modal: "Modal/active",
            NAME_edit: "Name/edit"
        }),
        ...mapActions({
            UPDATE: "update"
        }),
        tambahNama() {
            // bring up the form and the modal
            this.TOGGLE_modal({judul: "Masukkan nama baru", form: "newName"})
            // make vuex edit null
            this.NAME_edit(null)
        },
		editName(ev) {
			// Bring up the form and modal
			this.TOGGLE_modal({judul: "Ubah nama", form: "newName"});
			// add value to form
			this.NAME_edit(ev)
		},
        disableName(ev) {
            this.NAME_edit(ev)
            let record = this.GET_NAME_edit
            // change record disabled
            record.disabled = !record.disabled
            this.UPDATE({ store: "Name", obj: record })
        },
    },
    computed: {
            ...mapState({
                listsName: state => state.Name.lists
            }),
            ...mapGetters({
                GET_NAME_edit: "Name/edit"
            })
    }
}
</script>