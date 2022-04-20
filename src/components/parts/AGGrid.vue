<template>
  <ag-grid-vue
    style="width: 1000px; height: 700px; margin-left: auto; margin-right: auto;"
    class="ag-theme-alpine"
    :columnDefs="columnDefs"
    :rowData="rowData"
    :enterMovesDown="true"
    :enterMovesDownAfterEdit="true"
    rowSelection="multiple"
    :enableRangeSelection="true"
     @row-selected="onRowSelected"
  >
  </ag-grid-vue>
</template>

<script>
  /*
  <AGGrid
    :columnDefs="[
        { headerName: "Name", field: "name", editable: true },
        { headerName: "Email", field: "email", resizable: true },
        { headerName: "Phone", field: "phone" },
        { headerName: "City code", field: "city"}
      ]"
    :rowData="[
      { name: "Rijal", email: "rijal@binhusen.com", phone: "628123456789", city: 61256}
    ]"
  />
  */
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { AgGridVue } from "ag-grid-vue3";

export default {
  name: "App",
  components: {
    AgGridVue,
  },
  data() {
    return {
      selectedRow: [],
      keyPress: {},
    };
  },
  props: {
    columnDefs: {
      type: Object,
      required: true,
    },
    rowData: {
      type: Object,
      required: true,
    }
  },
  methods: {      
    releaseKey(event) {
      delete this.keyPress[event.key]
    },

    pressKey(event) {
      this.keyPress[event.key] = true
      if(this.keyPress.Control) {
        if(event.keyCode === 67) {
          this.copyRow()
        }
      }
    },

    onRowSelected(event) {
      if(this.keyPress.Shift) {
        this.selectedRow.push(event.node.data.id)
        return
      }
      if(this.keyPress.Control) {
        this.selectedRow.push(event.node.data.id)
        return
      }

      this.selectedRow = [event.node.data.id]
      
    },
    copyRow() {
      let field = this.columnDefs.map((val) => val.field)
      let result = ""
      this.rowData.forEach((val) => {
        if(this.selectedRow.includes(val.id) ) {
          field.forEach((val2) => {
            result += val[val2]+","
          })
          result += "\n"
        }
      })
      navigator.clipboard.writeText(result);
    },
  },
  mounted() {
      window.addEventListener("keydown", this.pressKey)
      window.addEventListener("keyup", this.releaseKey)
  },
  unmounted() {
      window.removeEventListener("keydown", this.pressKey)
      window.removeEventListener("keyup", this.releaseKey)
  }
};
</script>