<template>
    <div id="set-periode" class="w3-row w3-center">
        <ButtonVue 
            class="w3-left w3-col s2 w3-margin-top w3-margin-right" 
            primary 
            value="Set periode" 
            type="button" 
            @trig="pickPeriode"
        />
        <!-- Date Base report -->
        <SelectVue 
            class="w3-col s1 w3-margin-right"
            :options="dateBaseReportFile" 
            value="periode"
            judul="periode"
            text="periode2"
            @selected="selectedPeriode = $event"
        />
            <!-- 
            :inselect="selectedPeriode" -->

        <!-- Warehouse Base report -->
        <SelectVue
            v-if="selectedPeriode"
            class="w3-col s2 w3-margin-right"
            :options="warehouses" 
            value="warehouse"
            text="warehouseName"
            judul="gudang"
        />
            <!-- @selected="selectedWarehouse = $event"
            :inselect="selectedWarehouse" -->

        <!-- Sheet report -->
        <!-- <SelectVue 
            v-if="selectedWarehouse.length"
            class="w3-col s1 w3-margin-right"
            :options='[
                { id: "clock", title: "Clock" },
                { id: "stock", title: "Stock" },
            ]'
            value="id"
            text="title"
            judul="sheet"
            :inselect="sheet"
            @selected="sheet = $event"
        />             -->
        <!-- Shift -->
        <!-- <SelectVue 
            v-if="selectedWarehouse.length"
            class="w3-col s1 w3-margin-right"
            :options="[
                { id:1, title: 'Shift 1'},
                { id:2, title: 'Shift 2'},
                { id:3, title: 'Shift 3'},
            ]" 
            judul="shift"
            value="id"
            text="title"
            :inselect="shift"
            @selected="shift = $event"
        /> -->
        <!-- oPEN IN EXCEL MODE -->
        <!-- <ButtonVue 
            v-if="lists.length"
            class="w3-left w3-col s1 w3-margin-top w3-padding " 
            primary 
            value="Excel" 
            type="button" 
            @trig="excelMode = true" 
        /> -->
        <!-- MArk as finished -->
        <!-- <ButtonVue
            v-if="lists.length"
            class="w3-left w3-col s2 w3-margin-top" 
            primary 
            value="Mark as finished" 
            type="button" 
            @trig="BaseFinishForm = true"
        /> -->
    </div>
</template>

<script>
import ButtonVue from '@/components/elements/Button.vue';
import SelectVue from '@/components/elements/Select.vue';

import { 
    getBaseReportFile, 
    listsAllBaseReportFile, 
    dateBaseReportFileImported,
    warehouseByDate,
} from '@/composable/components/BaseReportFile';

import { useStore } from 'vuex';
import { computed, ref, watch, onUpdated } from '@vue/runtime-core';


export default {
    components: {
        ButtonVue, SelectVue
    },
    setup() {
        const store = useStore()
        const selectedPeriode = ref(null)
        const warehouses = ref([])
        const pickPeriode = () => {
            let unsubscribe;
            store.commit("Modal/active", { 
                judul: "Set periode to show", 
                form: "PeriodePicker", 
                store: false, 
                btnValue: "Show",
                tunnelMessage: true,
            });

            const promise = new Promise (resolve => {
                unsubscribe = store.subscribe(mutation => {
                    if (mutation.type === 'Modal/tunnelMessage') {
                        //get the payload that send to tunnel message
                    resolve(mutation?.payload)
                    }
                })
            })
            
            promise.then(async val => {
                //open the loader
                store.commit("Modal/active", {judul: "", form: "Loader"})
                // wait the process
                await getBaseReportFile(val?.periode1, val?.periode2)
                //unsubscribe the mutation
                unsubscribe()
                //close the loader
                store.commit("Modal/active")
                // renewLists()
                listsAllBaseReportFile()
            })
        }

        const dateBaseReportFile = computed(() => dateBaseReportFileImported() )
        

        watch(selectedPeriode, async () => {
            warehouses.value = await warehouseByDate(selectedPeriode.value)
                // console.log(warehouses.value)
        })
        
        return { pickPeriode, dateBaseReportFile, warehouses, selectedPeriode }
    },
}
</script>