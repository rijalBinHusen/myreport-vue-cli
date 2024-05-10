<template>
    <div>
        <AGGrid
            :originColumn="table?.excelColumn"
            :rowData="lists"
            :tableName="table?.excelId"
            @exit="mode = 'Main'"
            @save="save($event)"
            rowHeight="70"
        >   
            <template #text>
                {{ excelLabel }}
            </template>
        </AGGrid>
    </div>
</template>

<script>
import Button from "../../components/elements/Button.vue"
import AGGrid from "./AGGrid.vue"
import { baseReportStock } from '@/pages/BaseReport/BaseReportStock'
import { ref, onMounted } from "vue"
import { useStore } from "vuex"
import AGDateEditorVue from "./AGDateEditor.vue"
import { loaderMessage } from "../../components/parts/Loader/state";
import { Documents } from "../Documents/DocumentsPeriod";

export default {
    components: { AGGrid, Button },
    setup() {
        const store = useStore();
        const lists = ref([]);
        const excelLabel = ref(null);
        const { updateBaseStock  } = baseReportStock();
        const { getDocumentsFinishedBeforeDays } = Documents();

        const save = async (records) => {
            store.commit("Modal/active", {judul: "", form: "Loader"});
            for(let [index, record] of records.entries()) {
                
                loaderMessage.value = `Menyimpan record ${index + 1} dari ${records.length}`;
                await updateBaseStock(record.id, record.changed)
            }
            loaderMessage.value = '';
            store.commit("Modal/active");
        }

        const table = {
                    heads: ['Item', 'Selisih', 'Problem'],
                    excelId: 'excelStockEntry',
                    keys: ['itemName', 'selisih', 'problem2'],
                    idTable: 'BaseReportStockTableEntry',
                    excelColumn: [
                        { headerName: "Kode Item", field: "item", editable: true, resizable: true },
                        { headerName: "Nama Item", field: "itemName", editable: false, resizable: true, width: 300 },
                        { headerName: "Awal", field: "awal", editable: true, resizable: true, width: 100, valueParser: params => Number(params.newValue) }, 
                        { headerName: "Masuk", field: "in", editable: true, resizable: true, width: 100, filter: 'agNumberColumnFilter', valueParser: params => Number(params.newValue) }, 
                        { headerName: "Tanggal masuk", field: "dateIn", editable: true, resizable: true, maxWidth: 120, wrapText: true, autoHeight: true, cellEditor: AGDateEditorVue }, 
                        { headerName: "Coret DO", field: "planOut", editable: true, resizable: true, width: 100, valueParser: params => Number(params.newValue)  }, 
                        { headerName: "Keluar", field: "out", editable: true, resizable: true, width: 100, filter: 'agNumberColumnFilter', valueParser: params => Number(params.newValue)  }, 
                        { headerName: "Tanggal keluar", field: "dateOut", editable: true, resizable: true, maxWidth: 120, wrapText: true, autoHeight: true, cellEditor: AGDateEditorVue}, 
                        { headerName: "Akhir", editable: false, resizable: true, valueGetter: '(+data.in) - (+data.out) + data.awal', width: 100 },
                        { headerName: "Real stock", field: "real", editable: true, resizable: true, width: 100, valueParser: params => Number(params.newValue)  },
                        { headerName: "Tanggal terlama", field: "dateEnd", editable: true, resizable: true, maxWidth: 120, wrapText: true, autoHeight: true, cellEditor: AGDateEditorVue }, 
                        { headerName: "Selisih", editable: false, width:80, valueGetter: 'data.real - ((+data.in) - (+data.out) + (+data.awal))'}, 
                    ]
                }

        
        return { lists, save, table, excelLabel }
    }
}
</script>