import React, { useRef, useEffect } from "react";
import Chart from "chart.js";

const ChartRenderer = ({ chart }) => {
  const canvasRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chart || !chart.labels || !chart.datasets || !canvasRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");
    const type = chart.chartType === "line" ? "line" : chart.chartType === "bar" ? "bar" : chart.chartType === "pie" ? "pie" : "line";

    chartInstance.current = new Chart(ctx, {
      type,
      data: {
        labels: chart.labels,
        datasets: chart.datasets,
      },
      options: {
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
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chart]);

  if (!chart || !chart.labels || !chart.datasets) return null;
  if (!["line", "bar", "pie"].includes(chart.chartType)) return null;

  return (
    <div style={{ width: "100%", height: "400px", marginTop: "20px" }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default ChartRenderer;
