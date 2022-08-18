<template>
  <div id="mobile-formlist-container" class="form-list" ref="application">
    <div class="form-list-search" v-show="!showFilter">
      <form-list-search
        ref="listSearch"
        :schemaCode="schemaCode"
        :queryConditions="queryConditions"
        :querySorts="querySorts"
        :relevanceDataList="relevanceDataList"
        :canDelete="canDelete"
        @filter="search"
        @setFilter="setFilter"
        @batch="batchHandler"
        @sort="doSort"
      />
      <!-- <div class="form-list-batch">批量</div> -->
    </div>
    <div class="form-list-batch" v-show="showFilter">
      <div>
        <checkbox-item
          :defaultChecked="selectAll"
          @change="selectAllHandler"
        />&nbsp;&nbsp;全选
      </div>
      <div @click="cancelBatchHandler">取消</div>
    </div>
    <div class="form-list-item" v-if="loadedConditions">
      <h3-scroll
        ref="scroll"
        :loadMore="loadMore"
        :pageSize="20"
        v-show="isNoEmpty"
      >
        <!-- <div class="form-list-wrap">
          <form-item
            v-for="(form,index) in formList"
            :key="index"
            :formData="form"
            :queryColumns="queryColumns"
          />
        </div>
        <hr>-->
        <div class="custom-template-outer-wrapper">
          <listCustomTemplate
            v-if="formList && formList.length"
            :vm="vm"
            :batchFlag="showFilter"
            :canDelete="canDelete"
            :selectAll="selectAll"
            :columns="queryColumns"
            :originalListData="formList"
            :templateString="templateString"
            @selectedsome="selectedsomeHandler"
            @reloadList="reloadList"
            @mounted="listTemplateMounted"
          />
        </div>
      </h3-scroll>
      <div class="empty-box" v-show="!isNoEmpty">
        <Empty></Empty>
      </div>
    </div>
    <div class="form-list-batch-bottom" v-show="showFilter">
      <div>已选：{{ selectNum }}</div>
      <div @click="batchDelete" class="form-list-batch-delete">批量删除</div>
    </div>
    <div class="home-router">
      <router-view />
      <div v-if="canAdd" class="home-router-add" @click="goForm()">
        <img src="./add.png" />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from "vue-property-decorator";

import form from "@cloudpivot/form/src/renderer/components/mobile";

import moment from "moment";

import { dateFormatter } from "@cloudpivot/form/src/renderer/utils";

import { listApi, listParams } from "@cloudpivot/api";
import common from "@cloudpivot/common/mobile";
import * as platform from "@cloudpivot/platform";

import FormListSearch from "../list-search.vue";

import FormItem from "./form-item.vue";

// 自定义模板
import listCustomTemplate from "./listCustomTemplate.vue";
// 生命周期钩子
import listEventHooksHandler from "@cloudpivot/list/src/components/listCustom/eventHooks/handler";

import { QueryActions } from "@cloudpivot/api/src/application";

// 挂载给钩子
import axios from "axios";
// import appitem from "../../../../../../../entries/admin/src/store/modules/app/appitem";
import { ListApi } from "@cloudpivot/api/src/application.api";

const GetDateHandle = common.utils.GetDateHandle;

@Component({
  name: "FormList",
  components: {
    FormItem,
    H3Scroll: form.H3Scroll,
    Empty: common.components.Empty,
    FormListSearch,
    listCustomTemplate,
    checkboxItem: common.components.Checkbox,
  },
})
export default class FormList extends Vue {
  params: any = {
    filters: [],
    mobile: true,
    queryCode: "",
    schemaCode: "",
    page: 1,
    size: 20,
  };
  canDelete: boolean = false;
  showFilter: boolean = false;
  selectAll: boolean = false;
  selectNum: number = 0;
  selectItems = [];
  // 挂载给钩子
  axios: any = axios;

  templateString: string = "";

  associationCode: string = "";

  associationType: number = 0;

  formList: Array<any> = [];

  queryConditions: Array<any> = [];

  querySorts: Array<any> = []

  queryActions: QueryActions[] = [];

  queryColumns: Array<any> = [];

