import { useIdb } from "../../utils/localforage";
import { ref } from "vue"
import { getWarehouseById } from "../Warehouses/Warehouses";

interface expiredDate {
  id?: string
  no_do: string,
  date_transaction: string,
  shift: string
  item_kode: string,
  item_name: string
  date_expired: string
  mulai_muat: string
  selesai_muat: string,
  idWarehouse: string
  tally: string
  karu: string
  qty: string
  no_pol: string
  catatan: string
  gudang_csv: string
}

interface expiredDateMapped extends expiredDate {
  nameWarehouse?: string
}

interface customWarehouse {
      warehouseName: string
      warehouseId: string
}

export let lists = ref(<expiredDateMapped[]>[]);
export let listsCaseImport = ref(<expiredDate[]>[])
const storeName = "date-expired";

export function ExpiredDate() {
  const db = useIdb(storeName);
  const dbWarehouseCustom = useIdb("expired-date-warehouse");
  const listCustomWarehouse = <customWarehouse[]>[]

  async function addExpiredDate(
    no_do: string,
    date_transaction: string,
    shift: string,
    item_kode: string,
    item_name: string,
    date_expired: string,
    mulai_muat: string,
    selesai_muat: string,
    idWarehouse: string,
    tally: string,
    karu: string,
    qty: string,
    no_pol: string,
    catatan: string,
    gudang_csv: string
  ) {
    let rec = {
      no_do,
      date_transaction,
      shift,
      item_kode,
      item_name,
      date_expired,
      mulai_muat,
      selesai_muat,
      idWarehouse,
      tally,
      karu,
      qty,
      no_pol,
      catatan,
      gudang_csv
    };

    

    const insertedId = await db.createItem(rec);

    if (typeof insertedId === 'undefined') return;
    const interpretIt = await interpretCaseRecord({ id: insertedId, ...rec })
    lists.value.unshift(interpretIt)

  }

  async function getWarehouseByCustomMapped(yourWarehouse: string): Promise<string> {

    if(listCustomWarehouse.length) {
      const findWarehouseId = listCustomWarehouse.find((rec) => rec.warehouseName === yourWarehouse);

      if(findWarehouseId) return findWarehouseId.warehouseId;
    }

    const retrieveWarehouse = await dbWarehouseCustom.getItem<customWarehouse>(yourWarehouse);

    if(retrieveWarehouse === null) return "";
    
    listCustomWarehouse.push(retrieveWarehouse);
    return retrieveWarehouse.warehouseId;
  }

  async function interpretCaseRecord(obj: expiredDate): Promise<expiredDateMapped> {
    const warehouse = await getWarehouseById(obj.idWarehouse);

    return {
      ...obj,
      nameWarehouse: warehouse.name
    };
  }

  async function getExpiredDateByKodeItem(item_kode: string, date_transaction: string, shift: string): Promise<string|undefined> {
    const getOutput = await db.getItemsByThreeKeyValue<expiredDate>('item_kode', item_kode, 'date_transaction', date_transaction, 'shift', shift);

    if(!getOutput.length) return;

    let datePushed = <string[]>[];
    for(let out of getOutput) {
      const isDatePushed = datePushed.includes(out.date_expired);
      if(!isDatePushed) datePushed.push(out.date_expired);
    }

    return datePushed.join(", ");
  }

  async function createCustomWarehouse(yourWarehouse: string, yourIdWarehouse: string){

    dbWarehouseCustom.setItem(yourWarehouse, yourIdWarehouse);
    listCustomWarehouse.push({ warehouseId: yourIdWarehouse, warehouseName: yourWarehouse})
  }

  async function getColumnPaired(): Promise<expiredDate> {

    const getColumnPaired = await db.getItem<expiredDate>("column-paired");

    if(getColumnPaired) return getColumnPaired;

    return {
      "no_do": "",
      "date_transaction": "",
      "shift": "",
      "item_kode": "",
      "item_name": "",
      "date_expired": "",
      "mulai_muat": "",
      "selesai_muat": "",
      "idWarehouse": "",
      "tally": "",
      "karu": "",
      "qty": "",
      "no_pol": "",
      "catatan": "",
      "gudang_csv": "",
    }
  }

  function setColumnPaired(keyValue: expiredDate): void {

    db.setItem("column-paired", keyValue);
  }

  return {
    addExpiredDate,
    getWarehouseByCustomMapped,
    getExpiredDateByKodeItem,
    createCustomWarehouse,
    getColumnPaired,
    setColumnPaired
  }

}