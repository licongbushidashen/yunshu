<template>
  <div style="margin-bottom:10px">
    <div class="wy_tabs">
      <ul>
        <li
          v-for="(item, index) in dcdb"
          :key="index"
          @click="change(item, index)"
        >
          <span :class="Tindex == index ? 'active' : ''">{{ item.label }}</span>
        </li>
      </ul>
    </div>
    <div class="wy_select">
      <a-spin tip="Loading..." :spinning="isLoading">
        <div class="top_select">
          <div></div>
          <div>
            <a-select
              style="width: 130px !important"
              v-model="rwly"
              v-if="Tindex == 2"
              @change="test"
            >
              <a-select-option
                v-for="(item, index) in rwlys"
                :key="index"
                :value="item.name"
              >
                {{ item.name }}
              </a-select-option>
            </a-select>
            <a-select style="width: 200px" v-model="years" @change="test">
              <a-select-option
                v-for="(item, index) in year"
                :key="index"
                :value="item"
              >
                {{ item }}
              </a-select-option>
            </a-select>
            <a-select
              style="width: 110px !important"
              v-model="yearTpyes"
              @change="test"
            >
              <a-select-option
                v-for="(item, index) in yearTpye"
                :key="index"
                :value="item.name"
              >
                {{ item.name }}
              </a-select-option>
            </a-select>
          </div>
        </div>
        <div class="home_value">
          <div class="task">
            <div
              class="task_all"
              v-for="(item, index) in tasks"
              :key="index"
              @click="open(item)"
            >
              <h1>
                <span style="vertical-align: text-bottom;">
                  {{ item.name }}:</span
                >
                <span
                  :style="{ color: item.color || '#185c5c' }"
                  style="font-size: 25px;"
                >
                  {{ item.num }}</span
                >
              </h1>
            </div>
          </div>
          <div class="echarts">
            <div
              v-for="(item, index) in echar"
              :key="index"
              :ref="item.ref"
            ></div>
            <!-- <div ref="ids"></div> -->
          </div>
          <div
            class="echartline"
            style="    position: relative;    top: -10px;"
          >
            <div ref="echline"></div>
          </div>
        </div>
      </a-spin>
    </div>
  </div>
