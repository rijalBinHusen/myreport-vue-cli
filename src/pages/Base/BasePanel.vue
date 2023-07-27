<template>
    <div id="set-periode" :class="['w3-row w3-center', freezePanel ? 'w3-disabled' : '']">

        <ButtonVue 
            class="w3-left w3-col s1 w3-margin-top w3-margin-right" 
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
            :inselect="selectedPeriode + ''"
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

        <ButtonVue
            v-if="sheet == 'stock'"
            class="w3-left w3-col s1 w3-margin-top" 
            primary 
            value="Remap stock" 
            type="button" 
            @trig="remapCurrentStock"
        />

    </div>
</template>

<script lang="ts" setup>
import ButtonVue from '@/components/elements/Button.vue';
import SelectVue from '@/components/elements/Select.vue';
import { BaseReportFile, WarehouseByDate } from "@/pages/BaseReport/BaseReportFile";
import { subscribeMutation } from '@/composable/piece/subscribeMutation';
import { computed, ref, watch, onMounted } from 'vue';
import { loader, modalClose } from '@/composable/piece/vuexModalLauncher';
import SelectShift from '@/components/parts/SelectShift.vue';
import { selectedPeriode, selectedWarehouse, shift, sheet, freezePanel } from './BaseReportPanel'
import { dateMonth } from '@/composable/piece/dateFormat';
import { getWarehouseById } from '@/pages/Warehouses/Warehouses';
import { getProblemFromDB } from '@/pages/Problems/Problem'
import { baseReportStock } from "@/pages/BaseReport/BaseReportStock";

    const emits = defineEmits(['baseReportChanged', 'mode'])
    
    const { getBaseReportFile, dateBaseReportFileImported, warehouseByDate, getBaseFileByPeriodeAndWarehouse } = BaseReportFile();

    const warehouses = ref(<WarehouseByDate[]>[])

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
            selectedWarehouse.value = ''
            sheet.value = ''
        }
    }

    const remapCurrentStock = async () => {
        freezePanel.value = true;

        sheet.value = 'clock';

        let baseReportFileInfo = getBaseFileByPeriodeAndWarehouse(selectedPeriode.value, selectedWarehouse.value)

        let { reMapStock } = baseReportStock();

        if(typeof baseReportFileInfo === 'undefined') return;

        await reMapStock(baseReportFileInfo?.id, shift.value);

        freezePanel.value = false
        sheet.value = 'stock';
    }

    const dateBaseReportFile = computed(() => dateBaseReportFileImported() )

    async function getListPeriodeAndWarehouse () {

        let baseReportFileId = getBaseFileByPeriodeAndWarehouse(selectedPeriode.value, selectedWarehouse.value)?.id
        // get value for title
        let periode2 = dateMonth(Number(selectedPeriode.value || new Date()))
        let warehouseName = await getWarehouseById(selectedWarehouse.value || 'WHS22050002').then((res) => res.name)

        // jika base report file by periode and warehouse tidak exists maka selected warehouses kita kosongin 
        if(!baseReportFileId) {
            selectedWarehouse.value = ''
            sheet.value = ''
            // @ts-expect-error
            shift.value = ''
        }

        warehouses.value = warehouseByDate(selectedPeriode.value)

        emits('baseReportChanged', { 
            periode: selectedPeriode.value,
            warehouse: selectedWarehouse.value,
            shift: shift.value,
            baseReportFileId,
            sheet: sheet.value,
            title: periode2 + ' - ' + warehouseName + ', Shift ' + shift.value
            })
    }
    
    watch([selectedPeriode, selectedWarehouse, sheet, shift], async (newVal, oldVal) => {
        // selectedperiode
        getListPeriodeAndWarehouse()            
    })

    onMounted( async () => {
        await getProblemFromDB()
        getListPeriodeAndWarehouse()
    })

    const mode = (ev: string) => {
        emits('mode', ev)
    }
</script>