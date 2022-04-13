<template>
<div class="w3-container w3-margin-top">
			<Button class="w3-right" primary value="+ Periode" type="button" @trig="addPeriod" />
            <Button class="w3-right" primary value="Rekap" type="button" @trig="pesanSemua" />
            <Button 
                class="w3-right" 
                primary 
                :value="viewByPeriode ? 'View By Supervisors' : 'View by periode'" 
                type="button" 
                @trig="viewByPeriode = !viewByPeriode" 
            />
		<Datatable
          :datanya="viewByPeriode ? listByPeriode : listsByWarehouse"
          :heads="viewByPeriode ? ['Gudang', 'Nama', 'Periode'] : ['Nama', 'Gudang', 'Daftar report']"
          :keys="viewByPeriode ? ['spvWarehouse', 'spvName', 'periode2'] : ['name', 'warehouseName', 'uncollected']"
          option
          id="tableUncollected"
          v-slot:default="slotProp"
          >
				<span v-if="!viewByPeriode && slotProp.prop.uncollected && slotProp.prop.uncollected.length > 2">					
					<Button
					secondary
					value="Pesan" 
					datanya="tes" 
					type="button" 
					@trig="pesan(slotProp.prop)" 
					/>
				</span>
                <span v-if="viewByPeriode">
                    <Dropdown
                    value="Collect"  
                    :lists="[
                        { id: -1, isi: '-1 Hari'},
                        { id: -2, isi: '-2 Hari'},
                        { id: -3, isi: '-3 Hari'},
                        { id: 0, isi: '0 Hari' }
                    ]"
                    listsKey="id"
                    listsValue="isi"
                    @trig="collect({val: $event, rec: slotProp.prop.id})"
                    />
                </span>
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
    data() {
        return {
            viewByPeriode: true,
        }
    },
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
			// let datanya = JSON.parse(JSON.stringify(ev))
			let pesan = `*Tidak perlu dibalas*%0a%0aMohon maaf mengganggu bapak ${ev.name},%0aberikut kami iformasikan daftar laporan ${ev.warehouse} yang belum dikumpulkan yaitu [ ${ev.uncollected.slice(7)} ]%0a%0amohon untuk segera dikumpulkan,%0akarena jika lebih dari 2 hari,%0areport bapak akan diberi tanda terlambat mengumpulkan,%0a%0aTerimakasih atas perhatianya.`
			let link = `https://wa.me/${ev.phone}?text=${pesan}`
			window.open(link)
		},
        pesanSemua() {
            let nophone = window.prompt()
            if(nophone){
            let result = `*Tidak perlu dibalas*%0a%0aBerikut kami kirimkan daftar laporan yang belum dikumpulkan pada ${this.$store.getters["dateFormat"]({format: "full"})}:%0a%0a`
            this.listsByWarehouse.forEach((val) => {
                if(val.uncollected && val.uncollected.length > 2) {
                    result += `*${val.name} ${val.warehouseName}* : [${ val.uncollected.slice(7) }]%0a%0a`
                }
            })
            window.open(`https://wa.me/${nophone}?text=${result}`)
            // console.log(result)
            }
        }
    },
    computed: {
        ...mapState({
            _UNCOLLECTED: state => JSON.parse(JSON.stringify(state.Uncollected.lists))
        }),
        ...mapGetters({
            GET_UNCOLLECTEDbySpv: "Uncollected/uncollectedBySpv",
            GET_SUPERVISORS: "Supervisors/lists",
            GET_SPVID: "Supervisors/spvId",
            GET_DATEFORMAT: "dateFormat",
        }),
        listsByWarehouse() {
            let result = []
            this.GET_SUPERVISORS.forEach((val) => {
                result.push(Object.assign(val, { 
                    uncollected: this.GET_UNCOLLECTEDbySpv[val.id] 
                                    ? this.GET_UNCOLLECTEDbySpv[val.id] 
                                    : "All collected"
                    }))
            })
            return result
        },
        listByPeriode() {
            let result = []
            if(this._UNCOLLECTED.length > 0) {
                this._UNCOLLECTED.forEach((val) => {
                    let spvInfo = this.GET_SPVID(val.name)
                    result.push(
                        Object.assign(val, { 
                            spvName: spvInfo.name,
                            spvPhone: spvInfo.phone,
                            spvWarehouse: spvInfo.warehouseName,
                            periode2: this.GET_DATEFORMAT({format: 'dateMonth', time: val.periode})
                            })
                    )
                })
            }
            console.log(this.listsByWarehouse)
            return result
        }
    },
}
</script>