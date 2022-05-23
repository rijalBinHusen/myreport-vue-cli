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
          #default="{ prop }"
          >
				<span v-if="!viewByPeriode && prop.total > 2">
					<Button
                        secondary
                        value="Pesan" 
                        datanya="tes" 
                        type="button" 
                        @trig="pesan(prop)" 
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
                    @trig="collect({val: $event, rec: prop.id})"
                    class="w3-small"
                    />

                    <Button
                        class="w3-small"
                        secondary
                        value="Edit" 
                        datanya="tes" 
                        type="button" 
                        @trig="edit(prop.id)" 
					/>
                </span>
        </Datatable>
</div>
</template>

<script>

import Button from "../../components/elements/Button.vue"
import Datatable from "../../components/parts/Datatable.vue"
import Dropdown from "../../components/elements/Dropdown.vue"
import { mapGetters } from "vuex";

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
        edit(ev) {
            this.$store.commit("Modal/active", {
                judul: "Edit record", 
                form: "UncollectedEditForm",
                obj: this.GET_DOCID(ev),
            });
        },
		addPeriod() {
            // bring up the form and the modal
            this.$store.commit("Modal/active", {judul: "Masukkan periode", form: "UncollectedForm"});
		},
        collect(ev) {
            // get record from uncollected the state
            let info = this.$store.getters["Document/getId"](ev.rec)
            info.collected = this.$store.getters["dateFormat"]({format: ev.val})
            info.shared = false
            info.status = 1
                // console.log(info)
            this.$store.dispatch("update", {
                            store: "Document",
                            obj: info,
                            criteria: {id: ev.rec }
                        })
            
        },
		pesan(ev) {
			// slice the data
			// let datanya = JSON.parse(JSON.stringify(ev))
			let pesan = `*Tidak perlu dibalas*%0a%0aMohon maaf mengganggu bapak ${ev.name},%0aberikut kami iformasikan daftar laporan ${ev.warehouse} yang belum dikumpulkan yaitu *[ ${ev.uncollected.slice(7)} ]*%0a%0amohon untuk segera dikumpulkan,%0akarena jika lebih dari 2 hari,%0areport bapak akan diberi tanda terlambat mengumpulkan,%0a%0aTerimakasih atas perhatianya.`
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
        ...mapGetters({
            GET_UNCOLLECTED: "Document/uncollected",
            GET_UNCOLLECTEDBYSPV: "Document/uncollectedBySpv",
            GET_SUPERVISORS: "Supervisors/lists",
            GET_SPVID: "Supervisors/spvId",
            GET_DATEFORMAT: "dateFormat",
            GET_DOCID: "Document/getId"
        }),
        listsByWarehouse() {
            let result = []
            this.GET_SUPERVISORS.forEach((val) => {
                if(this.GET_UNCOLLECTEDBYSPV[val.id]) {

                    result.push(Object.assign(val, { 
                        uncollected: this.GET_UNCOLLECTEDBYSPV[val.id].join(", "), total: this.GET_UNCOLLECTEDBYSPV[val.id].length
                    }))
                }
            })
            return result
        },
        listByPeriode() {
            let result = []
            if(this.GET_UNCOLLECTED.length > 0) {
                this.GET_UNCOLLECTED.forEach((val) => {
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
            return result
        }
    },
    mounted() {
        this.$store.dispatch("getDataByCriteria", {store: "Document", criteria: { status: 0 }})
    }
}
</script>