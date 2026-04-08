import React, { useEffect, useRef } from "react";
import Chart from "chart.js";

const isValidChartData = (data) =>
  data &&
  Array.isArray(data.labels) &&
  Array.isArray(data.datasets) &&
  data.datasets.length > 0;

export default function ChartRenderer({
  type,
  data,
  options,
  width = 600,
  height = 400,
}) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isValidChartData(data) || !type) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const chartType = type === "mixed" ? "bar" : type;
    const opts = options || { responsive: true };

    chartRef.current = new Chart(ctx, {
      type: chartType,
      data,
      options: opts,
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [type, data, options]);

  if (!isValidChartData(data) || !type) {
    return (
      <div style={{ padding: 16, color: "#666" }}>No chart data available.</div>
    );
  }

  return <canvas ref={canvasRef} width={width} height={height} />;
}
