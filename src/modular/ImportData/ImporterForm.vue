<template>
<form class="w3-container" @submit.prevent="impor">
    <h2>Select store</h2>
    <div class="w3-row w3-margin-bottom w3-border w3-round-large w3-padding w3-padding-16">
        <span v-for="(store) in listsStore" :key="store" class="w3-col s3">
            <Checkbox 
                :label="store" 
                @check="selectStore($event)"
                :value="store"
                :checkboxName="store"
            />
        </span>
    </div>
    <div class="w3-row w3-border w3-round-large w3-padding">
        <p class="w3-col s2">Select mode:</p>
        <span class="w3-col s2 w3-margin-top">
            <input type="radio" name="mode" id="write" @click="mode = 'write'" />
            <label for="write"> Write mode</label><br>
        </span>

        <span class="w3-col s3  w3-margin-top">
            <input type="radio" name="mode" id="append" @click="mode = 'append'" />
            <label for="append"> Append mode</label>
        </span>
    </div>
    <p>Total record would be imported: {{ total }} record</p>
    <Button v-if="total > 0 && mode" primary value="Import" type="button"/>
</form>
</template>

<script>
import { mapState, mapActions } from "vuex"
import Checkbox from "../../components/elements/Checkbox.vue"
import Button from "../../components/elements/Button.vue"

export default {
    name: "ImporterForm",
    components: {
        Checkbox,
        Button,
    },
    data() {
        return {
            importLists: [],
            total: 0,
            mode: "",
        }
    },
    methods: {
        ...mapActions({
            EMPTY_STORE: "emptyStore",
            // payload = {store: nameOfStore: obj: [Array would to wrote]}
            WRITE_STORE: "rewriteStore",
            APPEND_IMPORT: "appendWoutGenerateId",
        }),
        selectStore(ev) {
            if(this.importLists.includes(ev)) {
                this.importLists = this.importLists.filter(store => store !== ev)
                this.total -= this._IMPOR[ev].length
            } else {
                this.importLists.push(ev)
                this.total += this._IMPOR[ev].length
            }
        },
        async impor() {
            // Bring up the loader
            this.$store.commit("Modal/active", {judul: "", form: "Loader"});

            for(let ind = 0; ind < this.importLists.length; ind++) {

                let store = this.importLists[ind]
            // }
            //iterate importLists
            // this.importLists.forEach(async (store, index) => {
                //delete the exists store
                await this.EMPTY_STORE(store)

                let doc = []
                //iterate the record
                // this._IMPOR[store].forEach(async (rec,index2) => {
                //     let newDoc = Object.assign(rec.data, {_key: rec.key })
                //     doc.push(newDoc)
                //     //if the end of record
                //     if( (index2+1) === this._IMPOR[store].length) {
                //         //push to localbase
                //         await this.WRITE_STORE({store: store, obj: doc})
                //     }
                // })

                for( let i =0 ; i < this._IMPOR[store].length; i++) {
                    
                    if(this.mode === 'write') {
                        doc.push(Object.assign(this._IMPOR[store][i].data, {_key: this._IMPOR[store][i].key })) 
                        //if the end of record
                        if( (i + 1) === this._IMPOR[store].length) {
                            //push to localbase
                            await this.WRITE_STORE({store: store.toLowerCase(), obj: doc})
                        }
                    } 
                    
                    else {
                        await this.APPEND_IMPORT({ store: store.toLowerCase(), obj : this._IMPOR[store][i].data})
                    }
                }

                //if the end of the importLists, close the loader
                if((ind + 1) === this.importLists.length) {
                    window.location.reload()
                }
            }
        }
    },
    computed: {
        ...mapState({
            _IMPOR: state => JSON.parse(JSON.stringify(state.Impor.lists))
        }),
        listsStore() {
            return Object.keys(this._IMPOR).filter((val) => val !== "status")
        }
    }
}
</script>