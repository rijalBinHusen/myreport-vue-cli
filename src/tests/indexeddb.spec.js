import "fake-indexeddb/auto"
import { useIdb } from "../utils/localforage"
import { describe, it, expect } from 'vitest'
import { faker } from "@faker-js/faker"

describe("We can store a record to indexeddb and retrieve the record", () => {
    let wasInsertedId = null;
    let allRecordInserted = [];
    const db = useIdb('test');
    const sumdb = useIdb('summary');
    const activitydb = useIdb('activity');

    it("Should retrieve a record from indexeddb", async () => {
        for(let i = 0; i < 100; i++) {
            // initialize object that we would to store
            const record = { name: faker.string.sample(13), age: faker.number.int({ min: 12 }) }
            // waiting proses store object to indexeddb
            const inserted = await db.createItem(record)
            // console.log(`Operation ${i} inserted with Id ${inserted.id}, the Id was ${wasInsertedId}`)
            // find the object from indexeddb by id
            const getData = await db.getItem(inserted.id)
            // expecting data that we got match with original record
            expect(getData).toMatchObject(record)
            // make sure that the id is different
            expect(wasInsertedId).not.equal(inserted.id)
            // set wasInsertedId variable
            wasInsertedId = inserted.id
            // /
            allRecordInserted.push(getData);
        }
    });

    it('All record inserted must be matched', async () => {
        const getAllRecord = await db.getItems();

        for(let rec of getAllRecord) {
            const findRecord = allRecordInserted.find((rec2) => rec2?.id === rec?.id)
            expect(rec).toMatchObject(findRecord);
        }
    })

    it('Summary and activity must be matched', async () => {
        await new Promise((resolve) => {
            setTimeout(() => resolve(), 3000);
        })

        const sum = await sumdb.getItem('test');
        // const activity = await activitydb.getItems()
        expect(sum?.total).equal(allRecordInserted.length);
    })
})