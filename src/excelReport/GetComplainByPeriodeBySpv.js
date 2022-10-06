import myfunction from "../myfunction";

export default function (criteria) {
  return myfunction
    .findData({
      store: "Complains",
      criteria: criteria,
    })
    .then((data) => {
      if (data && data.length) {
        return data.map((val) => ({
          periode: myfunction.dateFormat(["dateMonth", val?.periode]),
          masalah: val?.masalah,
          sumberMasalah: val?.sumberMasalah,
          solusi: val?.solusi,
          pic: val?.pic,
          dl: myfunction.dateFormat(["dateMonth", val?.dl]),
          periode2: val?.isCount ? +myfunction.dateFormat(["dateMonth", val?.periode]).match(/\d+/)[0] : '',
        }));
      }
    });
}
