<template>
<div>
  <div class="w3-padding w3-teal w3-center w3-margin-bottom">
  <Button class="w3-bar-item" small primary value="Files" type="button" @trig="launchForm" />
  <Button class="w3-bar-item" small primary value="Delete row" @trig="removeRow" type="button" />
  <Button class="w3-bar-item" small primary value="Copy row" type="button" @trig="copyRow" />
  <span class="w3-dropdown-hover">
  <Button  class="w3-bar-item" small primary value="Show column" type="button" />
    <span class="w3-small w3-dropdown-content w3-bar-block w3-border">
      <label
        class="w3-bar-item w3-button w3-hover-pale-blue"
        v-for="col in originColumn"
        :key="col.headerName"
      >
        <input
          type="checkbox"
          :value="col.headerName"
          :checked="columnShow.includes(col.headerName)"
          @click="toggleColumn(col.headerName)"
        />
        {{ col.headerName }}
      </label>
    </span>
  </span>
  <Button class="w3-bar-item w3-white" small value="-" type="button"  @trig="width = width - 10" />
  <span class="w3-margin-right w3-bar-item">Width</span>
  <input type="number" step="10" v-model="width" class="w3-white w3-margin-right w3-bar-item" style="width:100px;"  />
  <Button class="w3-bar-item w3-white" small primary value="+" type="button" @trig="width = width + 10" />
  <Button class="w3-bar-item" small primary value="Export" type="button" />
  <Button v-if="edited.length > 0" class="w3-bar-item" small primary value="Save" @trig="saveChanged" type="button" />
  <Button v-else class="w3-bar-item" small danger value="Exit" type="button" @trig="exit" />
  </div>
  <ag-grid-vue
    :style="{ 
      'width': width+'px', 
      'height': height+'px', 
      'margin-left': 
      'auto', 
      'margin-right': 
      'auto'
    }"
    class="ag-theme-alpine"
    :columnDefs="columnDefs"
    :rowData="rowData"
    :enterMovesDown="true"
    :enterMovesDownAfterEdit="true"
    rowSelection="multiple"
    :enableRangeSelection="true"
    :columnTypes="columnTypes"
     @row-selected="onRowSelected"
     @cellValueChanged="cellChanged"
  >
  </ag-grid-vue>
</div>
</template>

<script>
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { AgGridVue } from "ag-grid-vue3";
import Button from "../elements/Button.vue";

export default {
  name: "App",
  components: {
    Button,
    AgGridVue,
  },
  data() {
    return {
      width: 1000,
      height: 700,
      selectedRow: [],
      keyPress: {},
      columnDefs: [],
      columnShow: [],
      style: "",
      columnTypes: {
        valueColumn: {
          editable: true,
          valueParser: 'Number(newValue)',
          filter: 'agNumberColumnFilter',
        },
      },
      edited: [],
    };
  },
  props: {
    originColumn: {
      type: Array,
      required: true,
    },
    tableName: {
      type: String,
      required: true,
    },
    rowData: {
      type: Array,
      required: true,
    }
  },
  emits: ["exit", "removeRow", "save"],
  methods: {
    saveChanged() {
      this.$emit("save", this.edited)
      this.edited = []
    },
    cellChanged(ev) {
      // periksa dulu apakah sudah ada didalam edited
      let isEdited = this.edited.findIndex((val) => val.id === ev.data.id)
      // jika sudah ada
      if(isEdited >= 0) {
        this.edited[isEdited] = ev.data
        return
      }
      // jika belum ada
      this.edited.push(ev.data)
    },
    removeRow() {
      // send id that row selected [1,4,5,6,7]
      let arrId = this.selectedRow.map((val) => val.id)
      this.$emit("removeRow", arrId)
      this.selectedRow = []
    },   
    toggleColumn(ev) {
      // this.columnShow = []
      //hiden column
      if(this.columnShow.includes(ev)) {
        // find the index of column
        this.columnDefs = this.originColumn.filter((val) => {
          if(val.headerName !== ev && this.columnShow.includes(val.headerName)) {
          return val
          }
        })
      } else {
        //show the column
        //column defs
        this.columnDefs = this.originColumn.filter((val) => {
          if(val.headerName === ev || this.columnShow.includes(val.headerName)) {
            return val
          }
        })
      }
      this.columnShow = this.columnDefs.map((val) => val.headerName)
      // save table info to localStorage
      this.saveTableInfo()
    },
    getTableInfo() {
      //get item from localstorage
      let tableInfo = JSON.parse(localStorage.getItem(this.tableName))
      //if item is exists
      if(tableInfo) {
        // column defs
        this.columnDefs = tableInfo.column
        //notes that column is showed
        this.columnShow = tableInfo.column.map((val) => val.headerName)
        // ag grid width
        this.width = tableInfo.width
        return
      }
      // else
      //show all column original
      this.columnShow = this.originColumn.map((val) => val.headerName)
      // original column as column defsinition
      this.columnDefs = this.originColumn
      // agg grid set width default
      this.width = 1000;
    },
    saveTableInfo() {
      localStorage.setItem(this.tableName, JSON.stringify({
          column: this.columnDefs,
          width: this.width,
        })
      )
    },
    exit() {
      	this.$emit("exit")
    },
    launchForm() {
      this.$store.commit("Modal/active", { judul: "Set report to show", form: "AGGridForm"});
    },
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
        this.selectedRow.push(event.node.data)
        return
      }
      if(this.keyPress.Control) {
        this.selectedRow.push(event.node.data)
        return
      }

      this.selectedRow = [event.node.data]
      
    },
    copyRow() {
      if(this.selectedRow.length < 1) {
        return
      }
      let field = this.columnDefs.map((val) => val.field)
      let result = ""
      this.selectedRow.forEach((val) => {
        field.forEach((val2) => {
          result += val[val2]+ ","
        })
        result += "\n"
      })
      navigator.clipboard.writeText(result);
    },
  },
  watch: {
    width() {
      this.saveTableInfo()
    }
  },
  mounted() {
    //set tableInfo
    this.getTableInfo()
    // add listen event
      window.addEventListener("keydown", this.pressKey)
      window.addEventListener("keyup", this.releaseKey)
  },
  unmounted() {
    //remove listen event
      window.removeEventListener("keydown", this.pressKey)
      window.removeEventListener("keyup", this.releaseKey)
  }
};
</script>