<template>
  <div style="    height: 100%;     overflow-y: auto;">
    <div class="wy_tabs">
      <ul>
        <li
          v-for="(item, index) in dcdb"
          :key="index"
          @click="change(item, index)"
          style="position: relative;"
        >
          <span :class="Tindex == index ? 'active' : ''">{{ item.label }}</span>
          <span
            v-if="item.num"
            style=" background: rgb(186, 5, 5);
                    border-radius: 50%;
                    width: 22px;
                    height: 22px;
                    line-height: 22px;
                    display: inline-block;
                    position: absolute;
                    top: 11px;
                    right: 25px;
                    font-size: 12px;
                    text-align: center;
                    color: rgb(255, 255, 255);"
            >{{ item.num }}</span
          >
        </li>
      </ul>
    </div>
    <div class="wy_select">
      <a-form
        layout="inline"
        style="display:flex"
        v-if="Tindex == 1 || Tindex == 2 || Tindex == 3"
      >
        <!-- <label
          style="    line-height: 43px;    margin-right: 10px;color:#000000d9"
          >单据号</label
        >
        <a-form-item :colon="false" ref="queryForm1">
          <a-input
            placeholder="单据号"
            v-model="queryData.sequenceNo"
            class="workflow-name-input"
          ></a-input>
        </a-form-item> -->
        <!-- <label
          style="    line-height: 43px;    margin-right: 10px;color:#000000d9"
          >任务名称</label
        >
        <a-form-item :colon="false" ref="queryForm1">
          <a-input
            placeholder="任务名称"
            v-model="queryData.workflowName"
            class="workflow-name-input"
          ></a-input>
        </a-form-item> -->
        <!-- <label
          style="    line-height: 43px;    margin-right: 10px;color:#000000d9"
          >当前节点</label
        >
        <a-form-item :colon="false" ref="queryForm1">
          <a-input
            placeholder="审批节点"
            v-model="queryData.activityName"
            class="workflow-name-input"
          ></a-input>
        </a-form-item> -->
        <!-- <label
          style="    line-height: 43px;    margin-right: 10px;color:#000000d9"
          >处理人</label
        >
        <StaffSelector
          style="width: 200px;    display: inline-block;    margin-right: 16px;    margin-bottom: 0;    height: 40px;    position: relative;    top: 5px;"
          class="workflow-name-input"
          v-model="queryData.participantName"
          :options="setMulti2()"
          :onlyForm="true"
          :visiblePart="true"
        >
        </StaffSelector> -->
        <!-- <span class="wy_search" @click="seach"> </span> -->
      </a-form>
      <!-- <div class="wy_change">
        <button class="wy_button">新增</button>
        <button class="wy_button nts">导入</button>
        <button class="wy_button nts">导出</button>
      </div> -->
      <div class="wy_table" style="margin-top:20px;"></div>
      <List
        v-if="childrenList"
        ref="lists"
        class="wy_work"
        @onparchange="onparchange"
      />
    </div>
  </div>
</template>
<script>
import Axios from "axios";
import OAuthApi from "@/apis/oauth";
import { workflowCenterApi } from "@cloudpivot/api";
import formPc from "@cloudpivot/form/src/renderer/components/pc";
import List from "../views/my-unfinished";
import list from "@cloudpivot/list/pc";
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
    StaffSelector: formPc.StaffSelector,
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
      childrenList: false,
      Tindex: 0,
      sheetDataItem: "",
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
        activityName: "",
        sequenceNo: "",
        workflowName: "",
        participantName: "",
        workflowCode: "default_1646217559189"
      },
      dcdb: [
        {
          label: "实验室年度重点工作",
          //   id: "ZDGZ"
          id: "default_1646217559189",
          num: 0
        },
        {
          label: "实验室主任批示",
          //   id: "ZRPSD"
          id: "default_1646214214918",
          num: 0
        },
        {
          label: "日常督办事项",
          //   id: "DBX"
          id: "RCLC",
          num: 0
        },
        {
          label: "上级批示",
          id: "LDPS",
          num: 0
        },
        {
          label: "省年度重点工作",
          //   id: "SRW"
          id: "default_1646218936192",
          num: 0
        }
      ]
    };
  },
  methods: {
    setMulti2() {
      return {
        selectOrg: true,
        selectUser: false,
        mulpitle: false,
        showModel: true,
        showSelect: true,
        placeholder: "请选择"
        // maxTagCount: 1,
      };
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
      let prome = {};
      this.$refs.lists.onSearch(this.queryData);
    },
    change(item, index) {
      this.queryData = {
        activityName: "",
        sequenceNo: "",
        workflowName: "",
        participantName: "",
        workflowCode: this.dcdb[index].id
      };
      this.Tindex = index;
      this.$route.params.schemaCode = item.id;
      this.$nextTick(() => {
        this.seach();
      });
    },
    async numall() {
      const res = await OAuthApi.getUserInfo();
      // console.log(res, 123123123);
      // res.data?.employeeNo ||
      let num = await Axios.get(
        `/weiyuapi/authine-lowCode/RuntimeForm/getWaitTodo?gh=${(res.data
          ? res.data.userId
          : "") || "000814"}`,
        {}
      );
      let data = num.data;
      this.$store.state.wynum = data.total;
      for (let i = 0; i < this.dcdb.length; i++) {
        if (data[this.dcdb[i].id] != undefined) {
          this.dcdb[i].num = data[this.dcdb[i].id];
        }
      }
    },
    // async getUnfinishedWorkflowItems(type) {
    //   const params = {
    //     wd: "", //以前接口需要的参数
    //     workflowName: "",
    //     workflowCode: type,
    //     originator: "",
    //     workflowTplName: "",
    //     batchOperate: false,
    //     page: 0,
    //     size: 1,
    //     workItemSource: ""
    //   };

    //   const res = await workflowCenterApi.searchWorkitems(params);
    //   for (let i = 0; i < this.dcdb.length; i++) {
    //     if (type == this.dcdb[i].id) {
    //       this.dcdb[i].num = res.data.totalElements;
    //     }
    //   }
    // },
    onparchange() {
      this.numall();
      // this.getUnfinishedWorkflowItems("default_1646218936192");
      // this.getUnfinishedWorkflowItems("LDPS");
      // this.getUnfinishedWorkflowItems("default_1646214214918");
      // this.getUnfinishedWorkflowItems("default_1646217559189");
      // this.getUnfinishedWorkflowItems("RCLC");
    }
  },
  created() {
    this.numall();
    // this.getUnfinishedWorkflowItems("default_1646218936192");
    // this.getUnfinishedWorkflowItems("LDPS");
    // this.getUnfinishedWorkflowItems("default_1646214214918");
    // this.getUnfinishedWorkflowItems("default_1646217559189");
    // this.getUnfinishedWorkflowItems("RCLC");
  },
  mounted() {
    window.wy_query = null;
    this.$route.params.schemaCode = "default_1646217559189";
    this.childrenList = true;
    setTimeout(() => {
      this.seach();
    }, 500);
  }
};
</script>

<style lang="less" scoped>
.content-top {
  display: none;
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
    .active {
      color: #be0404;
    }
  }
}
</style>
<style lang="less">
.wy_work {
  .content-top {
    // display: none !important;
  }
}
</style>
