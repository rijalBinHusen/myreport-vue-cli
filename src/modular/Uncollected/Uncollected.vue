<template>
<div class="w3-container w3-margin-top">
        <Button class="w3-right" primary value="+ Periode" type="button" @trig="addPeriod" />
        
        <Dropdown
            value="Kirim rekap"  
            :lists="$store.state.Headspv.lists"
            listsKey="phone"
            listsValue="name"
            @trig="pesanSemua($event)"
            class="w3-right"
        />

        <Button 
            class="w3-right" 
            primary 
            :value="viewByPeriode ? 'View By Supervisors' : 'View by periode'" 
            type="button" 
            @trig="viewByPeriode = !viewByPeriode" 
        />

		<Datatable
          :datanya="lists"
          :heads="viewByPeriode ? ['Gudang', 'Nama', 'Periode', 'Shift', 'Kabag'] : ['Nama', 'Gudang']"
          :keys="viewByPeriode ? ['spvWarehouse', 'spvName', 'periode2', 'shift', 'headName'] : ['name', 'warehouseName']"
          option
          id="tableUncollected"
        >

                <template #th v-if="!viewByPeriode">
                    <th>Daftar periode</th>
                </template>

                <template #td="{ obj }" v-if="!viewByPeriode">
                    <td>
                        <Dropdown
                            v-for="doc in obj.documents" :key="doc?.id"
                            :value="doc?.periode2"  
                            :lists="[
                                { id: -1, isi: '-1 Hari'},
                                { id: -2, isi: '-2 Hari'},
                                { id: -3, isi: '-3 Hari'},
                                { id: 0, isi: '0 Hari' }
                            ]"
                            listsKey="id"
                            listsValue="isi"
                            @trig="check({val: $event, id: doc?.id})"
                            class="w3-small"
                        />
                    </td>
                </template>

				<template #default="{ prop }">
					<Button
                        small
                        v-if="!viewByPeriode"
                        secondary
                        value="Pesan" 
                        datanya="tes" 
                        type="button" 
                        @trig="pesan(prop)" 
					/>

                    <Dropdown
                        v-if="viewByPeriode"
                        value="Collect"  
                        :lists="[
                            { id: -1, isi: '-1 Hari'},
                            { id: -2, isi: '-2 Hari'},
                            { id: -3, isi: '-3 Hari'},
                            { id: 0, isi: '0 Hari' }
                        ]"
                        listsKey="id"
                        listsValue="isi"
                        @trig="collect({action: 'collect', val: $event, rec: prop.id})"
                        class="w3-small"
                    />

                    <Button
                         v-if="viewByPeriode"
                        small
                        secondary
                        value="Edit" 
                        datanya="tes" 
                        type="button" 
                        @trig="edit(prop.id)" 
					/>
                </template>
        
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
            lists: []
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
                id: ev,
                mode: "edit"
            });
        },
        check(ev) {
            this.$store.commit("Modal/active", {
                judul: `Report collected at ${
                    this.GET_DATEFORMAT({format: "dateMonth", time: this.GET_DATEFORMAT({format: ev.val})})
                }`, 
                form: "UncollectedEditForm",
                id: ev.id,
                mode: "edit",
                time: ev.val,
                next: "collect"
            });
        },
		addPeriod() {
            // bring up the form and the modal
            this.$store.commit("Modal/active", {judul: "Masukkan periode", form: "UncollectedForm"});
		},
        collect(ev) {
            // EV =  {action: 'approve', val: -1, rec: doc22050003}
            this.$store.dispatch("Document/handleDocument", ev)
        },
		pesan(ev) {
			// slice the data
			// let datanya = JSON.parse(JSON.stringify(ev))
            // daftar laporan yang melebihi H+2 dari sekarang
            console.log(ev)
            let sekarang = new Date().getTime()
            let listLaporan = []
            ev.documents.forEach((val) => {
                if(sekarang - val.periode >= 172800000 ) {
                    listLaporan.push(val.periode2)
                }
            })

            // jika ada laporan yang H+2 lapor kirim, buka link jika tidak ada tampilkan alert
			let pesan = `*Tidak perlu dibalas*%0a%0aMohon maaf mengganggu bapak ${ev.name},%0aberikut kami informasikan daftar laporan *${ev.warehouseName}* yang belum dikumpulkan yaitu *[ ${listLaporan.join(", ")} ]*%0a%0amohon untuk dikumpulkan tidak lebih dari H+2,%0a%0aTerimakasih atas perhatianya.`
			let link = `https://wa.me/${ev.phone}?text=${pesan}`
            if(listLaporan.length > 0) {
                window.open(link)
                // console.log(link)
                return
            }
            alert("Tidak ada laporan lebih dari H+2")
		},
        pesanSemua(ev) {
            // let nophone = window.prompt()
            // if(nophone){
            let result = `*Tidak perlu dibalas*%0a%0aBerikut kami kirimkan daftar laporan yang belum dikumpulkan pada ${this.$store.getters["dateFormat"]({format: "full"})}:%0a%0a`
            this.$store.getters["Document/documentBySpv"](0).forEach((val) => {
                if(val.documents) {
                // daftar laporan yang melebihi H+2 dari sekarang
                let sekarang = new Date().getTime()
                let listLaporan = []
                val.documents.forEach((val) => {
                    if(sekarang - val.periode >= 172800000 ) {
                        listLaporan.push(val.periode2)
                    }
                })
                if(listLaporan.length > 0)
                    result += `*${val.name} ${val.warehouseName}* : [${ listLaporan.join(", ") }]%0a%0a`
                }
            })
            window.open(`https://wa.me/${ev}?text=${result}`)
            // console.log(result)
            // }
        },
        renewLists() {
            this.viewByPeriode
                ? this.lists = this.$store.getters["Document/documentByStatus"](0)
                : this.lists = this.$store.getters["Document/documentBySpv"](0)
        },
    },
    computed: {
        ...mapGetters({
            GET_DATEFORMAT: "dateFormat",
        }),
    },
    watch: {
        viewByPeriode(newVal, oldVal) {
            this.renewLists()
        }
    },
    async mounted() {
        await this.$store.dispatch("Document/getDocumentByStatusFromDB", "uncollected")
        this.renewLists()

        // subscribe the mutation,, and renew lists when data updated
        this.unsubscribe = this.$store.subscribe((mutation) => {
            // jika document ada yang di update
            if (mutation.type === 'Document/update') {
                this.renewLists()
            }
        });
    }
}
</script>