import React, { useEffect, createRef } from "react";
import { Chart, registerables } from "chart.js";
import { styled } from "@material-ui/core/styles";

import { PropTypes } from "prop-types";

const DATASETS = {
  production: 1,
  plannedProduction: 2,
  oee: 3,
  statuses: 4
};

const production = {
  id: DATASETS.production,
  data: [
    { y: 90.5, x: 1 },
    { y: 100.5, x: 2 },
    { y: 105.5, x: 3 },
    { y: 125.5, x: 4 },
    { y: 175.5, x: 5 },
    { y: 220.5, x: 6 }
  ],
  fill: false,
  lineTension: 0,
  pointBackgroundColor: "#2BD195",
  borderColor: "#2BD195",
  borderWidth: 2,
  radius: 4,
  showLine: true,
  yAxisID: "y",
  label: "Production",
  type: "line"
};

const plannedProduction = {
  id: DATASETS.plannedProduction,
  fill: false,
  lineTension: 0,
  borderColor: "#FEA339",
  pointBackgroundColor: "#FEA339",
  borderWidth: 2,
  radius: 3,
  showLine: true,
  label: "Planned production",
  data: [
    { y: 107.5, x: 1 },
    { y: 120.5, x: 2 },
    { y: 130.5, x: 3 },
    { y: 152.5, x: 4 },
    { y: 200.5, x: 5 },
    { y: 250.5, x: 6 }
  ],
  yAxisID: "y",
  type: "line"
};

const oee = {
  id: DATASETS.oee,
  label: "OEE",
  order: 2,
  fill: false,
  lineTension: 0,
  pointBackgroundColor: "#84868F",
  borderColor: "#84868F",
  borderWidth: 2,
  radius: 3,
  pointRadius: 0,
  hitRadius: 3,
  showLine: true,
  yAxisID: "y1",
  data: [
    { y: 0.75, x: 1, foo: "bar" },
    { y: 0.88, x: 2 },
    { y: 0.66, x: 3 },
    { y: 0.92, x: 4 },
    { y: 0.95, x: 5 },
    { y: 0.98, x: 6 }
  ],
  type: "line"
};

const statuses = {
  id: DATASETS.statuses,
  pointStyle: "rect",
  pointRadius: 2,
  type: "scatter",
  data: [
    { y: 0.75 - 0.02, x: 1 },
    { y: 0.88 - 0.02, x: 2 },
    { y: 0.66 - 0.02, x: 3 },
    { y: 0.92 - 0.02, x: 4 },
    { y: 0.95 - 0.02, x: 5 },
    { y: 0.98 - 0.02, x: 6 }
  ],
  yAxisID: "y1",
  pointBackgroundColor: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"]
};

const footer = (tooltipItems) => {
  let sum = 0;

  tooltipItems.forEach(function (tooltipItem) {
    sum += tooltipItem.parsed.y;
  });
  return "Sum: " + sum;
};

const title = (tooltipItem) => {
  return tooltipItem[0].dataset.label;
};

const label = (tooltipItem) => {
  return `sss - ${tooltipItem.formattedValue}`;
};

const tooltipStyled = styled("div")({
  background: "rgba(255, 255, 255, 1)",
  borderRadius: "8px",
  color: "black",
  opacity: 1,
  pointerEvents: "none",
  position: "absolute",
  transform: "translate(-50%, 0)",
  transition: "all .1s ease",
  boxShadow: "0px 3px 6px #00000029",
  font: "Roboto",
  padding: "1rem"
});

const getOrCreateTooltip = (chart) => {
  let tooltipEl = chart.canvas.parentNode.querySelector("div");

  if (!tooltipEl) {
    tooltipEl = document.createElement("div");
    tooltipEl.style.background = "rgba(255, 255, 255, 1)";
    tooltipEl.style.borderRadius = "8px";
    tooltipEl.style.color = "black";
    tooltipEl.style.opacity = 1;
    tooltipEl.style.pointerEvents = "none";
    tooltipEl.style.position = "absolute";
    tooltipEl.style.transform = "translate(-50%, 0)";
    tooltipEl.style.transition = "all .1s ease";
    tooltipEl.style.boxShadow = "0px 3px 6px #00000029";
    tooltipEl.style.font = "Roboto";
    tooltipEl.style.padding = "1rem";

    const table = document.createElement("table");
    table.style.margin = "0px";

    tooltipEl.appendChild(table);
    chart.canvas.parentNode.appendChild(tooltipEl);
  }

  return tooltipEl;
};

const externalTooltipHandler = (context) => {
  const { chart, tooltip } = context;
  const tooltipEl = getOrCreateTooltip(chart);

  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = 0;
    return;
  }

  if (tooltip.body) {
    const titleLines = tooltip.title || [];
    const bodyLines = tooltip.body.map((b) => b.lines);

    const tableHead = document.createElement("thead");

    titleLines.forEach((title) => {
      const tr = document.createElement("tr");
      tr.style.borderWidth = 0;

      const th = document.createElement("th");
      th.style.borderWidth = 0;
      const text = document.createTextNode(title);

      th.appendChild(text);
      tr.appendChild(th);
      tableHead.appendChild(tr);
    });

    const tableBody = document.createElement("tbody");
    bodyLines.forEach((body, i) => {
      const tr = document.createElement("tr");
      tr.style.backgroundColor = "inherit";
      tr.style.borderWidth = 0;

      const td = document.createElement("td");
      td.style.borderWidth = 0;

      const text = document.createTextNode(body);

      td.appendChild(text);
      tr.appendChild(td);
      tableBody.appendChild(tr);
    });

    const tableRoot = tooltipEl.querySelector("table");

    while (tableRoot.firstChild) {
      tableRoot.firstChild.remove();
    }

    tableRoot.appendChild(tableHead);
    tableRoot.appendChild(tableBody);
  }

  const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

  tooltipEl.style.opacity = 1;
  tooltipEl.style.left = positionX + tooltip.caretX + "px";
  tooltipEl.style.top = positionY + tooltip.caretY + "px";
};

const LineChart = ({ data }) => {
  const chartRef = createRef();
  Chart.register(...registerables);
  let chart;

  useEffect(() => {
    if (!chart) {
      chart = new Chart(chartRef.current, {
        data: {
          datasets: [oee, statuses, plannedProduction, production]
        },
        options: {
          interaction: {
            mode: "nearest"
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                footer: footer,
                label: label,
                title: title
              },
              backgroundColor: "#fff",
              titleColor: "#000",
              bodyColor: "#000",
              footerColor: "#000",
              displayColors: false,
              usePointStyle: true,
              enabled: false,
              external: externalTooltipHandler
            }
          },
          scales: {
            x: {
              type: "linear",
              position: "bottom",
              stacked: 8,
              min: 0,
              max: 8
            },
            y: {
              display: true,
              position: "left",
              grid: {
                drawOnChartArea: false
              }
            },
            y1: {
              display: true,
              position: "right",
              stacked: 100,
              ticks: {
                beginAtZero: true,
                callback(value) {
                  return `${value * 100}%`;
                }
              },
              min: 0,
              max: 1
            }
          }
        }
      });
    }

    return () => chart.destroy();
  }, [data]);

  return <canvas ref={chartRef} />;
};

LineChart.propTypes = {
  data: PropTypes.array.isRequired
};

export default LineChart;