  isNoEmpty: boolean = true;

  // 是否已加载完毕筛选条件
  loadedConditions: boolean = false;

  // 是否展示新增悬浮按钮
  canAdd: boolean = false;

  listConfig: any = null;

  relevanceDataList = [];

  selectAllHandler(newVal) {
    if (newVal) {
      this.formList.forEach((item) => (item.select = newVal));
      //@ts-ignore
      this.selectItems = this.formList.map((item) => item.id);
      this.selectNum = this.selectItems.length;
    } else {
      this.formList.forEach((item) => (item.select = newVal));
      this.selectItems = [];
      this.selectNum = 0;
    }
    this.selectAll = newVal;
  }

  created() {
    // 获取关联表单数据项
    this._getDataItemList();
    this.setMomentLocale(this.$i18n.locale);
  }
  async mounted() {
    this.params.schemaCode = this.schemaCode;
    this.params.queryCode = this.queryCode ? (this.queryCode as string) : "";
    const vm: any = this;
    const params = {
      schemaCode: vm.schemaCode,
      code: vm.queryCode ? (vm.queryCode as string) : "",
      clientType: "APP"
    };

    // testing
    // const params = {
    //   code: 'newModelCode',
    //   schemaCode: 'newModelCode',
    //   source: 1
    // }

    let res = await listApi.getListConfigData(params);
    if(res.data.queryActions.find(item=>item.queryActionType===4)){
      this.canDelete=true;
    }
    // 注册钩子, 并触发 onPreLoad
    this.listConfig = res.data;
    await this.initPresentation(
      res.errcode === 0
        ? typeof res.data === "object" && res.data.queryPresentation
        : null
    );

    if (res.data && res.data.name && platform.IS_DINGTALK) {
      let title: any = res.data.name;
      if (res.data.name_i18n && typeof res.data.name_i18n === "string") {
        const locale: string = window.localStorage.getItem("locale") as string;
        const name = JSON.parse(res.data.name_i18n)[locale]
          ? JSON.parse(res.data.name_i18n)[locale]
          : title;
        title = locale === "zh" ? title : name;
      }
      this.$emit("setTitle", title);
    }

    if (res.data && res.data.queryActions) {
      const addAction: any = res.data.queryActions.find(
        (action: any) => action.actionCode === "add"
      );
      this.queryActions = res.data.queryActions as any;
      if (addAction) {
        vm.canAdd = true;
        vm.associationCode = addAction.associationCode;
        vm.associationType = addAction.associationType;
      } else {
        vm.canAdd = false;
      }
    }

    if (res.data && res.data.querySorts) {
      const querySorts: any = res.data.querySorts
      this.querySorts = querySorts
    }


    if (
      res.data &&
      Array.isArray(res.data.queryConditions) &&
      res.data.queryConditions.length
    ) {
      res.data.queryConditions.forEach((condition: any) => {
        if(condition.displayType === 3 && condition.options){
          condition.options = JSON.parse(condition.options).options
        }
        if (condition.propertyCode === "sequenceStatus") {
          condition.options = "草稿;进行中;已完成;已作废";
          if (!condition.defaultValue) return;
          const vals_zh: Array<string> = condition.defaultValue.split(";");
          const vals_en: Array<string> = [];
          vals_zh.forEach((val: string) => {
            switch (val) {
              case "DRAFT":
                vals_en.push("草稿");
                break;
              case "PROCESSING":
                vals_en.push("进行中");
                break;
              case "COMPLETED":
                vals_en.push("已完成");
                break;
              case "CANCELED":
                vals_en.push("已作废");
                break;
              default:
                break;
            }
          });
          condition.defaultValue = vals_en.join(";");
        }
        // 日期格式配置了dateType则获取本地当前时间进行过滤
        if (condition.propertyType === 3 && condition.dateType) {
          const date = this.setDateByDateType(
            condition.dateType,
            this.getFormat(condition.displayFormat)
          );
          condition.startValue = date[0];
          condition.endValue = date[1];
        }

        common.utils.compatible(condition, "name");
        condition.name_i18n["zh"] = condition.name;
        condition.name_i18n = JSON.stringify(condition.name_i18n);
      });
      vm.queryConditions = res.data.queryConditions;
    } else {
      vm.$refs.listSearch.initQuery();
    }

    if (res.data && Array.isArray(res.data.queryColumns)) {
      vm.queryColumns = res.data.queryColumns;
    }
  }

