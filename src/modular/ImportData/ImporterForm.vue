<template>
<form class="w3-container" @submit.prevent="impor">
    <h2>Select store</h2>
    <Checkbox v-for="(store) in listsStore" :key="store" :label="store" @check="selectStore($event)" />
    <hr>
    <p>Total record would be imported: {{ total }} record</p>
    <Button v-if="total > 0" primary value="Import" type="button"/>
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
        }
    },
    methods: {
        ...mapActions({
            EMPTY_STORE: "emptyStore",
            // payload = {store: nameOfStore: obj: [Array would to wrote]}
            WRITE_STORE: "rewriteStore",
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
                    let newDoc = Object.assign(this._IMPOR[store][i].data, {_key: this._IMPOR[store][i].key })
                    doc.push(newDoc)
                    //if the end of record
                    if( (i + 1) === this._IMPOR[store].length) {
                        //push to localbase
                        await this.WRITE_STORE({store: store, obj: doc})
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
            return Object.keys(this._IMPOR).slice(0, -1)
        }
    }
}
</script>