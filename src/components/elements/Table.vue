<template>
  <table :class="clas">
    <tr>
      <th v-for="header in headers" :key="header">
          {{ header }}
        </th>

      <th v-if="options">Options</th>
      
    </tr>
    <tr v-for="(list) in  lists" :key="list[keys[1]]">

      <td v-for="key in keys" :key="list[key]">
          {{ list[key] }}
      </td>
      
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