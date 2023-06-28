
function getWeekNumber() {
    // get today
    let currentdate = new Date();
    // get the 1 january day
    var oneJan = new Date(currentdate.getFullYear(), 0, 1);
    // get the number of today (currentdate - oneJan) would be epoch number and divide 1 day epoch number
    var numberOfDays = Math.floor((currentdate - oneJan) / (24 * 60 * 60 * 1000));
    // get the number of day + 1 + number of days and divide 1 week ( 170 / 7)
    return Math.ceil((currentdate.getDay() + 1 + numberOfDays) / 7);
  }

  
export function generateId(yourLastId) {
  
    let id = yourLastId.slice(0, 3);
    // masukkan increment
    // ambil 4 string e.g 0000 akan menjadi 0001
    let increment = Number(yourLastId.slice(-4)) + 1 + "";
    // 2022
    let fullYear = new Date().getFullYear() + "";
    // 5
    let weekNow = getWeekNumber();
    // 22
    let year = yourLastId.slice(3, 5); //21
    // 05
    let week = yourLastId.slice(5, 7); //08
    //if the week same
    if (weekNow === Number(week)) {
      id += year + week;
    }
    //if the week not same
    else {
      // if the week 9 change to 09
      weekNow = weekNow < 10 ? "0" + weekNow : weekNow;
      id += fullYear.slice(2) + weekNow;
      increment = "0";
    }
    //0000
    let result = id + "0000".slice(increment.length) + increment;
    // kembalikan
    return result;
  }