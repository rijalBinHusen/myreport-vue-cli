<template>
    <div>
        <form @submit.prevent="send">
            <!-- baris 1 -->
            <div class="w3-row">
                <!-- Tanggal mulai -->
                <div class="w3-col s3 w3-padding">
                    <label for="tanggalMulai">Tanggal mulai: </label>
                    <Datepicker id="tanggalMulai" class="w3-input w3-border w3-margin-top" v-model="tanggalMulaiModel" />
                </div>

                <!-- Nama gudang -->
                <div class="w3-col s3 w3-padding">
                    <label for="warehouse">Nama Gudang: </label>
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
                    <label for="nameSpv">Nama supervisor</label>
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
                    <InputItem @chose="problem.item = $event" :value="problem.item" placeholder="Kode item" class="w3-input w3-border w3-margin-top" />
                </div>
            </div>
            <!-- Baris 2 -->
            <div class="w3-row">
                <!-- Tanggal deadline solusi jangka pendek -->
                <div class="w3-col s3 w3-padding">
                    <label for="dl" class="w3-margin-top">Dead line jangka pendek: </label>
                    <Datepicker id="dl" class="w3-input w3-border w3-margin-top" v-model="dlModel" />
                </div>
                
                <!-- Shift mulai masalah -->
                <div class="w3-col s3 w3-padding">
                    <label for="shiftMulai">Shift mulai:</label>
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
                    <Input label="PIC jangka pendek" :value="problem.pic" placeholder="Nama PIC" type="text" @inp="problem.pic = $event" />
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
            <div class="w3-row">
                <!-- Deadline jangka panjang -->
                <div class="w3-col s3 w3-padding">
                    <label for="dlPanjang" class="w3-margin-top">Dead line jangka panjang: </label>
                    <Datepicker id="dlPanjang" class="w3-input w3-border w3-margin-top" v-model="dlPanjangModel" />
                </div>

                <!-- PIC jangka panjang -->
                <div class="w3-col s3 w3-padding">
                    <Input label="PIC Jangka panjang" :value="problem.picPanjang" placeholder="nama PIC" type="text" @inp="problem.picPanjang = $event" />
                </div>

                <!-- Tanggal masalah selesai -->
                <div class="w3-col s3 w3-padding">
                    <label for="tanggalSelesai" class="w3-margin-top">Tanggal selesai: </label>
                    <Datepicker id="tanggalSelesai" class="w3-input w3-border w3-margin-top" v-model="tanggalSelesaiModel" />
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
            </div>
            <!-- Baris 3 -->
            <div class="w3-row">
                <!-- Textarea masalah -->
                <div class="w3-col s6 w3-padding" style="height:100">
                    <label for="masalah">Masalah: </label>
                    <textarea v-model="problem.masalah" id="masalah" style="width:100%; height:100%;"></textarea>
                </div>

                <!-- Textarea sumber masalah -->
                <div class="w3-col s6 w3-padding" style="height:100">
                    <label for="sumberMasalah">Sumber masalah: </label>
                    <textarea v-model="problem.sumberMasalah" id="sumberMasalah" style="width:100%; height:100%;"></textarea>
                </div>
            </div>
            <!-- Baris 4 -->
            <div class="w3-row">
                <!-- Textarea solusi jangka pendek -->
                <div class="w3-col s6 w3-padding" style="height:100">
                    <label for="solusi">Solusi jangka pendek: </label>
                    <textarea v-model="problem.solusi" id="solusi" style="width:100%; height:100%;"></textarea>
                </div>

                <!-- Textarea solusi jangka panjang -->
                <div class="w3-col s6 w3-padding" style="height:100">
                    <label for="solusiPanjang">Solusi jangka panjang: </label>
                    <textarea v-model="problem.solusiPanjang" id="solusiPanjang" style="width:100%; height:100%;"></textarea>
                </div>
            </div>
            <Button primary :value="id ? 'Update' : 'Submit'" class="w3-right" type="button"/>
            <Button danger value="Exit" class="w3-right" type="button" @trig="$emit('exit')"/>
        </form>
    </div>
</template>

<script>
import Input from "../../components/elements/Input.vue"
import Datepicker from "vue3-datepicker"
import { mapState, mapGetters, mapActions } from "vuex"
import InputItem from "../Base/InputItem.vue"
import Select from "../../components/elements/Select.vue"
import Button from "../../components/elements/Button.vue"
import { uid } from "uid"

export default {
    data() {
        return {
            tanggalMulaiModel: "",
            dlModel: "",
            dlPanjangModel: "",
            tanggalSelesaiModel: "",
            problem: {
                warehouse: "",
                nameSpv: "",
                nameHeadSpv: "",
                item: "",
                tanggalMulai: "",
                shiftMulai: "",
                pic: "",
                dl: "",
                masalah: "",
                sumberMasalah: "",
                solusi: "",
                solusiPanjang: "",
                dlPanjang: "",
                picPanjang: "",
                tanggalSelesai: "",
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
            GET_HEADSPVENABLE: "Headspv/enabled",
            GET_PROBLEMID: "Problem/problemId"
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
    methods: {
        ...mapActions({
            APPEND: "append",
            UPDATE: "update"
        }),
        send() {
            this.$emit("exit")
            if(this.id) {
                this.UPDATE({
                store: "Problem",
                obj: this.problem
                })
                return
            }
            this.APPEND({
                store: "Problem",
                obj: Object.assign( { id: uid(3) }, this.problem)
            })
        }
    },
    components: {
        Button,
        Datepicker,
        Input,
        InputItem,
        Select,
    },
    watch: {
        tanggalMulaiModel(newVal, oldVal) {
            if(newVal === oldVal) {
                return
            }
            this.problem.tanggalMulai = this.GET_DATEFORMAT({format: "ymdTime", time: newVal})
        },
        dlModel(newVal, oldVal) {
            if(newVal === oldVal) {
                return
            }
            this.problem.dl = this.GET_DATEFORMAT({format: "ymdTime", time: newVal})
        },
        dlPanjangModel(newVal, oldVal) {
            if(newVal === oldVal) {
                return
            }
            this.problem.dlPanjang = this.GET_DATEFORMAT({format: "ymdTime", time: newVal})
        },
        tanggalSelesaiModel(newVal, oldVal) {
            if(newVal === oldVal) {
                return
            }
            this.problem.tanggalSelesai = this.GET_DATEFORMAT({format: "ymdTime", time: newVal})
        },
    },
    created() {
        this.tanggalMulaiModel =  new Date();
        this.dlModel = new Date();
        this.dlPanjangModel = new Date();
        this.tanggalSelesaiModel = new Date();
        if(this.id) {
            this.problem = this.GET_PROBLEMID(this.id)
            this.tanggalMulaiModel = new Date(this.problem.tanggalMulai)
            this.dlModel = new Date(this.problem.dl)
            this.dlPanjangModel = new Date(this.problem.dlPanjang)
            this.tanggalSelesaiModel = new Date(this.problem.tanggalSelesai)
        }
    },
    emits: ["exit"],
    props: ["id"],
    name: "ProblemReportForm"
}
</script>