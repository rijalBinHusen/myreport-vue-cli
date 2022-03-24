<template>
<div class="w3-container">
    <h1>Report uncollected</h1>
			<Button class="w3-right" primary value="+ Periode" type="button" @trig="addPeriod" />
            <Button class="w3-right" primary value="Rekap" type="button" @trig="pesanSemua" />
            
		<Datatable
          :datanya="lists"
          :heads="['Nama', 'Gudang']"
          :keys="['name', 'warehouse']"
          option
          :id="'nameOftable'"
          v-slot:default="slotProp"
          >
				<span v-if="slotProp.prop.uncollected && slotProp.prop.uncollected.length > 2">					
					<Button
					secondary
					value="Pesan" 
					datanya="tes" 
					type="button" 
					@trig="pesan(slotProp.prop)" 
					/>
				</span>

                <span>
                    <Button
                    v-for="uncl in slotProp.prop.uncollected" :key="uncl.id"
					primary
					:value="uncl.periode" 
					:datanya="uncl.id" 
					type="button" 
					@trig="collect($event)" 
					/>
                </span>
        </Datatable>
</div>
</template>

<script>

import Button from "../elements/Button.vue"
import Datatable from "../parts/Datatable.vue"

export default {
    name: "Uncollected",
    components: {
        Button,
        Datatable,
    },
    methods: {
		addPeriod() {
            // bring up the form and the modal
            this.$store.commit("Modal/active", {judul: "Masukkan periode", form: "UncollectedForm"});
		},
        collect(ev) {
            // get record from uncollected the state
            let info = this.$store.getters["Uncollected/getId"](ev)

            info.collected = this.$store.getters["dateFormat"]({format: "-1"})

            // append to collected store
            this.$store.dispatch("append", {
                            store: "Collected",
                            obj: info,
                            period: info.periode
                        })

            // delete from uncollected store
            // value = { store: "listsnames", id: 001 }
            this.$store.dispatch("delete", {store: "Uncollected", id: ev})
            
        },
		pesan(ev) {
			// slice the data
			let tanggalnya = []
			let datanya = JSON.parse(JSON.stringify(ev))
			datanya.uncollected.slice(0, -1).forEach((val) => {
				tanggalnya.push(val.periode)
			})
			let pesan = `*Tidak perlu dibalas*%0a%0aMohon maaf mengganggu bapak ${ev.name},%0aberikut kami iformasikan daftar laporan ${ev.warehouse} yang belum dikumpulkan yaitu [ ${tanggalnya.join(", ")} ]%0a%0amohon untuk segera dikumpulkan,%0akarena jika lebih dari 2 hari,%0areport bapak akan diberi tanda terlambat mengumpulkan,%0a%0aTerimakasih atas perhatianya.`
			let link = `https://wa.me/${ev.phone}?text=${pesan}`
            // copy(pesan)
			// console.log(link)
			window.open(link)
			// console.log(tanggalnya.join(", "))
		},
        pesanSemua() {
            let nophone = window.prompt()
            if(nophone){
            let result = `*Tidak perlu dibalas*%0a%0aBerikut kami kirimkan daftar laporan yang belum dikumpulkan pada ${this.$store.getters["dateFormat"]({format: "full"})}:%0a%0a`
            this.lists.forEach((val) => {
                if(val.uncollected && val.uncollected.length > 2) {
                    result += `*${val.name} ${val.warehouse}* : [${ val.uncollected.slice(1).map((val2) => val2.periode ).join(", ") }]%0a%0a`
                }
            })
            window.open(`https://wa.me/${nophone}?text=${result}`)
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
    }
}
</script>