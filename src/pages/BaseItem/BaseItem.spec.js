import "fake-indexeddb/auto"
import { BaseItem } from "./Baseitem"
import { describe, it, expect } from 'vitest'
import { faker } from "@faker-js/faker"

describe("We can create base item to indexeddb and retrieve the record", () => {
    let wasInsertedId = null;
    let allRecordInserted = [];
    const baseItem = new BaseItem();

    it("Should create item and item id doesn't same with before", async () => {
        for(let i = 0; i < 100; i++) {
            const itemKode = faker.string.symbol(10);
            const itemName = faker.string.fromCharacters(30);
            // waiting proses store object to indexeddb
            const insertedItem = await baseItem.addItem(itemKode, itemName);
            // console.log(`Operation ${i} inserted with Id ${inserted.id}, the Id was ${wasInsertedId}`)
            const record = { id: insertedItem?.id, kode: itemKode, name: itemName };

            const getData = await db.getItem(insertedItem.id)
            // expecting data that we got match with original record
            expect(getData).toMatchObject(record)
            // make sure that the id is different
            expect(wasInsertedId).not.equal(insertedItem.id)
            // set wasInsertedId variable
            wasInsertedId = inserted.id
            // /
            allRecordInserted.push(getData);
        }
    });

    it('All record inserted must be matched', async () => {
        for(let rec of allRecordInserted) {
            const findRecord = await baseItem.getItemById(rec?.id);
            expect(rec).toMatchObject(findRecord);
        }
    })

    it('Update record and must be matched', async () => {

        for (let rec of allRecordInserted) {
            const newItemKode = faker.string.alphanumeric({ length: 10 });
            const newItemName = faker.string.alpha({ length: 30 });
            const newLastUsed = new Date().getTime()
            
            await baseItem.updateItem(rec?.id, newItemKode, newItemName, newLastUsed)

            const findRecord = await baseItem.getItemById(rec?.id);

            expect(findRecord?.kode).equal(newItemKode);
            expect(findRecord?.name).equal(newItemName);
            expect(findRecord?.lastUsed).equal(newLastUsed);
        }

    })
})