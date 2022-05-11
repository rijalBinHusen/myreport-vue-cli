<template>
    <div>
        <h1>Masukkan masalah</h1>
        <form @submit.prevent="">
            <!-- baris 1 -->
            <div class="w3-row">
                <!-- Tanggal mulai -->
                <div class="w3-col s3 w3-padding">
                    <label for="tanggalMulai" style="font-weight:bold;" class="w3-margin-top">Tanggal mulai: </label>
                    <Datepicker id="tanggalMulai" class="w3-input w3-border w3-margin-top" v-model="problem.tanggalMulai" />
                </div>

                <!-- Nama gudang -->
                <div class="w3-col s3 w3-padding">
                    <label for="warehouse">Gudang: </label>
                    <Select 
                        id="warehouse"
                        class="w3-border"
                        :options="warehouses"
                        value="id"
                        text="name"
                        :inselect="problem.warehouse"
                        @selected="problem.warehouse = $event"
                    />
                </div>

                <!-- Nama supervisors -->
                <div class="w3-col s3 w3-padding">
                    <label for="nameSpv">Masukkan nama</label>
                    <Select 
                        id="nameSpv"
                        :options="names" 
                        class="w3-border"
                        value="id"
                        text="name"
                        :inselect="problem.nameSpv"
                        @selected="problem.nameSpv = $event"
                    />
                </div>
                
                <!-- Nama item -->
                <div class="w3-col s3 w3-padding">
                    <label for="namaItem">Masukkan Item</label>
                    <InputItem id="namaItem" @chose="problem.item = $event" placeholder="Kode item" class="w3-input w3-border w3-margin-top" />
                </div>
            </div>
            <!-- Baris 2 -->
            <div class="w3-row">
                <!-- Tanggal deadline solusi jangka pendek -->
                <div class="w3-col s3 w3-padding">
                    <label for="dl" style="font-weight:bold;" class="w3-margin-top">Dead line: </label>
                    <Datepicker id="dl" class="w3-input w3-border w3-margin-top" v-model="problem.dl" />
                </div>
                
                <!-- Shift mulai masalah -->
                <div class="w3-col s3 w3-padding">
                    <label for="shiftMulai">Shift mulai</label>
                    <Select 
                        class="w3-border"
                        id="shiftMulai"
                        :options="[
                            { id: '', title: 'Pilih shift' }, 
                            { id:1, title: 'Shift 1'},
                            { id:2, title: 'Shift 2'},
                            { id:3, title: 'Shift 3'},
                        ]" 
                        value="id"
                        text="title"
                        :inselect="problem.shiftMulai"
                        @selected="problem.shiftMulai = $event"
                    />
                </div>
                <!-- Nama PIC solusi jangka penddek -->
                <div class="w3-col s3 w3-padding">
                    <Input label="PIC" placeholder="Nama PIC" type="text" @inp="problem.pic = $event" />
                </div>

                <!-- Nama head spv -->
                <div class="w3-col s3 w3-padding">
                    <label>Nama kabag</label>
                    <Select 
                        class="w3-border"
                        :options="headspv" 
                        value="id"
                        text="name"
                        :inselect="problem.nameHeadSpv"
                        @selected="problem.nameHeadSpv = $event"
                    />
                </div>

            </div>
            <!-- Baris 5 -->
                <!-- Deadline jangka panjang -->
                <div class="w3-col s3 w3-padding">
                    <label for="dlPanjang" style="font-weight:bold;" class="w3-margin-top">Dead line 2: </label>
                    <Datepicker id="dlPanjang" class="w3-input w3-border w3-margin-top" v-model="problem.dlPanjang" />
                </div>

                <!-- PIC jangka panjang -->
                <div class="w3-col s3 w3-padding">
                    <Input label="PIC Jangka panjang" placeholder="nama PIC" type="text" @inp="problem.picPanjang = $event" />
                </div>

                <!-- Tanggal masalah selesai -->
                <div class="w3-col s3 w3-padding">
                    <label for="tanggalSelesai" style="font-weight:bold;" class="w3-margin-top">Tanggal selesai: </label>
                    <Datepicker id="tanggalSelesai" class="w3-input w3-border w3-margin-top" v-model="problem.tanggalSelesai" />
                </div>

                <!-- Shift masalah selesai -->
                <div class="w3-col s3 w3-padding">
                    <label for="shiftSelesai">Shift selesai</label>
                    <Select 
                        class="w3-border"
                        id="shiftMulai"
                        :options="[
                            { id: '', title: 'Pilih shift' }, 
                            { id:1, title: 'Shift 1'},
                            { id:2, title: 'Shift 2'},
                            { id:3, title: 'Shift 3'},
                        ]" 
                        value="id"
                        text="title"
                        :inselect="problem.shiftSelesai"
                        @selected="problem.shiftSelesai = $event"
                    />
                </div>
            <!-- Baris 3 -->
            <div class="w3-row">
                <!-- Textarea masalah -->
                <div class="w3-col s6 w3-padding" style="height:100">
                    <label for="masalah">Masalah: </label>
                    <textarea id="masalah" style="width:100%; height:100%;"></textarea>
                </div>

                <!-- Textarea sumber masalah -->
                <div class="w3-col s6 w3-padding" style="height:100">
                    <label for="sumberMasalah">Sumber masalah: </label>
                    <textarea id="sumberMasalah" style="width:100%; height:100%;"></textarea>
                </div>
            </div>
            <!-- Baris 4 -->
            <div class="w3-row">
                <!-- Textarea solusi jangka pendek -->
                <div class="w3-col s6 w3-padding" style="height:100">
                    <label for="solusi">Solusi jangka pendek: </label>
                    <textarea id="solusi" style="width:100%; height:100%;"></textarea>
                </div>

                <!-- Textarea solusi jangka panjang -->
                <div class="w3-col s6 w3-padding" style="height:100">
                    <label for="solusiPanjang">Solusi jangka panjang: </label>
                    <textarea id="solusiPanjang" style="width:100%; height:100%;"></textarea>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
