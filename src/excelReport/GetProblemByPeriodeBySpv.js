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
        let result = data.map((val) => {
          let promises = [
            myfunction.findData({
              store: "baseitem",
              criteria: { kode: val?.item },
            }),
            myfunction.findData({
              store: "supervisors",
              criteria: { id: val?.nameSpv },
            }),
          ];
          return Promise.all(promises).then((val2) => ({
            periode: myfunction.dateFormat(["dateMonth", val.periode]),
            masalah: `${val2[0][0]?.name} selisih ${val.masalah} Karu ${val2[1][0]?.name}`,
            sumberMasalah: val.sumberMasalah,
            solusi: val.solusi,
            pic: val.pic,
            dl: myfunction.dateFormat(["dateMonth", val.dl]),
          }));
        });
        return Promise.all(result);
      }
    })
    .then((result) => result);
}
