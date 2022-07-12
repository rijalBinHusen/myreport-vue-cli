import myfunction from "../myfunction";

export default function (periode, spv) {
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
        let result = data.map(
          (val) =>
            myfunction
              .findData({ store: "baseitem", criteria: { kode: val?.item } })
              .then((data) => ({
                periode: myfunction.dateFormat(["dateMonth", val.periode]),
                masalah: `${data[0]?.name} selisih ${val.masalah}`,
                sumberMasalah: val.sumberMasalah,
                solusi: val.solusi,
                pic: val.pic,
                dl: myfunction.dateFormat(["dateMonth", val.dl]),
              }))

          // return {
          // };
        );
        return Promise.all(result);
      }
    })
    .then((result) => result);
}
