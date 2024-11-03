import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

const BarChart = ({
  data,
  categories,
  colors,
  height,
  title,
  styleTitle,
  maxCount,
  min,
  positionTitle,
  showYAxis = true,
  columnWidth = 55,
  customColors = false,
  curentTime,
  xasis,
  tooltip = {},
  showGrid = false,
  yaxis,
}) => {
  const series = data;

  const [maxNumber, setMaxNumber] = useState(5);

  const getMaxNumber = () => {
    // Get max value from data and round it up
    setMaxNumber(Math.ceil(Math.max(...data[0].data)));
  }

  useEffect(() => {
    if(data[0].data && data[0].data.length > 0) {
      getMaxNumber();
    }
  }, [data]);

  const options = {
    chart: {
      type: "bar",
      // height: 350,
      stacked: true,
      toolbar: {
        show: true,
      },
      background: "transparent",
    },
    colors: customColors
      ? [
          function ({ value, dataPointIndex, seriesIndex }) {
            if (dataPointIndex === curentTime) {
              return customColors;
            } else {
              return colors[seriesIndex];
            }
          },
        ]
      : colors,
    legend: {
      position: "top",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: `${columnWidth}%`,
        endingShape: "rounded",
        borderRadius: 3, // Adjust the border radius value as needed
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: categories,
      floating: categories.length > 15 ? true : false,
      ...xasis,
    },
    yaxis: {
      show: showYAxis,
      max: maxCount ? maxCount : maxNumber,
      title: {
        text: title,
        style: styleTitle,
      },
      labels: {
        formatter: function (val) {
          return val.toFixed(1);
        },
      },
      ...yaxis,
    },
    fill: {
      opacity: 1,
      // colors: colors,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val;
        },
      },
      ...tooltip,
    },
    grid: {
      show: showGrid,
      // borderColor: "transparent", // Remove grid border
    },
  };

  return (
    <div id="chart" className="">
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        width={"100%"}
        height={height}
      />
    </div>
  );
};

export default BarChart;
