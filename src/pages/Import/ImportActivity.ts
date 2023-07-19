// // import { write, tunggu } from '@/myfunction'
// import { useIdb } from "@/utils/localforage"
// import { type Backup } from "@/pages/Backup/storeBackup"

// interface BackupData

// export const startImport = async (ObjectDocumentFromBackupFile: Backup) => {

//     let record = ObjectDocumentFromBackupFile?.record
//     for (let activity of ObjectDocumentFromBackupFile?.activities) {
//         let recordUser = record[activity?.store][activity?.idRecord]
//         if (recordUser) {
//             await write('activity', activity.id, activity)
//             await write(activity?.store, activity?.idRecord, recordUser)
//         }
//     }
// }