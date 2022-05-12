<template>
    <div>
        <div v-if="!form">
            <h2 class="w3-center">Daftar Masalah</h2>
            <Button primary value="Tambah" class="w3-right" type="button" @trig="form = true"/>
            <Datatable
                :datanya="lists"
                :heads="['Gudang', 'Nama item', 'Masalah', 'Tanggal mulai', 'Status']"
                :keys="['warehouse', 'item', 'masalah', 'tanggalMulai', 'status']"
                option
                id="problemReport"
            />
        </div>
        <ProblemReportForm v-else @exit="form = false" />
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
    computed: {
        lists() {
            return this.$store.getters["Problem/lists"]

        }
    },
    data() {
        return {
            form: false,
        }
    },
    name: "ProblemReport"
}
</script>
