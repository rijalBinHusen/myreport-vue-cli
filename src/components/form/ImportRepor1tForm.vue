<template>
    <div>
        <table :class="['w3-table w3-striped w3-small', disabled ? 'w3-disabled' : '']">
            <tr class="w3-small">
            <th>Nama file</th>
            <th>Tanggal</th>
            <th>Gudang</th>
            <th>Buku stock</th>
            <th>Rekap</th>
            </tr>
            <tr v-for="(info, index) in setupImport" :key="index">
            <td>
                <span v-if="!info.fileName">
                    <ImporReport1 @status="disabled = $event" @fileSelected="info.fileName = $event" />
                </span>
                <span v-else>
                    {{ info.fileName }}
                </span>
            </td>
            <td>
                <Datepicker class="w3-small" v-model="info.tanggal" />
            </td>
            <td>
                <Select 
                nomargin
                :options="[
                    {id:1, isi: 'GJCC'}, 
                    {id:2, isi: 'GJST'}, 
                    {id:3, isi: 'GJDP'}, 
                    {id:4, isi: 'GJBC'}, 
                    {id:5, isi: 'GJJBN'},
                ]" 
                value="id"
                text="isi"
                @selected="info.gudang = $event"
                />
            </td>
            <td>
                <span v-if="!info.fileName">
                    No sheets available
                </span>
                <span v-else>
                    <Select 
                    nomargin
                    :options="GET_SHEETNAMES(+index)" 
                    value="id"
                    text="value"
                    @selected="info.bukuStock = $event"
                    />
                </span>
            </td>
            <td>
                <span v-if="!info.fileName">
                    No sheets available
                </span>
                <span v-else>
                    <Select 
                    nomargin
                    :options="GET_SHEETNAMES(+index)" 
                    value="id"
                    text="value"
                    @selected="info.rekap = $event"
                    />
                </span>
            </td>
            </tr>
        </table>
        <p></p><p></p><p></p>
        <Button class="w3-right" primary value="Tambah" type="button" @trig="tambah" />
    </div>
</template>

<script>
import Select from "../elements/Select.vue"
import Datepicker from "vue3-datepicker"
import Table from "../elements/Table.vue"
import ImporReport1 from "../parts/ImporReport1.vue"
import Button from "../elements/Button.vue"
import { mapGetters } from "vuex";

export default {
    components: {
        Select,
        Table,
        Datepicker,
        Button,
        ImporReport1,
    },
    data () {
        return {
            setupImport: [],
            disabled: false,
        }
    },
    methods: {
        tambah() {
            this.setupImport.push({
                nameFile: null,
                tanggal: new Date,
                gudang: null,
                bukuStock: null,
                rekap: null,
            })
            
        }
    },
    computed: {
        ...mapGetters({
            GET_SHEETNAMES: "ImporReport1/sheetNames"
        })
    },
}
</script>