import Input from "../../components/elements/Input.vue"
import Datepicker from "vue3-datepicker"
import { mapState, mapGetters } from "vuex"
import InputItem from "../Base/InputItem.vue"
import Select from "../../components/elements/Select.vue"

export default {
    data() {
        return {
            problem: {
                warehouse: "",
                nameSpv: "",
                nameHeadSpv: "",
                item: "",
                tanggalMulai: new Date(),
                shiftMulai: "",
                pic: "",
                dl: new Date(),
                masalah: "",
                sumberMasalah: "",
                solusi: "",
                solusiPanjang: "",
                dlPanjang: new Date(),
                picPanjang: "",
                tanggalSelesai: new Date(),
                shiftSelesai: "",
            }
        }
    },
    computed: {
        ...mapState({
        _WAREHOUSES: state => JSON.parse(JSON.stringify(state.Warehouses.lists))
        }),        
        ...mapGetters({
            GET_SPVENABLE: "Supervisors/enabled",
            GET_DATEFORMAT: "dateFormat",
            GET_HEADSPVENABLE: "Headspv/enabled"
        }),
        names() {
            // ambil semua nama dari state
            let options = Array.from(this.GET_SPVENABLE)
            // tambahkan option lain
            options.unshift({id: "", name: "Pilih nama" })
            // kembalikan agar tidak reactive
            return options
        },
        warehouses() {
            let rec = this._WAREHOUSES
            rec.unshift({
                id: "",
                name: "Select warehouse"
            })
            return rec
        },        
        headspv() {
            // ambil semua nama dari state
            let options = this.GET_HEADSPVENABLE
            // tambahkan option lain
            options.unshift({id: "", name: "Pilih nama" })
            // kembalikan agar tidak reactive
            return options
        },
    },
    components: {
        Datepicker,
        Input,
        InputItem,
        Select,
    },
    name: "ProblemReportForm"
}
</script>