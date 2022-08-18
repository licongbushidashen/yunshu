<template>
  <div style="      height: calc(100% - 130px);">
    <div class="wy_select">
      <a-form layout="inline" style="display:flex">
        <label
          style="    line-height: 43px;    margin-right: 10px;color:#000000d9"
          >任务名称</label
        >
        <a-form-item :colon="false" ref="queryForm1">
          <a-input
            placeholder="任务名称"
            v-model="queryData.workflowName"
            class="workflow-name-input"
          ></a-input>
        </a-form-item>
        <label
          style="    line-height: 43px;    margin-right: 10px;color:#000000d9"
          >重点任务来源</label
        >
        <a-select
          show-search
          style="width:180px;    padding-top: 5px;    margin-right: 20px;"
          v-model="queryData.workflowCode"
          allowClear
        >
          <template v-for="item in targetDataItems">
            <a-select-option :value="item.status" :key="item.status">{{
              item.name
            }}</a-select-option>
          </template>
        </a-select>
        <span class="wy_search" @click="seach"> </span>
      </a-form>
      <div class="wy_table" style="margin-top:20px;"></div>
      <List @openForm="openForm" ref="list1" />
    </div>
  </div>
</template>
<script>
import Axios from "axios";
import OAuthApi from "@/apis/oauth";
import { workflowCenterApi } from "@cloudpivot/api";
import formPc from "@cloudpivot/form/src/renderer/components/pc";
import List from "../views/my-workitem.vue";
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
    List: List,
    StaffSelector: formPc.StaffSelector,
    AInput: Input,
    AForm: Form,
    AFormItem: Form.Item,
    ASelect: Select,
    ASelectOption: Select.Option,
    ARangePicker: DatePicker.RangePicker
    // List: list.components.ApplicationList
  },
  data() {
    return {
      childrenList: false,
      Tindex: 0,
      sheetDataItem: "",
      targetDataItems: [
        // {
        //   name: "上级批示",
        //   status: "LDPS"
        // },
        // {
        //   name: "实验室主任批示",
        //   status: "default_1646214214918"
        // },
        // {
        //   name: "日常督办事项",
        //   status: "RCLC"
        // },
        {
          name: "实验室年度重点工作",
          status: "default_1646217559189"
        },
        {
          name: "省年度重点工作",
          status: "default_1646218936192"
        }
        // {
        //   name: "任务办理反馈单",
        //   status: "RWBL"
        // }
      ],

      queryData: {
        activityName: "",
        sequenceNo: "",
        workflowName: "",
        participantName: "",
        workflowCode: ""
        // workflowCode: "default_1646217559189"
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
    openForm(obj) {
      const url = `/form/detail?workitemId=${obj.id}&workflowInstanceId=${
        obj.instanceId
      }&return=${location.pathname +
        location.search}&workitemType=unreadWorkitem`;
      if (this.isDingTalk) {
        this.$router.push({ path: url }).catch(err => {
          err;
        });
      } else {
        // const newWindow = window.open(); //
        // newWindow.location.href = url;
        obj.vm.IframeFormUrl = url;
        obj.vm.showIframeForm = true;
      }
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
      this.$refs.list1.onSearch(this.queryData);
    },
    change(item, index) {
      this.queryData = {
        activityName: "",
        sequenceNo: "",
        workflowName: "",
        participantName: "",
        workflowCode: ""
        // workflowCode: this.dcdb[index].id
      };
      this.Tindex = index;
      this.$route.params.schemaCode = item.id;
      this.$nextTick(() => {
        this.seach();
      });
    },
    async numall() {
      debugger;
      const res = await OAuthApi.getUserInfo();
      let num = await Axios.get(
        `/weiyuapi/authine-lowCode/RuntimeForm/getWaitToRead?gh=${(res.data
          ? res.data.userId
          : "") || "000814"}`,
        {}
      );
      let data = num.data;
      this.$store.state.wynum1 = data.total;
      for (let i = 0; i < this.dcdb.length; i++) {
        if (data[this.dcdb[i].id] != undefined) {
          this.dcdb[i].num = data[this.dcdb[i].id];
        }
      }
    },

    onparchange() {
      // this.numall();
    }
  },
  created() {
    // this.numall();
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
.wy_select {
  margin-left: 60px;
  margin-right: 60px;
  margin-top: 10px;
  height: calc(100% - 40px);
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
// .wy_select {
//   margin-left: 60px;
//   margin-right: 60px;
//   margin-top: 10px;
//   height: calc(100% - 180px);
// }
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
