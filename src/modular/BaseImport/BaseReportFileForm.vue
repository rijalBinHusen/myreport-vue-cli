<template>
    <div>
        <label class="w3-margin-top">Nama file</label>
        <input type="text" class="w3-input w3-margin-top w3-margin-bottom" :value="_BASEREPORT.fileName" disabled />
        <label class="w3-margin-top">Clock Sheet</label>
        <Select 
            :options="sheetNames" 
            judul="Clock sheet"
            value="id"
            text="title"
            @selected="clock = $event"
        />
        <label class="w3-margin-top">Stock Sheet</label>
        <Select 
            :options="sheetNames" 
            judul="Stock sheet"
            value="id"
            text="title"
            @selected="stock = $event"
        />
        <Button
            primary 
            class="w3-margin-top w3-right" 
            value="Submit" 
            type="button"
            @trig="importBase"
        />
    </div>
</template>

<script>
import Select from "../../components/elements/Select.vue"
import Button from "../../components/elements/Button.vue"
import { mapState, mapGetters } from "vuex"

export default {
    components: {
        Select,
        Button,
    },
    data() {
        return {
            clock: null,
            stock: null,
            infoBaseReport: "",
        }
    },
    methods: {
        async importBase() {
            // jika clock dan stock tidak null
            if(!this.clock || !this.stock) {
                alert("Select sheet first!")
                return
            }
            // BASE record info move to data
            // let infoBaseReport = this.MODALDETAILS.obj
            // this.GET_BASEID(this._BASEID)
            // tampilkan loader, proses data yang sudah dipilih
            this.$store.commit("Modal/active", {judul: "", form: "Loader"});
            // dapatkan !ref
            let infoRowColClock = this._BASEREPORT.sheets[this.clock]["!ref"].split(":")
            let infoRowColStock = this._BASEREPORT.sheets[this.stock]["!ref"].split(":")
            // dapatkan length data clock
            let lengthRowClock = +infoRowColClock[1].match(/\d+/)[0]
            // dapatkan length data stock
            let lengthRowStock = +infoRowColStock[1].match(/\d+/)[0]
            // ambil length yang paling tinggi
            let iterateLength = lengthRowClock > lengthRowStock ? lengthRowClock : lengthRowStock
            // masing masing sheet
            let clockSheet = this._BASEREPORT.sheets[this.clock]
            let stockSheet = this._BASEREPORT.sheets[this.stock]
            // console.log("Info row col clock", infoRowColClock)
            // console.log("Info row col stock", infoRowColStock)
            // console.log("length row clock", lengthRowClock)
            // console.log("length row stock", lengthRowStock)
            // console.log("Iterate length", iterateLength)
            
            // //iterate data menggunakan for
            for(let i = 1; i <= iterateLength; i++) {
                /* 
                    #CLOCK jika B5.v > 0 dan D5.v !== D4.v
                    maka masukkan ke idb 
                */
            //    CLOCK CHECKER
                let clockNo = clockSheet["D"+i] ? clockSheet["D"+ (i)].v : 0
                let clockNoBefore = clockSheet["D"+ (i-1)] ? clockSheet["D"+ (i-1)].v : false
                let clockStatus = clockNo > 0 && clockNoBefore !== clockNo ? true : false

               if(i > 5 && clockStatus) {
                    await this.$store.dispatch("appendWoutGenerateId", {
                        store: "BaseReportClock",
                        obj: {
                            parent: this.infoBaseReport.id,
                            shift: clockSheet["B"+i] ? clockSheet["B"+i].v : 0,
                            noDo: clockSheet["D"+i] ? clockSheet["D"+i].v : 0,
                            reg: clockSheet["F"+i] ? clockSheet["F"+i].w : 0,
                            start: clockSheet["G"+i] ? clockSheet["G"+i].w : 0,
                            finish: clockSheet["H"+i] ? clockSheet["H"+i].w : 0,
                            rehat: 0,
                        },
                    })
                }
                /* 
                    #STOCK 
                    shift 1 jika E5.v > 0 atau F5.v > 0 , A+i !== false
                    masukkan ke idb
                */
            //    Checker stock shift 1
            let in1st = stockSheet["E"+i] ? stockSheet["E"+i].v : 0
            let out1st = stockSheet["F"+i] ? stockSheet["F"+i].v : 0
                if(in1st > 0 || out1st > 0) {
                    await this.$store.dispatch("appendWoutGenerateId",  {
                        store: "BaseReportStock",
                        obj: {
                            parent: this.infoBaseReport.id,
                            shift: 1,
                            item: stockSheet["A"+i] ? stockSheet["A"+i].v : "No item",
                            awal: stockSheet["D"+i] ?  stockSheet["D"+i].v : 0,
                            in:  stockSheet["E"+i] ?  stockSheet["E"+i].v : 0,
                            out:  stockSheet["F"+i] ?  stockSheet["F"+i].v : 0,
                            dateIn: "",
                            dateOut: "",
                            dateEnd: "",
                            real: stockSheet["G"+i] ?  stockSheet["G"+i].v : 0,
                            problem: this.PROBLEMACTIVE(this.infoBaseReport.periode, this.infoBaseReport.warehouse, stockSheet["A"+i] ? stockSheet["A"+i].v : "No item")
                        },
                    })
                }
                /*
                    shift 2 jika H5.v > 0 atau I5.v > 0 , A+i !== false
                    masukkan ke idb
                */
            //    Checker stock shift 2
            let in2nd = stockSheet["H"+i] ? stockSheet["H"+i].v : 0
            let out2nd = stockSheet["I"+i] ? stockSheet["I"+i].v : 0
                if(in2nd > 0 || out2nd > 0) {
                    await this.$store.dispatch("appendWoutGenerateId",  {
                        store: "BaseReportStock",
                        obj: {
                            parent: this.infoBaseReport.id,
                            shift: 2,
                            item: stockSheet["A"+i] ? stockSheet["A"+i].v : "No item",
                            awal: stockSheet["G"+i] ?  stockSheet["G"+i].v : 0,
                            in:  stockSheet["H"+i] ?  stockSheet["H"+i].v : 0,
                            out:  stockSheet["I"+i] ?  stockSheet["I"+i].v : 0,
                            dateIn: "",
                            dateOut: "",
                            dateEnd: "",
                            real: stockSheet["J"+i] ?  stockSheet["J"+i].v : 0,
                            problem: this.PROBLEMACTIVE(this.infoBaseReport.periode, this.infoBaseReport.warehouse, stockSheet["A"+i] ? stockSheet["A"+i].v : "No item")
                        },
                    })
                }

                /*
                    shift 3 jika K5.v > 0 atau L5.v > 0  atau M5.v > 0  atau O5.v > 0 
                    A+i !== false
                    masukkan ke idb 
                */
                // number checker
                let in1 = stockSheet["K"+i] ? +stockSheet["K"+i].v : 0
                let in2 = stockSheet["O"+i] ? +stockSheet["O"+i].v : 0
                let totalIn = in1 == in2 ? in1 : in1 + in2
                let out1 = stockSheet["L"+i] ? +stockSheet["L"+i].v : 0
                let out2 = stockSheet["M"+i] ? +stockSheet["M"+i].v : 0
                let totalOut = out1 + out2

                    if( (in1 || out1  || out2  || in2) && i > 3 && stockSheet["A"+i] ) {
                    await this.$store.dispatch("appendWoutGenerateId",  {
                        store: "BaseReportStock",
                        obj: {
                            parent: this.infoBaseReport.id,
                            shift: 3,
                            item: stockSheet["A"+i] ? stockSheet["A"+i].v : "No item",
                            awal: stockSheet["J"+i] ?  stockSheet["J"+i].v : 0,
                            in:  totalIn,
                            out: totalOut,
                            dateIn: "",
                            dateOut: "",
                            dateEnd: "",
                            real: stockSheet["P"+i] ?  stockSheet["P"+i].v : 0,
                            problem: this.PROBLEMACTIVE(this.infoBaseReport.periode, this.infoBaseReport.warehouse, stockSheet["A"+i] ? stockSheet["A"+i].v : "No item")
                        },
                    })
                }
            }
            // console.log("D10",this._BASEREPORT.sheets[this.clock]["D10"].v)
            // console.log("D11",this._BASEREPORT.sheets[this.clock]["D11"].v)
            // update baseReportFile record
            this.infoBaseReport.fileName = this._BASEREPORT.fileName
            this.infoBaseReport.stock = this.stock
            this.infoBaseReport.clock = this.clock
            this.infoBaseReport.imported = true
            this.$store.dispatch("update",  { 
                store: "BaseReportFile", 
                obj: this.infoBaseReport,
                criteria: {id: this.infoBaseReport.id}
                })
            // sembunyikan loader
            this.$store.commit("Modal/active");
            // kosongkan state base report
            this.$store.commit("BaseReportFile/baseId", null)
            this.$store.commit("BaseReportFile/importTemp", null)

        }
    },
    computed: {
        ...mapState({
            _BASEREPORT: state => JSON.parse(JSON.stringify(state.BaseReportFile.importTemp)),
            // _BASEID: state => state.BaseReportFile.baseId,
        }),
        ...mapGetters({
            // GET_BASEID: "BaseReportFile/baseId"
            MODALDETAILS: "Modal/obj",
            PROBLEMACTIVE: "Problem/problemActive",
        }),
        sheetNames() {
            let result = this._BASEREPORT.sheetNames.map((val) => {
                return {
                    id: val,
                    title: val
                }
            })
            return result
        }
    },
    created() {
        this.infoBaseReport = JSON.parse(JSON.stringify(this.MODALDETAILS.obj))
    }
}
</script>