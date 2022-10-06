<template>
  <div>
    <!-- pagination length & form -->
    <div class="w3-row">
        <p class="w3-col s1 w3-left">Show entries: </p>
        <select class="w3-select w3-col s1 w3-left w3-center" @change="changeRow($event.target.value)">
          <option :selected="deData.lengthRow == 5" value="5">5</option>
          <option :selected="deData.lengthRow == 10" value="10">10</option>
          <option :selected="deData.lengthRow == 20" value="20">20</option>
          <option :selected="deData.lengthRow == 30" value="30">30</option>
          <option :selected="deData.lengthRow == 40" value="40">40</option>
          <option :selected="deData.lengthRow == 50" value="50">50</option>
        </select>
    </div>
    <!-- End of pagination length -->

    <!-- data Table -->

    <table class="w3-table w3-striped w3-border">
      <tr class="w3-teal">
        <th scope="col">No</th>
        <th
          v-for="(head, index) in heads"
          :key="head"
          @click="
            sortDedata(keys[index], deData.sortAsc);
            deData.sortAsc = !deData.sortAsc;
          "
          scope="col"
        >
          <span
            style="font-size: 20px; font-weight: bolder"
            v-if="!deData.sortAsc && deData.nowSort == head"
            >&darr;</span
          >
          <span
            style="font-size: 20px; font-weight: bolder"
            v-if="deData.sortAsc && deData.nowSort == head"
            >&uarr;</span
          >
          {{ tulisanBaku(head) }}
        </th>

        <slot name="th"></slot>
        
        <th v-if="option" scope="col">Option</th>
      </tr>

      <!--search form-->
      <tr>
        <td></td>
        <td :key="key" v-for="key in keys">
          <input
            type="text"
            class="w3-input w3-white w3-hover-white w3-small"
            placeholder="Search"
            :value="[
              deData.searchKey.includes(key)
                ? deData.searchInput[deData.searchKey.indexOf(key)]
                : '',
            ]"
            @keyup="searchWord($event.target.value, key)"
          />
        </td>
      </tr>
      <!--end ofsearch form-->

      <tr
        class="w3-hover-light-gray w3-border"
        :key="r"
        v-for="(r, index) in showRow"
      >
        <th>{{ index + deData.startRow + 1 }}</th>
        <td :key="r[key]" v-for="key in keys">{{ r[key] }}</td>

        <slot name="td" :obj="r" :id="r.id"></slot>

        <td v-if="option">
          <slot :prop="r"></slot>
        </td>
      </tr>
    </table>

    <!--End of data Table -->

    <!--Pagination button and info of qty item-->

    <div class="w3-margin-top">
      <span class="w3-left">
        <p>
          {{ deData.startRow + 1 }} -
          {{
            // eslint-disable-next-line vue/no-parsing-error
            deData.startRow + Number(deData.lengthRow) < deData.rowLenght
              ? deData.startRow + Number(deData.lengthRow)
              : deData.rowLenght
          }}
          of {{ deData.rowLenght }} item
        </p>
      </span>

      <div class="w3-bar w3-border w3-round w3-right">
        <a
          href="#"
          @click="toThePage(deData.currentPage - 1)"
          :class="[
            'w3-bar-item',
            'w3-button',
            deData.currentPage == 0 || deData.currentPage == 1 ? 'w3-hide' : '',
          ]"
        >
          &laquo;
        </a>

        <a
          href="#"
          :class="[
            'w3-bar-item',
            'w3-button',
            deData.currentPage == p || (p == 1 && deData.currentPage == 0)
              ? 'w3-teal'
              : '',
          ]"
          v-for="p in totalPage"
          :key="p"
          @click="toThePage(p)"
        >
          {{ p }}
        </a>

        <a
          href="#"
          :class="[
            'w3-bar-item',
            'w3-button',
            deData.startRow + Number(deData.lengthRow) >= deData.rowLenght
              ? 'w3-hide'
              : '',
          ]"
          @click="
            toThePage(deData.currentPage == 0 ? 2 : deData.currentPage + 1)
          "
        >
          &raquo;
        </a>
      </div>
    </div>

    <!--End of pagination button and info of qty item-->
  </div>
</template>

<script>

