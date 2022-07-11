import myfunction from "../myfunction";

export default function (periode, spv) {
  return myfunction.findData({
    store: "Problem",
    criteria: {
      periode: periode,
      nameSpv: spv,
    },
  });
}
