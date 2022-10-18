import { write, tunggu } from '@/myfunction'

export const startImport = async (ObjectDocumentFromBackupFile) => {
    let record = ObjectDocumentFromBackupFile?.record
    for (let activity of ObjectDocumentFromBackupFile?.activities) {
        let recordUser = record[activity?.store][activity?.idRecord]
        if(recordUser) {
            await write('activity', activity.id, activity)
            await write(activity?.store, activity?.idRecord, recordUser)
        }
    }
}