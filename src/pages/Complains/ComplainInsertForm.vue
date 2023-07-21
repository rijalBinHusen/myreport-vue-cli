<template>
    <div class="w3-row">
        <div class="w3-col s6 w3-padding-large" v-html="baseData" style="overflow: auto; height: 400px;">
        </div>
        <div class="w3-col s6 w3-padding-large" style="overflow: auto; height: 400px;">
            <!-- Supervisor -->

            <SelectSupervisors 
                @selectedSpv="name = $event;"
                :inSelectSpv="name"
            
            />
            
            <SelectHead 
                :inSelectHead="head"
                @selectedHead="head = $event"
            />
            <!-- Periode -->
            <label for="periode">Periode:</label>
            <datepicker id="periode" class="w3-margin-bottom w3-border w3-input" v-model="periodeModel"></datepicker>

            <!-- type kesalahan -->
            <!--   -->

            <label for="type">Kesalahan:</label>
            <Select 
                id="type"
                :options="[ 
                    { id: 'klaim', name: 'Klaim'}, 
                    { id: 'kurang', name: 'Kurang muat' }, 
                    { id: 'lebih', name: 'Lebih muat' },
                    { id: 'singsal', name: 'Singsal muat' }, 
                    { id: 'lain', name: 'Lain lain' },
                ]" 
                judul="type kesalahan"
                value="id"
                text="name"
                @selected="typeKesalahan($event)"
                :inselect="type"
            />

            <!-- Masalah -->
            <label for="masalah">Masalah: </label><br>
            <textarea v-model="masalah" id="masalah" style="width:100%; height:60px;"></textarea>

            <label for="sumberMasalah">Sumber masalah: </label><br>
            <textarea v-model="sumberMasalah" id="sumberMasalah" style="width:100%; height:60px;"></textarea>

            <label for="solusi">Solusi: </label><br>
            <textarea v-model="solusi" id="solusi" style="width:100%; height:60px;"></textarea>

            <label for="solusi">PIC: </label><br>
            <textarea v-model="pic" id="solusi" style="width:100%; height:60px;"></textarea>

            <label for="dl">Dead line:</label>
            <datepicker id="dl" class="w3-margin-bottom w3-border w3-input" v-model="dlModel"></datepicker>
            
            <label for="status">Status done?</label>
            <input type="checkbox" v-model="status" />
            <br/>
            <label for="status">Dihitung?</label>
            <input type="checkbox" v-model="isCount" />

            <Button primary :value=" id ? 'Update' : 'Tambah'" class="w3-right" type="button" @trig="send"/>
        </div>
    </div>
</template>

<script>
import datepicker from "vue3-datepicker"
import Select from "@/components/elements/Select.vue"
import Button from "@/components/elements/Button.vue"
import { ymdTime } from "@/composable/piece/dateFormat"
import SelectSupervisors from "@/pages/Supervisors/SelectSupervisors.vue"
import SelectHead from "@/pages/Headspv/SelectHead.vue"
import { Complains } from './Complains'

const { addComplain, updateComplain, getComplainById } = Complains();

export default {
    components: {
        datepicker, Select, Button, SelectSupervisors, SelectHead
    },
    // Tanggal[v], Masalah[v], Sumber Masalah, Solusi dan Tindakan, PIC, D/L, Status
    name: "ComplainInsertForm",
    data() {
        return {
            baseData: "",
            baseDataObj: "",
            periodeModel: new Date(),
            dlModel: new Date(),
            periode: "",
            dl: "",
            parent: "",
            name: "",
            head: "",
            masalah: "",
            sumberMasalah: "",
            solusi: "",
            type: "",
            pic: "",
            status: false,
            id: null,
            changed: {},
            isCount: false
        }
    },
    methods: {
        typeKesalahan(ev) {
        this.type = ev
        this.masalah = `Komplain muat ${this.baseDataObj?.customer} nomor surat jalan ${this.baseDataObj?.nomorSJ}, item ${this.baseDataObj?.item} selisih ${this.baseDataObj?.real - this.baseDataObj?.do } Ctn.`
        this.solusi = "Buat berita acara salah muat, tally diberi sanksi."
        this.pic = "Gita"
        // klaim, 
          if(ev === 'klaim') {
              this.sumberMasalah = "Barang kurang saat perjalanan kecustomer."
              this.solusi = "Buat berita acara klaim ekspedisi."
              this.pic = "Gita"
          }
        //   kurang, lebih,  singsal
        else {
            this.sumberMasalah = `Barang ${ev} muat dari gudang, tally tidak teliti ketika proses muat.`
        }
        },
        async send () {
            if(this.id) {
                if(Object.keys(this.changed).length) {
                    await updateComplain(this.id, { ...this.changed })
                }
            } else {
                await addComplain(this.periode, this.head, this.dl, ymdTime(), this.masalah, this.name, this.parent, this.pic, this.solusi, this.status, this.sumberMasalah, this.type, this.isCount)
                await updateComplain(this.parent, { inserted: true })
            }
            this.$store.commit("Modal/tunnelMessage", true)
            this.$store.commit("Modal/active")
        }
    },
    watch: {
        periodeModel(newVal, oldVal) {
            this.periode = ymdTime(newVal)
            // add dl model 14 days
            this.dlModel = new Date(newVal.getTime() + (1000*60*60*24*14))
            this.id ? this.changed['periode'] = ymdTime(newVal) : false
        },
        dlModel(newVal, oldVal) {
            this.dl = ymdTime(newVal)
            this.id ? this.changed['dl'] = ymdTime(newVal) : false
        },
        name(newVal) {
            this.id ? this.changed['name'] = newVal : false
        },
        head(newVal) {
            this.id ? this.changed['head'] = newVal : false
        },
        masalah(newVal) {
            this.id ? this.changed['masalah'] = newVal : false
        },
        sumberMasalah(newVal) {
            this.id ? this.changed['sumberMasalah'] = newVal : false
        },
        solusi(newVal) {
            this.id ? this.changed['solusi'] = newVal : false
        },
        type(newVal) {
            this.id ? this.changed['type'] = newVal : false
        },
        pic(newVal) {
            this.id ? this.changed['pic'] = newVal : false
        },
        status(newVal) {
            this.id ? this.changed['status'] = newVal : false
        },
        isCount(newVal) {
            this.id ? this.changed['isCount'] = newVal : false
        },
    },
    created() {
        let obj = this.$store.getters["Modal/obj"].obj
        let getComplain = getComplainById(obj?.id)
        let base = getComplainById(obj?.parent || getComplain.parent)

        if(obj?.edit) {
            // put to the 
            this.periodeModel = new Date(getComplain?.periode)
            this.dlModel = new Date(getComplain?.dl)
            this.parent = getComplain?.parent
            this.name = getComplain?.name
            this.head = getComplain?.head
            this.masalah = getComplain?.masalah
            this.sumberMasalah = getComplain?.sumberMasalah
            this.solusi = getComplain?.solusi
            this.type = getComplain?.type
            this.pic = getComplain?.pic
            this.status = getComplain?.status,
            this.isCount = getComplain?.isCount
            setTimeout(() => {
                this.id = obj?.id
            }, 300)
        } else {
            this.periodeModel = new Date()
            this.dlModel = new Date()
            this.parent = obj?.parent
        }
        this.baseDataObj = base
        // show to the left view editor
        this.baseData = Object.keys(base).map((val) => `${val}:<br> ${base[val]}`).join(`<hr/>`)
        
    },
}
</script>@/pages/Complains/Complains