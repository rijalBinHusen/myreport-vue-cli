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
        <SelectShift v-if="sheet" class="w3-col s1 w3-margin-right" :inSelectShift="shift" @selectedShift="shift = $event" />
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
    setup() {
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
        

        watch(selectedPeriode, async () => {
            warehouses.value = await warehouseByDate(selectedPeriode.value)
        })

        const renewLists = async () => {
            //  || !this.shift || !this.sheet) { return }
            base = this.BASEIDSELECTED(this.selectedPeriode, this.selectedWarehouse)
            this.listsWarehouse = this.WAREHOUSEBASEREPORT(this.selectedPeriode)
            // console.log(this.base)
            
            if(this.selectedPeriode && this.selectedWarehouse && this.shift) {
                // check dulu apakah somerecord exists, 
                let isExists = 
                    this.ISCLOCKEXISTS(this.base.id, this.shift) 
                    && this.ISSTOCKEXISTS( this.base.id, this.shift)
                // jika exists
                if(isExists) {
                    this.detailsDocument()
                    // renewthe lists using function BASEREPORTSTOCKSHIFTANDPARENT: "BaseReportStock/shiftAndParent",
                    this.lists = this[`BASEREPORT${this.sheet.toUpperCase()}SHIFTANDPARENT`](this.shift, this.base.id)
                    return
                }
                // // jika tidak exists
                this.$store.commit("Modal/active", {judul: "", form: "Loader"});
                // looping cari baseReportStock dengan criteria { parent: baseReportFile.id }
                await this.$store.dispatch("BaseReportStock/getDataByParentAndShift", { parent: this.base.id, shift: +this.shift });
                // // looping cari baseReportClock dengan criteria { parent: baseReportFile.id }
                await this.$store.dispatch("BaseReportClock/getDataByParentAndShift", { parent: this.base.id, shift: +this.shift });
                this.$store.commit("Modal/active");
                this.renewLists()
            }
        }
        
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