import { findData } from "@/myfunction";
import { dateMonth } from "../piece/dateFormat";
import { getSupervisorId } from "./Supervisors";
import { getWarehouseId } from "./Warehouses";

let lists = []

export const getProblemFromDB = async () => {

    if (!state.lists.length) {
        await findData({ store: "Problem", criteria: { isFinished: false } })
                .then((val) => {
                    if(val){
                        lists = val
                    }
                })
    }
    return true

}

export const listsProblem = async () => {
    if(!lists.length) {
        await getProblemFromDB()
    }
    let result = []
    
    if(lists.length) {
        for (let list of lists) {
            let getInfo = [
                getWarehouseId(list.warehouse),
                getSupervisorId(list.nameSpv)
            ]
            
            await Promise.all(getInfo).then((val) => {
                result.push({
                    id: list.id,
                    namaGudang: val[0]?.name
                    .name,
                    namaItem: list.item,
                    masalah: list.masalah,
                    periode: dateMonth(list.periode),
                    supervisor: val[1]?.name,
                    status: list?.isFinished ? "Closed" : "Progress",
                })
            })
        }
    }
    return result
}

export const problemId = (id) => { return lists.find((val) => val.id == id) }

export const masalah = (arrayOfProblemId) => {
        let result = [];
        if (arrayOfProblemId.length > 0) {
          lists.forEach((val) => {
            if (arrayOfProblemId.includes(val.id)) {
              result.push(val.masalah +' '+ dateMonth(val.periode));
            }
          });
        }
        return result.join(", ");
      }

export const problemActiveBySpvAndPeriode = (spv, periode) => {
          return lists.filter(
            (val) => val?.nameSpv === spv && val?.periode == periode
          );
        }

export const problemByItem = (warehouse, item) => {
        // this.$store.getters["Problem/problemActive"](new Date().getTime())
        /* expected result = [itemId, itemId] */
        return lists.filter((val) => val.warehouse == warehouse && val.item == item);
      }

export const  problemActive = (warehouse, item) => {
    // this.$store.getters["Problem/problemActive"](new Date().getTime())
    /* expected result = [itemId, itemId] */
    let result = [];
    lists.forEach((val) => {
        if (!val.isFinished && val.warehouse == warehouse && val.item == item) {
        result.push(val.id);
        }
    });
    return result;
}
  