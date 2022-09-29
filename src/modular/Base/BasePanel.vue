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
            :inselect="selectedPeriode"
        />
            

        <!-- Warehouse Base report -->
        <SelectVue
            v-if="selectedPeriode"
            class="w3-col s2 w3-margin-right"
            :options="warehouses" 
            value="warehouse"
            text="warehouseName"
            judul="gudang"
            @selected="selectedWarehouse = $event"
            :inselect="selectedWarehouse"
        />

        <!-- Sheet report -->
        <SelectVue 
            v-if="selectedWarehouse"
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
        />
        <!-- Shift -->
        <SelectShift 
            v-if="sheet" 
            class="w3-col s1 w3-margin-right" 
            :inSelectShift="shift"
            @selectedShift="shift = $event" 
        />
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
    isRecordExistsByPeriodeAndWarehouse
} from '@/composable/components/BaseReportFile';
import { subscribeMutation } from '@/composable/piece/subscribeMutation';
import { computed, ref, watch, onMounted } from 'vue';
import { loader, modalClose } from '@/composable/piece/vuexModalLauncher';
import SelectShift from '@/components/parts/SelectShift.vue';


export default {
    components: {
        ButtonVue,
        SelectVue,
        SelectShift,
    },
    emits: ['baseReportChanged'],
    setup(props, { emit }) {
        const selectedPeriode = ref(null)
        const warehouses = ref([])
        const shift = ref('')
        const sheet = ref('')
        const base = ref('')
        const selectedWarehouse = ref('')
        const pickPeriode = async () => {
            let res = await subscribeMutation(
                "Pilih periode yang akan ditampilkan", 
                "PeriodePicker",
                {},
                'Modal/tunnelMessage'
                )
            if(res) {
                //open the loader
                loader()
                // wait the process
                await getBaseReportFile(res?.periode1, res?.periode2)
                //close the loader
                modalClose()
                // renewLists()
                listsAllBaseReportFile()
            }
        }

        const dateBaseReportFile = computed(() => dateBaseReportFileImported() )
        

        watch([selectedPeriode, selectedWarehouse, sheet, shift], async (newVal, oldVal) => {
            // selectedperiode
            if(newVal[0] != oldVal[0]) {
                // jika base report file by periode and warehouse tidak exists maka selected warehouses kita kosongin 
                if(!isRecordExistsByPeriodeAndWarehouse(selectedPeriode.value, selectedWarehouse.value)) {
                    selectedWarehouse.value = null
                    sheet.value = null
                }
                warehouses.value = await warehouseByDate(selectedPeriode.value)
            }
            emit('baseReportChanged', { 
                periode: selectedPeriode.value,
                warehouse: selectedWarehouse.value,
                shift: shift.value
             })
        })
  
        return { 
            shift, 
            sheet, 
            pickPeriode, 
            dateBaseReportFile, 
            warehouses, 
            selectedPeriode,
            selectedWarehouse,             
        }
    },
}
</script>