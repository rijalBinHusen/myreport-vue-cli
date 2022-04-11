<template>
<div class="w3-container w3-margin-top">
			<Button class="w3-right" primary value="+ Periode" type="button" @trig="addPeriod" />
            <Button class="w3-right" primary value="Rekap" type="button" @trig="pesanSemua" />
            
		<Datatable
          :datanya="lists"
          :heads="['Nama', 'Gudang']"
          :keys="['name', 'warehouseName']"
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
                    <Dropdown 
                    v-for="uncl in slotProp.prop.uncollected" :key="uncl.id"
                    :value="uncl.periode"  
                    :lists="[
                        { id: -1, isi: '-1 Hari'},
                        { id: -2, isi: '-2 Hari'},
                        { id: -3, isi: '-3 Hari'},
                        { id: 0, isi: '0 Hari' }
                    ]"
                    listsKey="id"
                    listsValue="isi"
                    @trig="collect({val: $event, rec: uncl.id})"
                    />
        </Datatable>
</div>
</template>

<script>

import Button from "../elements/Button.vue"
import Datatable from "../parts/Datatable.vue"
import Dropdown from "../elements/Dropdown.vue"
import { mapState, mapGetters } from "vuex";

export default {
    name: "Uncollected",
    components: {
        Button,
        Datatable,
        Dropdown
    },
    methods: {
		addPeriod() {
            // bring up the form and the modal
            this.$store.commit("Modal/active", {judul: "Masukkan periode", form: "UncollectedForm"});
		},
        collect(ev) {
            // get record from uncollected the state
            let info = this.$store.getters["Uncollected/getId"](ev.rec)

            info.collected = this.$store.getters["dateFormat"]({format: ev.val})
            info.shared = false

            // append to collected store
            this.$store.dispatch("append", {
                            store: "Collected",
                            obj: info,
                            period: info.periode
                        })

            // delete from uncollected store
            // value = { store: "listsnames", id: 001 }
            this.$store.dispatch("delete", {store: "Uncollected", id: ev.rec})
            
        },
		pesan(ev) {
			// slice the data
			let datanya = JSON.parse(JSON.stringify(ev))
			let pesan = `*Tidak perlu dibalas*%0a%0aMohon maaf mengganggu bapak ${ev.name},%0aberikut kami iformasikan daftar laporan ${ev.warehouse} yang belum dikumpulkan yaitu [ ${datanya.uncollected.slice(1).map((val2) => val2.periode ).join(", ")} ]%0a%0amohon untuk segera dikumpulkan,%0akarena jika lebih dari 2 hari,%0areport bapak akan diberi tanda terlambat mengumpulkan,%0a%0aTerimakasih atas perhatianya.`
			let link = `https://wa.me/${ev.phone}?text=${pesan}`
			window.open(link)
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
        ...mapState({
            _SUPERVISORS: state => JSON.parse(JSON.stringify(state.Supervisors.lists))
        }),
        ...mapGetters({
            GET_UNCOLLECTED: "Uncollected/uncollected",
            GET_SUPERVISORS: "Supervisors/lists"
        }),
        lists() {
            let result = []
            this.GET_SUPERVISORS.forEach((val) => {
                result.push(Object.assign(val, { uncollected: this.GET_UNCOLLECTED[val.id] }))
            })
            return result
        },
    },
}
</script>