  batchHandler() {
    this.showFilter = true;
  }
  cancelBatchHandler() {
    this.showFilter = false;
  }
  selectedsomeHandler(b, index, selectItems) {
    this.formList[index].select = b;
    this.selectItems = selectItems
      .filter((item) => item.select)
      .map((item) => item.id);
    if (selectItems.every((item) => item.select)) {
      this.selectAll = true;
    }
    if (selectItems.some((item) => !item.select)) {
      this.selectAll = false;
    }
    let count = 0;
    selectItems.forEach((item) => {
      if (item.select) {
        count++;
      }
    });
    this.selectNum = count;
  }
  batchDelete() {
    if (this.selectNum == 0) {
      return;
    }
    let ids = this.selectItems;
    let param = { schemaCode: this.schemaCode, ids };
    listApi.checkDeleteItems(param).then((res) => {
      if (res.errcode == 0) {
         let info = '已选中'
        res.data.forEach(item => {
          if(item.objectIds.length > 0) {
            info = info + item.objectIds.length + '条' + item.resultDesc + ','
          }
        })
        let dataNum = res.data.find(item=>item.resultCode===1000).objectIds.length;
        let flowNum = res.data.find(item=>item.resultCode===1004).objectIds.length;
        this.$h3.modal.show({
          content: `${info}。删除后数据不可恢复，是否删除？`,
          actions: [
            {
              //@ts-ignore
              text: this.$t("cloudpivot.form.renderer.cancel").toString(),
              onPress() {},
            },
            {
              //@ts-ignore
              text: this.$t("cloudpivot.form.renderer.ok").toString(),
              onPress: () => {
                listApi.deleteListData(param).then((res) => {
                  if (res.errcode == 0) {
                    this.$h3.toast.show({
                      text: "删除成功",
                      iconType: "check",
                    });
                    this.showFilter = false;
                    this.reloadList();
                  } else {
                    this.$h3.toast.show({
                      text: "删除失败，请重新尝试",
                      iconType: "close",
                    });
                  }
                });
              },
            },
          ],
        });
      } else {
        this.$h3.toast.show({
          text: "操作失败，请重新尝试",
          iconType: "close",
        });
      }
    });
  }
  getFormat(str: string) {
    switch (Number(str)) {
      case 2:
        return "YYYY-MM-DD HH:mm:ss";
      case 3:
        return "YYYY-MM-DD HH:mm";
      case 4:
        return "YYYY-MM";
      case 5:
        return "YYYY";
      case 6:
        return "MM-DD";
      case 7:
        return "HH:mm";
      case 8:
        return "HH:mm:ss";
      default:
        return "YYYY-MM-DD";
    }
  }

