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
        <ButtonVue 
            v-if="shift"
            class="w3-left w3-col s1 w3-margin-top w3-padding " 
            primary 
            value="Excel" 
            type="button" 
            @trig="mode('Excel')" 
        />
        <!-- MArk as finished -->
        <ButtonVue
            v-if="shift"
            class="w3-left w3-col s2 w3-margin-top" 
            primary 
            value="Mark as finished" 
            type="button" 
            @trig="mode('BaseFinishedForm')"
        />
    </div>
</template>

<script>
import ButtonVue from '@/components/elements/Button.vue';
import SelectVue from '@/components/elements/Select.vue';
import { 
    getBaseReportFile,
    dateBaseReportFileImported,
    warehouseByDate,
    isRecordExistsByPeriodeAndWarehouse
} from '@/composable/components/BaseReportFile';
import { subscribeMutation } from '@/composable/piece/subscribeMutation';
import { computed, ref, watch, onMounted } from 'vue';
import { loader, modalClose } from '@/composable/piece/vuexModalLauncher';
import SelectShift from '@/components/parts/SelectShift.vue';
import { selectedPeriode, selectedWarehouse, shift, sheet } from '@/composable/components/BaseReportPanel'
import { useStore } from 'vuex';
import { dateMonth } from '@/composable/piece/dateFormat';
import { getWarehouseId } from '@/composable/components/Warehouses';
import { getProblemFromDB } from '@/composable/components/Problem'


export default {
    components: {
        ButtonVue,
        SelectVue,
        SelectShift,
    },
    emits: ['baseReportChanged', 'mode'],
    setup(props, { emit }) {
        const store = useStore()
        const warehouses = ref([])
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
                // wait the process get base report file
                await getBaseReportFile(res?.periode1, res?.periode2)
                //close the loader
                modalClose()
                // renewLists()
                selectedWarehouse.value = null
                sheet.value = null
            }
        }

        const dateBaseReportFile = computed(() => dateBaseReportFileImported() )

        async function send () {
            let baseReportFile = isRecordExistsByPeriodeAndWarehouse(selectedPeriode.value, selectedWarehouse.value)?.id
            // get value for title
            let periode2 = dateMonth(Number(selectedPeriode.value || new Date()))
            let warehouseName = await getWarehouseId(selectedWarehouse.value || 'WHS22050002').then((res) => res.name)

            // jika base report file by periode and warehouse tidak exists maka selected warehouses kita kosongin 
            if(!baseReportFile) {
                selectedWarehouse.value = null
                sheet.value = null
                shift.value = null
            }

            warehouses.value = await warehouseByDate(selectedPeriode.value)

            emit('baseReportChanged', { 
                periode: selectedPeriode.value,
                warehouse: selectedWarehouse.value,
                shift: shift.value,
                baseReportFile,
                sheet: sheet.value,
                title: periode2 + ' - ' + warehouseName + ', Shift ' + shift.value
             })
        }
        
        watch([selectedPeriode, selectedWarehouse, sheet, shift], async (newVal, oldVal) => {
            // selectedperiode
            send()            
        })

        onMounted( async () => {
            await getProblemFromDB()
            send()
        })

        const mode = (ev) => {
            emit('mode', ev)
        }
  
        return { 
            shift, 
            sheet, 
            pickPeriode, 
            dateBaseReportFile, 
            warehouses, 
            selectedPeriode,
            selectedWarehouse,
            mode,         
        }
    },
}
</script>@/pages/BaseReportFile/BaseReportFile