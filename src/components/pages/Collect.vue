<template>
    <div class="w3-row" style="height:82%">
        <h1>Ini adalah collect</h1>
		<!-- collected -->
        <div class="w3-col s4 w3-border">
            <p>Collected</p>
			
			<Table v-if="collected.length > 0"
			:headers="['Nama', 'Gudang', 'Periode', 'Collected']" 
			:lists="collected" 
			:keys="['nameSPV', 'warehouse', 'periode', 'date']"
			v-slot:default="slotProp"
			small
			options
			>
				<Button href="#" value="Batal" type="link" @trig="unCollect(slotProp.prop)" />
                /
                <Button href="#" value="Edit" type="link" @trig="edit(slotProp.prop)" />
			</table>
			
        </div>
		<!-- End of collected -->
		
		<!-- Not collected -->
        <div class="w3-col s8 w3-border">
            <p>Not collected</p>
            <Button primary value="Masukan nama" type="button" datanya="Report" @trig="baruNama" />
			<Button primary value="+ Periode" type="button" @trig="addPeriod" />
            
            <Table v-if="lists.length > 0"
            :headers="['Nama', 'Gudang']" 
            :lists="lists" 
            :keys="['name', 'warehouse']"
			v-slot:default="slotProp"
			options
            >

				<Button small primary value="Edit" :datanya="slotProp.prop.id" type="button" @trig="editName($event)" />
                
                <Button 
                small
                :danger="slotProp.prop.disabled"
                :primary="!slotProp.prop.disabled"
                :value="slotProp.prop.disabled ? 'Disabled' : 'Enabled'" 
                :datanya="slotProp.prop.id" 
                type="button" 
                @trig="disable($event)" 
                />
				
				<span v-if="uncollected[slotProp.prop.id] && uncollected[slotProp.prop.id].length > 2">					
					<Button
					small
					secondary
					value="Pesan" 
					datanya="tes" 
					type="button" 
					@trig="pesan(slotProp.prop)" 
					/>
				</span>

                <span>
                    <span 
                    v-for="uncl in uncollected[slotProp.prop.id]" :key="uncl.id"
                    class="w3-button w3-tiny"
                    @click="collect(uncl)"
                    >
                        {{ uncl.periode }}
                    </span>
                </span>

			</Table>

        </div>
		<!-- End of Not collected -->
	</div>
</template>

<script>
import Input from "../elements/Input.vue"
import Button from "../elements/Button.vue"
import Table from "../elements/Table.vue"

export default {
    name: "Collect",
    components: {
        Input,
        Button,
        Table
    },
    methods: {
        // masukkan nama fungsi level baru
        baruNama() {
            // bring up the form and the modal
            this.$store.commit("Modal/active", {judul: "Masukkan nama baru", form: "newName"});
            // make vuex edit null
            this.$store.commit("Name/edit", "")
        },
		addPeriod() {
            // bring up the form and the modal
            this.$store.commit("Modal/active", {judul: "Masukkan periode", form: "CollectForm"});
		},
		editName(ev) {
			// Bring up the form and modal
			this.$store.commit("Modal/active", {judul: "Ubah nama", form: "newName"});
			// add value to form
			this.$store.commit("Name/edit", ev)
		},
        disable(ev) {
            this.$store.commit("Name/edit", ev)
            let record = this.$store.getters["Name/edit"]
            // change record disabled
            record.disabled = !record.disabled
            this.$store.dispatch("update", { store: "Name", obj: record })
        },
        collect(ev) {
            // add date collect
            ev.collected = new Date().getTime()
            // append to collected
            this.$store.dispatch("append", {
                store: "Collect",
                obj: ev
            })
            // delete from uncollected
            this.$store.dispatch("delete", { store: "Uncollected", doc: { id: ev.id }})
        },
		unCollect(ev) {
			// remove date collect
			delete ev.collected
			// append to uncollected
			this.$store.dispatch("append", {
			    store: "Uncollected",
			    obj: {id: ev.id, name: ev.name, periode: ev.periode}
			})
			// delete from collected
			this.$store.dispatch("delete", { store: "Collect", doc: { id: ev.id }})
		},
		pesan(ev) {
			// slice the data
			let tanggalnya = []
			let datanya = JSON.parse(JSON.stringify(ev))
			datanya.uncollected.slice(0, -1).forEach((val) => {
				tanggalnya.push(val.periode)
			})
			let pesan = `Mohon maaf mengganggu bapak ${ev.name}, Mohon laporan ${ev.warehouse} tanggal : [ ${tanggalnya.join(", ")} ] untuk segera dikumpulkan, karena jika lebih dari 3 hari report bapak akan diberi tanda terlambat mengumpulkan, Terimakasih atas perhatianya.`
			let link = `https://wa.me/${ev.phone}?text=${pesan}`
			console.log(link)
			// window.open(link)
			// console.log(tanggalnya.join(", "))
		},
        edit(ev) {
            // ev.collected = window.prompt()
            // value = {store: 'nameOfStore', obj: {id: idOfDocument, object: 'to append to indexeddb'} }
            let rec = JSON.parse(JSON.stringify(ev))
            delete rec.nameSPV
            delete rec.warehouse
            rec.collected = window.prompt()
            delete rec.date
            if(rec.collected) {
                this.$store.dispatch("update", {store: "Collect", obj: rec})
            }
        }
    },
    computed: {
        lists() {
            let uncollected = this.$store.getters["Uncollected/uncollected"]
            let name = JSON.parse(JSON.stringify(this.$store.state.Name.lists))
            let result = []

            name.forEach((val) => {
                result.push(Object.assign(val, {uncollected: uncollected[val.id] }))
            })

            return result
            // return this.$store.state.Name.lists
        },
        collected() {
			let collect = JSON.parse(JSON.stringify(this.$store.state.Collect.lists))
			let result = []
			collect.forEach((val) => {
				val.nameSPV = this.$store.getters["Name/nameId"](val.name)["name"]
				val.warehouse = this.$store.getters["Name/nameId"](val.name)["warehouse"]
                val.periode = this.$store.getters["dateFormat"]({ format: "dateMonth", time: val.periode })
                val.date = !isNaN(val.collected) ? this.$store.getters["dateFormat"]({ format: "dateMonth", time: val.collected }) : val.collected
				result.push(val)
			})
            return result
        },
        uncollected() {
            return this.$store.getters["Uncollected/uncollected"]
        }
    },
}
</script>