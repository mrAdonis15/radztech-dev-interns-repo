import React, { useState, useRef, useEffect } from "react";
import Chart from "chart.js";
import {
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";
import sampleData from "../data/sampleData.json";

const WINDOW_MS = 3 * 60 * 1000;

// Static sample muna
const SAMPLE_DATA = sampleData.cpupercent;

function padToThreeMinutes(data, intervalMs) {
  const now = Date.now();
  const count = Math.ceil(WINDOW_MS / intervalMs);
  const padded = [];
  for (let i = 0; i < count; i++) {
    const t = now - (count - 1 - i) * intervalMs;
    const src = data[i % data.length];
    padded.push({ ...src, timestamp: t });
  }
  return padded;
}

function getHistoricalChart(data, intervalMs) {
  const interval = intervalMs == null ? 1000 : intervalMs;
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const pointsNeeded = Math.ceil(WINDOW_MS / interval);
  const raw = Array.isArray(data) ? data.slice(-pointsNeeded) : [];
  const labels = [];
  const cpuAvg = [];
  const memUsed = [];
  let lastMem = null;
  raw.forEach(function (d, i) {
    const t =
      d.timestamp != null ? d.timestamp : now - (raw.length - 1 - i) * interval;
    if (t >= cutoff) {
      labels.push(
        new Date(t).toLocaleTimeString([], {
          minute: "2-digit",
          second: "2-digit",
        }),
      );
      const cp = d && d.cpu_percent;
      if (Array.isArray(cp) && cp.length) {
        const sum = cp.reduce(function (acc, v) {
          return acc + (Number(v) || 0);
        }, 0);
        cpuAvg.push(sum / cp.length);
      } else {
        cpuAvg.push(Number(cp) || 0);
      }
      memUsed.push(
        d.mem && d.mem.used_percent != null ? d.mem.used_percent : 0,
      );
      if (d && d.mem) lastMem = d.mem;
    }
  });
  if (labels.length === 0) {
    labels.push("0:00");
    cpuAvg.push(0);
    memUsed.push(0);
  }

  const currentCpu = cpuAvg.length ? cpuAvg[cpuAvg.length - 1] : 0;
  const currentMem = memUsed.length ? memUsed[memUsed.length - 1] : 0;
  const currentMemUsedKb =
    lastMem && lastMem.used_kb != null ? lastMem.used_kb : 0;
  const currentMemTotalKb =
    lastMem && lastMem.total_kb != null ? lastMem.total_kb : 0;

  const datasets = [
    {
      label: "CPU %",
      data: cpuAvg,
      borderColor: "#e65100",
      backgroundColor: "transparent",
      fill: false,
      lineTension: 0.35,
      tension: 0.35,
      pointRadius: 0,
      pointHoverRadius: 4,
      borderWidth: 2,
    },
    {
      label: "Memory %",
      data: memUsed,
      borderColor: "#1565c0",
      backgroundColor: "rgba(21, 101, 192, 0.10)",
      fill: false,
      lineTension: 0.35,
      tension: 0.35,
      pointRadius: 0,
      pointHoverRadius: 4,
      borderWidth: 2,
    },
  ];

  const chartData = {
    labels,
    datasets,
  };

  const chartOptions = {
    animation: { duration: 0 },
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { top: 12, right: 12, bottom: 12, left: 12 },
    },
    legend: {
      display: true,
      position: "bottom",
      labels: {
        fontColor: "#333",
        padding: 15,
        boxWidth: 30,
        font: { size: 12, weight: "500" },
      },
    },
    tooltips: {
      mode: "index",
      intersect: false,
      backgroundColor: "rgba(33,33,33,0.9)",
      titleFontColor: "#fff",
      bodyFontColor: "#fff",
      borderColor: "#e65100",
      borderWidth: 1,
    },
    scales: {
      xAxes: [
        {
          gridLines: { display: false },
          ticks: {
            autoSkip: true,
            fontSize: 10,
            fontColor: "#666",
          },
        },
      ],
      yAxes: [
        {
          gridLines: { color: "rgba(0,0,0,0.06)" },
          ticks: {
            fontColor: "#666",
            beginAtZero: true,
            max: 100,
            fontSize: 11,
            stepSize: 25,
          },
        },
      ],
    },
  };

  return {
    chartData,
    chartOptions,
    currentCpu,
    currentMem,
    currentMemUsedKb,
    currentMemTotalKb,
  };
}

function CpuPercentHistorical({
  data: dataProp,
  intervalMs = 1000,
  height = 320,
}) {
  const [localData, setLocalData] = useState([]);
  const [dataIndex, setDataIndex] = useState(0);
  const [maxDataPoints, setMaxDataPoints] = useState(10);
  const data = localData;
  const { chartData, chartOptions } = getHistoricalChart(data, intervalMs);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  // Auto-update data every 1 second with looping
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const nextIndex = dataIndex % SAMPLE_DATA.length;
      const newEntry = {
        ...SAMPLE_DATA[nextIndex],
        timestamp: now,
      };
      setLocalData((prev) => {
        const next = [...prev, newEntry];
        // Keep only the last N data points based on maxDataPoints
        if (next.length > maxDataPoints) {
          return next.slice(-maxDataPoints);
        }
        return next;
      });
      setDataIndex((prevIndex) => prevIndex + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [dataIndex, maxDataPoints]);
  const headerHeight = 56;
  const chartHeight = Math.max(0, height - headerHeight);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (chartRef.current) {
      try {
        chartRef.current.data = chartData;
        chartRef.current.options = chartOptions;
        chartRef.current.update();
      } catch (e) {
        chartRef.current.destroy();
        chartRef.current = new Chart(ctx, {
          type: "line",
          data: chartData,
          options: chartOptions,
        });
      }
    } else {
      chartRef.current = new Chart(ctx, {
        type: "line",
        data: chartData,
        options: chartOptions,
      });
    }
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [chartData, chartOptions]);
  return (
    <Paper
      elevation={0}
      style={{
        padding: 0,
        backgroundColor: "#fff",
        border: "1px solid rgba(230, 81, 0, 0.2)",
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        px={2}
        pt={2}
        pb={0}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h6" style={{ color: "#333", fontWeight: 600 }}>
          CPU & Memory usage (Live)
        </Typography>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <FormControl size="small" style={{ minWidth: "100px" }}>
            <InputLabel style={{ fontSize: "12px" }}>Data Points</InputLabel>
            <Select
              value={maxDataPoints}
              onChange={(e) => setMaxDataPoints(e.target.value)}
              label="Data Points"
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={15}>15</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={30}>30</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="caption" style={{ color: "#999" }}>
            {localData.length}/{maxDataPoints}
          </Typography>
        </div>
      </Box>
      <div
        style={{
          height: chartHeight,
          padding: "0 8px 8px",
          position: "relative",
        }}
      >
        <canvas
          ref={canvasRef}
          height={chartHeight}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </Paper>
  );
}

export {
  getHistoricalChart,
  CpuPercentHistorical,
  padToThreeMinutes,
  SAMPLE_DATA,
};
export default CpuPercentHistorical;
