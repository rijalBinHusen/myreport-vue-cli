import { getData, update, append } from '../../myfunction'
import { postData } from "../../utils/sendDataToServer"
import { progressMessage2 } from "../../components/parts/Loader/state"

export let lists = []
const storeName = "Supervisors";

export const getSupervisors = async () => {
    lists = []
    lists = await getData({ store: 'Supervisors', orderBy: 'id', desc: true })
    return true
}

export const getSupervisorId = async (supervisorId) => {
    if(!lists.length) {
        await getSupervisors()
    }
    return lists.find((rec) => rec?.id === supervisorId)
}

export const updateSupervisor = async (idSupervisor, objectToUpdate) => {
  // objectToUpdate = { name : "", phone : "" }
  //idb
  await update({
    store: "Supervisors",
    criteria: { id: idSupervisor},
    obj : objectToUpdate
  })

  lists = lists.map((val) => {
    if(val.id == idSupervisor) {
        return { ...val, ...objectToUpdate }
    }
    return val
  })

  return true
}

export const addSupervisor = async (nameSupervisor, phone) => {
  await append({ store: "Supervisors", obj: { name: nameSupervisor, phone } })
        .then((val) => {
            if(lists.length) {
              lists = lists.concat(val.data)
            }
        })
        return true
}

export const supervisorsEnabled = () => {
  return lists.filter((val) => val.disabled === false)
}


export async function syncSupervisorToServer () {

  let allData = await getData({ store: storeName, withKey: true })
  //disabled, id, name, phone, shift, warehouse, warehouseName

  for(let [index, datum] of allData.entries()) {

    let dataToSend = {
      "id": datum?.key,
      "supervisor_name": datum?.data?.name || 0,
      "supervisor_phone": datum?.data?.phone || 0,
      "supervisor_warehouse": datum?.data?.warehouse || 0,
      "supervisor_shift": datum?.data?.shift || 0,
      "is_disabled": datum?.data?.disabled || 0
    }

    try {
      progressMessage2.value = `Mengirim data ${index} dari ${allData.length}`
      await postData('supervisor', dataToSend);

    } catch(err) {
        
        // alert(err); 
        console.log(err)
        // return false;

    }
  }

  return true;
}