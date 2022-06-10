import React from "react";
import {Line} from "react-chartjs-2";
import PropTypes from "prop-types";

var options = {
  layout: {
    padding: {
      right: 25,
      left: 25,
    },
  },
  tooltips: {
    mode: "index",
    intersect: false,
    callbacks: {
      label(tooltipItems, data) {
        return `INR ${tooltipItems.yLabel}`;
      },
    },
    displayColors: false,
  },
  hover: {
    mode: "index",
    intersect: false,
  },
  maintainAspectRatio: false,
  responsive: true,
  legend: {
    display: false,
  },
  scales: {
    xAxes: [
      {
        display: false,
      },
    ],
    fontStyle: "bold",
    yAxes: [
      {
        gridLines: {
          color: "rgba(0, 0, 0, 0)",
        },
        fontStyle: "bold",

        ticks: {
          callback(value) {
            return "INR " + value.toFixed(2);
          },
        },
      },
    ],
  },
  elements: {
    point: {
      radius: 0,
    },
    line: {
      borderCapStyle: "round",
      borderJoinStyle: "round",
    },
  },
};

const FullChart = ({
  month,
  stockData,
  data1,
  changeFocus,
  getOneMonthChart,
  getOneMonthFutureChart,
}) => (
  <div className="Chart">
    <Line data={data1} options={options} />
    <div className="Chart__timers">
      <h6
        className="Chart__option"
        ref={month}
        id="1m"
        onClick={() => {
          getOneMonthChart();
        }}>
        1 month
      </h6>
      <h6
        className="Chart__option"
        ref={month}
        id="1M+"
        onClick={() => {
          getOneMonthFutureChart();
        }}>
        Forecast next month
      </h6>
    </div>
  </div>
);

FullChart.propTypes = {
  getOneMonthChart: PropTypes.func,
  getOneMonthFutureChart:PropTypes.func,
  getOneDayChart: PropTypes.func,
  data1: PropTypes.func,
  stockData: PropTypes.object,
  month: PropTypes.object,
};

export default FullChart;
