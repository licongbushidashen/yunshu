<template>
  <span class="bar-right">
    <span :style="wrapStyle">
      <a-popover placement="bottom" v-model="popoverVisible" trigger="click">
        <template slot="content">
          <div class="popover-box">
            <!-- 过滤的弹窗 -->
            <ul v-if="dialogList.length">
              <!-- 全选 -->
              <li class="section-bar" @click="handleAllCheck()">
                <span class="bar-title">
                  <label>{{
                    $t("languages.Apps.FormDesignPage.AllChecked")}}</label>
                </span>
                <span class="bar-right">
                  <a-checkbox :checked="isAllChecked" />
                </span>
              </li>
              <!-- 业务数据项 -->
              <li class="section-bar">
                <span class="bar-title bar-c">
                  <label>{{ $t("languages.Apps.BizDataItem") }}</label>
                </span>
              </li>
              <li :class="
                  !(
                    status &&
                    cur.propertyType === 8 &&
                    cur.subSchema &&
                    cur.subSchema.properties
                  )
                    ? 'section-bar'
                    : ''
                "
                v-for="(cur, index) in dialogList"
                v-if="!cur.isSystem"
                :key="cur.index"
              >
                <template
                  v-if="
                    status &&
                    cur.propertyType === 8 &&
                    cur.subSchema &&
                    cur.subSchema.properties
                  "
                >
                  <div>
                    <span class="bar-title bar-c">
                      <label>{{`${cur.propertyName || cur.name}[${cur.code}]`}}</label>
                    </span>
                  </div>
                  <div
                    style="margin-left: 10px"
                    class="section-bar"
                    v-for="(e, o) in cur.subSchema.properties"
                    v-if="!e.defaultProperty"
                    :key="e.code"
                  >
                    <span class="bar-title bar-title-c">
                      <label :title="`${e.propertyName || e.name}[${e.code}]`"
                             class="text-ellipsis">{{`${e.propertyName || e.name}[${e.code}]`}}</label>
                    </span>
                    <span class="bar-right">
                      <a-checkbox
                      @change="toggleCheckedSheet(e, index, o)"
                      :checked="e.checked"
                      />
                    </span>
                  </div>
                </template>
                <template v-else>
                  <span class="bar-title bar-title-c">
                    <label :title="`${getKey(cur)}[${cur.code}]`"
                           class="text-ellipsis">{{`${getKey(cur)}[${cur.code}]`}}</label>
                  </span>
                  <span class="bar-right">
                    <a-checkbox
                      @change="
                        status
                          ? handleIcon($event, index)
                          : toggleChecked(cur)
                      "
                      :checked="cur.checked"
                    />
                  </span>
                </template>
              </li>
              <!-- 系统数据项 -->
              <li class="section-bar">
                <span class="bar-title bar-c">
                  <label>{{ $t("languages.Apps.SysDataItem") }}</label>
                </span>
              </li>

              <li
                class="section-bar"
                v-for="(cur, index) in dialogList"
                v-if="cur.isSystem"
                :key="cur.index"
              >
                <span class="bar-title bar-title-c">
                  <label :title="`${getKey(cur)}[${cur.code}]`"
                         class="text-ellipsis">
                    {{`${cur.propertyName || cur.name}[${cur.code}]`}}</label>
                </span>
                <span class="bar-right">
                  <a-checkbox
                    @change="handleIcon($event, index)"
                    :checked="cur.checked"
                  />
                </span>
              </li>
            </ul>
            <!-- 提醒 -->
            <div v-else class="empty-tips">
              <p v-if="fieldBlock === 2">
                {{ $t("languages.Apps.NoSortDataTips") }}
              </p>
              <p v-if="fieldBlock === 100">
                {{ $t("languages.Apps.NoSortFormDataTips") }}
              </p>
              <p v-else>{{ $t("languages.Apps.NoDataTips") }}</p>
            </div>
            <div class="bottom-bolck btn-group clearfix">
              <a-button
                class="btn"
                type="primary"
                size="small"
                @click="comfirmLevel1Popover"
                >{{ $t("languages.Apps.Ok") }}</a-button
              >
              <a-button class="btn" size="small" @click="closeLevel1Popover">{{
                $t("languages.Apps.Cancel")
              }}</a-button>
            </div>
          </div>
        </template>
        <template v-if="status">
          <div class="input-modal">
            <span class="txt">{{
              value && value.length > 0 ? "已设置" : "未设置"
            }}</span
            ><i class="aufontAll h-icon-all-ellipsis-o"></i>
          </div>
        </template>
        <span v-else class="icons" @click.stop="() => {}">
          <i class="aufontAll h-icon-all-plus-square-o"></i>
        </span>
        <!-- <a-icon type="plus-square-o" /> -->
      </a-popover>
    </span>
  </span>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { State, Action, Mutation, namespace } from "vuex-class";

// import appsApi from '@/apis/apps';
import { getDataItems } from "@/apis/list";
import { DataItemType } from "@cloudpivot/form/schema";

const ListdesignModule = namespace("Apps/Listdesign");

@Component({
  name: "Dialog",
  components: {},
})
export default class Dialog extends Vue {
  @ListdesignModule.State("showFieldArray") showFieldArray: any;

