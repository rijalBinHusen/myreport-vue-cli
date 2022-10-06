import { getSupervisorId } from "@/composable/components/Supervisors";
import { getHeadspvId } from "@/composable/components/Headspv";
import { dateMonth } from "@/composable/piece/dateFormat";
import { append, getData, update, deleteDocument } from "@/myfunction";

let lists = [];

export async function addComplain(
  periode,
  head,
  dl,
  insert,
  masalah,
  name,
  parent,
  pic,
  solusi,
  status,
  sumberMasalah,
  type,
  isCount,
) {
  let rec = {
    periode,
    head,
    dl,
    insert,
    masalah,
    name,
    parent,
    pic,
    solusi,
    status,
    sumberMasalah,
    type,
    isCount,
  };
  await append({ store: "Complains", obj: rec }).then((res) => {
      lists.unshift(res.data);
  });
  return;
}

export async function addComplainImport(
  customer,
  Do,
  gudang,
  item,
  kabag,
  nomorSJ,
  nopol,
  real,
  row,
  spv,
  tally,
  tanggalBongkar,
  tanggalInfo,
  tanggalKomplain,
  tanggalSuratJalan,
  type,
) {
  let rec = {
    customer,
    do: Do,
    gudang,
    item,
    kabag,
    nomorSJ,
    nopol,
    real,
    row,
    spv,
    tally,
    tanggalBongkar,
    tanggalInfo,
    tanggalKomplain,
    tanggalSuratJalan,
    type,
    import: true,
    inserted: false,
  };
  await append({ store: "Complains", obj: rec }).then((res) => {
      lists.unshift(res.data);
  });
  return;
}

export async function getComplains() {
  if (lists.length) {
    return;
  }
  await getData({
    store: "Complains",
    limit: 100,
    orderBy: "id",
    desc: true,
  }).then((result) => {
    if (result) {
      lists = result;
    }
  });
}

export async function listsComplain(isInsert) {
  let result = [];
  let category = isInsert ? "insert" : "import";
  for (let list of lists) {
    if (list[category]) {
      result.push({
        ...list,
        periode2: dateMonth(list.periode),
        spvName: await getSupervisorId(list?.name).then((res) => res?.name),
        headName: await getHeadspvId(list?.head).then((res) => res?.name),
        insert2: dateMonth(list?.insert),
        selisih: (Number(list?.real) || 1) - (Number(list?.do) || 1)
      });
    }
  }
  return result;
}

export function getComplainId(idComplain) {
  return lists.find((rec) => rec.id == idComplain);
}

export async function updateComplain(idComplain, objToUpdate) {
  lists = lists.map((val) => {
    if (val.id == idComplain) {
      return { ...val, ...objToUpdate };
    }
    return val;
  });
  await update({
    store: "Complains",
    criteria: { id: idComplain },
    obj: objToUpdate,
  });
  return;
}

export const removeComplain = async (idComplain) => {
  lists = lists.filter((rec) => rec.id !== idComplain);
  await deleteDocument({ store: "Complains", criteria: { id: idComplain } });
  return;
};
