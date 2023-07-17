import { ymdTime } from "./dateFormat"

const getDaysArray = (start, end) => {
    let arr = [];
    for (
      let dt = new Date(start);
      dt <= new Date(end);
      dt.setDate(dt.getDate() + 1)
    ) {
      arr.push(ymdTime(dt));
    }
    return arr;
}

export default getDaysArray