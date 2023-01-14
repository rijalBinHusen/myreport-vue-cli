import { useLocalbase } from "./localbase";
const store = 'summary'

// 1ore would contain { lastId: value, total: value }
export async function summary(storeName) {
  const summaryDB = useLocalbase()
  // would return { }
  const lastUpdated = await summaryDB.getItem(storeName)
  //   to update summary
  const updateSummary = async (lastId) => {
    const record = { id: storeName, lastId, total: lastUpdated?.total ? lastUpdated?.total + 1 : 1}
    await summaryDB.setItem(storeName, record)
    return;
  };

  const getAllDataToBackup = async () => {
    // initiate idb
    const summarydb = await useIdb("summary");
    // get all data
    const allData = await summarydb.getItems();
    // return the result
    return { store: "summary", data: allData ? allData : null };
  };

  return { lastUpdated, updateSummary, getAllDataToBackup };
}
