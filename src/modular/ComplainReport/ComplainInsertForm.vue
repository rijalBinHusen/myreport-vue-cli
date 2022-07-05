<template>
    <div class="w3-row">
        <div class="w3-col s6 w3-padding-large" v-html="baseData" style="overflow: auto; height: 400px;">
        </div>
        <div class="w3-col s6 w3-padding-large" style="overflow: auto; height: 400px;">
            <!-- Supervisor -->
            <label for="name">Supervisor:</label>
            <Select 
                id="name"
                :options="$store.getters['Supervisors/enabled']" 
                judul="Supervisor"
                value="id"
                text="name"
                @selected="ComplainInput.name = $event"
                :inselect="ComplainInput.name"
            />
            <label for="head">Kabag:</label>
            <Select 
                id="head"
                :options="$store.state.Headspv.lists" 
                judul="Kabag"
                value="id"
                text="name"
                @selected="ComplainInput.head = $event"
                :inselect="ComplainInput.head"
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
                :inselect="ComplainInput.type"
            />

            <!-- Masalah -->
            <label for="masalah">Masalah: </label><br>
            <textarea v-model="ComplainInput.masalah" id="masalah" style="width:100%; height:60px;"></textarea>

            <label for="sumberMasalah">Sumber masalah: </label><br>
            <textarea v-model="ComplainInput.sumberMasalah" id="sumberMasalah" style="width:100%; height:60px;"></textarea>

            <label for="solusi">Solusi: </label><br>
            <textarea v-model="ComplainInput.solusi" id="solusi" style="width:100%; height:60px;"></textarea>

            <label for="solusi">PIC: </label><br>
            <textarea v-model="ComplainInput.pic" id="solusi" style="width:100%; height:60px;"></textarea>

            <label for="dl">Dead line:</label>
            <datepicker id="dl" class="w3-margin-bottom w3-border w3-input" v-model="dlModel"></datepicker>
            
            <label for="status">Status done?</label>
            <input type="checkbox" v-model="ComplainInput.status" />

            <Button primary v-if="ComplainInput.id" value="Update" class="w3-right" type="button" @trig="updateComplain"/>
            <Button primary v-else value="Submit" class="w3-right" type="button" @trig="appendComplain"/>
        </div>
    </div>
</template>

<script>
import datepicker from "vue3-datepicker"
import Select from "../../components/elements/Select.vue"
import Button from "../../components/elements/Button.vue"

export default {
    // Tanggal[v], Masalah[v], Sumber Masalah, Solusi dan Tindakan, PIC, D/L, Status
    name: "ComplainInsertForm",
    data() {
        return {
            baseData: "",
            baseDataObj: "",
            periodeModel: new Date(),
            dlModel: new Date(),
            ComplainInput: {
                parent: "",
                periode: "",
                name: "",
                head: "",
                masalah: "",
                sumberMasalah: "",
                solusi: "",
                type: "",
                pic: "",
                dl: "",
                status: false,
                insert: true,
            }
        }
    },
    methods: {
        typeKesalahan(ev) {
        this.ComplainInput.type = ev
        this.ComplainInput.masalah = `Komplain muat ${this.baseDataObj?.customer} nomor surat jalan ${this.baseDataObj?.nomorSJ}, item ${this.baseDataObj?.item} selisih ${this.baseDataObj?.selisih} Ctn.`
        this.ComplainInput.solusi = "Buat berita acara salah muat, tally diberi sanksi."
        this.ComplainInput.pic = "Gita"
        // klaim, 
          if(ev === 'klaim') {
              this.ComplainInput.sumberMasalah = "Barang kurang saat perjalanan kecustomer."
              this.ComplainInput.solusi = "Buat berita acara klaim ekspedisi."
              this.ComplainInput.pic = "Gita"
          }
        //   kurang, lebih,  singsal
        else {
            this.ComplainInput.sumberMasalah = `Barang ${ev} muat dari gudang, tally tidak teliti ketika proses muat.`
        }
        },
        appendComplain() {
            this.$store.dispatch("Complains/append", { ...this.ComplainInput })
            this.$store.commit("Modal/active")
        },
        updateComplain() {
            this.$store.dispatch("update",
                { 
                    store: "Complains", 
                    obj: { ...this.ComplainInput }, 
                    criteria: { id: this.ComplainInput.id }
                }
            )
            this.$store.commit("Modal/active")
        }
    },
    watch: {
        periodeModel(newVal, oldVal) {
            this.ComplainInput.periode = this.$store.getters["dateFormat"]({format: "ymdTime", time: newVal})
            // add dl model 14 days
            this.dlModel = new Date(newVal.getTime() + (1000*60*60*24*14))
        },
        dlModel(newVal, oldVal) {
            this.ComplainInput.dl = this.$store.getters["dateFormat"]({format: "ymdTime", time: newVal})
        },
    },
    created() {
        let obj = this.$store.getters["Modal/obj"].obj
        this.baseDataObj = obj
        if(obj?.edit) {
            // delete unneeded keys
            const {
                periode2,
                spvName,
                headName,
                edit,
                ...details
            } = obj;
            // put to the Complaininput
            this.ComplainInput = details
            this.periodeModel = new Date(obj?.periode)
            this.dlModel = new Date(obj?.dl)
            // get the parent record
            let base = this.$store.getters["Complains/complainId"](obj.parent)
            // show to the left view editor
            this.baseData = Object.keys(base).map((val) => `${val}:<br> ${base[val]}`).join(`<hr/>`)
            this.baseDataObj = base
            return
        }
        this.ComplainInput.parent = obj?.id
        this.baseData = Object.keys(obj).map((val) => `${val}:<br> ${obj[val]}`).join(`<hr/>`)
        
    },
    components: {
        datepicker, Select, Button
    },
}
</script>