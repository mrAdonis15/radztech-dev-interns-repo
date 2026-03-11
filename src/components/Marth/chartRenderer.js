import React, { useRef, useEffect, useState, memo } from "react";
import Chart from "chart.js";

function scheduleIdle(cb, timeout = 400) {
  if (typeof requestIdleCallback !== "undefined") {
    return requestIdleCallback(cb, { timeout });
  }
  return setTimeout(cb, 0);
}

function cancelIdle(id) {
  if (typeof cancelIdleCallback !== "undefined") cancelIdleCallback(id);
  else clearTimeout(id);
}

const ChartRenderer = ({ chart }) => {
  const canvasRef = useRef(null);
  const chartInstance = useRef(null);
  const [chartReady, setChartReady] = useState(false);
  const idleRef = useRef(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!chart || !chart.labels || !chart.datasets || !canvasRef.current) {
      setChartReady(false);
      return;
    }

    cancelledRef.current = false;
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }
    setChartReady(false);

    const canvas = canvasRef.current;
    const chartData = { ...chart };

    idleRef.current = scheduleIdle(() => {
      if (cancelledRef.current || !canvasRef.current || !canvas.isConnected) return;

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = canvas.getContext("2d");
      const isMixed = chartData.chartType === "mixed";
      const defaultType = isMixed ? "bar" : (chartData.chartType === "line" ? "line" : chartData.chartType === "bar" ? "bar" : chartData.chartType === "pie" ? "pie" : "line");

      const datasets = chartData.datasets.map((ds) => {
        const type = isMixed && ds.type ? ds.type : defaultType;
        return { ...ds, type };
      });

      chartInstance.current = new Chart(ctx, {
        type: defaultType,
        data: {
          labels: chartData.labels,
          datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          backgroundColor: "#ffffff",
          animation: false,
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
            text: chartData.title || "",
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
      setChartReady(true);
    }, 400);

    return () => {
      cancelledRef.current = true;
      cancelIdle(idleRef.current);
      idleRef.current = null;
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [chart]);

  if (!chart || !chart.labels || !chart.datasets) return null;
  if (!["line", "bar", "pie", "mixed"].includes(chart.chartType)) return null;

  return (
    <div className="chart-renderer-wrap" style={{ position: "relative", width: "100%", minHeight: "560px", height: "560px", marginTop: "12px", background: chartReady ? "#fff" : "#f5f5f5" }}>
      {!chartReady && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#888", fontSize: 14 }}>
          Drawing chart…
        </div>
      )}
      <canvas ref={canvasRef} style={{ position: "relative", zIndex: 1 }} />
    </div>
  );
};

export default memo(ChartRenderer);
