import func from "../myfunction";
// import addDocument from "./storeAdd";

const createLogsFromScratch = async () => {
  // dapatkan store activity
  let activity = await func.getData({ store: "activity" });
  let allStores = [];

  // jika store activity di indexeddb tidak ada
  if (activity.length) { return }
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
              if(rec?.store !== 'summary') {
                
                for (let i = 0; i < rec?.data.length; i++) {
                    //   await addDocument(rec?.store, doc?.key, doc?.data);
                    // { store: store.toLowerCase(), obj : this._IMPOR[store][i].data}
                    // await func.append({ 
                    //     store: "activity", 
                    //     obj: { 
                    //         id: i+1, 
                    //         time: new Date().getTime(),
                    //         store: rec?.store,
                    //         idRecord: rec[1]?.data?.id,
                    //     }
                    // })
                    console.log({ 
                        id: i+1, 
                        time: new Date().getTime(),
                        store: rec?.store,
                        idRecord: rec?.data[1]?.data?.id,
                    })
                    await func.tunggu(1170)
                }
            }
        }
    })
};
export default createLogsFromScratch;
