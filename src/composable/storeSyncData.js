import func from "../myfunction";
import addDocument from "./firebaseAddStore";

const syncData = () => {
  // jika ditemukan store activity
  let activity = func.getData({ store: "activity"});

    // console.log(await Promise.all(allStores));
    return new Promise( resolve => {
      activity.then(async (val) => {
        let inserted = {}
        //   iterate name of store
        // iterate data that contain in name of store
        for (let rec of val) {
          if(rec?.store != 'activity' && rec?.store != 'summary' && rec?.store != 'login') {
            // periksa apakah store sudah pernah diinsert?
            if(inserted[rec?.store]) {
              //  jika sudah pernah diinsert, periksa apakah record sudaah pernah diinsert ke firebase]
              if(inserted[rec?.store].includes(rec?.idRecord)) {

              }
              else {
                // jika tidak pernah diinsert
                inserted[rec?.store].push(rec?.idRecord)
              }

            } 
            else {
              // jika store tidaak pernah diinsert
              inserted[rec?.store] = [rec?.idRecord]
            }
            
            let record = await func.findData({ store: rec?.store, criteria: { id: rec?.idRecord }})
            //   // kirim ke firebasel
            //   // await addDocument(rec?.store, doc?.key, doc?.data);
            //   console.log(rec?.store, doc?.key, doc?.data)
            await func.tunggu(3000)
          }
        }
        resolve()
      })
    });
};
export default syncData;
