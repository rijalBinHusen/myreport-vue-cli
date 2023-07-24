<template>
    <div>
        <div v-if="!form">
            <Button primary value="Tambah" class="w3-right w3-margin-top" type="button" @trig="form = true"/>
            <Button primary value="Set periode" class="w3-right w3-margin-top" type="button" @trig="pickPeriode" />
            <Button primary value="Broad cast problem" class="w3-right w3-margin-top" type="button" @trig="handleBroadcast" />
            <Datatable
                v-if="lists.length"
                :datanya="lists"
                :heads="['Gudang', 'Nama item', 'Masalah', 'Tanggal mulai', 'Karu', 'Status']"
                :keys="['namaGudang', 'namaItem', 'masalah', 'periode', 'supervisor', 'status']"
                option
                id="tableProblemReport"
                #default="{ prop }"
            >
                
                <Dropdown 
                    value="Opsi" 
                    :lists="[
                        { id: 'edit', content: 'Edit'}, 
                        { id: 'duplicate', content: 'Duplicate'}
                    ]"
                    listsKey="id"
                    listsValue="content"
                    @trig="handleButton($event, prop?.id)"
                    primary
                />
            </Datatable>
        </div>
        <ProblemReportForm :id="editId" v-else @exit="form = false; editId = ''" />
     </div>
</template>

<script>
import Datatable from "@/components/parts/Datatable.vue"
import Button from "@/components/elements/Button.vue"
import ProblemReportForm from "./ProblemReportForm.vue"
import Dropdown from '@/components/elements/Dropdown.vue'
import { useStore } from 'vuex'
import { onMounted, ref, watch } from "vue"
import { getProblemFromDB, lists, getProblemBetweenPeriode, duplicate } from './Problem'
import { subscribeMutation } from '@/composable/piece/subscribeMutation'
import { getSupervisorShift1ByWarehouse, getWarehouseById } from '@/pages/Warehouses/Warehouses'

export default {
    setup() {
        
        const form = ref(false)
        const editId =  ref(null)
        const store = useStore()

        const handleButton = async (action, id) => {
            if(action === 'edit') {
                editId.value = id
                form.value = true
                return
            }
            // THE ACTION is to duplicate record
            let res = await subscribeMutation(
                '',
                'Confirm',
                { pesan: 'Record akan di gandakan'},
                'Modal/tunnelMessage'
            )

            if(res) {
                await duplicate(id)
            }
        }

        const handleBroadcast = async () => {
            let res = await subscribeMutation(
                '',
                'Confirm',
                { pesan: 'Semua problem akan dikirim kepada supervisor yang bertugas shift 1'},
                'Modal/tunnelMessage'
            )

            if(res) {
                // group dulu berdasarkan gudang
                let group = []
                //   grouped seperate by name
                let grouped = {}
                lists.value.forEach((val) => {
                    if(val?.status == "Progress") {
                    //    if the object was grouped, and else
                        if(grouped.hasOwnProperty(val['warehouse'])) {
                            group[grouped[val['warehouse']]].push({ ...val })
                        } else {
                                let warehouse = getWarehouseById(val.warehouse)
                                if(warehouse?.group) {
                                // if('namaGudang' && (val?.namaGudang.includes("jabon") || val?.namaGudang.includes("biscuit"))) {
                                    grouped[val.warehouse] = group.length
                                    grouped[warehouse?.group] = group.length
                                } 
                                else {
                                    grouped[val.warehouse] = group.length
                                }
                            group.push([{ ...val }])
                        }
                    }
                })
                sendBroadcast(group)
                // console.log(group)
                // dapatkan supervisor yang bertugas shift 1
                // kirim pesan
            }
        }

        const sendBroadcast = async (groupss) => {
            for(let groups of groupss) {
                let getSupervisor = await getSupervisorShift1ByWarehouse(groups[0]?.warehouse)
                // confirm to send message
                let confirm = await subscribeMutation(
                                '',
                                'Confirm',
                                { pesan: `Kita akan mengirimkan pesan kepada ${getSupervisor?.name}`},
                                'Modal/tunnelMessage'
                            )
                if(confirm) {
                    let problemLists = groups.map((val, index) => ([
                        `*${index+1}.* ${val?.namaGudang} ${val?.namaItem} selisih ${val?.masalah} karu *${val?.supervisor}* mulai tanggal *${val.periode}*`
                    ]))
                    let message = `Selamat pagi bapak ${getSupervisor?.name}, berikut kami kirimkan catatan kami terkait selisih stock digudang :%0a%0a`
                    let closingMessage = '%0a%0aKami mohon untuk dikoreksi apabila terdapat catatan yang tidak sesuai, terimakasih.'
                    let pesan = message+problemLists.join('%0a%0a')+closingMessage
                    window.open(`https://wa.me/${getSupervisor.phone}?text=${pesan}`)
                }
            }
        }
        
        const pickPeriode = async () => {
            let res = await subscribeMutation(
                'Masukkan periode yang akan ditampikan',
                'PeriodePicker',
                {},
                'Modal/tunnelMessage'
            )

            if(res) {
                store.commit("Modal/active", {judul: "", form: "Loader"});
                await getProblemBetweenPeriode(res?.periode1, res?.periode2)
                store.commit("Modal/active");
            }
        }

        onMounted( async () => {
            await getProblemFromDB()
        })

        return { handleButton, form, editId, pickPeriode, lists, handleBroadcast }
    },
    components: {
        Button,
        Datatable,
        ProblemReportForm,
        Dropdown
    },
    name: "ProblemReport",
}
</script>
@/pages/Warehouses/Warehouses