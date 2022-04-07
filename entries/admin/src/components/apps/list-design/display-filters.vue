<template>
  <span class="bar-right">
    <span :style="wrapStyle">
      <a-popover
        overlayClassName="display-filters"
        placement="top"
        v-model="popoverVisible"
        trigger="click"
      >
        <template slot="content">
          <div class="popover-box">
            <!-- 过滤的弹窗 -->
            <ul v-if="dialogList.length">
              <!-- 全选 -->
              <li class="section-bar" @click="handleAllCheck()" style>
                <span class="bar-title" style="font-weight: bold;">
                  <label>
                    {{
                    $t("languages.Apps.FormDesignPage.AllChecked")
                    }}
                  </label>
                </span>
                <span class="bar-right">
                  <a-checkbox :checked="isAllChecked" />
                </span>
              </li>
              <li class="section-bar" v-for="(cur, index) in dialogList" :key="cur.index">
                <span class="bar-title bar-title-c">
                  <label class="text-ellipsis">
                    {{
                    `${getKey(cur)}`
                    }}
                  </label>
                </span>
                <span class="bar-right">
                  <a-checkbox
                    @change="
                        status
                          ? handleIcon(cur.checked, index)
                          : toggleChecked(cur)
                      "
                    :checked="cur.checked"
                  />
                </span>
              </li>
            </ul>
            <!-- 提醒 -->
            <div v-else class="empty-tips">
              <p v-if="fieldBlock === 100">{{ $t("languages.Apps.sheetFiters") }}</p>
              <p v-else>{{ $t("languages.Apps.NoDataTips") }}</p>
            </div>
            <div class="bottom-bolck btn-group clearfix">
              <a-button
                class="btn"
                type="primary"
                size="small"
                @click="comfirmLevel1Popover"
              >{{ $t("languages.Apps.Ok") }}</a-button>
              <a-button class="btn" size="small" @click="closeLevel1Popover">
                {{
                $t("languages.Apps.Cancel")
                }}
              </a-button>
            </div>
          </div>
        </template>
        <template v-if="status">
          <div class="input-modal">
            <span class="txt">
              {{
              value && value.length > 0 ? "已设置" : "未设置"
              }}
            </span>
            <i class="aufontAll h-icon-all-ellipsis-o"></i>
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
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

@Component({
  name: 'DisplayFilters',
  components: {},
})
export default class DisplayFilters extends Vue {
  @Prop() propDataList!: Array<any[]>;

  @Prop() fieldBlock!: number;

  @Prop() status!: boolean;

  @Prop() value!: any;

  wrapStyle = { left: '624px' };

  // /* 服务器获取的原始数据 */
  // originDatas:any[] = [];

  dialogList: any[] = [];

  fblock: number = -1;

  popoverVisible: boolean = false;

  dialogListDefault: any[] = [];

  isAllChecked: boolean = false;

  // 获取非系统数据key
  getKey(cur: any) {
    let name: any = cur.name;
    if (cur.name_i18n) {
      let name_i18n: any;
      if (typeof cur.name_i18n === 'string') {
        name_i18n = JSON.parse(cur.name_i18n);
      } else {
        name_i18n = cur.name_i18n;
      }
      if (name_i18n[this.$i18n.locale]) {
        name = name_i18n[this.$i18n.locale];
      }
    }
    return name;
  }

  created() {
    // this.dialogList;
  }

  toggleChecked(item) {
    item.checked = !item.checked;
    this.isAllChecked = this.dialogList.every((res: any) => res.checked);
  }
  toggleCheckedSheet(e, v, o) {
    let item = this.dialogList[v];
    item.subSchema.properties[o].checked = !e.checked;

    this.$set(this.dialogList, v, item);
  }
  /* icon点击 */
  handleIcon(checked: boolean, i: number) {
    console.info(checked, i);
    this.changeDialogListChecked(checked, i);
    this.isAllChecked = this.dialogList.every((res: any) => res.checked);
  }

  changeDialogListChecked(ck: boolean, i: number) {
    // this.dialogList[i].checked = !ck;
    let item = this.dialogList[i];
    item.checked = !ck;
    // 手动触发刷新
    this.$set(this.dialogList, i, item);
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
    let flag: boolean = this.dialogList.every((d: any) => !d.checked)
    let list: any[] = flag ? [] : this.dialogList;
    this.$emit('addcomfirm', this.fieldBlock, list);
    this.popoverVisible = false;
  }

  // /* add弹窗-取消 */
  closeLevel1Popover() {
    const arr = JSON.parse(JSON.stringify(this.dialogListDefault));
    this.dialogList = arr;
    this.popoverVisible = false;
  }

  /**
   * 下拉选择值赋值
   */
  @Watch('propDataList', { immediate: true })
  linsteningdialogData(v: any) {
    if (this.status) {
      v = v.map((i) => {
        if (typeof this.value === 'string') {
          try {
            this.value = JSON.parse(this.value);
          } catch {
            this.value = [];
          }
        }
        const f = this.value && this.value.find((s: any) => i.code === s.code);
        i.checked = f && f.hasOwnProperty('checked') ? f.checked : false;
        i.isSystem = i.defaultProperty;
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
    this.$off('addcomfirm');
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
<style lang="less">
.display-filters {
  width: 260px;
  max-height: 280px;
  .popover-box {
    width: 220px;
    ul {
      height: 260px;
      overflow: auto;
    }
  }
}
</style>
