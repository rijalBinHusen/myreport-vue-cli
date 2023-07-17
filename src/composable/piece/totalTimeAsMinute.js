import { time } from "./dateFormat"

export const totalTime = (start, finish) => {
    if(!start || !finish || start?.length < 5 || finish?.length < 5) { return 0 }
    // start
    let startTime = time(seperateAsClock(start))
    //finish
    let finishTime = time(seperateAsClock(finish))
    // total time
    let total = finishTime < startTime ? finishTime + 86400000 - startTime : finishTime - startTime;
    // jaddikan menit, masukan total waktu
    return total / 1000 / 60
}

const seperateAsClock = (clock) => {
    return `2022-03-03 ${clock.slice(0, 2)}:${clock.slice(3,5)}`
}