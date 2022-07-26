import myfunction from "../myfunction";

export default function (criteria) {
  return myfunction
    .findData({
      store: "Cases",
      criteria: criteria,
    })
    .then((data) => {
      if (data && data.length) {
        return data.map((val) => ({
          masalah: "[Kasus] " + val?.masalah,
          sumberMasalah: val?.sumberMasalah,
          solusi: val?.solusi,
          pic: val?.pic,
          periode: myfunction.dateFormat(["dateMonth", val?.periode]),
          dl: myfunction.dateFormat(["dateMonth", val?.dl]),
        }));
      }
    });
}
