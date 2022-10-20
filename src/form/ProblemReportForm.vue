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
                        :inSelectWarehouse="warehouse"
                        @selectedWarehouse="warehouse = $event"

                    />
                </div>

                <!-- Nama supervisors -->
                <div class="w3-col s3 w3-padding">
                    <SelectSupervisorsVue 
                        :inSelectSpv="nameSpv"
                        @selectedSpv="nameSpv = $event; setPic($event)"
                        spvEnabled
                    />
                </div>
                
                <!-- Nama item -->
                <div class="w3-col s3 w3-padding">
                    <label for="namaItem">Masukkan Item</label>
                    <InputItem @chose="item = $event" :value="item" placeholder="Kode item" class="w3-input w3-border w3-margin-top" />
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
                        :inSelectShift="shiftMulai"
                        @selectedShift="shiftMulai = $event"
                    />
                </div>
                <!-- Nama PIC solusi jangka penddek -->
                <div class="w3-col s3 w3-padding">
                    <Input 
                        label="PIC jangka pendek" 
                        :value="pic" 
                        placeholder="Nama PIC" 
                        type="text" 
                        @inp="pic = $event" 
                    />
                </div>

                <!-- Nama head spv -->
                <div class="w3-col s3 w3-padding">
                    <SelectHeadVue
                        :inSelectHead="nameHeadSpv" 
                        @selectedHead="nameHeadSpv = $event"
                    />
                </div>

            </div>
            <!-- Baris 3 -->
            <div class="w3-row">
                <!-- Deadline jangka panjang -->
                <div class="w3-col s3 w3-padding">
                    <label for="dlPanjang" class="w3-margin-top">Dead line jangka panjang: </label>
                    <Datepicker id="dlPanjang" class="w3-input w3-border w3-margin-top" v-model="dlPanjangModel" />
                </div>

                <!-- PIC jangka panjang -->
                <div class="w3-col s3 w3-padding">
                    <Input label="PIC Jangka panjang" :value="picPanjang" placeholder="nama PIC" type="text" @inp="picPanjang = $event" />
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
                        :inSelectShift="shiftSelesai"
                        @selectedShift="shiftSelesai = $event"
                    />
                </div>
            </div>
            <!-- Baris 4 -->
            <div class="w3-row">
                <!-- Textarea masalah -->
                <div class="w3-col s6 w3-padding" style="height:100">
                    <label for="masalah">Masalah: </label>
                    <textarea v-model="masalah" id="masalah" style="width:100%; height:100%;"></textarea>
                </div>

                <!-- Textarea sumber masalah -->
                <div class="w3-col s6 w3-padding" style="height:100">
                    <label for="sumberMasalah">Sumber masalah: </label>
                    <textarea v-model="sumberMasalah" id="sumberMasalah" style="width:100%; height:100%;"></textarea>
                </div>
            </div>
            <!-- Baris 5 -->
            <div class="w3-row">
                <!-- Textarea solusi jangka pendek -->
                <div class="w3-col s6 w3-padding" style="height:100">
                    <label for="solusi">Solusi jangka pendek: </label>
                    <textarea v-model="solusi" id="solusi" style="width:100%; height:100%;"></textarea>
                </div>

                <!-- Textarea solusi jangka panjang -->
                <div class="w3-col s6 w3-padding" style="height:100">
                    <label for="solusiPanjang">Solusi jangka panjang: </label>
                    <textarea v-model="solusiPanjang" id="solusiPanjang" style="width:100%; height:100%;"></textarea>
                </div>
            </div>
            <Button danger value="Exit" class="w3-right" type="button" @trig="$emit('exit')"/>
            <Button primary :value="id ? 'Update' : 'Submit'" class="w3-right" type="button"/>
            <span class="w3-xlarge">
                <label for="isFinished">Finished?</label>
                <input type="checkbox" class="w3-xlarge" v-model="isFinished" id="isFinished">
                *
                <label for="linkedToDocument">Linked as item variance to document?</label>
                <input type="checkbox" class="w3-xlarge" v-model="linkedToDocument" id="linkedToDocument">
            </span>
        </form>
    </div>
</template>

<script>
import Input from "@/components/elements/Input.vue"
import Datepicker from "vue3-datepicker"
import InputItem from "@/modular/Base/InputItem.vue"
import Select from "@/components/elements/Select.vue"
import Button from "@/components/elements/Button.vue"
import SelectSupervisorsVue from "@/components/parts/SelectSupervisors.vue"
import SelectHeadVue from "@/components/parts/SelectHead.vue"
import SelectShiftVue from "@/components/parts/SelectShift.vue"
import SelectWarehouse from "@/components/parts/SelectWarehouse.vue"
import { addProblem, problemId, updateProblem } from '@/composable/components/Problem'
import { getSupervisorId } from '@/composable/components/Supervisors'
import { ymdTime } from '@/composable/piece/dateFormat'
import { updateDocument, getDocumentByPeriodeByWarehouseByShiftFromDb } from '@/composable/components/DocumentsPeriod'