  // 新增
  temporaryActionStorageKey: string =
    "____mobile__formList__action__temporary__storage__";
  async goForm() {
    if (!this.canAdd) {
      return;
    }

    const action = this.getAction("add");
    if (!action) return console.error('action "add" not found!');
    if (
      this.eventHooksHandler &&
      (await this.eventHooksHandler.exec("onPreAction", action)) === false
    )
      return;

    // 为 onActionDone 埋数据 (临时方案)
    // 记录新增动作, 移动端不同于pc端, 没法多开页面, 也就无从使用 postMessage 通信; 这个页面还无法实现 beforeRouteEnter ...?
    // 因此对 action 做一个内存中的临时记录, 以做跨页面数据保存
    // 在当前页面触发按钮, 会对 action 做一个内存中的临时记录. 这条记录仅存在当前window中, 而且仅支持一次性读取, 读完即删, 刷新失效.
    // 如果是从详情页面返回, 可以读取到记录, 读完也会立即删除, 不对对后续的操作产生影响
    // 如果是从别的页面进来, 因为没有触发 action, 数据又没有遗留, 因此也不会造成错误触发
    (window as any)[this.temporaryActionStorageKey] = {
      action: "add",
      totalElements: this.totalElements,
    };
    // this.$message.error('ewqew');

    //判断是否有权限发起流程表单
    const params: listParams.ApiImplicitParam = {
      schemaCode: action.schemaCode,
      relativeCode: action.associationCode,
      isMobile: true,
      queryActionType: action.queryActionType,
      queryActionRelativeType: action.associationType,
    };
    const res = await listApi.getJurisdiction(params);
    if (res.errcode === 700020) {
      this.$h3.toast.show({
        text: this.$t("cloudpivot.list.mobile.NoPermissionAdd"),
      });
      return;
    }

    if (this.associationType === 1) {
      // 流程表单
      this.$router
        .push({
          name: "form-detail",
          query: {
            startWorkflowCode: this.associationCode,
            return: this.$route.fullPath,
          },
        })
        .catch((err: any) => {
          err;
        });
    } else {
      this.$router
        .push({
          // 业务表单
          name: "form-detail",
          query: {
            schemaCode: this.schemaCode,
            sheetCode: this.associationCode,
            return: this.$route.fullPath,
          },
        })
        .catch((err: any) => {
          err;
        });
    }
  }

  /**
   * 初始化视图自定义数据&事件
   * @queryPresentation optional! 从 listApi.getListConfigData 获取到的 queryPresentation, 没有则传空
   */
  eventHooksHandler: any = null;
  async initPresentation(queryPresentation: any) {
    // console.log('__________________ initPresentation', queryPresentation)

    // 变量
    let vm = this as any;
    let listWrapper = document.querySelector(
      "#mobile-formlist-container"
    ) as any;
    let styleElement = listWrapper.querySelector("#customStyle");
    let isStyleElementExist = !!styleElement;
    styleElement = styleElement || document.createElement("style");

    // 尝试解析
    let htmlObj,
      isError = !queryPresentation || !queryPresentation.htmlJson;
    try {
      if (!isError) htmlObj = JSON.parse(queryPresentation.htmlJson) as any;
    } catch (err) {
      isError = true;
      console.error(err);
    }

    // 如果数据为空|数据出错, 清空模型自定义数据&事件
    if (isError) {
      styleElement.innerHTML = "";
      this.eventHooksHandler = null;
      this.templateString = "";
      return;
    }

    // 设置渲染脚本
    this.templateString = htmlObj.templateJson;

    // 注入样式
    styleElement.innerHTML = htmlObj.styleJson;
    if (!isStyleElementExist) {
      styleElement.id = "customStyle";
      listWrapper.appendChild(styleElement);
    }

    // 初始化并执行自定义脚本
    try {
      this.eventHooksHandler = listEventHooksHandler.loadSupportingVersionHandler(
        {
          vm,
          scriptString: htmlObj.scriptJson,
          hooksOption: [
            { name: "onPreLoad", params: [] },
            { name: "onLoad", params: ["formList"] },
            { name: "onRendered", params: ["formList"] },
            { name: "onPreAction", params: ["formList"] },
            { name: "onCustomAction", params: ["formList"] },
            { name: "onActionDone", params: [] },
          ],
        }
      );
      // 立即执行 onPreLoad
      await this.eventHooksHandler.exec("onPreLoad");
    } catch (err) {
      if (err === "first version scription uncompatible!") return;
      this.$h3.toast.show({
        text: err.toString(),
      });
    }
  }

  listTemplateMounted(templateVM) {
    // 监控模板的渲染, 触发 onRendered
    // 理论上, onRendered 只需监控<文档结构>渲染完毕即可, 对图片等异步加载是不做保证的
    // 但考虑到用户不一定分得清"文档渲染完毕"和"全部元素渲染完毕", 这里加个简单超时
    // 这个超时仍不能保证"全部元素渲染完毕", 毕竟低网速和大图片等情况是必然会存在的, 但多少能降低些用户的困惑🤷‍♂️
    // setTimeout(()=>{
    //   if ( this.eventHooksHandler ) {
    //     this.eventHooksHandler.exec('onRendered')
    //   }
    // },50);
  }

