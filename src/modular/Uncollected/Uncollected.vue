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

        <Dropdown
            value="Belum approval"  
            :lists="$store.state.Headspv.lists"
            listsKey="phone"
            listsValue="name"
            @trig="notApproval($event)"
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
          :heads="viewByPeriode ? ['Gudang', 'Nama', 'Periode', 'Shift', 'Kabag'] : ['Gudang', 'Nama']"
          :keys="viewByPeriode ? ['warehouseName', 'spvName', 'periode2', 'shift', 'headName'] : ['warehouseName', 'name']"
          option
          :id="viewByPeriode ? 'uncollectedByPeriode' : 'uncollectedBySpv'"
        >

                <template #th v-if="!viewByPeriode">
                    <th>Daftar periode</th>
                </template>

                <template #td="{ obj }" v-if="!viewByPeriode">
                    <td>
                        <Dropdown
                            v-for="doc in obj.documents" :key="doc?.id"
                            :value="doc?.periode2+' | '+doc?.warehouseName.replace('Gudang jadi ', '')"  
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
            lists: [],
            timeOut: "",
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
            let listLaporan = this.$store.getters["Document/documentMore2DaysBySpv"](ev?.id)

            // jika lists laporan ada, jadikan listslaporan menjadi text
            if(Object.keys(listLaporan).length) {

                let listLaporanText = ""
                Object.keys(listLaporan).forEach((val) => {
                    listLaporanText += `${listLaporan[val].join(", ")}`
                    listLaporanText += ` | ${this.$store.getters["Warehouses/warehouseId"](val)?.name}%0a`
                })
                // jika ada laporan yang H+2 lapor kirim, buka link jika tidak ada tampilkan alert
    			let pesan = `*Tidak perlu dibalas*%0a%0aMohon maaf mengganggu bapak ${ev.name},%0aberikut kami informasikan daftar laporan yang belum dikumpulkan yaitu:%0a%0a${listLaporanText}%0amohon untuk dikumpulkan tidak lebih dari H%2b2.%0aTerimakasih atas perhatianya.`

                    window.open(`https://wa.me/${ev.phone}?text=${pesan}`)
                    //  console.log(pesan)
                    return
            }
            alert("Tidak ada laporan lebih dari H+2")
		},
        pesanSemua(ev) {
            // let nophone = window.prompt()
            // if(nophone){
            let result = `*Tidak perlu dibalas*%0a%0aBerikut kami kirimkan daftar laporan yang belum dikumpulkan pada ${this.$store.getters["dateFormat"]({format: "full"})}:%0a%0a`
            // get document by spv and iterate, document by spv yang >= H+2
            this.$store.getters["Document/documentBySpv"](0).forEach((val) => {
                if(val.documents) {
                // daftar laporan yang melebihi H+2 dari sekarang
                let sekarang = new Date().getTime()
                let listLaporan = []
                val.documents.forEach((val) => {
                    if(sekarang - val.periode >= 172800000 ) {
                        listLaporan.push(`${val.periode2} | ${val?.warehouseName}%0a`)
                    }
                })
                if(listLaporan.length > 0)
                    result += `*${val.name} (${listLaporan.length} Dokumen)* :%0a${ listLaporan.join("") }%0a`
                }
            })

            window.open(`https://wa.me/${ev}?text=${result}`)
            // console.log(result)
            // }
        },
        notApproval(ev) {
            // dockumen yang belum tanda tangan kabag
            let result = "Dokumen belum *approval* kapala bagian:%0a%0a"
            let notApproval = this.$store.getters["Document/documentNotApproval"]
            Object.keys(notApproval).forEach((val) => {
                result += `*${notApproval[val]?.headName} (${notApproval[val]?.lists.length}) Dokumen* :%0a`
                result += notApproval[val]?.lists.join("%0a")
                result += "%0a%0a"
            })
            // console.log(result)
            window.open(`https://wa.me/${ev}?text=${result}`)
        },
        renewLists() {
            this.viewByPeriode
                ? this.lists = this.$store.getters["Document/documentByStatus"](0)
                : this.lists = this.$store.getters["Document/documentBySpv"](0)
            clearTimeout(this.timeOut)
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
            if (mutation.type === 'Document/append') {
                clearTimeout(this.timeOut)
                this.timeOut = setTimeout( () => {
                    this.renewLists()
                } , 1500 )
            }
        });
    },
    beforeUnmount() {
         this.unsubscribe();
    },
}
</script>