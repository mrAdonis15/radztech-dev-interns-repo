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

          // Ensure data array matches labels length and has valid values
          const dataLength = chart.labels.length;
          let validData = Array.isArray(ds.data) ? [...ds.data] : [];

          // Pad or trim data to match labels length
          if (validData.length < dataLength) {
            validData = [
              ...validData,
              ...Array(dataLength - validData.length).fill(null),
            ];
          } else if (validData.length > dataLength) {
            validData = validData.slice(0, dataLength);
          }

          // Replace undefined/NaN with null and ensure numeric values
          validData = validData.map((v) => {
            if (v === undefined || v === null) return null;
            const num = Number(v);
            return isNaN(num) ? null : num;
          });

          // Ensure data array is well-formed and not all nulls
          const hasAnyValidValue = validData.some((v) => v !== null);
          if (!hasAnyValidValue) {
            // If all null, fill with zeros to prevent Chart.js issues
            validData = validData.map(() => 0);
          }

          // Build a clean dataset object with required properties
          const cleanDataset = {
            label: ds.label || `Dataset`,
            data: validData,
            // Include chart.js required properties
            borderColor: ds.borderColor || "rgba(0,0,0,0.1)",
            backgroundColor: ds.backgroundColor || "rgba(0,0,0,0.1)",
            borderWidth: ds.borderWidth !== undefined ? ds.borderWidth : 1,
            pointRadius: 4,
            pointHoverRadius: 6,
            ...ds, // Spread remaining properties
            data: validData, // Ensure data is our validated version
          };

          // Remove invalid properties
          if (!isMixed) {
            delete cleanDataset.type;
          }

          return cleanDataset;
        })
        .filter((ds) => ds !== null); // Remove any invalid datasets

      // Ensure we have at least one dataset
      if (datasets.length === 0) {
        console.warn("No valid datasets provided to chart");
        return;
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
          spanGaps: true, // Allow line charts to span over null values
          legend: {
            display: true,
            position: "top",
            align: "end",
            fullWidth: false,
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
                      gridLines: {
                        display: true,
                        color: "rgba(0,0,0,0.08)",
                        borderDash: [4, 4],
                      },
                      ticks: {
                        fontColor: "#666",
                        fontSize: 11,
                        maxRotation: 45,
                        minRotation: 0,
                      },
                    },
                  ],
                  yAxes: [
                    {
                      gridLines: {
                        display: true,
                        color: "rgba(0,0,0,0.08)",
                        borderDash: [4, 4],
                      },
                      ticks: {
                        fontColor: "#666",
                        fontSize: 11,
                        beginAtZero: true,
                      },
                    },
                  ],
                }
              : undefined,
          tooltips: {
            enabled: false,
          },
          hover: {
            animationDuration: 0,
          },
          animation: {
            duration: 0,
          },
        },
      });

      // Wrap chart event handler to prevent errors from bubbling
      const originalEventHandler = chartInstance.current.eventHandler;
      if (originalEventHandler) {
        chartInstance.current.eventHandler = function (e) {
          try {
            return originalEventHandler.call(this, e);
          } catch (err) {
            console.warn("Chart event handler error (suppressed):", err);
          }
        };
      }
    } catch (error) {
      console.error("Failed to create chart:", error, { chart });
    }

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