  @ListdesignModule.Mutation("onEdit") onEdit: any;

  @Prop() propDataList!: Array<any[]>;

  @Prop() fieldBlock!: number;

  @Prop() status!: boolean;

  @Prop() value!: any;

  wrapStyle = { left: "624px" };

  // /* 服务器获取的原始数据 */
  // originDatas:any[] = [];

  dialogList: any[] = [];

  fblock: number = -1;

  popoverVisible: boolean = false;

  dialogListDefault: any[] = [];

  isAllChecked: boolean = false;

  // 获取非系统数据key
  getKey(cur: any) {
    let name: any = cur.name
    if(cur.name_i18n) {
      let name_i18n: any;
      if(typeof cur.name_i18n === 'string') {
        name_i18n = JSON.parse(cur.name_i18n)
      } else {
        name_i18n = cur.name_i18n
      }
      if(name_i18n[this.$i18n.locale]) {
        name = name_i18n[this.$i18n.locale]
      }
    }
    return name;
  }

  created() {
    // this.dialogList;
  }

  toggleChecked(item) {
    item.checked = !item.checked;
    console.log('=============>asideDialog')
    if(item.propertyType === 9 && item.data && JSON.parse(item.data.options).showStyle === 'tree'){
      item.choiceType = 2
      item.data.choiceType = 2
    }
    this.isAllChecked = this.dialogList.every((res: any) => res.checked);
  }
  toggleCheckedSheet(e, v, o) {
    let item = this.dialogList[v];
    item.subSchema.properties[o].checked = !e.checked;

    this.$set(this.dialogList, v, item);
  }
  /* icon点击 */
  handleIcon(e, i: number) {
    let item = this.dialogList[i];
    item.checked = e.target.checked;
    this.$set(this.dialogList, i, item);
    this.isAllChecked = this.dialogList.every((res: any) => res.checked);
  }

  changeDialogListChecked(ck: boolean, i: number) {
    // this.dialogList[i].checked = !ck;
    let item = this.dialogList[i];
    item.checked = !ck;
    // 手动触发刷新
    // this.$set(this.dialogList, i, item);
    // this.dialogList.splice(i,1,item);
  }

  handleAllCheck() {
    this.isAllChecked = !this.isAllChecked;
    this.dialogList.forEach((item) => {
      item.checked = this.isAllChecked;
    });
  }

  /* add弹窗-确定 */
  comfirmLevel1Popover() {
    this.$emit("addcomfirm", this.fieldBlock, this.dialogList);
    // 更新弹出框的数据
    this.updateDialogListDefault()
    this.onEdit(true);
    this.popoverVisible = false;
  }

  // /* add弹窗-取消 */
  closeLevel1Popover() {
    const arr = JSON.parse(JSON.stringify(this.dialogListDefault));
    this.dialogList = arr;
    this.popoverVisible = false;
  }

  // 更新默认数据
  updateDialogListDefault() {
    this.dialogListDefault = this.dialogList
  }

  /**
   * 下拉选择值赋值
   */
  @Watch("propDataList", {
    immediate: true
  })
  linsteningdialogData(v: any) {
    if (this.status) {
      v = v.map((i) => {
        if (typeof this.value === "string") {
          try {
            this.value = JSON.parse(this.value);
          } catch {
            this.value = []
          }
        }
        const f = this.value && this.value.filter((c) => c === i.code);
        if (f && f.length > 0) {
          i.checked = true;
        } else {
          i.checked = false;
        }
        i.isSystem = i.defaultProperty;
        if (
          i.propertyType === DataItemType.Sheet &&
          i.subSchema &&
          i.subSchema.properties
        ) {
          i.subSchema.properties.forEach((v) => {
            const f =
              this.value &&
              this.value.filter((c) => c === i.code + "." + v.code);
            if (f && f.length > 0) {
              v.checked = true;
            } else {
              v.checked = false;
            }
          });
        }
        return i;
      });
    }
    this.dialogList = v;
    this.dialogListDefault = JSON.parse(JSON.stringify(v));
    if (v) {
      const arr = v.filter((res: any) => !res.checked);

      if (arr.length === 0) {
        this.isAllChecked = true;
      } else {
        this.isAllChecked = false;
      }
    }
  }

  beforeDestroy() {
    this.$off("addcomfirm");
  }
}
</script>

<style lang="less" scoped>
.design-wrapper {
  .each-title {
    font-size: 14px;
  }
}
.popover-box {
  width: 260px;
  .bottom-bolck {
    padding-bottom: 4px;
    margin-top: 8px;
    .btn {
      float: right;
      margin-right: 0px !important;
      &:last-child {
        margin-right: 8px !important;
      }
    }
  }
  .empty-tips {
    text-align: center;
    padding-top: 28px;
    padding-bottom: 24px;
    color: rgba(0, 0, 0, 0.65);
  }
  ul {
    max-height: 450px;
    overflow: auto;
    overflow-x: hidden;
    margin-right: -16px;
    li {
      min-height: 30px;
      line-height: 30px;
      .bar-right {
        margin-right: 16px;
      }
      &:hover {
        background: #e8fcf4;
      }
    }
  }
}
.section-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}
.bar-c {
  color: rgba(0, 0, 0, 0.45);
}
</style>