// <Datatable
//       :datanya="lists"
//       :heads="['Nama', 'Gudang']"
//       :keys="['name', 'warehouse']"
//       option
//       :id="'nameOftable'"
//     />
export default {
  name: "Datatable",
  props: {
    datanya: {
      type: Object,
      required: true,
    },
    heads: {
      type: Array,
      required: true,
    },
    keys: {
      type: Array,
      required: true,
    },
    option: Boolean,
    icon: String,
    id: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      deData: "",
    };
  },
  computed: {
    showRow() {
      if (this.deData.currentPage > this.deData.allPages) {
        this.toThePage(1);
      }

      if (this.deData.searchInput.length < 1) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.deData.rowLenght = this.datanya.length; //total data length
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.deData.allPages = Math.ceil(
          this.deData.rowLenght / this.deData.lengthRow
        ); //total pages

        return this.datanya.slice(
          this.deData.startRow,
          this.deData.startRow + Number(this.deData.lengthRow)
        );
      } else {
        let result = [];
        this.datanya.filter((val) => {
          let condition = [];

          this.deData.searchKey.map((key, index) => {
            if (isNaN(val[key])) {
              //if the value is string not a number
              val[key]
                .toLowerCase()
                .includes(this.deData.searchInput[index].toLowerCase())
                ? condition.push(true)
                : condition.push(false);
            } else {
              val[key] == this.deData.searchInput[index]
                ? condition.push(true)
                : condition.push(false);
            }
          });

          if (!condition.includes(false)) {
            result.push(val);
          }
        });
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.deData.rowLenght = result.length; //total data length
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.deData.allPages = Math.ceil(
          this.deData.rowLenght / this.deData.lengthRow
        ); //total pages

        return result.slice(
          this.deData.startRow,
          this.deData.startRow + Number(this.deData.lengthRow)
        );
      }
    },
    // eslint-disable-next-line vue/return-in-computed-property
    totalPage() {
      if (this.deData.allPages > 1) {
        return this.deData.startRow == 1 || this.deData.startRow == 0
          ? this.deData.allPages > 2
            ? [1, 2, 3]
            : [1, 2] //pages more than 2 or not
          : [
              this.deData.currentPage - 1,
              this.deData.currentPage,
              this.deData.currentPage + 1 > this.deData.allPages
                ? 1
                : this.deData.currentPage + 1,
            ];
      }
    },
  },
  methods: {
    toThePage(num) {
      this.deData.startRow = (num - 1) * this.deData.lengthRow;
      this.deData.currentPage = num;
      this.saveData();
    },
    changeRow(num) {
      this.deData.lengthRow = num;
      this.deData.startRow = 0;
      this.deData.currentPage = 0;
      this.saveData();
    },
    sortDedata(sortKey, sortAsc) {
      if (sortKey) {
        // eslint-disable-next-line vue/no-mutating-props
        this.datanya.sort(function (a, b) {
          let x = a[sortKey];
          let y = b[sortKey];
          if (isNaN(a[sortKey])) {
            x = a[sortKey].toLowerCase();
            y = b[sortKey].toLowerCase();
          }
          if (sortAsc) {
            if (x < y) {
              return -1;
            }
            if (x > y) {
              return 1;
            }
          } else {
            if (x > y) {
              return -1;
            }
            if (x < y) {
              return 1;
            }
          }
          return 0;
        });
        this.deData.nowSort = sortKey;
        this.searchWord("", sortKey);
      }
      this.saveData();
    },
    tulisanBaku(str) {
      //to make inClock become In Clock
      let hasil;

      let res = str.replace(/([A-Z])/g, " $1"); //insert space before middle capital letter
      hasil = res[0].toUpperCase();
      hasil += res.slice(1);

      return hasil;
    },
    searchWord(val, key) {
      if (val) {
        if (this.deData.searchKey.includes(key)) {
          let position = this.deData.searchKey.indexOf(key); //find the position of key
          this.deData.searchInput.splice(position, 1); //delete him
          this.deData.searchInput.splice(position, 0, val); //insert the new key word
        } else {
          this.deData.searchInput.push(val);
          this.deData.searchKey.push(key);
        }
      } else {
        if (this.deData.searchKey.includes(key)) {
          let position = this.deData.searchKey.indexOf(key); //find the position of key
          this.deData.searchInput.splice(position, 1); //delete from deData.searchInput
          this.deData.searchKey.splice(position, 1); //delete from deData.searchKey
        } else {
          this.deData.searchInput = [];
          this.deData.searchKey = [];
        }
      }

      this.deData.startRow = 0;
      this.deData.currentPage = 0;
      this.saveData();
    },
    // save data to local storage with expired 60 second
    saveData() {
      // set ttl 60 second
      let ttl = new Date().getTime() + 60000
      let item = Object.assign(this.deData, { ttl: ttl })
      sessionStorage.setItem(this.id, JSON.stringify(item));
    },
    //get data from localStorage
    getData() {
      let result = {
            startRow: 0,
            lengthRow: 5,
            nowSort: null,
            currentPage: 0,
            searchInput: [],
            searchKey: [],
            rowLenght: 0,
            allPages: 0,
            sortAsc: true,
          };
      const itemStr  = sessionStorage.getItem(this.id)
      const item = JSON.parse(itemStr)
      const now = new Date().getTime()

      if(!itemStr || now > item.ttl) {
        sessionStorage.removeItem(this.id)
        return result
      }

      return item
    }
  },
  created() {
    this.deData = this.getData()
  },
  beforeUnmount() {
    this.saveData()
  },
};
</script>
