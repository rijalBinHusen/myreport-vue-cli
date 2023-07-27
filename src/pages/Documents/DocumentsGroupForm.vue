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
        <span v-for="spv in warehouse.supervisorsAndDetail" :key="spv.id">
            <Input 
                v-if="spv.id"
                :label="spv.name" placeholder="Shift" class="w3-row w3-padding" type="number"
                :value="spv.shift" @inp="changeShift('Supervisors', spv?.id, $event)"
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

<script lang="ts">
import Select from "@/components/elements/Select.vue"
import Button from "@/components/elements/Button.vue"
import Datepicker from "vue3-datepicker"
import Input from "@/components/elements/Input.vue"
import { ref, onBeforeMount } from "vue"
import { updateShiftSupervisor } from "@/pages/Supervisors/Supervisors"
import { updateShiftHeadSupervisor, headspvEnabled, headspvByShift } from "@/pages/Headspv/Headspv"
import { getWarehouseNotGroupedAndTheSupervisors, type WarehouseAndTheSupervisors } from '@/pages/Warehouses/Warehouses'
import { Documents } from '@/pages/Documents/DocumentsPeriod'
import { useStore } from "vuex"
import { ymdTime } from "@/composable/piece/dateFormat"

interface HeadSpv {
  disabled: boolean
  id: string
  name: string
  phone: string
  shift: number
}

export default {
    components: {
        Select, Button,
        Input, Datepicker,
    },
    setup() {
        const headLists = ref(<HeadSpv[]>[])
        const periode = ref()
        const lowerPeriode = ref(new Date())
        const warehousesLists = ref(<WarehouseAndTheSupervisors[]>[]);
        const store = useStore()
        const { getLastDate, addDocumentsGroup } = Documents();

        const changeShift = (store: string, idFL: string, shift: string|number) => {
            store == 'Supervisors'
                ? updateShiftSupervisor(idFL, Number(shift))
                : updateShiftHeadSupervisor(idFL, Number(shift))
        }

        onBeforeMount(async () => {
            headLists.value = headspvEnabled()
            warehousesLists.value = await getWarehouseNotGroupedAndTheSupervisors()
            lowerPeriode.value = new Date(getLastDate())
        })

        const send = async () => {
            if(periode.value) {
                // bring up the loader
                store.commit("Modal/active", {judul: "", form: "Loader"});
                // jadikkan this.periode sebagai new Date().getTime()
                let periodeTime = ymdTime(periode.value)
                await addDocumentsGroup(periodeTime);
                //close the modeal
                store.commit('Modal/tunnelMessage', true)
                store.commit("Modal/active")
            }
        }

        return {
            changeShift, headLists, periode, warehousesLists, lowerPeriode, send
        }
    },
}
</script>