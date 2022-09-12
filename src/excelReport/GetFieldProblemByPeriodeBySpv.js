import myfunction from "../myfunction";

export default function (periode, supervisor) {
  return myfunction
    .findData({
      store: "fieldProblem",
      criteria: {periode, supervisor},
    })
    .then((data) => {
      if (data && data?.length) {
        let result = data.map(async (val) => {
          let getSupervisor = await myfunction.findData({ store: "supervisors", criteria: { id: val?.supervisor } });
          return {
            periode: myfunction.dateFormat(["dateMonth", val.periode]),
            masalah: `[Kendala] ${val.masalah} Karu ${getSupervisor[0]?.name}`,
            sumberMasalah: val.sumberMasalah,
            solusi: val.solusi,
            pic: val.pic,
            dl: myfunction.dateFormat(["dateMonth", val.dl]),
          };
      })
      return Promise.all(result)
    }
  })
    .then((result) => result);
}
