<template>
    <div>
        <form @submit.prevent="send">
            <!-- baris 1 -->
            <div class="w3-row">
                <!-- Tanggal mulai -->
                <div class="w3-col s3 w3-padding">
                    <label for="periode">Tanggal mulai: </label>
                    <Datepicker id="periode" class="w3-input w3-border w3-margin-top" v-model="periodeModel" />
                </div>

                <!-- Nama gudang -->
                <div class="w3-col s3 w3-padding">
                    <SelectWarehouse 
                        :inSelectWarehouse="problem.warehouse"
                        @selectedWarehouse="problem.warehouse = $event"

                    />
                </div>

                <!-- Nama supervisors -->
                <div class="w3-col s3 w3-padding">
                    <SelectSupervisorsVue 
                        :inSelectSpv="problem.nameSpv"
                        @selectedSpv="problem.nameSpv = $event; setPic($event)"
                        spvEnabled
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
                    <SelectShiftVue
                        label="mulai"
                        :inSelectShift="problem.shiftMulai"
                        @selectedShift="problem.shiftMulai = $event"
                    />
                </div>
                <!-- Nama PIC solusi jangka penddek -->
                <div class="w3-col s3 w3-padding">
                    <Input 
                        label="PIC jangka pendek" 
                        :value="problem.pic" 
                        placeholder="Nama PIC" 
                        type="text" 
                        @inp="problem.pic = $event" 
                    />
                </div>

                <!-- Nama head spv -->
                <div class="w3-col s3 w3-padding">
                    <SelectHeadVue
                        :inSelectHead="problem.nameHeadSpv" 
                        @selectedHead="problem.nameHeadSpv = $event"
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
                    <SelectShiftVue
                        label="selesai"
                        :inSelectShift="problem.shiftSelesai"
                        @selectedShift="problem.shiftSelesai = $event"
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
            <Button danger value="Exit" class="w3-right" type="button" @trig="$emit('exit')"/>
            <Button primary :value="id ? 'Update' : 'Submit'" class="w3-right" type="button"/>
            <span class="w3-xlarge">
                <label for="isFinished">Finished?</label>
                <input type="checkbox" class="w3-xlarge" v-model="problem.isFinished" id="isFinished">
            </span>
        </form>
    </div>
</template>

<script>
import Input from "@/components/elements/Input.vue"
import Datepicker from "vue3-datepicker"
import { mapState, mapGetters, mapActions } from "vuex"
import InputItem from "@/modular/Base/InputItem.vue"
import Select from "@/components/elements/Select.vue"
import Button from "@/components/elements/Button.vue"
import SelectSupervisorsVue from "@/components/parts/SelectSupervisors.vue"
import SelectHeadVue from "@/components/parts/SelectHead.vue"
import SelectShiftVue from "@/components/parts/SelectShift.vue"
import SelectWarehouse from "@/components/parts/SelectWarehouse.vue"

export default {
    data() {
        return {
            periodeModel: "",
            dlModel: "",
            dlPanjangModel: "",
            tanggalSelesaiModel: "",
            problem: {
                warehouse: "",
                nameSpv: "",
                nameHeadSpv: "",
                item: "",
                periode: "",
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
                isFinished: false,
            }
        }
    },
    computed: {
        ...mapState({
            _PROBLEM: state => JSON.parse(JSON.stringify(state.Problem.lists))
        }),        
        ...mapGetters({
            GET_DATEFORMAT: "dateFormat",
            GET_PROBLEMID: "Problem/problemId"
        }),
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
                    obj: { ...this.problem },
                    criteria: { id: this.id }
                })
                return
            }
            this.APPEND({
                store: "Problem",
                obj: { ...this.problem },
            })
        },
        setPic(ev) {
            this.problem.pic = this.$store.getters['Supervisors/spvId'](ev)?.name
        }
    },
    components: {
    Button,
    Datepicker,
    Input,
    InputItem,
    Select,
    SelectSupervisorsVue,
    SelectHeadVue,
    SelectShiftVue,
    SelectWarehouse
},
    watch: {
        periodeModel(newVal, oldVal) {
            this.problem.periode = this.GET_DATEFORMAT({format: "ymdTime", time: newVal})
            // let tanggalSelesai = new Date(newVal.setFullYear(newVal.getFullYear() + 1))
            // this.problem.tanggalSelesai = this.GET_DATEFORMAT({format: "ymdTime", time: tanggalSelesai})
            // 1 add 1 year
            this.tanggalSelesaiModel = new Date(newVal.getTime() + 31536000000)
            this.dlModel = new Date(newVal.getTime() + (1000*60*60*24*7))
            this.dlPanjangModel = new Date(newVal.getTime() + (1000*60*60*24*14))
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
        this.periodeModel =  new Date();
        this.dlModel = new Date();
        this.dlPanjangModel = new Date();
        this.tanggalSelesaiModel = new Date();
        if(this.id) {
            this.problem = this.GET_PROBLEMID(this.id)
            this.periodeModel = new Date(this.problem.periode)
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