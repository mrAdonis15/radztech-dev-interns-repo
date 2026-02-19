import React from "react";
import { Line, Bar, Pie } from "react-chartjs-2";

const ChartRenderer = ({ chart }) => {
  if (!chart || !chart.labels || !chart.datasets) return null;

  const data = {
    labels: chart.labels,
    datasets: chart.datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      position: "top",
    },
    title: {
      display: !!chart.title,
      text: chart.title || "",
    },
    tooltips: {
      mode: "index",
      intersect: false,
    },
    hover: {
      mode: "nearest",
      intersect: true,
    },
  };

  const containerStyle = {
    width: "100%",
    height: "400px",
    marginTop: "20px",
  };

  switch (chart.chartType) {
    case "line":
      return (
        <div style={containerStyle}>
          <Line data={data} options={options} />
        </div>
      );

    case "bar":
      return (
        <div style={containerStyle}>
          <Bar data={data} options={options} />
        </div>
      );

    case "pie":
      return (
        <div style={containerStyle}>
          <Pie data={data} options={options} />
        </div>
      );

    default:
      return null;
  }
};

export default ChartRenderer;
