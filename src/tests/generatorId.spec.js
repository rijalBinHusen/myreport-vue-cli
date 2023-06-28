import { generateIdCutomDate } from "../utils/generatorId";

import { describe, it, expect } from 'vitest'

describe("Next id must be oke", () => {

    
    it('Must be oke', async () => {
        const year = 2023;
        const startDate = new Date(`${year}-01-02`);
        const endDate = new Date(`${year}-12-25`);

        let currentdate = startDate;
        let week = 1;
        let idName = "SUPER_"
        let yearId = year.toString().slice(2);

        while(currentdate <= endDate) {
            let nextId = generateIdCutomDate(currentdate, idName +"22110000");

            let weekId = week < 10 ? "0" + week : week;
            let expectId = idName + yearId + weekId + "0000"
            expect(expectId).equal(nextId);

            let currentId = nextId;

            for(let i =1; i < 10; i++) {
                let nextId2 = generateIdCutomDate(currentdate, currentId);
                let nextExpectId2 = idName + yearId + weekId + "000" + i;
                expect(nextExpectId2).equal(nextId2);
                currentId = nextId2;
            }

            currentdate.setDate(currentdate.getDate() + 7);
            week++
        }


    })

}, 100000)