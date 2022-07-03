<template>
<div class="">
    <div class="w3-border w3-padding w3-container">
        <label>Set record to show : </label>
        <Button primary value="Set" type="button" />
        <Button primary class="w3-right" value="Import" @trig="$refs.importerCase.click();" type="button"/>
        <Button primary class="w3-right" value="Imported" type="button"/>
        <Button primary class="w3-right" value="Cases" type="button"/>
        <input
            class="w3-hide"
            @change.prevent="readExcel($event)"
            type="file"
            ref="importerCase"
            accept=".xls, .ods"
        />
    </div>

            <!-- <Datatable
                :datanya="lists"
                :heads="['Nama', 'Gudang', 'Periode', 'Collected', 'Kabag', 'Approve']"
                :keys="['spvName', 'warehouseName', 'periode2', 'collected2', 'headName', 'approval2']"
                option
                id="tableApproval"
            >
                <template #default="{ prop }">
				<span v-if="prop.shared == 'false' || !prop.shared ">
                    <Button 
                        value="Batal" 
                        type="button" 
                        danger small 
                        @trig="handleAction({ action: 'unapprove', rec: prop.id })" 
                    />
                    
                    <Button 
                        value="Share" 
                        type="button" 
                        primary small 
                        @trig="handleAction({ action: 'share', rec: prop.id })" 
                    />

                </span>
                <span v-else>
                    {{
                    !isNaN(prop.shared)
                     ? "Shared at "+ this.$store.getters["dateFormat"](
                         { 
                            format: "dateMonth", 
                            time: prop.shared 
                         }) 
                    : prop.shared
                 }}
                </span>
                <Button 
                    v-if="!isNaN(prop.isfinished)"
                    value="Export" 
                    type="button" 
                    secondary small 
                    @trig="exportReport(prop)" 
                />
                </template>
                <template #th>
                    <th>Export group</th>
                </template>
                <template #td="{ obj }">
                    <input :id="obj.id" v-model="grouped" :value="obj.id" @input="push(obj.id, obj)" type="checkbox" />
                    <label :for="obj.id"> Group</label>
                    <br />
                </template>
            </Datatable> -->
			<!-- </table> -->
			
        </div>
</template>

<script>
import Button from "../../components/elements/Button.vue"
import Datatable from "../../components/parts/Datatable.vue"
import Input from '@/components/elements/Input.vue'
import * as XLSX from "xlsx";

export default {
    name: "Cases",
    methods: {
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
          if(d.sheet["B"+i]) {
            await this.$store.dispatch("append", { 
              store: "Cases",
              obj: { 
                  tanggal: d.sheet["C"+i]?.v, 
                  divisi: d.sheet["D"+i]?.v , 
                  bagian: d.sheet["E"+i]?.v , 
                  fokus: d.sheet["F"+i]?.v , 
                  temuan: d.sheet["G"+i]?.v , 
                  karu: d.sheet["I"+i]?.v , 
                  kabag: d.sheet["J"+i]?.v , 
                  keterangan1: d.sheet["L"+i]?.v , 
                  keterangan2: d.sheet["M"+i]?.v 
                  }
             })
          }
        }
        // close the loader
        this.$store.commit("Modal/active");
			})
		}
    },
    components: {
        Button,
        Datatable,
        Input,
    },
}
</script>