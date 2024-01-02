
function getWeekNumber(yourDate: Date) {
    // get today
    let currentdate = new Date(yourDate);
    // get the 1 january day
    var oneJan = new Date(currentdate.getFullYear(), 0, 1);
    // get the number of today (currentdate - oneJan) would be epoch number and divide 1 day epoch number
    var numberOfDays = Math.floor((currentdate.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
    // get the number of day + 1 + number of days and divide 1 week ( 170 / 7)
    return Math.ceil((currentdate.getDay() + 1 + numberOfDays) / 7);
  }

  
export function generateId(yourLastId: string) {
  const dateNow = new Date();
  const nextId = generateIdCutomDate(dateNow, yourLastId)
  return nextId;
}

export function generateIdCutomDate(yourDate: Date, yourLastId: string): string {

    let id = yourLastId.slice(0, yourLastId.length -8);
    // masukkan increment
    // ambil 4 string e.g 0000 akan menjadi 0001
    let increment = Number(yourLastId.slice(-4)) + 1 + "";
    // 2022
    let fullYear = new Date(yourDate).getFullYear() + "";
    let yearNow = fullYear.slice(2);
    // 5
    let weekNow = getWeekNumber(yourDate) + '';
    // 22
    let year = yourLastId.slice(id.length, id.length + 2); //21
    // 05
    let week = yourLastId.slice(id.length + 2, id.length + 4); //08

    //if the week same
    if (Number(weekNow) == Number(week) && year == yearNow) {
      id = id + yearNow + week;
    }
    //if the week not same
    else {
      // if the week 9 change to 09
      weekNow = Number(weekNow) < 10 ? "0" + weekNow : weekNow;
      id = id + yearNow + weekNow;
      increment = "0";
    }
    //0000
    let result = id + "0000".slice(increment.length) + increment;
    
    // kembalikan
    return result;
}