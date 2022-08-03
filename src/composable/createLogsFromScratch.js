import func from "../myfunction";
import addDocument from "./firebaseAddStore";

const createLogsFromScratch = async () => {
  //dapatkan store activity
  let activity = await func.getData({ store: "activity" });
  let allStores = [];

  // jika store activity di indexeddb tidak ada
  // if (activity.length) { return }
    
  return new Promise(async resolve => {
    // maka ambil store summary,
    let summary = await func.getData({ store: "summary", withKey: true });
    // masukkan info summary ke all store
    allStores.push({ store: "summary", data: summary });
    // iterate untuk ambil nama store
    summary.forEach((val) => {
      // setelah dapat nama store, ambil semua data di indexeddb atas nama store tersebut
      allStores.push(
        func.getData({ store: val?.key, withKey: true }).then((res) => {
          return {
            store: val?.key,
            data: res,
          };
        })
      );
    });
    
    Promise.all(allStores).then(async (val) => {
        // iterate name of store
        for (let rec of val) {
          let inserted = {}
            // iterate data that contain in name of store
            for (let i = 0; i <= rec?.data.length; i++) {
              let doc = rec?.data[i]
              if(doc?.data?.id && rec?.store !== 'activity' && i < 500) {
                // jika store tidak pernah diinsert
                if(!inserted[rec?.store]) {
                  inserted[rec?.store] = []
                }
                // jika record belum pernah diinsert
                if(!inserted[rec?.store].includes(doc?.key)) {
                  inserted[rec?.store].push(doc?.key)
                  let res = await func.addActivity({ type: "create", store: rec?.store, idRecord: doc?.data?.id })
                  // insert to firebase
                  await addDocument(rec?.store, doc?.key, doc?.data);
                  await addDocument('activity', res?.id, res);

                }
              }
            }
        }
        resolve()
    })
  })
};
export default createLogsFromScratch;
