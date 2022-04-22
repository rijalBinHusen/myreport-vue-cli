<template>
<div>
  <Button primary value="Files" type="button" @trig="launchForm" />
  <Button primary value="Delete row" type="button" />
  <Button primary value="Copy row" type="button" />
  <Button primary value="Show column" type="button" />
  <Button primary value="-" type="button"  @trig="width = width - 10" />
  <span class="w3-margin-right">Width</span>
  <Button primary value="+" type="button" @trig="width = width + 10" />
  <Button primary value="Enable filter" type="button" />
  <Button primary value="Column width" type="button" />  
  <Button primary value="Save" type="button" />
  <Button primary value="Export" type="button" />
  <Button danger value="Exit" type="button" @trig="exit" />
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
     @row-selected="onRowSelected"
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
      columnDefs: [
        { headerName: "Name", field: "name", editable: true },
        { headerName: "Email", field: "email", resizable: true },
        { headerName: "Phone", field: "phone" },
        { headerName: "City code", field: "city"}
      ],
      rowData: [
          {
            "id": 1,
            "name": "Melodie Larsen",
            "email": "dolor.dapibus@hotmail.ca",
            "phone": "(620) 908-4668",
            "city": "26722"
          },
          {
            "name": "Shaeleigh Conway",
            "id": 2,
            "email": "lorem.auctor.quis@protonmail.com",
            "phone": "(484) 184-0810",
            "city": "15388"
          },
          {
            "id": 3,
            "name": "Faith Michael",
            "email": "adipiscing.enim@google.ca",
            "phone": "1-237-448-3180",
            "city": "261295"
          },
          {
            "id": 4,
            "name": "Clare Rosa",
            "email": "cum@outlook.net",
            "phone": "(468) 960-8712",
            "city": "0719"
          },
          {
            "id": 5,
            "name": "Dawn Bridges",
            "email": "cras@protonmail.org",
            "phone": "(450) 450-7712",
            "city": "3375"
          },
          {
            "id": 6,
            "name": "Mark Olson",
            "email": "at.pede@icloud.com",
            "phone": "1-256-654-4911",
            "city": "T7K 3Y2"
          },
          {
            "id": 7,
            "name": "Anthony Boyd",
            "email": "nam.tempor@google.couk",
            "phone": "(718) 471-7632",
            "city": "85724-319"
          },
          {
            "id": 8,
            "name": "Sydnee Vinson",
            "email": "convallis.in@hotmail.org",
            "phone": "(633) 378-2278",
            "city": "1101"
          },
          {
            "id": 9,
            "name": "Sade Key",
            "email": "pede.nunc@hotmail.edu",
            "phone": "(557) 778-7476",
            "city": "2654"
          },
          {
            "id": 10,
            "name": "Uriel Pickett",
            "email": "nunc.ut@hotmail.org",
            "phone": "1-461-363-6266",
            "city": "2975 HN"
          },
          {"id": 11,
            "name": "Kelsie Blake",
            "email": "nunc.quisque.ornare@outlook.edu",
            "phone": "(626) 137-3358",
            "city": "2382"
          },
          {
            "id": 12,
            "name": "Alma Reeves",
            "email": "inceptos.hymenaeos@hotmail.com",
            "phone": "(767) 397-8628",
            "city": "5667"
          },
          {
            "id": 13,
            "name": "Imelda House",
            "email": "erat.sed@google.net",
            "phone": "1-640-793-1223",
            "city": "886953"
          },
          {
            "id": 14,
            "name": "Lance Mckee",
            "email": "justo.eu.arcu@icloud.couk",
            "phone": "1-982-756-8823",
            "city": "13-091"
          },
          {
            "id": 15,
            "name": "Gemma Carey",
            "email": "sollicitudin.orci@aol.couk",
            "phone": "(647) 213-2723",
            "city": "50106"
          },
          {
            "id": 16,
            "name": "Amber Moss",
            "email": "nonummy.ac@protonmail.edu",
            "phone": "(972) 737-4138",
            "city": "762288"
          },
          {
            "id": 17,
            "name": "Mollie Whitley",
            "email": "nec@protonmail.org",
            "phone": "(544) 707-3871",
            "city": "72548-26307"
          },
          {
            "id": 18,
            "name": "Calista Sutton",
            "email": "vehicula.risus.nulla@aol.edu",
            "phone": "(539) 595-2744",
            "city": "88618"
          },
          {
            "id": 19,
            "name": "Andrew Hicks",
            "email": "rutrum@aol.edu",
            "phone": "(412) 841-9716",
            "city": "302128"
          },
          {
            "id": 20,
            "name": "Blythe Leon",
            "email": "in@hotmail.net",
            "phone": "(665) 227-1937",
            "city": "693412"
          }
        ],
      selectedRow: [],
      keyPress: {},
    };
  },
  emits: ["exit"],
  methods: {      
    exit() {
      	this.$store.commit("Navbar/toNav", "")
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