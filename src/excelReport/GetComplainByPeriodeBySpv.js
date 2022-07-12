import myfunction from "../myfunction";

export default function (periode, spv) {
  return myfunction
    .findData({
      store: "Complains",
      criteria: {
        periode: periode,
        name: spv,
      },
    })
    .then((data) => {
      if (data && data.length) {
        return data.map((val) => ({
          masalah: val?.masalah,
          sumberMasalah: val?.sumberMasalah,
          solusi: val?.solusi,
          pic: val?.pic,
          periode: myfunction.dateFormat(["dateMonth", val?.periode]),
          dl: myfunction.dateFormat(["dateMonth", val?.dl]),
        }));
      }
    });
}
