<template>
<div class="w3-container">
    <h1>Ini adalah name</h1>
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

export default {
    name: "Name",
    components: {
        Button,
        Table
    },
    methods: {
        tambahNama() {
            // bring up the form and the modal
            this.$store.commit("Modal/active", {judul: "Masukkan nama baru", form: "newName"});
            // make vuex edit null
            this.$store.commit("Name/edit", "")
        },
		editName(ev) {
			// Bring up the form and modal
			this.$store.commit("Modal/active", {judul: "Ubah nama", form: "newName"});
			// add value to form
			this.$store.commit("Name/edit", ev)
		},
        disableName(ev) {
            this.$store.commit("Name/edit", ev)
            let record = this.$store.getters["Name/edit"]
            // change record disabled
            record.disabled = !record.disabled
            this.$store.dispatch("update", { store: "Name", obj: record })
        },
    },
    computed: {
        listsName() {
            return JSON.parse(JSON.stringify(this.$store.state.Name.lists))
        },
    }
}
</script>