</template>
<script>
import Axios from "axios";
import option from "./home.js";
import List from "../views/wy_application-list.vue";
import "echarts/lib/chart/gauge";
import "echarts/lib/chart/bar";
import "echarts/lib/chart/line";
import "echarts/lib/component/tooltip";
import "echarts/lib/component/toolbox";
import "echarts/lib/component/legend";
import "echarts/lib/component/axisPointer";
import "echarts/lib/component/title";
import "echarts/lib/component/grid";
const echarts = require("echarts/lib/echarts");
import {
  Form,
  Input,
  TreeSelect,
  Select,
  DatePicker,
  Table
} from "@h3/antd-vue";
import { conformsTo } from "lodash";
export default {
  components: {
    AInput: Input,
    AForm: Form,
    AFormItem: Form.Item,
    ASelect: Select,
    ASelectOption: Select.Option,
    ARangePicker: DatePicker.RangePicker,
    List: List
    // List: list.components.ApplicationList
  },
  data() {
    return {
      charts: {},
      isLoading: false,
      rwlys: [],
      rwly: "",
      years: "",
      year: [],
      yearTpyes: "",
      yearTpye: [],
      tasks: [],
      echar: [],
      childrenList: false,
      Tindex: 0,
      sheetDataItem: "",
      targetDataItems: [],
      queryData: {
        time: [],
        workflowName: ""
      },
      dcdb: [
        {
          label: "实验室年度重点工作",
          id: "ZDGZ"
        },
        {
          label: "实验室主任批示",
          id: "ZRPSD"
        },
        {
          label: "日常督办事项",
          id: "DBX"
        },
        {
          label: "上级批示",
          id: "LDPS"
        },
        {
          label: "省年度重点工作",
          id: "SRW"
        }
      ]
    };
  },
  created() {},
  async mounted() {
    // document.title = `督查督办系统-${this.$route.meta.title}` || "督查督办系统";
    this.isLoading = true;
    this.$route.params.schemaCode = "ZDGZ";
    let res = await this.tj();
    let res1 = await this.rw();
    this.rwlys = res1;
    this.rwly = res1[0].name;
    this.year = res.year;
    this.years = res.year[0];
    this.yearTpyes = res.season[0].name;
    this.yearTpye = res.season;
    this.vy_all();
    this.childrenList = true;
    let _this = this;
    window.addEventListener("resize", () => {
      _this.charts.resize();
    });
  },
  methods: {
    open(item) {
      this.$router.push({
        path: "/wyviews/dcdb",
        query: {
          Tindex: this.Tindex,
          sheetDataItem: item.type,
          code: item.code
        }
      });
    },
    test() {
      this.vy_all();
    },
    rw() {
      return Axios.get("/weiyuapi/authine-lowCode/dcdb/report/getRWLY", {});
    },
    tj() {
      return Axios.get(
        "/weiyuapi/authine-lowCode/dcdb/report/getReportData",
        {}
      );
    },
    vy_all() {
      this.isLoading = true;
      return Axios.get("/weiyuapi/authine-lowCode/dcdb/report/getYearData", {
        params: {
          code: this.$route.params.schemaCode,
          year: this.years,
          stage: this.yearTpyes,
          rwly: this.rwly
        }
      }).then(res => {
        this.tasks = res.task;
        this.initCharts(res.probability, res.deptTask);
        this.isLoading = false;
      });
    },
    change(item, index) {
      this.Tindex = index;
      if (this.Tindex == 2) {
        this.rwly = "全部";
      } else {
        this.rwly = "";
      }
      this.$route.params.schemaCode = item.id;
      this.childrenList = false;
      this.$nextTick(() => {
        this.childrenList = true;
      });
      this.vy_all();
    },
    initCharts(list, lines) {
      for (let i = 0; i < list.length; i++) {
        if (!this.echar[i]) {
          this.echar.push({ ref: "id" + i });
        }
        this.$nextTick(() => {
          const container = this.$refs[this.echar[i].ref][0];
          const chartOptions = JSON.parse(JSON.stringify(option.option));
          if (list[i].type == 1) {
            chartOptions.series[0].axisLine = {
              show: true,
              lineStyle: {
                width: 10,
                shadowBlur: 0,
                color: [[0.2, "#96BFA6"], [0.8, "#627B93"], [1, "#A2312E"]]
              }
            };
            if (list[i].rate > 80) {
              chartOptions.series[0].detail.color = "#A2312E";
            } else if (list[i].rate > 20) {
              chartOptions.series[0].detail.color = "#627B93";
            } else if (list[i].rate >= 0) {
              chartOptions.series[0].detail.color = "#96BFA6";
            }
          } else if (list[i].type == 2) {
            chartOptions.series[0].axisLine = {
              show: true,
              lineStyle: {
                width: 10,
                shadowBlur: 0,
                color: [[0, "#627B93"], [0.5, "#627B93"], [1, "#A2312E"]]
              }
            };
            if (list[i].rate > 50) {
              chartOptions.series[0].detail.color = "#A2312E";
            } else if (list[i].rate >= 0) {
              chartOptions.series[0].detail.color = "#627B93";
            }
            chartOptions.series[0].min = 0;
            chartOptions.series[0].max = list[i].total;
            chartOptions.series[0].splitNumber = 10;
            chartOptions.series[0].detail.formatter = "{value}";
          } else {
            if (list[i].rate > 80) {
              chartOptions.series[0].detail.color = "#96BFA6";
            } else if (list[i].rate > 20) {
              chartOptions.series[0].detail.color = "#627B93";
            } else if (list[i].rate >= 0) {
              chartOptions.series[0].detail.color = "#A2312E";
            }
          }
          list[i].rate = Number(list[i].rate)
            ? Number(list[i].rate).toFixed(2)
            : 0;
          chartOptions.series[0].data = [
            {
              value: list[i].rate,
              name: list[i].name
            }
          ];
          const chart = echarts.init(container);
          chart.setOption(chartOptions);
        });
      }
      this.$nextTick(() => {
        const container = this.$refs["echline"];
        let all = [];
        for (var i = 0; i < lines.total.length; i++) {
          all.push(
            lines.complete[i] ? lines.complete[i] / lines.total[i] : "0"
          );
        }
        const chartOptions = JSON.parse(JSON.stringify(option.lineoption));
        chartOptions.xAxis[0].data = lines.name;
        chartOptions.series[0].data = lines.total;
        chartOptions.series[1].data = lines.complete;
        chartOptions.series[2].data = all;
        chartOptions.series[2].tooltip = {
          valueFormatter: function(value) {
            let num = value * 100;
            if ((num | 0) === num) {
              return value * 100 + "%";
            } else {
              return (value ? (value * 100).toFixed(2) : 0) + "%";
            }
          }
        };
        const chart = echarts.init(container);
        this.charts = chart;
        chart.setOption(chartOptions);
      });
    }
  }
};
</script>
<style lang="less" scoped>
.ant-spin-nested-loading {
  height: 100%;
  /deep/.ant-spin-container {
    height: 100%;
  }
  .home_value {
    height: calc(100% - 66px);
  }
}
.home_value {
  margin-top: 27px;
  padding: 0px 20px;
  padding-bottom: 10px;
  .echartline {
    min-height: 370px;
    border: 1px solid #e0e0e0ab;
    padding: 20px;
    box-shadow: 0px 2px 8px 0px #1e55ff1a;

    > div {
      min-height: 350px;
    }
  }
  .echarts {
    height: 280px;
    display: flex;
    justify-content: space-around;
    > div {
      width: 300px;
    }
  }
  .task {
    display: flex;
    justify-content: space-around;
    .task_all:last-child {
      margin: 0px;
    }
    .task_all {
      cursor: pointer;
      width: 200px;
      border: 1px solid #e0e0e0b5;
      padding: 10px 0px;
      border-radius: 6px;
      h1 {
        color: #333;
        margin: 0px;
        font-size: 18px;
      }
      h2 {
        color: #185c5c;
        margin: 0px;
        font-size: 16px;
      }
      h1,
      h2 {
        text-align: center;
      }
    }
  }
}
.wy_change {
  margin-top: 20px;
}
.wy_button {
  width: 90px;
  height: 30px;
  margin-right: 30px;
  border-radius: 3px;
}
.wy_button.nts {
  background: none;
  border: 1px solid #e0e0e0;
}
.wy_search {
  border-radius: 4px;
  background: #991212;
  width: 25px;
  display: inline-block;
  height: 25px;
  margin-top: 9px;
}
.wy_select {
  border: 1px solid #e0e0e0ad;
  padding-top: 6px;
  margin-left: 60px;
  margin-right: 60px;
  margin-top: 10px;
  margin-bottom: 10px;
  box-shadow: 0px 2px 8px 0px #1e55ff1a;
}
.wy_tabs {
  border-top: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
  width: 100%;
  margin-top: 10px;
  height: 70px;
  line-height: 70px;
  padding-left: 40px;
  ul {
    display: flex;
    li {
      color: #000;
      font-size: 18px;
      &:hover {
        color: #be0404;
        cursor: pointer;
      }
      &::after {
        content: "";
        display: inline-block;
        height: 20px;
        width: 1px;
        background: #e0e0e0;
        position: relative;
        top: 4px;
        margin: 0px 20px;
      }
    }
    li:last-child {
      &::after {
        width: 0px;
      }
    }
    .active {
      color: #be0404;
      position: relative;
      // &::before {
      //   content: "";
      //   display: block;
      //   position: absolute;
      //   width: 0;
      //   height: 0;
      //   top: 45px;
      //   left: 43%;
      //   border-width: 8px 8px 0;
      //   border-style: solid;
      //   border-color: #e4e4ec transparent transparent; /*黄 透明 透明 */
      // }
      // &::after {
      //   content: "";
      //   display: block;
      //   position: absolute;
      //   top: 43px;
      //   left: 43%;
      //   border-left: 8px solid transparent;
      //   border-right: 8px solid transparent;
      //   border-top: 8px solid #fff;
      // }
    }
    .active {
      color: #be0404;
    }
  }
}
.top_select {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #e0e0e0ad;
  padding-bottom: 6px;

  > div {
    .ant-select {
      margin-right: 5px;
      width: 80px !important;
    }
  }
}
</style>
