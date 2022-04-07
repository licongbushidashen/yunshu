<template>
  <a-layout id="components-layout-demo-top-side-2">
    <a-layout>
      <a-layout-sider
        width="180"
        style="background: #ffffff; box-shadow: 0px -1px 0px 0px rgba(0, 0, 0, 0.09);"
      >
        <a-menu
          mode="inline"
          :default-selected-keys="['dataModel']"
          :style="{ height: '100%', borderRight: 0 }"
        >
          <a-menu-item key="dataModel">数据模型</a-menu-item>
          <a-menu-item key="bizRule">业务规则</a-menu-item>
          <a-menu-item key="dataRule">数据规则</a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout style="padding: 12px">
        <a-layout-content
          :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }"
        >Content</a-layout-content>
      </a-layout>
    </a-layout>
  </a-layout>
</template>

<script lang='ts'>
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { State, Action, Mutation, namespace } from "vuex-class";
import DataItem from "@/components/apps/model/dataitem.vue";
import BizMethod from "@/views/app/biz-method/index.vue";
import DataRule from "@/views/app/data-rule/index.vue";
import DataPermission from "@/views/app/data-permission/index.vue";
import MessageReminder from "@/views/app/message-reminder/index.vue";
import BizRuleList from "@/views/app/model/biz-rule-list.vue";

import { bizpropertyApi } from "@cloudpivot/api";

export enum TabPaneNames {
  TabDataModel = "1",
  TabBizMethod = "2",
  TabDataRule = "3",
  TabDataPermission = "4",
  TabMessageReminder = "5",
}

@Component({
  name: "DataModel",
  components: {
    DataItem,
    BizMethod,
    DataRule,
    DataPermission,
    MessageReminder,
    BizRuleList,
  },
})
export default class DataModel extends Vue {
  @Prop({
    type: String,
  })
  bizSchemaCode!: string;

  activeKey = "1";
  // 模型是否开启
  isNew = true;
  // 查看状态开启
  onlyLook = true;

  visible = false;

  TabPaneNames: any = TabPaneNames;

  openModal() {
    this.visible = true;
  }

  getModelState() {
    if (!this.bizSchemaCode) {
      return;
    }
    const params = {
      schemaCode: this.bizSchemaCode,
    };
    bizpropertyApi.getBusinessRuleEnable(params).then((res) => {
      if (res.errcode === 0) {
        this.isNew = res.data;
        this.onlyLook = this.isNew;
        let query: any = this.$route.query;
        if (query && query.tabsIndex) {
          this.activeKey = query.tabsIndex;
          const oldBiz = ["2", "3", "5"];
          if (this.isNew && oldBiz.includes(query.tabsIndex)) {
            this.activeKey = "1";
            this.tabClick();
          }
          if (!this.isNew && query.tabsIndex === "6") {
            this.activeKey = "1";
            this.tabClick();
          }
        }
      }
    });
  }

  mounted() {
    let query: any = this.$route.query;
    if (query && query.tabsIndex) {
      this.activeKey = query.tabsIndex;
      const oldBiz = ["2", "3", "5"];
      if (this.isNew && oldBiz.includes(query.tabsIndex)) {
        this.activeKey = "1";
        this.tabClick();
      }
      if (!this.isNew && query.tabsIndex === "6") {
        this.activeKey = "1";
        this.tabClick();
      }
    }
  }

  handleOk() {
    this.onlyLook = !this.onlyLook;
    if (this.value === 1) {
      this.modifyModelState(this.isNew);
    } else {
      this.modifyModelState(!this.isNew);
    }
    this.activeKey = "1";
    this.tabsChange(this.activeKey);
    this.close();
  }

  modifyModelState(val: boolean) {
    if (!this.bizSchemaCode) {
      return;
    }
    const params = {
      schemaCode: this.bizSchemaCode,
      enable: val,
    };
    bizpropertyApi.setBusinessRuleEnable(params).then((res) => {
      if (res.errcode === 0) {
        this.isNew = !this.isNew;
      }
    });
  }

  close() {
    this.visible = false;
  }

  value = 1;

