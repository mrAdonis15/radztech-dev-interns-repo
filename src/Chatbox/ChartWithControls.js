import React, { useState, useMemo } from "react";
import ChartRenderer from "src/components/Marth/chartRenderer";

const CHART_TYPES = ["line", "bar", "pie"];

/** Stock movement layout: title left, Show Breakdown + arrows right */
function StockChartHeader({ title, showBreakdown, onShowBreakdownChange, onPrev, onNext }) {
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
          <button type="button" onClick={onPrev} className="chart-stock-arrow" aria-label="Previous">
            ‹
          </button>
          <button type="button" onClick={onNext} className="chart-stock-arrow" aria-label="Next">
            ›
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChartWithControls({ chart }) {
  const [chartTypeOverride, setChartTypeOverride] = useState(null);
  const [visibleDatasets, setVisibleDatasets] = useState(() =>
    chart?.datasets?.map((_, i) => i) ?? []
  );
  const [showBreakdown, setShowBreakdown] = useState(false);
  const isStockMovement = chart?.title && String(chart.title).startsWith("YEAR ");

  const modifiedChart = useMemo(() => {
    if (!chart || !chart.labels || !chart.datasets?.length) return null;

    const type = chartTypeOverride || chart.chartType;
    const datasets = chart.datasets.filter((_, i) => visibleDatasets.includes(i));

    if (datasets.length === 0) return null;

    const PIE_COLORS = [
      "rgba(75,192,192,0.8)", "rgba(54,162,235,0.8)", "rgba(255,99,132,0.8)",
      "rgba(255,206,86,0.8)", "rgba(153,102,255,0.8)", "rgba(255,159,64,0.8)",
    ];
    if (type === "pie") {
      const ds = datasets[0];
      const colors = Array.isArray(ds.backgroundColor)
        ? ds.backgroundColor
        : PIE_COLORS.slice(0, chart.labels.length);
      return {
        chartType: "pie",
        title: chart.title,
        labels: chart.labels,
        datasets: [
          {
            label: ds.label,
            data: ds.data,
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
      datasets: datasets.map((ds) => ({ ...ds })),
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
      const next = prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i];
      return next.length ? next : [i];
    });
  };

  const handlePrev = () => {};
  const handleNext = () => {};

  return (
    <div className={"chart-with-controls" + (isStockMovement ? " chart-with-controls-stock" : "")}>
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
