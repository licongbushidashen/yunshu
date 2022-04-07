<template>
  <a-modal
    v-model="showModal"
    :maskClosable="false"
    :width="600"
    @cancel="closeModal"
  >
    <div slot="title">
      <span>{{ $t("cloudpivot.list.pc.SetDisplayItems") }}</span>
      <span class="tip">{{ $t("cloudpivot.list.pc.dragToSort") }}</span>
    </div>
    <div class="column-setting">
      <div class="select-all">
        <a-checkbox
            :indeterminate="indeterminate"
            :checked="checkedAll"
            @change="onCheckAll"
        >
        </a-checkbox>
        <span>{{ $t("cloudpivot.list.pc.checkAll") }}</span>
      </div>
      <Draggable :list="cusColumns" :options="dragOptions">
        <transition-group>
          <li v-for="(item, index) in cusColumns"
              :key="item.id"
              class="drag-item"
          >
            <span class="index">{{ index + 1 }}</span>
            <a-checkbox
              v-model="item.isShow"
              class="checkbox"
              @change="itemChange"
            ></a-checkbox>
            <span
              class="name"
              :title="isChinese ? item.vcTitle : JSON.parse(item.name_i18n)[$i18n.locale]"
              >{{
                isChinese ? item.vcTitle : JSON.parse(item.name_i18n)[$i18n.locale]
              }}</span
            >
            <i class="icon aufontAll h-icon-all-drag"></i>
          </li>
        </transition-group>
      </Draggable>
      <div v-if="sheetColumns && sheetColumns.length > 0" v-for="(i, v) in sheetColumns" :key="v">
        <div class="h3-panel">
          <div class="h3-panel-header left">
            <div class="sheet-check">
              <span class="index">{{ cusColumns ? cusColumns.length + v + 1 : '' }}</span>
              <a-checkbox
                  :indeterminate="indeterminateSheet[v]"
                  :checked="i.isShow"
                  @change.prevent.stop="onSheetCheckAll(i, v)"
              >
              </a-checkbox>
              <span>{{
                isChinese ? i.vcTitle : JSON.parse(i.name_i18n)[$i18n.locale]
              }}</span>
            </div>
            <i
              @click="collapse(v)"
              class="icon aufontAll h-icon-all-right-o"
              :class="{ expanded: show[v] }"
            />
          </div>
          <div class="h3-panel-right">
            <slot name="fullIcon"></slot>
          </div>
          <transition name="h3-fade">
            <div class="h3-panel-body" v-show="show[v]">
              <Draggable :list="i.childColumns" :options="dragOptions">
                <transition-group>
                  <li
                    v-for="(item, index) in i.childColumns"
                    :key="item.id"
                    class="drag-item"
                  >
                    <span class="index">{{ index + 1 }}</span>
                    <a-checkbox
                      v-model="item.isShow"
                      class="checkbox"
                      @change.prevent.stop="caculateStatusSheet(v, i)"
                    ></a-checkbox>
                    <span
                      class="name"
                      :title="
                        isChinese ? item.name : JSON.parse(item.name_i18n)[$i18n.locale]
                      "
                      >{{
                        isChinese ? item.name : JSON.parse(item.name_i18n)[$i18n.locale]
                      }}</span
                    >
                    <i class="icon aufontAll h-icon-all-drag"></i>
                  </li>
                </transition-group>
              </Draggable>
            </div>
          </transition>
        </div>
      </div>
    </div>
    <div slot="footer" class="model-footer">
      <a-button type="default" @click="closeModal">{{
        $t("cloudpivot.list.pc.Cancel")
      }}</a-button>
      <!-- <a-button type="default" @click="recovery">{{ $t('cloudpivot.list.pc.recovery') }}</a-button> -->
      <a-button type="primary" @click="confirm">{{
        $t("cloudpivot.list.pc.OK")
      }}</a-button>
    </div>
  </a-modal>
</template>
<script lang='ts'>
import { Component, Vue, Prop, Watch } from "vue-property-decorator";

import { Modal, Checkbox, Icon, Button } from "@h3/antd-vue";

import { DataItemType } from "@cloudpivot/form/schema";
import Draggable from "vuedraggable";

