import myfunction from "../myfunction";

export default async function (periode, spv) {
  return new Promise((resolve) => {
    let result = {};
    myfunction
      .findData({
        store: "Problem",
        criteria: {
          periode: periode,
          nameSpv: spv,
        },
      })
      .then((data) => {
        if (data) {
          // result.periode = myfunction
          //   .dateFormat({ format: "dateMonth", time: data.periode })
          //   .match(/\d+/)[0];
          result.masalah = data.masalah;
          result.sumberMasalah = data.sumberMasalah;
          result.solusi = data.solusi;
          result.pic = data.pic;
          // result.dl = myfunction.dateFormat({
          //   format: "dateMonth",
          //   time: data.dl,
          // });
        }
      });
    resolve(result);
  });
}
