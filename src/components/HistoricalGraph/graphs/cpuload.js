import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Paper,
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@material-ui/core";
import Chart from "chart.js";
import sampleData from "../data/sampleData.json";

const WINDOW_MS = 3 * 60 * 1000;

const CpuLoad = ({ height = 320 }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  // sample json data
  const CpuLoadDataJSON = sampleData.cpuload;

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const [dataPoints, setDataPoints] = useState([]);
  const [dataIndex, setDataIndex] = useState(0); // Track which data point to add next
  const [maxDataPoints, setMaxDataPoints] = useState(10);

  // Auto-update data every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const nextIndex = dataIndex % CpuLoadDataJSON.length;
      const newDataPoint = {
        time: now,
        ...CpuLoadDataJSON[nextIndex],
      };

      setDataPoints((prevPoints) => {
        const next = [...prevPoints, newDataPoint];
        // Keep only the last N data points based on maxDataPoints
        if (next.length > maxDataPoints) {
          return next.slice(-maxDataPoints);
        }
        return next;
      });

      setDataIndex((prevIndex) => prevIndex + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [dataIndex, maxDataPoints, CpuLoadDataJSON]);
  const chartData = useMemo(() => {
    const now = Date.now();
    const cutoff = now - WINDOW_MS;
    const filteredPoints = dataPoints.filter((point) => point.time >= cutoff);

    const labels = filteredPoints.map((point) => formatTime(point.time));
    const load1minValues = filteredPoints.map(
      (point) => point.cpu_loadavg?.["1min"] ?? 0,
    );
    const load5minValues = filteredPoints.map(
      (point) => point.cpu_loadavg?.["5min"] ?? 0,
    );
    const load15minValues = filteredPoints.map(
      (point) => point.cpu_loadavg?.["15min"] ?? 0,
    );

    return {
      labels: labels.length ? labels : ["0:00"],
      datasets: [
        {
          label: "1 Minute Load Average",
          data: load1minValues,
          borderColor: "#1976d2",
          backgroundColor: "rgba(25, 118, 210, 0.1)",
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0.3,
        },
        {
          label: "5 Minute Load Average",
          data: load5minValues,
          borderColor: "#388e3c",
          backgroundColor: "rgba(56, 142, 60, 0.1)",
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0.3,
        },
        {
          label: "15 Minute Load Average",
          data: load15minValues,
          borderColor: "#f57c00",
          backgroundColor: "rgba(245, 124, 0, 0.1)",
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0.3,
        },
      ],
    };
  }, [dataPoints]);

  const chartOptions = useMemo(() => {
    const now = Date.now();
    const cutoff = now - WINDOW_MS;
    const filteredPoints = dataPoints.filter((point) => point.time >= cutoff);

    const load1minValues = filteredPoints.map(
      (point) => point.cpu_loadavg?.["1min"] ?? 0,
    );
    const load5minValues = filteredPoints.map(
      (point) => point.cpu_loadavg?.["5min"] ?? 0,
    );
    const load15minValues = filteredPoints.map(
      (point) => point.cpu_loadavg?.["15min"] ?? 0,
    );
    const allValues = [
      ...load1minValues,
      ...load5minValues,
      ...load15minValues,
    ];
    const maxValue = allValues.length > 0 ? Math.max(...allValues, 0.1) : 0.1;

    return {
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
            ticks: { autoSkip: true, fontSize: 10 },
          },
        ],
        yAxes: [
          {
            gridLines: { color: "rgba(0,0,0,0.06)" },
            ticks: {
              beginAtZero: true,
              max: Math.max(1.0, maxValue),
              stepSize: 0.25,
              fontSize: 11,
              fontColor: "#666",
              callback: (value) => value.toFixed(2),
            },
          },
        ],
      },
    };
  }, [dataPoints]);

  useEffect(() => {
    const ctx = chartRef.current?.getContext("2d");
    if (!ctx) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.data = chartData;
      chartInstanceRef.current.options = chartOptions;
      chartInstanceRef.current.update();
    } else {
      chartInstanceRef.current = new Chart(ctx, {
        type: "line",
        data: chartData,
        options: chartOptions,
      });
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
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
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h6" style={{ color: "#333", fontWeight: 600 }}>
          CPU Load Average (Live)
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
            {dataPoints.length}/{maxDataPoints}
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
          ref={chartRef}
          height={chartHeight}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </Paper>
  );
};

export default CpuLoad;
