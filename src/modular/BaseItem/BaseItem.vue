<template>
  <div class="w3-center w3-margin-top w3-row">
    <form ref="spvForm" class="margin-bottom" @submit.prevent="send">
    <p class="w3-col s2 w3-right-align w3-margin-right">Add new item : </p>
    <input 
      v-model="Baseitem.kode" 
      class="w3-col s2 w3-input w3-large w3-margin-right" 
      type="text" 
      placeholder="Item id" 
    />
    
    <input 
      v-model="Baseitem.name" 
      class="w3-col s5 w3-input w3-large w3-margin-right" 
      type="text" 
      placeholder="Item name" 
    />

    <Button 
      primary 
      class="w3-left w3-large w3-margin-left" 
      :value="_EDITSTATUS ? 'Update' : 'Add'" 
      type="button"
    />
    <Button 
      v-if="_EDITSTATUS"
      danger 
      class="w3-left w3-large" 
      value="Cancel" 
      type="button" 
      @trig="cancel" 
    />

    <Button 
      v-if="!_EDITSTATUS"
      primary
      class="w3-left w3-large" 
      value="Import" 
      type="button" 
      @trig="launch" 
    />

    <input
      class="w3-hide"
      @change.prevent="readExcel($event)"
      type="file"
      ref="importerBase"
      accept=".xls, .ods"
    />
    </form>
  </div>
    <Datatable
      v-if="_BASEITEM.length > 0"
      :datanya="_BASEITEM"
      :heads="['Kode item', 'Nama item']"
      :keys="['kode', 'name']"
      option
      id="tableBaseFile"
      v-slot:default="slotProp"
    >
      <Button 
        primary 
        value="Edit" 
        :datanya="slotProp.prop.id" 
        type="button" 
        @trig="edit($event)" 
        />

        <Button
          danger
          value="Delete" 
          :datanya="slotProp.prop.id" 
          type="button" 
          @trig="remove($event)" 
        />
    </Datatable>
</template>

<script>
import Button from "../../components/elements/Button.vue"
import Select from "../../components/elements/Select.vue"
import { uid } from "uid"
import Datatable from "../../components/parts/Datatable.vue"
import { mapState, mapGetters, mapMutations, mapActions } from "vuex";
import * as XLSX from "xlsx";

export default {
  components: {
    Button,
    Datatable,
    Select
  },
  name: "Baseitem",
  data() {
    return {
      Baseitem: {}
    }
  },
  methods: {
    ...mapActions({
      APPEND: "append",
      UPDATE: "update"
    }),
    ...mapMutations({
      EDIT: "Baseitem/edit"
    }),

    send() {
      if(this.Baseitem.name) {
        // if update
          if(this._EDITSTATUS) {
            this.UPDATE({
              store: "Baseitem",
              obj: this.Baseitem
            })
          }

        // else
        else {
          this.APPEND({
            store: "Baseitem",
            obj: Object.assign( { id: uid(6) }, this.Baseitem)
          })
        }
      }
      this.cancel()
    },
    edit(ev) {
      this.EDIT(ev)
      this.Baseitem = this.GET_EDIT
    },
    cancel() {
      this.EDIT(null)
      this.Baseitem = this.GET_EDIT
    },
    remove(ev) {
      this.$store.dispatch("delete", {store: "Baseitem", id: ev})
    },        
    // to launch file picker
    launch() {
      this.$refs.importerBase.click();
    },
    readExcel(e) {
    // bring the loader up
    this.$store.commit("Modal/active", {judul: "", form: "Loader"});
			const file = e.target.files[0]
			let info = { fileName: file.name }
			
			const promise = new Promise ((resolve, reject) => {
				const fileReader = new FileReader();
				fileReader.readAsArrayBuffer(file);
				
				fileReader.onload = (e) => {
					const bufferArray = e.target.result;
					
					// const wb = XLSX.read(bufferArray, {type: "buffer"});
					const wb = XLSX.read(bufferArray);
          let sheets = wb.SheetNames
					info.sheet = wb.Sheets[sheets[0]]
					
					resolve(info)
				};
				
				fileReader.onerror=((error) => { reject(error) })
			})
			
			promise.then(async (d) => {
        // insert to idb
        let infoRow = d.sheet["!ref"].split(":")
        let lengthRow = +infoRow[1].match(/\d+/)[0]
        for(let i = 1; i <= lengthRow; i++) {
          if(d.sheet["A"+i]) {
            await this.APPEND({
              store: "Baseitem",
              obj: { id: uid(6), kode: d.sheet["A"+i].v, name: d.sheet["B"+i].v },
            })
          }
        }
        // close the loader
        this.$store.commit("Modal/active");
			})
		}
  },
  mounted() {
    this.cancel();
  },
  computed: {
    ...mapState({
      _BASEITEM: state => JSON.parse(JSON.stringify(state.Baseitem.lists)),
      _EDITSTATUS: state => JSON.parse(JSON.stringify(state.Baseitem.edit)),
    }),
    ...mapGetters({
      GET_EDIT: "Baseitem/edit",
      GET_BASEITEM: "Baseitem/lists"
    }),
  }
};
</script>
