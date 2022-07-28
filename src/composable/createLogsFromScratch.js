import func from "../myfunction";
// import addDocument from "./storeAdd";

const createLogsFromScratch = async () => {
  // dapatkan store activity
  let activity = await func.getData({ store: "activity" });
  let allStores = [];

  // jika store activity di indexeddb tidak ada
  if (activity.length) { return }
    
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
          // iterate data that contain in name of store
          for (let i = 0; i <= rec?.data.length; i++) {
            if(rec?.data[1]?.data?.id) {
              // insert to idb
              await func.addActivity({ type: "create", store: rec?.store, idRecord: rec?.data[1]?.data?.id })
              // wait a minute
              await func.tunggu(100)
            }
          }
        }
        resolve()
    })
  })
};
export default createLogsFromScratch;
