import React, { useRef, useEffect } from "react";
import Chart from "chart.js";

const ChartRenderer = ({ chart }) => {
  const canvasRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chart || !chart.labels || !chart.datasets || !canvasRef.current)
      return;

    // Validate that datasets have data
    const hasValidData = chart.datasets.some(
      (ds) => Array.isArray(ds.data) && ds.data.length > 0,
    );
    if (!hasValidData) {
      console.warn("Chart has no valid data");
      return;
    }

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    try {
      const ctx = canvasRef.current.getContext("2d");
      const isMixed = chart.chartType === "mixed";
      const defaultType = isMixed
        ? "bar"
        : chart.chartType === "line"
          ? "line"
          : chart.chartType === "bar"
            ? "bar"
            : chart.chartType === "pie"
              ? "pie"
              : "line";

      // For mixed charts, keep dataset types; for others, ensure no type property
      const datasets = chart.datasets
        .map((ds) => {
          if (!ds || typeof ds !== "object") {
            console.warn("Invalid dataset:", ds);
            return null;
          }

    chartInstance.current = new Chart(ctx, {
      type: defaultType,
      data: {
        labels: chart.labels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        backgroundColor: "#ffffff",
        legend: {
          display: true,
          position: "top",
          align: "center",
          fullWidth: true,
          labels: {
            boxWidth: 14,
            padding: 16,
            usePointStyle: true,
            fontColor: "#333",
            fontSize: 12,
          },
        },
        title: {
          display: false,
          text: chart.title || "",
        },
        scales:
          defaultType !== "pie"
            ? {
                xAxes: [
                  {
                    gridLines: { display: true, color: "rgba(0,0,0,0.06)", zeroLineColor: "rgba(0,0,0,0.1)" },
                    ticks: { fontColor: "#666", fontSize: 11, maxRotation: 45, minRotation: 0 },
                  },
                ],
                yAxes: [
                  {
                    gridLines: { display: true, color: "rgba(0,0,0,0.06)", zeroLineColor: "rgba(0,0,0,0.12)" },
                    ticks: { fontColor: "#666", fontSize: 11, beginAtZero: true, stepSize: 1 },
                  },
                ],
              }
            : undefined,
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
  if (!["line", "bar", "pie", "mixed"].includes(chart.chartType)) return null;

  return (
    <div
      className="chart-renderer-wrap"
      style={{
        width: "100%",
        height: "400px",
        marginTop: "12px",
        background: "#fff",
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
};

export default ChartRenderer;
