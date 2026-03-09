import React, { useState, useMemo } from "react";
import ChartRenderer from "src/components/Marth/chartRenderer";

const CHART_TYPES = ["line", "bar", "pie"];

/** Stock movement layout: title left, Show Breakdown + arrows right */
function StockChartHeader({
  title,
  showBreakdown,
  onShowBreakdownChange,
  onPrev,
  onNext,
}) {
  return (
    <div className="chart-stock-header">
      <h3 className="chart-stock-title">{title}</h3>
      <div className="chart-stock-controls">
        <label className="chart-stock-breakdown">
          <span className="chart-stock-toggle-wrap">
            <input
              type="checkbox"
              checked={showBreakdown}
              onChange={(e) => onShowBreakdownChange(e.target.checked)}
              className="chart-stock-toggle"
            />
            <span className="chart-stock-toggle-label">Show Breakdown</span>
          </span>
        </label>
        <div className="chart-stock-arrows">
          <button
            type="button"
            onClick={onPrev}
            className="chart-stock-arrow"
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={onNext}
            className="chart-stock-arrow"
            aria-label="Next"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChartWithControls({ chart }) {
  const [chartTypeOverride, setChartTypeOverride] = useState(null);
  const [visibleDatasets, setVisibleDatasets] = useState(
    () => chart?.datasets?.map((_, i) => i) ?? [],
  );
  const [showBreakdown, setShowBreakdown] = useState(false);
  const isStockMovement =
    chart?.title && String(chart.title).startsWith("YEAR ");

  const modifiedChart = useMemo(() => {
    if (!chart || !chart.labels || !chart.datasets?.length) return null;

    const type = chartTypeOverride || chart.chartType;
    const datasets = chart.datasets.filter((_, i) =>
      visibleDatasets.includes(i),
    );

    if (datasets.length === 0) return null;

    const PIE_COLORS = [
      "rgba(75,192,192,0.8)",
      "rgba(54,162,235,0.8)",
      "rgba(255,99,132,0.8)",
      "rgba(255,206,86,0.8)",
      "rgba(153,102,255,0.8)",
      "rgba(255,159,64,0.8)",
    ];
    if (type === "pie") {
      const ds = datasets[0];
      if (!ds) return null;

      const colors = Array.isArray(ds.backgroundColor)
        ? ds.backgroundColor
        : PIE_COLORS.slice(0, chart.labels.length);

      // Ensure pie chart data is valid
      const dataLength = chart.labels.length;
      let pieData = Array.isArray(ds.data) ? [...ds.data] : [];

      // Pad or trim data to match labels length
      if (pieData.length < dataLength) {
        pieData = [...pieData, ...Array(dataLength - pieData.length).fill(0)];
      } else if (pieData.length > dataLength) {
        pieData = pieData.slice(0, dataLength);
      }

      // Replace null/undefined with 0 for pie charts, ensure numeric values
      pieData = pieData.map((v) => {
        if (v === null || v === undefined) return 0;
        const num = Number(v);
        return isNaN(num) || num < 0 ? 0 : num;
      });

      return {
        chartType: "pie",
        title: chart.title,
        labels: chart.labels,
        datasets: [
          {
            label: ds.label || "Data",
            data: pieData,
            backgroundColor: colors,
            borderColor: "rgba(255,255,255,0.8)",
            borderWidth: 1,
          },
        ],
      };
    }

    return {
      chartType: type,
      title: chart.title,
      labels: chart.labels,
      datasets: datasets
        .map((ds) => {
          if (!ds || typeof ds !== "object") return null;

          // Ensure data array is valid and matches labels length
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

          // Ensure data array is well-formed
          const hasAnyValidValue = validData.some((v) => v !== null);
          if (!hasAnyValidValue) {
            validData = validData.map(() => 0);
          }

          // Build clean dataset
          const cleanDataset = {
            label: ds.label || `Dataset`,
            data: validData,
            borderColor: ds.borderColor || "rgba(0,0,0,0.1)",
            backgroundColor: ds.backgroundColor || "rgba(0,0,0,0.1)",
            borderWidth: ds.borderWidth !== undefined ? ds.borderWidth : 1,
            pointRadius: 4,
            pointHoverRadius: 6,
            ...ds, // Spread remaining properties
            data: validData, // Ensure data is validated version
          };

          // Remove type property if not a mixed chart
          if (type !== "mixed") {
            delete cleanDataset.type;
          }

          return cleanDataset;
        })
        .filter((ds) => ds !== null),
    };
  }, [chart, chartTypeOverride, visibleDatasets]);

  if (!chart || !chart.labels || !chart.datasets?.length) return null;

  const hasMultipleDatasets = chart.datasets.length > 1;

  const handleChartTypeChange = (e) => {
    const v = e.target.value;
    setChartTypeOverride(v === chart.chartType ? null : v);
  };

  const toggleDataset = (i) => {
    setVisibleDatasets((prev) => {
      const next = prev.includes(i)
        ? prev.filter((x) => x !== i)
        : [...prev, i];
      return next.length ? next : [i];
    });
  };

  const handlePrev = () => {};
  const handleNext = () => {};

  return (
    <div
      className={
        "chart-with-controls" +
        (isStockMovement ? " chart-with-controls-stock" : "")
      }
    >
      {isStockMovement ? (
        <StockChartHeader
          title={chart.title}
          showBreakdown={showBreakdown}
          onShowBreakdownChange={setShowBreakdown}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      ) : (
        <div className="chart-controls">
          <label className="chart-control-label">Chart type:</label>
          <select
            value={chartTypeOverride || chart.chartType}
            onChange={handleChartTypeChange}
            className="chart-type-select"
          >
            {CHART_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
          {hasMultipleDatasets && (
            <div className="chart-dataset-toggles">
              {chart.datasets.map((ds, i) => (
                <label key={i} className="chart-dataset-checkbox">
                  <input
                    type="checkbox"
                    checked={visibleDatasets.includes(i)}
                    onChange={() => toggleDataset(i)}
                  />
                  <span>{ds.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
      <ChartRenderer chart={modifiedChart} />
    </div>
  );
}
