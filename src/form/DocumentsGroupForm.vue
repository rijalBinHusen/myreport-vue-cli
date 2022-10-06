<template>
<form @submit.prevent="send">
    <div class="w3-col s2 w3-round-large w3-topbar w3-bottombar w3-padding-small w3-small">
        <h3 class="w3-margin-bottom">Periode</h3>
        <Datepicker 
            class="w3-input w3-row" 
            v-model="periode" 
            DateFormat="yyyy-MM-dd"
            :lowerLimit="lowerPeriode"
        />
        <h3>Kabag</h3>
        <Input 
            v-for="name in headLists" :key="name.id" 
            :label="name.name.split(' ')[0]" placeholder="Shift" class="w3-row w3-padding" type="number"
            :value="name.shift+''" @inp="changeShift('Headspv', name.id, $event)"
        />
    </div>
    <div v-for="warehouse in warehousesLists" :key="warehouse.id"  class=" w3-topbar w3-bottombar w3-col s2 w3-round-large w3-padding-small w3-small">
        <h5>{{ warehouse.name.replace('jadi ', '') }}</h5>
        <span v-for="spv in warehouse.supervisors" :key="spv">
            <Input 
                v-if="spvLists[spv]"
                :label="spvLists[spv]?.name" placeholder="Shift" class="w3-row w3-padding" type="number"
                :value="spvLists[spv]?.shift+''" @inp="changeShift('Supervisors', spvLists[spv]?.id, $event)"
            />
        </span>
    </div>

    <div class="w3-row">
        <Button
            primary 
            class="w3-margin-top w3-right" 
            value="Tambah" 
            type="button"
        />
    </div>
</form>

</template>

<script>
import Select from "@/components/elements/Select.vue"
import Button from "@/components/elements/Button.vue"
import Datepicker from "vue3-datepicker"
import Input from "@/components/elements/Input.vue"
import { ref, onBeforeMount } from "vue"
import { updateSupervisor, supervisorsEnabled } from "@/composable/components/Supervisors"
import { updateHeadspv, headspvEnabled, headspvByShift } from "@/composable/components/Headspv"
import { lists as listsWarehouse } from '@/composable/components/Warehouses'
import { getLastDate, addData as addNewDocument } from '@/composable/components/DocumentsPeriod'
import { useStore } from "vuex"
import { ymdTime } from "@/composable/piece/dateFormat"
import { addBaseReportFile } from '@/composable/components/BaseReportFile'

export default {
    components: {
        Select, Button,
        Input, Datepicker,
    },
    setup() {
        let timeout = ref('')
        let id = ref('')
        const spvLists = ref({})
        const headLists = ref([])
        const periode = ref(new Date())
        const lowerPeriode = ref('')
        const warehousesLists = ref([])
        const store = useStore()

        const changeShift = (store, idFL, shift) => {
            if(id.value == idFL) {
                clearTimeout(timeout.value)
              }
              id.value = idFL
              timeout.value = setTimeout(() => {
                    store == 'Supervisors'
                        ? updateSupervisor(idFL, { shift })
                        : updateHeadspv(idFL, { shift })
              }, 1000)
        }

        onBeforeMount(() => {
            warehousesLists.value.length = 0
            supervisorsEnabled().forEach((spv) => {
                spvLists.value[spv.id] = spv
            })
            headLists.value = headspvEnabled()
            listsWarehouse.forEach((warehouse) => {
                let findGroup = warehousesLists.value.findIndex((warehouseList) => warehouseList.group == warehouse.id)
                if(findGroup < 0) {
                    warehousesLists.value.push(warehouse)
                }
            })
            lowerPeriode.value = new Date(getLastDate())
        })

        const send = async () => {
            if(periode.value) {
                // bring up the loader
                store.commit("Modal/active", {judul: "", form: "Loader"});
                // jadikkan this.periode sebagai new Date().getTime()
                let periodeTime = ymdTime(periode.value)
                //// iterate gudang, kemudian iterate nama spv yang ada didalam gudang
                for(let warehouse of listsWarehouse) {
                    if(!warehouse?.disabled) {
                        // baseReportFile record, masukkan berdasar iteraatenya gudang
                        await addBaseReportFile(periodeTime, warehouse?.id)

                        // Document record, iterate spv yang ada digudang
                        for(let spv of warehouse?.supervisors) {
                            let shiftNow = spvLists.value[spv]?.shift
                            if(shiftNow) {
                                await addNewDocument(
                                    spv, 
                                    periodeTime, 
                                    shiftNow,
                                    headspvByShift(shiftNow == 3 ? 2 : shiftNow )?.id,
                                    warehouse?.id
                                )
                            }
                        }
                    }
                }
                //close the modeal
                store.commit('Modal/tunnelMessage', true)
                store.commit("Modal/active")
            }
        }

        return {
            changeShift, spvLists, headLists, periode, warehousesLists, lowerPeriode, send
        }
    },
}
</script>