const getDetails = (payload) => {
    // a = { format: 'dateTime', time: new Date() }
    const jsDate = payload ? new Date(payload) : new Date();
    const dateNumber = jsDate.getDate() > 9 ? jsDate.getDate() : "0" + jsDate.getDate();
    const monthNumber = jsDate.getMonth();
    const YearNumber = jsDate.getFullYear();
    const hoursNumber = jsDate.getHours() > 9 ? jsDate.getHours() : "0" + jsDate.getHours();
    const minutesNumber = jsDate.getMinutes() > 9 ? jsDate.getMinutes() : "0" + jsDate.getMinutes();
    return {
        origin: jsDate,
        date: dateNumber,
        month: monthNumber,
        year: YearNumber,
        hours: hoursNumber,
        minutes: minutesNumber
    }
}

const MMM = [ "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Des", ];

export const time = (payload) => {
    return getDetails(payload)?.origin?.getTime()
}

export const full = (payload) => {
    let details = getDetails(payload)
    return details.date + " " + MMM[details.month] + " " + details.year + " " + details.hours + ":" + details.minutes;
} //dapatkan waktu penuh dd mmm yyyy hh:mm

export const dayPlus1 = (payload) => {
    let date = getDetails(payload)
    date.setDate(date.getDate() +1)
    return date.getTime()
} 

export const ymdTime = (payload) => {
    const details = getDetails(payload)
    return new Date(details.year + "/" + (details.month + 1) + "/" + details.date).getTime();
}

export const dateMonth = (payload) => {
    const details = getDetails(payload)
    return `${details.date}-${MMM[details.month]}`
}

//dapatkan waktu penuh dd/mm/yyyy
export const ddmmyyyy = (payload, splitter) =>  {
    const details = getDetails(payload)
    return details.date+splitter+details.month+splitter+details.year      
} 

const dateFormat =  {
        time, full, dayPlus1, ymdTime
    }

export default dateFormat
// // hari selanjutnya pada jam 00:00
//     else if (a[0] == "-1") {
//       a001.setDate(a002 - 1);
//       return a001.getTime();
//     } // 1 hari sebelumnya time
//     else if (a[0] == "-2") {
//       a001.setDate(a002 - 2);
//       return a001.getTime();
//     } // 2 hari sebelumnya time
//     else if (a[0] == "-3") {
//       a001.setDate(a002 - 3);
//       return a001.getTime();
//     } // 3 hari sebelumnya time
//     else if (a[0] == "0") {
//       return a001.getTime() - 25200000;
//     } // hari yang tersebut pada jam 00:00
//     else if (a[0] == "dateMonth") {
//       return (a002 > 9 ? a002 : "0" + a002) + "-" + a007[a003];
//     } //dapatkan tanggal bulan dd-mmm
//     else if (a[0] === "yearMonth") {
//       return a004 + (a003 + 1 > 9 ? a003 : "0" + (a003 + 1));
//     } //dapatkan tahun bulan, yyyym
//     else if (a[0] === "ymdTime") {
//       return new Date(a004 + "/" + (a003 + 1) + "/" + a002).getTime();
//     } else if (a[0] === "ymdexcel") {
//       return (
//         a004 + "/" + (a003 + 1 > 9 ? a003 + 1 : "0" + (a003 + 1)) + "/" + a002
//       );
//       //dapatkan waktu penuh yyyy/mm/dd
//     } else if (a[0] === "ddmmyyyy") {
//       return (
//         (a002 > 9 ? a002 : "0" + a002) +
//         "/" +
//         (a003 + 1 > 9 ? a003 + 1 : "0" + (a003 + 1)) +
//         "/" +
//         a004
//       );
//     } //dapatkan waktu penuh dd/mm/yyyy
// }