  /**
   * 获取列表
   */
  search(val: any) {
    this.params.filters = [...val];
    this.isNoEmpty = true;
    this.formList = [];
    if (!this.loadedConditions) {
      this.loadedConditions = true;
    } else {
      this.params.page = 1;
      this.loadedConditions = false;
      this.$nextTick(() => {
        this.loadedConditions = true;
      });
    }
  }

  doSort(val: any) {
    this.params.orderType = val.orderType
    this.params.orderByFields= val.orderByFields

    this.isNoEmpty = true;
    this.formList = [];
    if (!this.loadedConditions) {
      this.loadedConditions = true;
    } else {
      this.params.page = 1;
      this.loadedConditions = false;
      this.$nextTick(() => {
        this.loadedConditions = true;
      });
    }    
  }

  /**
   * 设置筛选条件
   */
  setFilter(val: any) {
    this.params.filters = [...val];
    this.loadedConditions = true;
  }

  // 根据名字获取事件
  getAction(code: string) {
    return this.queryActions.find((a) => a.actionCode === code);
  }

  /**
   * 滚动加载更多
   */
  totalElements: number = 0;

  reloadList() {
    this.params.num = 1;
    this.loadMore(this.params);
  }

  loadMore(page: any, done?: any) {
    const vm: any = this;
    vm.params.filters = this.params.filters;
    vm.params.page = page.num;

    // 查看时是否有为 actionDone 的触发埋下的数据
    let templateActionStorage = (window as any)[
      this.temporaryActionStorageKey
    ] as any;
    (window as any)[this.temporaryActionStorageKey] = null;

    listApi
      .getQueryList({
        ...vm.params,
        page: vm.params.page - 1,
      })
      .then((res: any) => {
        // 执行钩子, 仅在正常读取的时候执行, 接口异常情况通过其他方式触发通知
        if (res.errcode === 0 && this.eventHooksHandler) {
          // 事件触发完毕; 对比数据, 查看是否添加成功
          if (templateActionStorage && templateActionStorage.action === "add") {
            const addSuccessFully =
              templateActionStorage.totalElements < this.totalElements;
            this.eventHooksHandler.exec(
              "onActionDone",
              this.getAction("add"),
              addSuccessFully
            );
          }

          // 加载
          return this.eventHooksHandler
            .exec("onLoad")
            .then((resp) => {
              // 渲染; onRendered 目前无法监控, 包含了 form-item > base-item
              setTimeout(() => {
                this.eventHooksHandler.exec("onRendered");
              }, 50);
            })
            .then((empty) => {
              return res;
            });
        } else {
          return res;
        }
      })
      .then((res: any) => {
        if (res.errcode === 0) {
          if (done) {
            done(vm.params.size, res.data.totalElements);
          }
          // 记录列表长度
          this.totalElements = res.data.totalElements;
          if (vm.params.page === 1) {
            vm.formList = res.data.content;
          } else {
            vm.formList = vm.formList.concat(res.data.content);
             if(this.showFilter && this.selectAll) {
              this.selectNum = vm.formList.length;
            }
          }
          vm.isNoEmpty = !!vm.formList.length;
        } else {
          vm.formList = [];
          vm.isNoEmpty = false;
          // 展示字段为空时，提示‘列表显示字段不能为空！’
          if (res.errcode === 303026) {
            this.$h3.toast.show({
              text: `${res.errmsg}`,
              iconType: "close",
            });
          }
        }
        vm.formList.forEach((item) => {
          item.select = false;
        });
      });
  }

  //语言为中文时自然周从周一开始。
  setMomentLocale(lang: string) {
    if (lang === "en") {
      moment.locale("en-US");
    } else {
      moment.locale("zh-cn");
    }
  }

