import { ref } from "vue"
import { useLocalbase } from "@/utils/localbase"
// database name
const db = useLocalbase('database_lists')
// store
const store = 'databases'
// generator id
import { generateId } from "../../utils/generatorId"
// import dateformat
import { dayPlusOrMinus, ymdTime } from "../piece/dateFormat"
// database lists
export const databases = ref([])
// message to show to page when duplicate database in progress
export const messageToShow = ref(null)
// function to set message to show
export const setMessageToShow = (message) => {
    messageToShow.value = message
}

export const currentDatabaseUsed = ref(null)

// record = { id, name, isAllowToDuplicate }

export const getAllDatabase = async () => {
    // if state is not null
    if(databases.value.length) {
        return;
    }
    // get our original database (myreport)
    const isOriginalDBExists = await db.getDataById(store, 'myreport')
    // if doesn exists  create new one
    if(!isOriginalDBExists) {
        // create origin database record
        await db.write(store, 'myreport', { id: 'myreport', name: '21 Juli 2022'})
    }
    // get all databases lists
    databases.value = await db.getDataOrderByKey(store, 'id')
    // set current database used
    databases.value.forEach((rec) => {
        if(rec?.isUsed) {
            currentDatabaseUsed.value = rec?.id
        }
    })
    // console.log(currentDatabaseUsed.value)
    // console.log(databases.value)
}

export const getDatabaseById = async (id) => {
    return db.getDataById(store, id)
}

export const updateDatabaseById = async (id, name) => {
    // write to database
	await db.updateRecordById(store, id, { name })
	// update state
	databases.value = databases.value.map((rec) => {
		if(rec?.id === id) {
			return { ...rec, name }
		}
		return rec
	})
    
    return;
}

export const duplicateDatabase = async (currentDbId) => {
    // duplicate the database
    // create new database
        // // generate new id for database
        // const nextdbId = generateId('db_22030004')
        // console.log(nextdbId)
        // // create db based on nextdb
        // await db.write(store, nextdbId, { id: nextdbId, name: 'Fresh database', isAllowToDuplicate: true })
        // // initiate next db
        // const nextDb = useLocalbase(nextdbId)
        // databases.value.unshift({ id: nextdbId, name: 'Fresh database' })
    // initiate current db
    const currentDB = useLocalbase(currentDbId)
    // get all base item that the last used < 60 day
    const dayBefore60 = dayPlusOrMinus(false, -60)
    const baseItem = await currentDB.getData('baseitem').then((res) => res.filter((rec) => rec?.lastUsed <= dayBefore60))
    // get all complain that periode greater than now date
    const complains = await currentDB.getData('complains').then((res) => res.filter((rec) => rec?.periode >= ymdTime()))
    // get all head spv
    const headspv = await currentDB.getData('headspv')
    // get all problem that no finished
    const problems = await currentDB.getData('problem').then((res) => res.filter((rec) => !rec?.isFinished))
    // get all supervisor
    const supervisors = await currentDB.getData('supervisors')
    // get all warehouses
    const warehouses = await currentDB.getData('warehouses')
    // get all users
    const users = await currentDB.getData('user')
    // set as array
    const dataToInsert = [
        { store: 'baseitem', data: baseItem},
        { store: 'complains', data: complains },
        { store: 'headspv', data: headspv },
        { store: 'problems', data: problems },
        { store: 'supervisors', data: supervisors },
        { store: 'warehouses', data: warehouses },
        { store: 'user', data: users}
    ]
    // for(const [index, db] of dataToInsert.entries()) {
    //     // looping db.data
    //     for(const [index2, data] of db.data.entries()) {
    //         // set message
    //         setMessageToShow(`Duplicate ${index} of ${dataToInsert.length} database, write ${index2} of ${data.length} record!`)
    //         // insert into db
    //         await nextDb.write(db.store, data.id, data);
    //     }
    // }
    // finished, update to current db to prevent to duplicate
    // await db.updateRecordById(store, currentDbId, { isAllowToDuplicate: false })
    console.log(dataToInsert)
}


export const setCurrentDatabaseUsed = async (id) => {
    currentDatabaseUsed.value = id
    // write to database
	await db.updateRecordById(store, id, { isUsed: true })
	// update state
	databases.value = databases.value.map((rec) => {
		if(rec?.id === id) {
			return { ...rec, isUsed: true }
		}
		return { ...rec, isUsed: false }
	})
    // update each database id
    for (const dbList of databases.value) {
        // update it
        // console.log(dbList.id !== id)
        if(dbList.id !== id) {
            await db.updateRecordById(store, dbList.id, { isUsed: false })
        }
    }
    
    return;
}

export const removeDatabase = async (id) => {
    try {
        // delete record from database lists
        await db.removeDataById(store, id)
        // init db
        const dbToRemove = useLocalbase(id)
        // delete database
        await dbToRemove.removeDatabase()
    } catch(err) {
        // 
        const message = `Terjadi kesalahan saat menghapus database: , ${err}`
        alert(message)
        console.log(message)
    } finally {
        // remove data from state
        // find index
        const idx = databases.value.findIndex((rec) => rec.id === id)
        // remove data
        databases.value.splice(idx, 1)
    }
}

// const databaseName = (idRecord, periode) => {
//     // id record = storeName_databaseName_weekUniqueeID
//     // e.g idRecord = warehouses_202201_030032
//     // if send we're recieve idRecord, return database
//     if(idRecord) {
//         // pick the 13 end (202201_030032)
//         let tailId = "warehouses_202201_030032".slice(-13)
//         // the database 202201
//         return tailId.slice(0, 6)
//     }
//     if(periode) {
//         // date
//         let date = new Date(periode)
//         // get year of periode
//         let year = date.getFullYear()
//         // get month of periode
//         let month = date.getMonth()
//         // convert week in to quarter of year
//         // return yearQuarterOfYear
//         return year + quarterOfYear[month]
//     }
// }

// const quarterOfYear = {
//     0: '01',
//     1: '01',
//     2: '01',
//     3: '02',
//     4: '02',
//     5: '02',
//     6: '03',
//     7: '03',
//     8: '03',
//     9: '04',
//     10: '04',
//     11: '04',
// }