import myfunction from "../myfunction";

export default async function (periode, spv) {
  return myfunction
    .findData({
      store: "Problem",
      criteria: {
        periode: periode,
        nameSpv: spv,
      },
    })
    .then((data) => {
      if (data && data?.length) {
        return data.map((val) => ({
          periode: myfunction.dateFormat(["dateMonth", val.periode]),
          masalah: val.masalah,
          sumberMasalah: val.sumberMasalah,
          solusi: val.solusi,
          pic: val.pic,
          dl: myfunction.dateFormat(["dateMonth", val.dl]),
        }));
        // return {
      }
    });
}
