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
	emits: ["fileSelected", "disabled"],
    methods: {
		readExcel(e) {
			this.$emit("disabled", true)
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
					
					resolve(info)
				};
				
				fileReader.onerror=((error) => { reject(error) })
			})
			
			promise.then((d) => {
				this.$store.commit("ImporReport1/impor", d)
				this.$emit("fileSelected", d.fileName)
				this.$emit("disabled", false)
			})
		}
	},
    computed: {}
}
</script>