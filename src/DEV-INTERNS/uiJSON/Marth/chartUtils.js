export const getStockCardData = (stockGraph) => {
  // Use items that have meaningful data
  const items = stockGraph.items.filter((item) => item.runBal !== undefined);

  // Labels — you can use YrWk or YrMo depending on your preference
  const labels = items.map((item) => item.YrWk || item.YrMo);

  // Dataset — for example, runBal
  const runBalDataset = {
    label: "Running Balance",
    data: items.map((item) => item.runBal),
    borderColor: "rgb(75,192,192)",
    backgroundColor: "rgba(75,192,192,0.2)",
    tension: 0.3,
  };

  // Optional: In / Out transactions
  const inDataset = {
    label: "In",
    data: items.map((item) => item.tIN),
    borderColor: "rgb(54,162,235)",
    backgroundColor: "rgba(54,162,235,0.2)",
    tension: 0.3,
  };

  const outDataset = {
    label: "Out",
    data: items.map((item) => Math.abs(item.tOUT)), // Use absolute to make chart positive
    borderColor: "rgb(255,99,132)",
    backgroundColor: "rgba(255,99,132,0.2)",
    tension: 0.3,
  };

  return {
    chartType: "line", // or "bar"
    title: "Stock Movement",
    labels,
    datasets: [runBalDataset, inDataset, outDataset],
  };
};
