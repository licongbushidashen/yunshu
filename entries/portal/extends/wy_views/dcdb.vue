<template>
  <div style="    height: 100%;    overflow-y: auto;">
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
      <a-form layout="inline" style="display:flex">
        <label style="line-height: 39px;margin-right: 10px;color:#000000d9"
          >截止日期</label
        >
        <a-form-item
          :colon="false"
          class="range-picker"
          ref="queryForm5"
          style="width:230px"
        >
          <a-range-picker
            class="workflow-name-input"
            format="YYYY-MM-DD"
            :placeholder="['开始时间', '结束时间']"
            v-model="queryData.time"
          />
        </a-form-item>
        <!-- <label
          style="    line-height: 39px;    margin-right: 10px;color:#000000d9"
          >单据状态</label
        >
        <a-select
          show-search
          style="width:160px;    padding-top: 5px;    margin-right: 20px;"
          v-model="sheetDataItem"
          allowClear
        >
          <template v-for="item in targetDataItems">
            <a-select-option :value="item.status" :key="item.status">{{
              item.name
            }}</a-select-option>
          </template>
        </a-select> -->
        <label
          style="    line-height: 39px;    margin-right: 10px;color: #000000d9;"
          >是否逾期</label
        >
        <a-select
          show-search
          style="width:160px;    padding-top: 5px;    margin-right: 20px;"
          v-model="sheetDataItem1"
          allowClear
        >
          <template v-for="item in targetDataItems1">
            <a-select-option :value="item.status" :key="item.status">{{
              item.name
            }}</a-select-option>
          </template>
        </a-select>
        <label
          style="    line-height: 39px;    margin-right: 10px;color: #000000d9;"
          v-if="Tindex == 1 || Tindex == 2 || Tindex == 3"
          >是否延期</label
        >
        <a-select
          v-if="Tindex == 1 || Tindex == 2 || Tindex == 3"
          show-search
          style="width:160px;    padding-top: 5px;    margin-right: 20px;"
          v-model="sheetDataItem2"
          allowClear
        >
          <template v-for="item in targetDataItems2">
            <a-select-option :value="item.status" :key="item.status">{{
              item.name
            }}</a-select-option>
          </template>
        </a-select>
        <label
          style="    line-height: 39px;    margin-right: 10px;color: #000000d9;"
          v-if="Tindex == 0 || Tindex == 4"
          >是否预警</label
        >
        <a-select
          v-if="Tindex == 0 || Tindex == 4"
          show-search
          style="width:160px;    padding-top: 5px;    margin-right: 20px;"
          v-model="sheetDataItem3"
          allowClear
        >
          <template v-for="item in targetDataItems3">
            <a-select-option :value="item.status" :key="item.status">{{
              item.name
            }}</a-select-option>
          </template>
        </a-select>
        <label
          style="    line-height: 39px;    margin-right: 10px;color: #000000d9;"
          v-if="Tindex == 2"
          >任务来源</label
        >
        <a-select
          v-if="Tindex == 2"
          show-search
          style="width:160px;    padding-top: 5px;    margin-right: 20px;"
          v-model="sheetDataItem4"
          allowClear
        >
          <template v-for="item in targetDataItems4">
            <a-select-option :value="item.name" :key="item.name">{{
              item.name
            }}</a-select-option>
          </template>
        </a-select>
        <label
          v-if="!$store.state.dept.name"
          for=""
          style="    line-height: 39px;    margin-right: 10px;color: #000000d9;"
          >承办部门</label
        >
        <staff-selector
          v-if="!$store.state.dept.name"
          style="width:200px;position: relative;    top: 4px;    margin-right: 20px;"
          v-model="depts"
          :options="taffSelectorOpts"
          @change="onValueChange"
          :params="{
            sourceType: 'portal'
          }"
        >
        </staff-selector>
        <span class="wy_search" @click="seach"> </span>
      </a-form>
      <!-- <div class="wy_change">
        <button class="wy_button">新增</button>
        <button class="wy_button nts">导入</button>
        <button class="wy_button nts">导出</button>
      </div> -->
      <div class="wy_table" style="margin-top:20px;"></div>
      <List v-if="childrenList" ref="lists" />
    </div>
  </div>
