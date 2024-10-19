
export function getWeekNumber(date: Date) {
  // Create a new Date object from the input date string
  const d = new Date(date);

  // Calculate the day of the year (0-365)
  const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / 86400000);

  // Determine the week number based on the day of the year and the first day of the year
  const weekNumber = Math.ceil((dayOfYear + 1) / 7);

  return weekNumber;
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