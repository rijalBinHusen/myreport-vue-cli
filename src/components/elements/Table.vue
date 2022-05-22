<template>
  <table :class="clas">
    <tr>
      <th v-for="header in headers" :key="header">
          {{ header }}
        </th>
      <slot name="th"></slot>
      <th v-if="options">Options</th>
      
    </tr>
    <tr v-for="(list) in  lists" :key="list[keys[1]]">

      <td v-for="(key,index) in keys" :key="list[key] + index">
          {{ list[key] }}
      </td>
      <slot name="td" :obj="list" :id="list.id"></slot>
      <td v-if="options">
          <slot :prop="list"></slot>
      </td>
    </tr>
  </table>
</template>

<script>
/* <Table 
    :headers="['Nama', 'Keterangan']" 
    :lists="[{name:1, keterangan:1}]" 
    :keys="['name', 'keterangan']"
    options
    />
*/

export default {
    name: "Table",
    props: {
        headers: {
            type: Array,
            required: true,
        },
        lists: {
            type: Array,
            required: true,
        },
        options: Boolean,
        keys: {
            type: Array,
            required: true,
        },
		small: Boolean,
    },
	computed: {
		clas() {
			let classLists = ["w3-table", "w3-bordered"]
			if (this.small) classLists.push("w3-small");
			
			return classLists.join(" ");
		}
	}
}
</script>