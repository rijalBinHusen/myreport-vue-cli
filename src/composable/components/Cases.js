import { getSupervisorId } from "@/composable/components/Supervisors";
import { getHeadspvId } from "@/composable/components/Headspv";
import { dateMonth } from "@/composable/piece/dateFormat";
import { append, getData, update, deleteDocument } from "@/myfunction";

let lists = [];

export async function addCase(
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
  sumberMasalah
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
  };
  await append({ store: "Cases", obj: rec }).then((res) => {
      lists.unshift(res.data);
  });
  return;
}

export async function addCaseImport(
  bagian,
  divisi,
  fokus,
  kabag,
  karu,
  keterangan1,
  keterangan2,
  periode,
  temuan
) {
  let rec = {
    bagian,
    divisi,
    fokus,
    kabag,
    karu,
    keterangan1,
    keterangan2,
    periode,
    temuan,
    import: true,
    inserted: false,
  };
  await append({ store: "Cases", obj: rec }).then((res) => {
      lists.unshift(res.data);
  });
  return;
}

export async function getCases() {
  await getData({
    store: "cases",
    limit: 200,
    orderBy: "id",
    desc: true,
  }).then((result) => {
    if (result) {
      lists = result;
    }
  });
}

export async function listsCase(isInsert) {
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
      });
    }
  }
  return result;
}

export function getCaseId(idCase) {
  return lists.find((rec) => rec.id == idCase);
}

export async function updateCase(idCase, objToUpdate) {
  lists = lists.map((val) => {
    if (val.id == idCase) {
      return { ...val, ...objToUpdate };
    }
    return val;
  });
  await update({
    store: "Cases",
    criteria: { id: idCase },
    obj: objToUpdate,
  });
  return;
}


export const removeCase = async (id) => {
  lists = lists.filter((rec) => rec.id !== id);
  deleteDocument({ store: "Cases", criteria: { id } });
  return true;
};