export default {
    data() {
        return {
            periodeModel: "",
            dlModel: "",
            dlPanjangModel: "",
            tanggalSelesaiModel: "",
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
            changed: {},
            isEditMode: false,
            linkedToDocument: false,
        }
    },
    methods: {
        async send() {
            // console.log({ ...this.changed })
            this.$store.commit('Modal/active', { judul: '', form: 'Loader' })
            if(this.id) {
                await updateProblem(this.id, { ...this.changed })
            } else {
                await addProblem(this.warehouse, this.nameSpv, this.nameHeadSpv, this.item, this.periode, this.shiftMulai, this.pic, this.dl, this.masalah,
                this.sumberMasalah, this.solusi, this.solusiPanjang, this.dlPanjang, this.picPanjang, this.tanggalSelesai, this.shiftSelesai, this.isFinished)
            }
            this.$emit("exit")
            this.$store.commit('Modal/active')
        },
        async setPic(ev) {
            this.pic = await getSupervisorId(ev).then((res) => res.name)
        },
        async linkToDocument (bool) {
            if(bool) {
                let doc = await getDocumentByPeriodeByWarehouseByShiftFromDb(this.periode, this.warehouse, this.shiftMulai)
                // reflect the variance to document
                updateDocument(doc?.id, { itemVariance: doc?.itemVariance ? doc?.itemVariance + 1 : 1 })
                // update the problem
                updateProblem(this.id, { linkedToDocument: true })
            }
        },
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
            this.periode = ymdTime(newVal)
            // let tanggalSelesai = new Date(newVal.setFullYear(newVal.getFullYear() + 1))
            // this.tanggalSelesai = this.GET_DATEFORMAT({format: "ymdTime", time: tanggalSelesai})
            // 1 add 1 year
            this.tanggalSelesaiModel = new Date(newVal.getTime() + 31536000000)
            this.dlModel = new Date(newVal.getTime() + (1000*60*60*24*7))
            this.dlPanjangModel = new Date(newVal.getTime() + (1000*60*60*24*14))
            if(this.isEditMode) {
                this.changed['periode'] = ymdTime(newVal)
            }
        },
        dlModel(newVal, oldVal) {
            this.dl = ymdTime(newVal)
            if(this.isEditMode) {
                this.changed['dl'] = ymdTime(newVal)
            }
        },
        dlPanjangModel(newVal, oldVal) {
            this.dlPanjang = ymdTime(newVal)
            if(this.isEditMode) {
                this.changed['dlPanjang'] = ymdTime(newVal)
            }
        },
        tanggalSelesaiModel(newVal, oldVal) {
            this.tanggalSelesai = ymdTime(newVal)
            if(this.isEditMode) {
                this.changed['tanggalSelesai'] = ymdTime(newVal)
            }
        },
        warehouse(newVal) {
            if(this.isEditMode) {
                this.changed['warehouse'] = newVal
            }
        },
        nameSpv(newVal) {
            if(this.isEditMode) {
                this.changed['nameSpv'] = newVal
            }
        },
        nameHeadSpv(newVal) {
            if(this.isEditMode) {
                this.changed['nameHeadSpv'] = newVal
            }
        },
        item(newVal) {
            if(this.isEditMode) {
                this.changed['item'] = newVal
            }
        },
        shiftMulai(newVal) {
            if(this.isEditMode) {
                this.changed['shiftMulai'] = newVal
            }
        },
        pic(newVal) {
            if(this.isEditMode) {
                this.changed['pic'] = newVal
            }
        },
        masalah(newVal) {
            if(this.isEditMode) {
                this.changed['masalah'] = newVal
            }
        },
        sumberMasalah(newVal) {
            if(this.isEditMode) {
                this.changed['sumberMasalah'] = newVal
            }
        },
        solusi(newVal) {
            if(this.isEditMode) {
                this.changed['solusi'] = newVal
            }
        },
        solusiPanjang(newVal) {
            if(this.isEditMode) {
                this.changed['solusiPanjang'] = newVal
            }
        },
        picPanjang(newVal) {
            if(this.isEditMode) {
                this.changed['picPanjang'] = newVal
            }
        },
        shiftSelesai(newVal) {
            if(this.isEditMode) {
                this.changed['shiftSelesai'] = newVal
            }
        },
        isFinished(newVal) {
            if(this.isEditMode) {
                this.changed['isFinished'] = newVal
            }
        },
        linkedToDocument(newVal) {
            this.linkToDocument(newVal)
        },

    },
    created() {
        this.periodeModel =  new Date();
        this.dlModel = new Date();
        this.dlPanjangModel = new Date();
        this.tanggalSelesaiModel = new Date();
        if(this.id) {
            this.isEditMode = false
            let getProblem = problemId(this.id)
            this.periodeModel = new Date(getProblem.periode)
            this.dlModel = new Date(getProblem.dl)
            this.dlPanjangModel = new Date(getProblem.dlPanjang)
            this.tanggalSelesaiModel = new Date(getProblem.tanggalSelesai)
            this.warehouse = getProblem.warehouse
            this.nameSpv = getProblem.nameSpv
            this.nameHeadSpv = getProblem.nameHeadSpv
            this.item = getProblem.item
            this.shiftMulai = getProblem.shiftMulai
            this.pic = getProblem.pic
            this.masalah = getProblem.masalah
            this.sumberMasalah = getProblem.sumberMasalah
            this.solusi = getProblem.solusi
            this.solusiPanjang = getProblem.solusiPanjang
            this.picPanjang = getProblem.picPanjang
            this.shiftSelesai = getProblem.shiftSelesai
            this.isFinished = getProblem?.isFinished
            this.linkedToDocument = getProblem?.linkedToDocument
            setTimeout(() => {
                this.isEditMode = true
            }, 300)
        }
    },
    emits: ["exit"],
    props: ["id"],
    name: "ProblemReportForm"
}
</script>