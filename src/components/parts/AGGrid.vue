<template>
<div>
  <div class="w3-padding-large w3-teal w3-center w3-margin-bottom">
    <slot name="button"></slot>
    <span class="w3-dropdown-hover">
    <Button  class="w3-bar-item w3-margin-right" small primary value="Show column" type="button" />
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
    <!-- Width excel -->
    <!-- <Button class="w3-bar-item w3-white" small value="-" type="button"  @trig="width = width - 10" /> -->
    <span class="w3-margin-right w3-bar-item">Width</span>
    <input type="number" step="10" v-model="width" class="w3-white w3-padding w3-round-large w3-margin-right w3-bar-item" style="width:100px;"  />
    <!-- <Button class="w3-bar-item w3-white" small primary value="+" type="button" @trig="width = width + 10" /> -->
    <!-- Width excel -->
    <!-- Height excel -->
    <!-- <Button class="w3-bar-item w3-white" small value="-" type="button"  @trig="height = height - 10" /> -->
    <span class="w3-margin-right w3-bar-item">Height</span>
    <input type="number" step="10" v-model="height" class="w3-white w3-padding w3-round-large w3-margin-right w3-bar-item" style="width:100px;"  />
    <!-- <Button class="w3-bar-item w3-white" small primary value="+" type="button" @trig="height = height + 10" /> -->
    <!-- Height excel -->
    <Button v-if="edited.length > 0" class="w3-bar-item" small primary value="Save" @trig="saveChanged" type="button" />
    <Button v-else class="w3-bar-item" small danger value="Exit" type="button" @trig="exit" />
      <slot name="text"></slot>
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
    :columnTypes="columnTypes"
     @cellValueChanged="cellChanged"
  >
  </ag-grid-vue>
</div>
</template>

<script>
import { subscribeMutation } from "@/composable/piece/subscribeMutation";
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
      unsubscribe: null,
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
  emits: ["exit", "save"],
  methods: {
    saveChanged() {
      if(this.edited.length) {
        this.$emit("save", this.edited)
        this.edited = []
        return
      }
    },
    cellChanged(ev) {
      // periksa dulu apakah sudah ada didalam edited
      let isEdited = this.edited.findIndex((val) => val.id === ev.data.id)
      let changedCell = () => {
        // jika yang berubah adalah date out
        if(ev.colDef.field == 'dateOut') {
          // jika stock akhir > 0
          if(Number(ev.data.real) > 0) {
            return { 
              // samakan date end dengan date out
              [ev.colDef.field]: ev.newValue ,
              dateEnd: ev.newValue,
            }
          } 
          // jika tidak 0
          else {
            return { 
              [ev.colDef.field]: ev.newValue ,
              dateEnd: '-',
            }
          }
        }
        return { [ev.colDef.field]: ev.newValue }
      }
      // jika sudah ada
      if(isEdited >= 0) {
        this.edited[isEdited] = { 
          id: ev.data.id, 
          changed: { ...this.edited[isEdited].changed, ...changedCell() }
        }
        return
      }
      // jika belum ada
      this.edited.push({ id: ev.data.id, changed: changedCell() })
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
        // ag grid height
        this.height = tableInfo.height
      } else {
        // else
        //show all column original
        this.columnShow = this.originColumn.map((val) => val.headerName)
        // original column as column defsinition
        this.columnDefs = this.originColumn
        // agg grid set width default
        this.width = 1000;
      }
    },
    saveTableInfo() {
      let columnFiltered = this.columnDefs.filter((col) => !col?.cellEditor)
      localStorage.setItem(this.tableName, JSON.stringify({
          column: columnFiltered,
          width: this.width,
          height: this.height,
        })
      )
    },
    editMode() {
      let columnToShow = this.originColumn.filter((col) => col?.cellEditor)
      columnToShow.forEach((col) => this.toggleColumn(col.headerName))
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
    async saveAndExit() {
      if(this.edited.length) {
          this.saveChanged()
          await subscribeMutation( '',  'Loader',  {}, 'Modal/tunnelMessage')
      }
      this.exit()
    },
    async pressKey(event) {
      this.keyPress[event.key] = true
      // if the control button still pressed
      if(this.keyPress['Control']) {
        // if the S (83) button pressed ( CTRL + S )
        if(event.keyCode === 83) {
          // prevent dialog save as to launch
          event.preventDefault()
          // if any record edited
          if(this.edited.length) {
            // save the canged record
            this.saveChanged()
          }
          return false
        }
        // if the W (87) button pressed ( CTRL + W )
        // if the A (65) keyCode pressed
        //  Save the document and close the excel mode
        else if(event.keyCode === 65) {
          // prevent default function (closing tab)
          event.preventDefault()
          // save the changed record
          this.saveAndExit()
        }
        // if CTRL + E (keycode 69), go to editMode
        else if(event.keyCode === 69) {
          event.preventDefault()
          this.editMode()
        }
      }
    },
  },
  watch: {
    width() {
      this.saveTableInfo()
    },
    height() {
      this.saveTableInfo()
    }
  },
  mounted() {
    //set tableInfo
    this.getTableInfo()
    // add listen event
      window.addEventListener("keydown", this.pressKey)
      window.addEventListener("keyup", this.releaseKey)
      window.onbeforeunload = function (e) {
          // Cancel the event
          e.preventDefault();

          // Chrome requires returnValue to be set
          this.saveChanged()
          e.returnValue = 'Really want to quit the app?';
      };

      // subscribe mutation to save record (if record changed) before add new record
      this.unsubscribe = this.$store.subscribe((mutation) => {
                // if the confirmation button clicked whatever yes or no
                if(mutation?.type == 'Modal/active' && mutation?.payload?.judul) {
                    // resolve the messaage, true or false
                    this.saveChanged()
                  }
            })
  },
  unmounted() {
    //remove listen event
      window.removeEventListener("keydown", this.pressKey)
      window.removeEventListener("keyup", this.releaseKey)
      this.unsubscribe()
  }
};
</script>