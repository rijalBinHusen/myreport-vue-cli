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
      :value="editId ? 'Update' : 'Add'" 
      type="button"
    />
    <Button 
      v-if="editId"
      danger 
      class="w3-left w3-large" 
      value="Cancel" 
      type="button" 
      @trig="cancel" 
    />

    <Button 
      v-if="!editId"
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
      :datanya="$store.state.Baseitem.lists"
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
import Datatable from "../../components/parts/Datatable.vue"
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
      Baseitem: {},
      editId: "",
    }
  },
  methods: {
    send() {
      if(!this.Baseitem?.name && !this.Baseitem?.kode) { return }
    // jika update
      if(this.editId) {
        this.$store.dispatch("Baseitem/update",{ ...this.Baseitem, id: this.editId })
      }
      // jika tidak
      else {
        this.$store.dispatch("append",{ obj: { ...this.Baseitem }, store: "Baseitem" })
      }
      // reset the form
      this.cancel()
    },
    edit(ev) {
      this.editId = ev
      this.Baseitem = { ...this.$store.getters["Baseitem/baseItemId"](ev) }
    },
    cancel() {
      this.editId = ""
      this.Baseitem = {}
    },
    remove(ev) {
      let confirm = window.confirm(`Apakah anda yakin akan menghapus item tersebut?`)
      if(!confirm) { return }
      this.$store.dispatch("delete", { store: "Baseitem", criteria: { id: ev } })
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
            await this.$store.dispatch("append", { 
              store: "Baseitem",
              obj: { kode: d.sheet["A"+i].v, name: d.sheet["B"+i].v }
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
};
</script>
