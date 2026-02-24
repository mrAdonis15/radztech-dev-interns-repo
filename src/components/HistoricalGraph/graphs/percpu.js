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

function extractFinalPerCpu(obj) {
  let cur = obj;
  while (cur && cur.per_cpu) {
    cur = cur.per_cpu;
  }
  return cur || {};
}

function perCpuToArray(perCpu) {
  if (!perCpu || typeof perCpu !== "object") return [];

  return Object.keys(perCpu)
    .filter((k) => k.startsWith("cpu"))
    .sort((a, b) => Number(a.replace("cpu", "")) - Number(b.replace("cpu", "")))
    .map((k) => Number(perCpu[k]) || 0);
}

function getHistoricalChart(data, intervalMs = 1000) {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;

  const labels = [];
  const cpuSeries = {};

  // Determine number of CPUs from data or use default
  let numCpus = 0;
  if (data.length > 0) {
    const firstEntry = data[0];
    const finalCpuObj = extractFinalPerCpu(firstEntry.per_cpu);
    numCpus = perCpuToArray(finalCpuObj).length;
  }
  // Default to 2 CPUs if no data
  if (numCpus === 0) {
    numCpus = 2;
  }

  data.forEach((d, i) => {
    const t = d.timestamp ?? now - (data.length - 1 - i) * intervalMs;
    if (t < cutoff) return;

    labels.push(
      new Date(t).toLocaleTimeString([], {
        minute: "2-digit",
        second: "2-digit",
      }),
    );

    const finalCpuObj = extractFinalPerCpu(d.per_cpu);
    const cpuValues = perCpuToArray(finalCpuObj);

    cpuValues.forEach((val, idx) => {
      const key = `cpu${idx}`;
      if (!cpuSeries[key]) cpuSeries[key] = [];
      cpuSeries[key].push(val);
    });
  });

  const colors = [
    "#e65100",
    "#1565c0",
    "#43a047",
    "#fbc02d",
    "#8e24aa",
    "#00acc1",
    "#f57c00",
  ];

  // Always create datasets for all CPUs, even if no data
  const datasets = [];
  for (let i = 0; i < numCpus; i++) {
    const key = `cpu${i}`;
    datasets.push({
      label: key.toUpperCase(),
      data: cpuSeries[key] || [],
      borderWidth: 2,
      fill: false,
      lineTension: 0.3,
      pointRadius: 0,
      borderColor: colors[i % colors.length],
    });
  }

  const last = data[data.length - 1];
  const lastCpuArr = last
    ? perCpuToArray(extractFinalPerCpu(last.per_cpu))
    : [];

  const currentCpu =
    lastCpuArr.length > 0
      ? lastCpuArr.reduce((s, v) => s + v, 0) / lastCpuArr.length
      : 0;

  return {
    chartData: {
      labels: labels.length ? labels : ["0:00"],
      datasets,
    },
    chartOptions: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 0 },
      legend: {
        display: true,
        position: "bottom",
        labels: {
          fontColor: "#333",
          padding: 15,
          boxWidth: 30,
        },
      },
      tooltips: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(33,33,33,0.9)",
        titleFontColor: "#fff",
        bodyFontColor: "#fff",
      },
      scales: {
        xAxes: [
          {
            gridLines: { display: false },
            ticks: { autoSkip: true, fontSize: 10, fontColor: "#666" },
          },
        ],
        yAxes: [
          {
            gridLines: { color: "rgba(0,0,0,0.06)" },
            ticks: {
              min: 0,
              max: 100,
              stepSize: 25,
              fontSize: 11,
              fontColor: "#666",
            },
          },
        ],
      },
    },
    currentCpu,
  };
}

export default function Percpu({ intervalMs = 1000, height = 320 }) {
  const [localData, setLocalData] = useState([]);
  const [dataIndex, setDataIndex] = useState(0);
  const [maxDataPoints, setMaxDataPoints] = useState(10);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const { chartData, chartOptions } = getHistoricalChart(localData, intervalMs);

  // Auto-update data every 1 second with looping
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const nextIndex = dataIndex % sampleData.percpu.length;
      const newEntry = {
        ...sampleData.percpu[nextIndex],
        timestamp: now,
      };

      setLocalData((prev) => {
        const next = [...prev, newEntry];
        // Keep only the last 10 data points
        if (next.length > maxDataPoints) {
          return next.slice(-maxDataPoints);
        }
        return next;
      });
      setDataIndex((prevIndex) => prevIndex + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [dataIndex]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    if (chartRef.current) {
      chartRef.current.data = chartData;
      chartRef.current.options = chartOptions;
      chartRef.current.update();
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

  const headerHeight = 56;
  const chartHeight = Math.max(0, height - headerHeight);

  return (
    <Paper
      elevation={0}
      style={{
        border: "1px solid rgba(230, 81, 0, 0.2)",
        backgroundColor: "#FFFFFF",
        height: height,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        px={2}
        pt={2}
        pb={0}
        display="flex"
        alignItems="baseline"
        justifyContent="space-between"
        flexWrap="wrap"
      >
        <Typography variant="h6" style={{ color: "#333", fontWeight: 600 }}>
          CPU (Live)
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
