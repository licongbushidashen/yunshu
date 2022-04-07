<template>
  <div class="update-code">
    <div class="table-box">
      <div class="table-box-tip">
        <i class="icon aufontAll h-icon-all-Components_Warning"></i>
        <span class="file-status-txt">检测服务方法重名,修改后导入将生成新的编码</span>
      </div>

      <a-table
        :pagination="false"
        :columns="appCodeColumns"
        :data-source="list"
        rowKey="id">
        <template slot="newServiceCode" slot-scope="text, record">
          <div class="model-item">
            <a-input
              :class="record.isShow?'input-error':''"
              :placeholder="$t('languages.Apps.PlzFillInNewCode')"
              v-model="record.newServiceCode"
              @change="valueChange(record)"
              :maxLength="27">
              <a-tooltip slot="suffix" 
              overlayClassName="import-server-hint" 
              placement="bottom" 
              title="该编码已存在"
              v-if="record.isShow">
                 <i class="icon aufontAll h-icon-all-close-circle"></i>
              </a-tooltip>
            </a-input>
          </div>
        </template>
      </a-table>

    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { State, Action, namespace } from "vuex-class";

import { Input } from "@h3/antd-vue";

@Component({
  name: "update-code",
  components: {
    AInput: Input,
  },
})
export default class UpdateCode extends Vue {
  @Prop() type!: any;

  @Prop() list!: any;

  toogleShow(item) {
    this.$set(item[0], "show", !item[0].show);
    this.$nextTick(() => {
      console.log(item);
      this.$forceUpdate();
    });
  }


  get subClassificationList() {
    let res: any = {};
    let subCodeList = this.list.subCodeList;
    this.list.subCodeList.forEach((el: any) => {
      if (res[el.parentSchemaCode]) {
        res[el.parentSchemaCode].push(el);
      } else {
        res[el.parentSchemaCode] = [el];
      }
    });
    return res;
  }

  searchFormModelText: string = "";
  getFormModelItem(item) {
    return item.filter(
      (el) => el.sheetName.indexOf(this.searchFormModelText) > -1
    );
  }
  searchSubCodeText: string = "";
  getSubCodeItem(item) {
    return item.filter(
      (el) => el.modelName.indexOf(this.searchSubCodeText) > -1
    );
  }

  valueChange(item){
    item.isShow = false;
  }

  // 切换tab
  tabClick(val) {
    this.tabKey = val;
  }

  tabKey: string = "1";
  appCodeColumns: any[] = [
    {
      title: "目录",
      key: "groupName",
      dataIndex: "groupName",
    },
    {
      title: "服务方法",
      key: "serviceName",
      dataIndex: "serviceName",
    },
     {
      title: "原编码",
      key: "oldServiceCode",
      dataIndex: "oldServiceCode",
    },
    {
      title: "新编码",
      key: "newServiceCode",
      dataIndex: "newServiceCode",
      scopedSlots: { customRender: "newServiceCode" },
    },
  ];

  getCodeList() {
    let existEmptyAppcode: boolean = false;
    let existEmptyModelcode: boolean = false;
    let existEmptySubCode: boolean = false;
    let existValidAppcode: boolean = false;
    let existValidModelcode: boolean = false;
    let existValidSubCode: boolean = false;
    if (this.list.appCodeList.length > 0) {
      // 应用
      existEmptyAppcode = this.list.appCodeList.some(
        (item: any) => !item.newCode
      );
      existValidAppcode = this.list.appCodeList.some(
        (item: any) => !/^[a-zA-Z][a-zA-Z0-9_]{0,25}$/.test(item.newCode)
      );
    }

    if (this.list.modelCodeList.length > 0) {
      // 模型
      existEmptyModelcode = this.list.modelCodeList.some(
        (item: any) => !item.newCode
      );
      existValidModelcode = this.list.modelCodeList.some(
        (item: any) => !/^[a-zA-Z][a-zA-Z0-9_]{0,25}$/.test(item.newCode)
      );
    }

    if (this.list.subCodeList.length > 0) {
      // 子表
      existEmptySubCode = this.list.subCodeList.some(
        (item: any) => !item.newCode
      );
      existValidSubCode = this.list.subCodeList.some(
        (item: any) => !/^[a-zA-Z][a-zA-Z0-9_]{0,25}$/.test(item.newCode)
      );
    }

    if (existEmptyModelcode || existEmptyAppcode || existEmptySubCode) {
      let type = "应用";
      if (existEmptyAppcode) {
        this.tabKey = "1";
        type = "应用";
      } else if (existEmptyModelcode) {
        this.tabKey = "2";
        type = "模型";
      } else {
        this.tabKey = "3";
        type = "子表";
      }
      this.$message.error(type + "新编码不能为空");
      return null;
    }

    if (existValidAppcode || existValidModelcode || existValidSubCode) {
      let type = "应用";
      if (existValidAppcode) {
        this.tabKey = "1";
        type = "应用";
      } else if (existValidModelcode) {
        this.tabKey = "2";
        type = "模型";
      } else {
        this.tabKey = "3";
        type = "子表";
      }

      this.$message.error(
        type + "编码格式必须以字母开头不超过26个字符，仅支持字母、数字、下划线"
      );
      return null;
    }
    return this.list;
  }
}
</script>
<style lang="less" scoped>
.ant-input-search {
  margin-bottom: 16px;
}
.collapse {
  margin-bottom: 16px;
  .collapse-title {
    height: 38px;
    font-size: 16px;
    color: rgba(0, 0, 0, 0.85);
    line-height: 38px;
    cursor: pointer;
    &:hover {
      color: #17bc94;
      i {
        color: #17bc94;
      }
    }
    span {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.65);
      margin-right: 8px;
    }
  }
}

.update-code {
  .table-box {
    &-tip {
      & > .exclamation-circle {
        color: #faad14;
      }
      & > .file-status-txt {
        padding-left: 12px;
        font-size: 16px;
        color:  rgba(0, 0, 0, 0.85);
        font-weight: 400;
      }
    }
    .code-table {
      padding-left: 32px;
      padding-right: 24px;
      margin-top: 24px;
      margin-bottom: 32px;
      &-head,
      &-body {
        display: flex;
        justify-content: space-between;
        align-items: center;
        & > span {
          display: inline-block;
          width: 30%;
          margin-right: 1.5%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          line-height: 20px;
          &:last-of-type {
            margin-right: 0;
          }
        }
      }
      &-body {
        margin-top: 8px;
        margin-bottom: 16px;
      }
    }
  }
}

.table-box-tip {
  padding-left: 40px;
  margin-bottom: 13px;
  margin-top: 24px;
  i{
    font-size: 20px;
    color: #F7B500;
  }
}

.input-error {
  border-color: #f4454e;
   
  /deep/ .ant-input:focus{
    border-color: #f4454e;
      box-shadow: none;
  }
}

.h-icon-all-close-circle{
  color: #F4454E;
  font-size:20px;
  &:hover{
    color: #F4454E;
  }
}

</style>
<style lang="less">
.import-server-hint{
   .ant-tooltip-inner{
    background-color:  #F4454E;
  }
}
</style>