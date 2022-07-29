import func from "../myfunction";
import addDocument from "./firebaseAddStore";

const syncData = () => {
  // jika ditemukan store activity
  let activity = func.getData({ store: "activity"});

    // console.log(await Promise.all(allStores));
    return new Promise( resolve => {
      activity.then(async (val) => {
        //   iterate name of store
        for (let rec of val) {
          // iterate data that contain in name of store
          let record = await func.findData({ store: rec?.store, criteria: { id: rec?.idRecord }})
          console.log(record, rec?.store, rec?.idRcord)
          //   // kirim ke firebase
          //   // await addDocument(rec?.store, doc?.key, doc?.data);
          //   console.log(rec?.store, doc?.key, doc?.data)
          await func.tunggu(3000)
        }
        resolve()
      })
    });
};
export default syncData;
