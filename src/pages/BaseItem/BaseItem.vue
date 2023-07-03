<template>
  <div class="w3-center w3-margin-top w3-row">
    <form ref="spvForm" class="margin-bottom" @submit.prevent="send">
    <p class="w3-col s2 w3-right-align w3-margin-right">Add new item : </p>
    <input 
      v-model="kode" 
      class="w3-col s2 w3-input w3-large w3-margin-right" 
      type="text" 
      placeholder="Item id" 
    />
    
    <input 
      v-model="name" 
      class="w3-col s5 w3-input w3-large w3-margin-right" 
      type="text" 
      placeholder="Item name" 
    />

    <Button 
      primary 
      class="w3-left w3-large w3-margin-left" 
      :value="editId ? 'Update' : 'Add'" 
      type="button"
    />
    <Button 
      v-if="editId"
      danger 
      class="w3-left w3-large" 
      value="Cancel" 
      type="button" 
      @trig="cancel" 
    />

    <Button 
      v-if="!editId"
      primary
      class="w3-left w3-large" 
      value="Import" 
      type="button" 
      @trig="launch" 
    />

    <input
      class="w3-hide"
      @change.prevent="readExcel($event)"
      type="file"
      ref="importerBase"
      accept=".xls, .ods"
    />
    </form>
  </div>
    <Datatable
      v-if="renderTable"
      :datanya="listItems"
      :heads="['Kode item', 'Nama item']"
      :keys="['kode', 'name']"
      option
      id="tableBaseFile"
      v-slot:default="slotProp"
    >
      <Button 
        primary 
        value="Edit" 
        :datanya="slotProp.prop.id" 
        type="button" 
        @trig="edit($event)" 
        />

        <Button
          danger
          value="Delete" 
          :datanya="slotProp.prop.id" 
          type="button" 
          @trig="remove($event)" 
        />
    </Datatable>
</template>

<script setup>
  import Button from "@/components/elements/Button.vue"
  import Select from "@/components/elements/Select.vue"
  import Datatable from "@/components/parts/Datatable.vue"
  import * as XLSX from "xlsx";
  // import { addItem, updateItem, lists as stateItems, getItemById, removeItem, get20Item } from '@/composable/components/Baseitem'
  import { BaseItem, lists as stateItems } from "./Baseitem"
  import { onMounted, ref, watch } from "vue";

  const BaseItemClass = new BaseItem();
  const { addItem, updateItem, getItemById, removeItem } = BaseItemClass;

  const kode = ref('');
  const name = ref('');
  const editId = ref('');
  const edited = ref({});
  const listItems = ref([]);
  const renderTable = ref(false);

  function cancel () {
    editId.value = '';
    kode.value = '';
    name.value = '';
  }

  function renewList () {
    renderTable.value = false
    listItems = stateItems

    setTimeout(() => {
      renderTable.value = true
    }, 100)
  }

  async function send() {
    const isOkeToSend = name.value !== '' && kode.value !== '';

    if(!isOkeToSend) { 
      alert('Form tidak boleh kosong') 
      return
    };

    if(editId.value) {
      await updateItem(editId.value, kode.value, name.value);
    } else {
      await addItem(kode.value, name.value);
    }

    cancel();
    renewList();

  }

  async function edit (idItem) {

    editId.value = idItem;
    const item = await getItemById(idItem);
    kode.value = item?.kode;
    name.value = item?.name;

  }

  async function remove(ev) {

    let confirm = window.confirm(`Apakah anda yakin akan menghapus item tersebut?`)
    if(!confirm) { return }
    await removeItem(ev)
    renewList()
        
  }; 

  onMounted(() => {
    cancel();
    renewList()
  })

  watch(kode, name, (newValue, oldValue) => {
    if(editId.value) {
      // kode item
      if(newValue[0] !== oldValue[0]) {
        edited.value['kode'] = newValue[0]
      }

      // name item
      if(newValue[1] !== oldValue[1]) {
        edited.value['name'] = newValue[1]
      }

    }
  })
  
</script>
