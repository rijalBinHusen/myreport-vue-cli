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
  import Datatable from "@/components/parts/Datatable.vue"
  // import { addItem, updateItem, lists as stateItems, getItemById, removeItem, get20Item } from '@/composable/components/Baseitem'
  import { baseItem, lists as stateItems } from "./Baseitem"
  import { onMounted, ref, watchEffect } from "vue";

  const BaseItemClass = baseItem();
  const { addItem, updateItem, getItemById, removeItem, getAllItems } = BaseItemClass;

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
    listItems.value = stateItems

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

  onMounted(async () => {
    await getAllItems();
    cancel();
    renewList();
  })

  watchEffect(kode, name, (newValue, oldValue) => {
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