  setDateByDateType(type: any, format: string) {
    let start: string = "";
    let end: string = "";
    let date: Array<string> = [];
    switch (type) {
      /* 当天 */
      case 9:
        start = dateFormatter(moment().startOf("days").toString(), format);
        end = dateFormatter(moment().endOf("days").toString(), format);
        break;
      /* 最近一周 */
      case 1:
        start = dateFormatter(
          moment(GetDateHandle.getLatelyWeek()).startOf("days").toString(),
          format
        );
        end = dateFormatter(moment().endOf("days").toString(), format);
        break;
      /* 最近一月 */
      case 2:
        start = dateFormatter(
          moment(GetDateHandle.getLatelyMonth()).startOf("days").toString(),
          format
        );
        end = dateFormatter(moment().endOf("days").toString(), format);
        break;
      /* 最近一季度 */
      case 3:
        start = dateFormatter(
          moment(GetDateHandle.getLatelyQuarter()).startOf("days").toString(),
          format
        );
        end = dateFormatter(moment().endOf("days").toString(), format);
        break;
      /* 最近一年 */
      case 4:
        start = dateFormatter(
          moment(GetDateHandle.getLatelyYear()).startOf("days").toString(),
          format
        );
        end = dateFormatter(moment().endOf("days").toString(), format);
        break;
      /* 本周 */
      case 5:
        date = GetDateHandle.getThisWeek();
        start = date[0];
        end = dateFormatter(moment().endOf("days").toString(), format);
        break;
      /* 本月 */
      case 6:
        date = GetDateHandle.getThisMonth();
        start = date[0];
        end = dateFormatter(moment().endOf("days").toString(), format);
        break;
      /* 本季度 */
      case 7:
        date = GetDateHandle.getThisQuarter();
        start = date[0];
        end = dateFormatter(moment().endOf("days").toString(), format);
        break;
      /* 本年 */
      case 8:
        date = GetDateHandle.getThisYear();
        start = date[0];
        end = dateFormatter(moment().endOf("days").toString(), format);
        break;
      /* 默认值 */
      default:
        break;
    }
    return [start, end];
  }

  get schemaCode() {
    return this.$route.params.schemaCode;
  }

  get queryCode() {
    return this.$route.query.queryCode;
  }
  get vm() {
    return this;
  }

  async _getDataItemList() {
    const res = await listApi.getDataItemList({ schemaCode: this.schemaCode });
    const { errcode, errmsg, data } = res;
    if (errcode === 0) {
      this.relevanceDataList = data;
    } else {
      this.$message.error(errmsg as string);
    }
  }
}
</script>


<style lang="less" scoped>
@import "~@cloudpivot/common/styles/mixins.less";
@add-btn-size: 100px;
@btn-padding-bottom: 140px;
.form-list {
  .form-list-batch {
    .px2rem(height, 87px);
    .px2rem(padding-left, @horizontal-padding-lg);
    .px2rem(padding-right, @horizontal-padding-lg);
    .px2rem(font-size, 30px);
    background: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e6ebf6;
  }
  .form-list-batch-bottom {
    width: 100%;
    .px2rem(height, 112px);
    .px2rem(padding-left, @horizontal-padding-lg);
    .px2rem(padding-right, @horizontal-padding-lg);
    .px2rem(font-size, 30px);
    background: #fff;
    display: flex;
    position: fixed;
    bottom: 0px;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #e6ebf6;
    z-index: 99;
    .form-list-batch-delete {
      display: flex;
      align-items: center;
      justify-content: center;
      .px2rem(width, 320px);
      .px2rem(height, 72px);
      .px2rem(border-radius, 40px);
      color: #fff;
      background: #f4454e;
    }
  }
  .form-list-item {
    background: @main-background;
  }
  /deep/.mescroll {
    // .px2rem(top, 90px);

    top: 2.4rem;
    height: calc(100% - 2.4rem);
    // top: 1.2rem;
    // height: calc(100% - 1.2rem);
    padding-bottom: 1rem;
  }
  .empty-box {
    position: absolute;
    z-index: 9;
    width: 100%;
    bottom: 0;
    left: 0;
    // .px2rem(top, 90px);
    top: 2.4rem;
  }
  .home-router {
    /deep/.home-router {
      .px2rem(top, 90px);
    }
    &-add {
      position: absolute;
      z-index: 9;
      .px2rem(right, 30px);
      .px2rem(bottom, 120px);
      img {
        .px2rem(height, @add-btn-size);
        .px2rem(width, @add-btn-size);
      }
    }
  }
}
</style>
