import React, { useEffect, useRef } from "react";
import Chart from "chart.js";

export default function ChartRenderer({
  type,
  data,
  options,
  width = 600,
  height = 400,
}) {
  console.log("chart-type", type);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(ctx, {
      type,
      data,
      options,
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [type, data, options]);

  return <canvas ref={canvasRef} width={width} height={height} />;
}
