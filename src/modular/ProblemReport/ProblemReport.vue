<template>
    <div>
        <div v-if="!form">
            <Button primary value="Tambah" class="w3-right w3-margin-top" type="button" @trig="form = true"/>
            <Datatable
                :datanya="lists"
                :heads="['Gudang', 'Nama item', 'Masalah', 'Tanggal mulai', 'Status']"
                :keys="['namaGudang', 'namaItem', 'masalah', 'tanggalMulai', 'status']"
                option
                id="problemReport"
                v-slot:default="slotProp"
            >
                <Button 
                    small
                    primary 
                    value="Edit" 
                    :datanya="slotProp.prop.id" 
                    type="button" 
                    @trig="edit($event)" 
                />
            </Datatable>
        </div>
        <ProblemReportForm :id="editId" v-else @exit="form = false; editId = ''" />
     </div>
</template>

<script>
import Datatable from "../../components/parts/Datatable.vue"
import Button from "../../components/elements/Button.vue"
import ProblemReportForm from "./ProblemReportForm.vue"

export default {
    components: {
        Button,
        Datatable,
        ProblemReportForm,
    },
    methods: {
        edit(ev) {
            this.editId = ev
            this.form = true
        }
    },
    computed: {
        lists() {
            return this.$store.getters["Problem/lists"]
        }
    },
    data() {
        return {
            form: false,
            editId: "",
        }
    },
    name: "ProblemReport"
}
</script>
