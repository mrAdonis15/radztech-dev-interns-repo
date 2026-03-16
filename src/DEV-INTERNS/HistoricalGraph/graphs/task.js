import React, { useState, useRef, useEffect } from "react";
import { Paper, Typography, Box, Button } from "@material-ui/core";
import Chart from 'chart.js';
import sampleData from '../data/sampleData.json';

const WINDOW_MS = 3 * 60 * 1000;

function getTaskChart(data, intervalMs = 1000) {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;

  const labels = [];
  const runningTasks = [];
  const totalTasks = [];
  const threads = [];

  data.forEach((d, i) => {
    const t = d.timestamp ?? now - (data.length - 1 - i) * intervalMs;
    if (t < cutoff) return;

    labels.push(
      new Date(t).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' })
    );

    runningTasks.push(d.running ?? 0);
    totalTasks.push(d.tasks ?? d.totalTasks ?? 0);
    threads.push(d.threads ?? 0);
  });

  if (labels.length === 0) {
    labels.push('0:00');
    runningTasks.push(0);
    totalTasks.push(0);
    threads.push(0);
  }

  const datasets = [
    {
      label: 'Running Tasks',
      data: runningTasks,
      borderColor: '#1976d2',
      backgroundColor: 'rgba(25, 118, 210, 0.1)',
      borderWidth: 2,
      fill: false,
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.3,
    },
    {
      label: 'Total Tasks',
      data: totalTasks,
      borderColor: '#388e3c',
      backgroundColor: 'rgba(56, 142, 60, 0.1)',
      borderWidth: 2,
      fill: false,
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.3,
    },
    {
      label: 'Threads',
      data: threads,
      borderColor: '#f57c00',
      backgroundColor: 'rgba(245, 124, 0, 0.1)',
      borderWidth: 2,
      fill: false,
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.3,
    },
  ];

  const chartData = {
    labels: labels.length ? labels : ['0:00'],
    datasets,
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        fontColor: '#333',
        padding: 15,
        boxWidth: 30,
      },
    },
    tooltips: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(33,33,33,0.9)',
      titleFontColor: '#fff',
      bodyFontColor: '#fff',
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
          gridLines: { color: 'rgba(0,0,0,0.06)' },
          ticks: {
            beginAtZero: true,
            fontSize: 11,
            fontColor: '#666',
          },
        },
      ],
    },
  };

  const last = data[data.length - 1];
  const currentRunning = last?.running ?? 0;
  const currentTotal = last?.tasks ?? last?.totalTasks ?? 0;
  const currentThreads = last?.threads ?? 0;

  return { chartData, chartOptions, currentRunning, currentTotal, currentThreads };
}

export default function Task({ intervalMs = 1000, height = 320 }) {
  const [localData, setLocalData] = useState([]);
  const [dataIndex, setDataIndex] = useState(0);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const maxDataPoints = sampleData.task.length;

  const { chartData, chartOptions } =
    getTaskChart(localData, intervalMs);

  const isMax = dataIndex >= maxDataPoints;

  function addDataPoint() {
    if (isMax) return;

    const now = Date.now();
    const newTask = {
      ...sampleData.task[dataIndex],
      timestamp: now,
    };

    setLocalData((prev) => {
      const next = [...prev, newTask];
      if (next.length > maxDataPoints) return next.slice(-maxDataPoints);
      return next;
    });
    setDataIndex((prevIndex) => prevIndex + 1);
  }

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    if (chartRef.current) {
      chartRef.current.data = chartData;
      chartRef.current.options = chartOptions;
      chartRef.current.update();
    } else {
      chartRef.current = new Chart(ctx, {
        type: 'line',
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
        border: '1px solid rgba(230, 81, 0, 0.2)',
        backgroundColor: '#FFFFFF',
        height: height,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box px={2} pt={2} pb={0} display="flex" alignItems="baseline" justifyContent="space-between" flexWrap="wrap">
        <Typography variant="h6" style={{ color: '#333', fontWeight: 600 }}>
          Tasks
        </Typography>
        <div>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={addDataPoint}
            disabled={isMax}
          >
            Add Data ({localData.length}/{maxDataPoints})
          </Button>
        </div>
      </Box>
      <div style={{ height: chartHeight, padding: '0 8px 8px', position: 'relative' }}>
        <canvas ref={canvasRef} height={chartHeight} style={{ width: '100%', height: '100%' }} />
      </div>
    </Paper>
  );
}
