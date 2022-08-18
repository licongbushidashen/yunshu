let option = {
  backgroundColor: "#ffffff",
  color: ["#37A2DA", "#32C5E9", "#67E0E3"],

  series: [
    {
      title: {
        offsetCenter: [0, "-30%"],
        fontSize: 14
      },
      name: "业务指标",
      type: "gauge",
      detail: {
        formatter: "{value}%",
        fontSize: "22px"
      },
      center: ["50%", "49%"],
      splitLine: {
        show: false,
        distance: 0
      },
      axisLabel: {
        color: "auto"
      },
      axisLine: {
        show: true,
        lineStyle: {
          width: 10,
          shadowBlur: 0,
          color: [[0.2, "#A2312E"], [0.8, "#627B93"], [1, "#96BFA6"]]
        }
      },
      axisTick: {
        length: "5%",
        distance: 0.5
      },
      data: []
    }
  ]
};
let lineoption = {
  grid: {
    left: "0%",
    right: "0%",
    bottom: "0%",
    top: "10%",
    containLabel: true
  },
  tooltip: {
    trigger: "axis"
    // axisPointer: {
    //   type: "cross",
    //   crossStyle: {
    //     color: "#999"
    //   }
    // }
  },

  legend: {
    left: "3%",
    top: "0%"
  },
  xAxis: [
    {
      type: "category",
      data: [],
      axisPointer: {
        type: "shadow"
      },
      axisLabel: {
        fontSize: 15,
        color: "#333",
        interval: 0
      }
    }
  ],
  yAxis: [
    {
      splitLine: {
        show: false
      },
      type: "value",
      name: "",
      interval: 50,
      axisLabel: {
        formatter: "{value}"
      }
    },
    {
      splitLine: {
        show: false
      },
      type: "value",
      name: "",
      min: 0,
      max: 1,
      interval: 0.1,
      axisLabel: {
        formatter: "{value}"
      }
    }
  ],
  series: [
    {
      barWidth: 30,
      name: "总任务数",
      type: "bar",
      tooltip: {
        valueFormatter: function(value) {
          return value;
        }
      },
      data: []
    },
    {
      barWidth: 30,
      name: "已完成数",
      type: "bar",
      tooltip: {
        valueFormatter: function(value) {
          return value;
        }
      },
      data: []
    },
    {
      name: "完成率",
      type: "line",
      yAxisIndex: 1,
      smooth: true,
      tooltip: {
        valueFormatter: function(value) {
          return (value * 100).toFixed(2) + "%";
        }
      },
      data: []
    }
  ]
};
export default { option, lineoption };