@Component({
  name: "FormColumnSetting",
  components: {
    AModal: Modal,
    AButton: Button,
    ACheckbox: Checkbox,
    Draggable,
  },
})
export default class FormColumnSetting extends Vue {
  @Prop() value!: boolean;

  @Prop() columns!: Array<any>;

  cusColumns: any = [];

  sheetColumns: any = [];

  showModal: boolean = false;

  indeterminate: boolean = false; // 非全选

  checkedAll: boolean = false; // 全选

  checkedAllSheet: any = [];

  indeterminateSheet: any = [];

  activeKey:any = ["0"];
  show: any = [];

  get icon() {
    return this.show ? "h-icon-all-down-o" : "h-icon-all-right-o";
  }

  collapse(v) {
    this.$set(this.show, v, !this.show[v]);
  }

  // 拖拽排序配置
  dragOptions: any = {
    animation: 150,
    ghostClass: "ghostClass",
    fallbackClass: "dragClass",
    touchStartThreshold: 20,
    delay: 50,
  };

  get isChinese() {
    return this.$i18n.locale === "zh";
  }

  mounted() {
    console.log('this.cul', this.columns)
    document.body.ondrop = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
  }

  closeModal() {
    this.$emit("input", false);
  }

  confirm() {
    this.sheetColumns.forEach((i) => {
      const cols = i.childColumns.filter((i) => i.isShow);
      if (cols && cols.length > 0) {
        i.isShow = true;
      }
    });
    this.$emit("confirm", [...this.cusColumns, ...this.sheetColumns]);
    this.closeModal();
  }

  recovery() {
    this.$emit("recovery");
    this.closeModal();
  }

  itemChange() {
    this.caculateStatus();
  }

  onCheckAll(v: any) {
    const checked:boolean = v.target.checked;
    if (Array.isArray(this.cusColumns) && this.cusColumns.length > 0) {
      this.cusColumns.forEach((col: any) => {
        col.isShow = checked;
      });
    }
    if (Array.isArray(this.sheetColumns) && this.sheetColumns.length > 0) {
      this.sheetColumns.forEach((col: any) => {
        col.isShow = checked;
        if (Array.isArray(col.childColumns) && col.childColumns.length > 0) {
          col.childColumns.forEach((child: any) => {
            child.isShow = checked;
          });
        }
      });
    }
    this.caculateStatus();
    // const allItems: number = this.cusColumns.length;
    // const checkedItems: number = this.cusColumns.filter(
    //   (col: any) => col.isShow
    // ).length as number;
    // if (checkedItems < allItems) {
    //   this.cusColumns.forEach((col: any) => {
    //     col.isShow = true;
    //   });
    // } else {
    //   this.cusColumns.forEach((col: any) => {
    //     col.isShow = false;
    //   });
    // }
  }

  onSheetCheckAll(i, v: any) {
    i.isShow = !i.isShow;
    this.sheetColumns[v].childColumns.forEach((col: any) => {
      col.isShow = i.isShow;
    });
    const allItems: number = this.sheetColumns[v].childColumns.length;
    const checkedItems: number = this.sheetColumns[v].childColumns.filter(
        (col: any) => col.isShow
    ).length as number;
    this.indeterminateSheet[v] =
        checkedItems === 0 ? false : allItems > checkedItems;
    this.caculateStatus();
  }

  caculateStatus() {
    let allItems = 0;
    let checkedItems = 0;
    let checkedAllSheet:any = [];
    const list = [...this.cusColumns, ...this.sheetColumns];

    list.forEach((i) => {
      if (i.propertyType === DataItemType.Sheet) {
        allItems = allItems + i.childColumns.length;
        checkedItems = (checkedItems +
            i.childColumns.filter((col: any) => col.isShow).length) as number;
        let status =
            i.childColumns.filter((col: any) => col.isShow).length ===
            i.childColumns.length;
        checkedAllSheet.push(!status);
      } else {
        allItems++;
        if (i.isShow) {
          checkedItems++;
        }
      }
    });
    // this.indeterminateSheet = checkedAllSheet;
    this.indeterminate = checkedItems === 0 ? false : allItems > checkedItems;
    this.checkedAll = allItems === checkedItems;
  }

