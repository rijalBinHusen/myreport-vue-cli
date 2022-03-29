<template>
	<input type="file" id="filenya" @change="readExcel($event)">
</template>

<style scoped>
</style>

<script>
	import * as XLSX from "xlsx";
	
export default {
    name: "Imporxlsx",
    data() {
		return {};
	},
    components: {},
    methods: {
		readExcel(e) {
			const file = e.target.files[0]
			let info = { fileName: file.name }
			
			const promise = new Promise ((resolve, reject) => {
				const fileReader = new FileReader();
				fileReader.readAsArrayBuffer(file);
				
				fileReader.onload = (e) => {
					const bufferArray = e.target.result;
					
					// const wb = XLSX.read(bufferArray, {type: "buffer"});
					const wb = XLSX.read(bufferArray);
					info.sheetNames = wb.SheetNames
					info.sheets = wb.Sheets
					
					// const wsname = wb.SheetNames
					
					// const data = []

					// wsname.forEach((val) => {
					// 	const ws = wb.Sheets[val];
					// 	data.push(XLSX.utils.sheet_to_csv(ws))
					// })
					
					
					// resolve(data)
					resolve(info)
				};
				
				fileReader.onerror=((error) => { reject(error) })
			})
			
			promise.then((d) => {
				this.$store.commit("ImporReport1/impor", d)
				this.$store.commit("Modal/active", {judul: "Setup import data", form: "ImporReport1Form"});
			})
		}
	},
    computed: {}
}
</script>