</template>
<script>
import Axios from "axios";
import List from "../views/wy_application-list.vue";
import list from "@cloudpivot/list/pc";
import StaffSelector from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";
import { userApi } from "@cloudpivot/api";
import {
  Form,
  Input,
  TreeSelect,
  Select,
  DatePicker,
  Table
} from "@h3/antd-vue";
export default {
  components: {
    AInput: Input,
    StaffSelector,
    AForm: Form,
    AFormItem: Form.Item,
    ASelect: Select,
    ASelectOption: Select.Option,
    ARangePicker: DatePicker.RangePicker,
    List: List
  },
  data() {
    return {
      taffSelectorOpts: {
        selectOrg: true,
        selectUser: false,
        showModel: true,
        mulpitle: false,
        showSelect: true,

        placeholder: "请选择",
        title: "选择部门"
      },
      depts: "",
      childrenList: false,
      Tindex: 0,
      sheetDataItem1: "",
      sheetDataItem2: "",
      sheetDataItem3: "",
      sheetDataItem4: "",
      sheetDataItem: "",
      targetDataItems4: [],
      targetDataItems1: [
        {
          name: "是",
          status: "是"
        },
        {
          name: "否",
          status: "否"
        }
      ],
      targetDataItems2: [
        {
          name: "是",
          status: "是"
        },
        {
          name: "否",
          status: "否"
        }
      ],
      targetDataItems3: [
        {
          name: "是",
          status: "是"
        },
        {
          name: "否",
          status: "否"
        }
      ],
      targetDataItems: [
        {
          name: "进行中",
          status: "PROCESSING"
        },
        {
          name: "已完成",
          status: "COMPLETED"
        },
        {
          name: "已作废",
          status: "CANCELED"
        },
        {
          name: "草稿",
          status: "DRAFT"
        }
      ],
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
  methods: {
    rw() {
      return Axios.get("/weiyuapi/authine-lowCode/dcdb/report/getRWLY", {});
    },
    onValueChange(value) {
      if (value.length > 0) {
        this.getUserDepartments(value[0].id);
      } else {
        this.departmentsList = [];
        this.departments = undefined;
      }
    },
    async getUserDepartments(userId) {
      const res = await userApi.getUserDepartments(userId);
      if (res && res.errcode === 0) {
        this.departmentsList = res.data;
        let resoure = res.data.find(d => d.isMain);
        this.departments = resoure.deptId;
      } else {
        this.$message.error(res.errmsg);
      }
    },
    test() {
      console.log(this.$refs.lists.$refs.queryForm);
    },
    datePick(val) {
      let time = new Date(val);
      let year = time.getFullYear();
      let mouth =
        time.getMonth() < 9 ? "0" + (time.getMonth() + 1) : time.getMonth() + 1;
      let day = time.getDate() < 9 ? "0" + time.getDate() : time.getDate();
      return year + "-" + mouth + "-" + day;
    },
    seach() {
      let dept = [];
      if (this.$store.state.dept.name) {
        this.depts = [this.$store.state.dept];
      }
      for (let i = 0; i < this.depts.length; i++) {
        dept.push({
          name: this.depts[i].name,
          id: this.depts[i].id,
          unitType: this.depts[i].unitType
        });
      }
      let depts = "";
      if (dept.length) {
        depts = JSON.stringify(dept);
      }

      window.wy_query = {
        select: this.sheetDataItem,
        time:
          this.queryData.time.length > 0
            ? this.datePick(this.queryData.time[0]) +
              ";" +
              this.datePick(this.queryData.time[1])
            : null,
        YQZT: this.sheetDataItem1,
        SFTQ: this.sheetDataItem2,
        YJ: this.sheetDataItem3,
        CBBM: depts,
        LY: this.sheetDataItem4
      };
      this.$refs.lists.reload();
    },
    change(item, index) {
      this.sheetDataItem = "";
      this.queryData = {
        time: [],
        workflowName: ""
      };
      let dept = [];
      if (this.$store.state.dept.name) {
        this.depts = [this.$store.state.dept];
      }
      for (let i = 0; i < this.depts.length; i++) {
        dept.push({
          name: this.depts[i].name,
          id: this.depts[i].id,
          unitType: this.depts[i].unitType
        });
      }
      let depts = "";
      if (dept.length) {
        depts = JSON.stringify(dept);
      }

      window.wy_query = {
        CBBM: depts
      };
      this.sheetDataItem1 = "";
      this.sheetDataItem2 = "";
      this.Tindex = index;
      this.$router.push({
        path: `/wyviews/dcdb?Tindex=${this.Tindex}`
      });
      this.$route.params.schemaCode = item.id;
      this.childrenList = false;
      this.$nextTick(() => {
        this.childrenList = true;
      });
    }
  },
  created: {},
  async mounted() {
    this.targetDataItems4 = await this.rw();
    if (this.$route.query.Tindex) {
      this.Tindex = this.$route.query.Tindex;
    }
    if (this.$route.query.sheetDataItem) {
      if (this.$route.query.code != "预警") {
        this.sheetDataItem = this.$route.query.sheetDataItem;
      }
    }
    if (this.$route.query.code) {
      let code = this.$route.query.code;
      switch (code) {
        case "预警":
          this.sheetDataItem3 = "是";
          this.sheetDataItem = "";
          break;
        case "逾期":
          this.sheetDataItem1 = "是";
          this.sheetDataItem = "";
          break;
        case "延期":
          this.sheetDataItem2 = "是";
          this.sheetDataItem = "";
          break;
        case "已完成":
          this.sheetDataItem = "COMPLETED";
          break;
      }
    }
    let dept = [];
    if (this.$store.state.dept.name) {
      this.depts = [this.$store.state.dept];
    }
    for (let i = 0; i < this.depts.length; i++) {
      dept.push({
        name: this.depts[i].name,
        id: this.depts[i].id,
        unitType: this.depts[i].unitType
      });
    }
    let depts = "";
    if (dept.length) {
      depts = JSON.stringify(dept);
    }

    window.wy_query = {
      CBBM: depts
    };
    this.$route.params.schemaCode = this.dcdb[this.Tindex].id;
    this.childrenList = true;
    this.seach();
  }
};
</script>
<style lang="less" scoped>
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
  background: url("../views/search.png");
  width: 30px;
  height: 30px;
  background-size: 100% 100%;
  margin-top: 6px;
}
.wy_select {
  margin-left: 60px;
  margin-right: 60px;
  margin-top: 10px;
  height: calc(100% - 180px);
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
      cursor: pointer;
      &:hover {
        color: #be0404;
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
  }
}
</style>