  caculateStatusSheet(v, i) {
    const allItems: number = this.sheetColumns[v].childColumns.length;
    const checkedItems: number = this.sheetColumns[v].childColumns.filter(
      (col: any) => col.isShow
    ).length as number;
    this.indeterminateSheet[v] =
      checkedItems === 0 ? false : allItems > checkedItems;
    i.isShow = allItems === checkedItems;
    this.caculateStatus();
  }

  @Watch("value")
  onValueChange(v: boolean) {
    this.showModal = v;
    if (v) {
      const list = JSON.parse(JSON.stringify(this.columns));
      this.cusColumns = list.filter(
        (i) => i.propertyType !== DataItemType.Sheet
      );
      this.sheetColumns = list.filter(
        (i) => i.propertyType === DataItemType.Sheet
      );
      let indeterminateSheet:any = [];
      this.sheetColumns.forEach((i) => {
        let status =
          i.childColumns.filter((col: any) => col.isShow).length ===
          i.childColumns.length;
        indeterminateSheet.push(!status);
      });
      this.indeterminateSheet = indeterminateSheet;
      this.show = Array.apply(null, {
        length: this.sheetColumns.length,
      }).map(() => true);
      this.caculateStatus();
    }
  }
}
</script>
<style lang="less" scoped>
.column-setting {
  max-height: 340px;
  overflow: auto;
  .drag-item {
    display: inline-block;
    width: 33.3333%;
    padding: 5px;
    vertical-align: middle;
    background: white;
    transition: all ease 0.3s;
    border: 1px solid white;
    border-radius: 4px;
    white-space: nowrap;
    cursor: move;
    user-select: none;
    > span,
    > label {
      vertical-align: middle;
    }
    > span.name {
      padding-right: 0px;
      display: inline-block;
      max-width: 7em;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-left: 8px;
    }
    .index {
      display: inline-block;
      vertical-align: middle;
      width: 24px;
      // height: 22px;
      margin-right: 8px;
      text-align: center;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.45);
      // line-height:22px;
      overflow: hidden;
    }
    .icon {
      color: rgba(0, 0, 0, 0.45);
      font-size: 12px;
      line-height: 21px;
      float: right;
      display: none;
    }
    &:hover {
      background: #f0f7ff;
      & .icon {
        display: block;
      }
    }
  }
  .ghostClass {
    opacity: 1;
    background-color: white;
    border: 1px dashed #2970ff;
    border-radius: 4px;
    * {
      opacity: 0;
    }
  }
  .dragClass {
    .index {
      display: none;
    }
  }
  .select-all {
    // margin-left: 5px;
    margin-left: 38px;
    margin-bottom: 5px;
  }
}
.sheet-check{
  margin-left: 6px;
  .index{
    display: inline-block;
    vertical-align: middle;
    width: 24px;
    margin-right: 8px;
    text-align: center;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.45);
    overflow: hidden;
  }
}
.model-footer {
  text-align: right;
}
.tip {
  margin-left: 8px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  line-height: 22px;
}
.h3-panel {
  text-align: left;

  &.required > .h3-panel-header::before {
    content: "*";
    color: @error-color;
    display: inline-block;
  }
}

.h3-panel-right {
  float: right;
  cursor: pointer;
  margin-top: 6px;
}
.h3-panel-header {
  display: flex;
  cursor: pointer;
  justify-content: space-between;
  border-bottom: 1px #e8e8e8 solid;
  margin-top: 10px;
  &.vertical {
    padding-left: 8px !important;
  }

  & > i {
    margin-left: 0.5em;
    margin-right: 9px;
    font-size: 10px;
    display: inline-block;
    transition: transform 0.24s;

    &.expanded {
      transform: rotate(90deg);
    }
    color: rgba(0, 0, 0, 0.65);
    // & > svg {
    //   color: rgba(0, 0, 0, 0.65);
    // }
  }
}

.h3-panel-body {
  //overflow: hidden;
}

.h3-panel.xl > .h3-panel-header {
  padding: @base4-padding-sm 0;

  & > span {
    font-size: 18px;
  }
}

.h3-fade-enter-active,
.h3-fade-leave-active {
  max-height: 100rem;
  // transition: all 3s ease;
  transition: all 0.15s cubic-bezier(0.645, 0.045, 0.355, 1) !important;
}

.h3-fade-enter,
.h3-fade-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
