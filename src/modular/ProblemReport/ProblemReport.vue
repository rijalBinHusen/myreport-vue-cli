<template>
    <div>
        <div v-if="!form">
            <Button primary value="Tambah" class="w3-right w3-margin-top" type="button" @trig="form = true"/>
            <Button primary value="Set periode" class="w3-right w3-margin-top" type="button" @trig="pickPeriode" />
            <Datatable
                :datanya="$store.getters['Problem/lists']"
                :heads="['Gudang', 'Nama item', 'Masalah', 'Tanggal mulai', 'Status']"
                :keys="['namaGudang', 'namaItem', 'masalah', 'tanggalMulai', 'status']"
                option
                id="tableProblemReport"
                #default="{ prop }"
            >
                <Button 
                    small
                    primary 
                    value="Edit" 
                    :datanya="prop.id" 
                    type="button" 
                    @trig="edit($event)" 
                />
                <Button 
                    small
                    secondary
                    value="Duplicate" 
                    :datanya="prop.id" 
                    type="button" 
                    @trig="duplicate($event)" 
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
        pickPeriode() {
            this.$store.commit("Modal/active", { 
                judul: "Set record to show", 
                form: "PeriodePicker", 
                store: "Problem",
                btnValue: "Show"
            });
        },
        edit(ev) {
            this.editId = ev
            this.form = true
        },
        duplicate(ev){
            let confirm = window.confirm("Apakah anda yakin akan menduplikat record tersebut?")
            if(!confirm) { return }
            let record = this.$store.getters["Problem/problemId"](ev)
            delete record.id
            this.$store.dispatch("append",
            {
                store: "Problem",
                obj: record
            })
            // delete record.id
            // console.log(Object.assign( { id: this.lists[0] ? this.lists[0].id : "PRB22050000" }, record))
        }
    },
    data() {
        return {
            form: false,
            editId: "",
        }
    },
    async mounted() {
        await this.$store.dispatch("Problem/getProblemFromDB");
        this.$store.dispatch("Baseitem/getAllItem");
    },
    name: "ProblemReport",
}
</script>