  tabsChange(val: string) {
    if (val === TabPaneNames.TabDataPermission) {
      const dataPermission: any = this.$refs.dataPermission;
      if (dataPermission && dataPermission.reset) {
        dataPermission.reset();
      }
    }
    this.$router
      .push({
        name: "dataModel",
        query: { tabsIndex: this.activeKey },
      })
      .catch((err: any) => {
        err;
      });
  }

  get onlyReadTips() {
    if (this.onlyLook) {
      return "仅查看旧版本业务方法、数据规则、消息通知";
    } else {
      return "仅查看新版本业务规则";
    }
  }

  get readAndWriteTips() {
    if (this.onlyLook) {
      return "查看并使用旧版业务方法、数据规则、消息通知";
    } else {
      return "查看并使用新版本业务规则";
    }
  }

  get title() {
    if (this.onlyLook) {
      return "返回旧版本";
    } else {
      return "启用新版本";
    }
  }

  get warningMsg() {
    if (this.onlyLook) {
      return "使用旧版本业务方法、数据规则、消息通知后，新版本业务规则将不再执行";
    } else {
      return "使用新版本业务规则后，旧的业务方法、数据规则、消息通知将不再执行并且不兼容旧数据，需要重新在业务规则中创建规则";
    }
  }
  created() {
    // 参数不合法强制跳转
    if (this.bizSchemaCode === "data") {
      this.$router.push({ path: "/apps" }).catch((err: any) => {
        err;
      });
    }
  }

  tabClick() {
    this.$router
      .push({
        name: "dataModel",
        query: { tabsIndex: this.activeKey },
      })
      .catch((err: any) => {
        err;
      });
  }
  // mounted() {
  //   // 根据路由传入的tab类型进行切换
  //   const query: any = this.$route.query;
  //   if (query && query.tab) {
  //     this.activeKey = query.tab;
  //   }
  // }
}
</script>
<style lang='less' scoped>
.ant-menu-vertical .ant-menu-item::before,
.ant-menu-vertical-left .ant-menu-item::before,
.ant-menu-vertical-right .ant-menu-item::before,
.ant-menu-inline .ant-menu-item::before {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  border-right: 4px solid #17bc94;
  -webkit-transform: scaleY(0.0001);
  transform: scaleY(0.0001);
  opacity: 0;
  -webkit-transition: opacity 0.15s cubic-bezier(0.215, 0.61, 0.355, 1),
    -webkit-transform 0.15s cubic-bezier(0.215, 0.61, 0.355, 1);
  transition: opacity 0.15s cubic-bezier(0.215, 0.61, 0.355, 1),
    -webkit-transform 0.15s cubic-bezier(0.215, 0.61, 0.355, 1);
  transition: transform 0.15s cubic-bezier(0.215, 0.61, 0.355, 1),
    opacity 0.15s cubic-bezier(0.215, 0.61, 0.355, 1);
  transition: transform 0.15s cubic-bezier(0.215, 0.61, 0.355, 1),
    opacity 0.15s cubic-bezier(0.215, 0.61, 0.355, 1),
    -webkit-transform 0.15s cubic-bezier(0.215, 0.61, 0.355, 1);
  content: "";
}
.ant-menu-inline .ant-menu-selected::before,
.ant-menu-inline .ant-menu-item-selected::before {
  -webkit-transform: scaleY(1);
  transform: scaleY(1);
  opacity: 1;
  -webkit-transition: opacity 0.15s cubic-bezier(0.645, 0.045, 0.355, 1),
    -webkit-transform 0.15s cubic-bezier(0.645, 0.045, 0.355, 1);
  transition: opacity 0.15s cubic-bezier(0.645, 0.045, 0.355, 1),
    -webkit-transform 0.15s cubic-bezier(0.645, 0.045, 0.355, 1);
  transition: transform 0.15s cubic-bezier(0.645, 0.045, 0.355, 1),
    opacity 0.15s cubic-bezier(0.645, 0.045, 0.355, 1);
  transition: transform 0.15s cubic-bezier(0.645, 0.045, 0.355, 1),
    opacity 0.15s cubic-bezier(0.645, 0.045, 0.355, 1),
    -webkit-transform 0.15s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.ant-menu-vertical .ant-menu-item::after,
.ant-menu-vertical-left .ant-menu-item::after,
.ant-menu-vertical-right .ant-menu-item::after,
.ant-menu-inline .ant-menu-item::after {
  opacity: 0;
}
</style>
