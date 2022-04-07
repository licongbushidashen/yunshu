<template>
  <div class="left-attr">

    <template v-if="itemAttrs.eleType">
      <div class="left-item">
        <p>{{obj && obj.title ? obj.title : '子表'}}</p>
        <div><small>单行高度</small></div>
        <a-input-number style="width:100%;margin-top:4px" :min="9" :max="625 - itemAttrs.top" v-model="itemAttrs.bodyHeight" @change="bodyHeightChange(itemAttrs.bodyHeight)" />
      </div>

      <div class="left-item" v-if="!obj || (obj && obj.type !== 'processLog')">
        <p>打印表头</p>
        <div class="input-select">
          <a-select show-search v-model="sheetHeaderPagingAttr" @change="handleSelectChange">
            <a-select-option
              v-for="item in sheetHeaderOptions"
              :key="item.code"
              :value="item.code"
            >{{ item.label }}</a-select-option>
          </a-select>
        </div>
      </div>

      <!-- <Xywh  /> -->

      <div class="left-item">

        <p>表格</p>

        <a-row type="flex" class="header">
          <a-col class="col" :span="6"><small>列内容</small></a-col>
          <a-col class="col" :span="14"><small>列标题</small></a-col>
        </a-row>

        <draggable element="div" v-model="itemAttrs.columns" :options="dragOptions" @end="onSortEnd" class="draggable">
          <a-row type="flex" align="middle" v-for="(col, index) in itemAttrs.columns" :key="index">

            <a-col class="col text" :span="6" @pointerdown.stop="">
              <template v-if="col.isSequence">
                序号
              </template>
              <template v-else-if="col.rowSettings.bindSource">
                {{ col.rowSettings.bindSource.name }}
              </template>
              <template v-else>
                空白列
              </template>
            </a-col>

            <a-col class="col" :span="14">
              <a-input :value="col.name" @change="e => col.name = e.target.value" @pointerdown.stop="" />
            </a-col>

            <a-col class="col" :span="4">

              <!-- 删除按钮 -->
              <span class="icons">

                <i class="aufontAll h-icon-all-delete-o" @click="onDeleteCol(index)"></i>

              </span>

              <!-- 删除按钮 -->
              <span class="icons">

                <i class="aufontAll h-icon-all-move-o"></i>

              </span>

            </a-col>

          </a-row>
        </draggable>

        <div class="action-bar">

          <a-dropdown :trigger="['click']">
            <a class="ant-dropdown-link" href="#">
              <a-icon type="plus" /> 新增
            </a>
            <a-menu slot="overlay">
              <a-menu-item @click="onAddColumn('sequence')" :disabled="hasSequence">
                序号
              </a-menu-item>
              <a-menu-item v-for="item of subItems" :key="item.code" :disabled="itemDisabled(item.code)" @click="onAddColumn(item)">
                {{ item.name }}
              </a-menu-item>
              <a-menu-item @click="onAddColumn('empty')">
                空白列
              </a-menu-item>
            </a-menu>
          </a-dropdown>

        </div>

      </div>

    </template>

    <template v-else>

      <div class="left-item">
        <p>文本内容</p>

        <div class="input-text" v-if="itemAttrs.name !== undefined">
          <a-input :value="itemAttrs.name" @change=" e => setItemProperty('name', e.target.value)" />
        </div>

        <div class="input-select" style="line-height:0.9" v-else>
          <a-select show-search :value="itemAttrs.bindSource ? itemAttrs.bindSource.code : ''" @change="setBindSource">
            <a-select-option value="sequence">序号</a-select-option>
            <a-select-option v-for="item in subItems" :value="item.code" :key="item.code">{{ item.name }}</a-select-option>
            <a-select-option value="">空白列</a-select-option>
          </a-select>
        </div>

      </div>

    </template>
    <div class="left-item" v-if="obj && obj.type === 'processLog'">
      <p>表格行</p>
      <div class="row-checkbox">
        <div
          v-for="(i,index) in itemAttrs.baseOperation"
          :key="index"
          class="check-item"
        >
          <a-checkbox
            v-model="i.selected"
            class="checkbox"
            @change="(e)=>{ onSelectChange(index,e) }"
          ></a-checkbox>
          <span>{{ i.text }}</span>
        </div>
      </div>
    </div>
    <div class="left-item">
      <p>填充色</p>
      <div class="color-select">

        <color-dropdown :fill="true" :value="itemAttrs.backgroundColor" @change="selectColor($event, 'backgroundColor')"></color-dropdown>

      </div>
    </div>

    <div class="left-item" v-if="itemAttrs.eleType">
      <p>边框</p>
      <div class="select-input">

        <line-size-dropdown :value="itemAttrs.borderWidth" @change="selectBorder($event, 'borderWidth')"></line-size-dropdown>

        <color-dropdown icon="h-icon-all-edit-o" :value="itemAttrs.borderColor" @change="selectColor($event, 'borderColor')"></color-dropdown>

        <border-dropdown :disabled="true"></border-dropdown>

      </div>
    </div>

    <div class="left-item">
      <p>字体</p>
      <div class="font-setting">

        <size-dropdown :value="itemAttrs.fontSize" @change="setFontSize"></size-dropdown>

        <color-dropdown icon="h-icon-all-text-a" :value="itemAttrs.fontColor" @change="selectColor($event, 'fontColor')"></color-dropdown>

        <font-style-group :bold="itemAttrs.fontBold" :italic="itemAttrs.fontItalic" :underline="itemAttrs.fontUnderline" @change="setFontStyle"></font-style-group>

      </div>
    </div>

    <div class="left-item">
      <p>对齐</p>
      <div class="font-neat">

        <text-align-group :horizontal="itemAttrs.horizontalAlign" :vertical="itemAttrs.verticalAlign" @change="setTextAlign"></text-align-group>

      </div>
    </div>
  </div>

  </div>
</template>

<script lang="ts">
// eslint-disable-next-line
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
// eslint-disable-next-line
import { namespace } from "vuex-class";
// eslint-disable-next-line
import {
  borderDivs,
  fontsArrays,
  borderStyle,
} from "@/config/print/dataStructure";
// eslint-disable-next-line
import { onChange } from "@/utils/print-util";
import ColorSelect from "./color-component.vue";

import ColorDropdown from "./color-dropdown.vue";
import LineSizeDropdown from "./line-size-dropdown.vue";
import SizeDropdown from "./size-dropdown.vue";
import BorderDropdown from "./border-dropdown.vue";
import FontStyleGroup from "./font-style-group.vue";
import TextAlignGroup from "./text-align-group.vue";
import processLog from "../processLog";

import Xywh from "./xywh.vue";

const PrintVuex = namespace("Print/Print");

import Draggable from "vuedraggable";

// @ts-ignoie
import { Sheet, SheetColumn } from "@/config/print/dataStructure";

@Component({
  name: "sheet-settings",
  components: {
    ColorSelect,
    ColorDropdown,
    LineSizeDropdown,
    SizeDropdown,
    BorderDropdown,
    FontStyleGroup,
    TextAlignGroup,
    Xywh,
    Draggable,
  },
})
export default class SheetSettings extends Vue {
  @PrintVuex.State("itemAttrs") itemAttrs!: any;
  @PrintVuex.Mutation("setAttrs") setAttrs!: any;

  @PrintVuex.Mutation("changeXYWH") changeXYWH!: any;

  @PrintVuex.State("bizSysData") bizSysData!: any[];

  @Prop() obj!: object;

  positionClick: object = {
    top: true,
    right: true,
    bottom: true,
    left: true,
  };

  borderStyle: object = borderStyle;

  borders: object[] = borderDivs;

  fontsArr: number[] = fontsArrays;

  dragOptions = {
    animation: 150,
    ghostClass: "ghostClass",
  };

  sheetHeaderPagingAttr: string = "first";
  sheetHeaderOptions: Array<any> = [
    {
      label: "首页打印",
      code: "first",
    },
    {
      label: "每页打印",
      code: "every",
    },
  ];

  created() {
    if (this.itemAttrs.sheetHeaderPagingAttr) {
      this.sheetHeaderPagingAttr = this.itemAttrs.sheetHeaderPagingAttr;
    }
  }

  get subItems() {
    if (
      this.itemAttrs.eleType === "processLog" ||
      this.itemAttrs.parentId === "leftProcessLog"
    ) {
      return processLog;
    }
    const code = this.itemAttrs.parentId
      ? this.itemAttrs.parentId
      : this.itemAttrs.code;
    const parent = this.bizSysData.find((x: any) => x.code === code);
    if (!parent) {
      return [];
    }

    return parent.subSchema.properties.filter(
      (item: any) => !item.defaultProperty && item.published
    );
  }

  itemDisabled(code: string) {
    const has = this.itemAttrs.columns.some(
      (col: any) =>
        col.rowSettings.bindSource && col.rowSettings.bindSource.code === code
    );
    return has;
  }

  get hasSequence() {
    return this.itemAttrs.columns.some((col: any) => col.isSequence);
  }

  selectBorder(e: any, border: string) {
    this.itemAttrs.borderWidth = e;
    this.setAttrs(this.itemAttrs);
  }

  selectColor(color: string, key: string) {
    this.setItemProperty(key, color);
  }

  setFontSize(evt: any) {
    this.setItemProperty("fontSize", evt);
  }

  setFontStyle(data: { key: string; value: boolean }) {
    const key = `font${data.key[0].toUpperCase()}${data.key.substr(1)}`;
    this.setItemProperty(key, data.value);
  }

  setFont(key: string, value: any) {
    this.setItemProperty(key, value);
  }

  setHorizontalAlign(value: string) {
    this.setItemProperty("horizontalAlign", value);
  }

  setVerticalAlign(value: string) {
    this.setItemProperty("verticalAlign", value);
  }

  setTextAlign(data: { key: string; value: string }) {
    const key = data.key + "Align";
    this.setItemProperty(key, data.value);
  }

  setItemProperty(key: string, value: any) {
    this.itemAttrs[key] = value;

    if (this.itemAttrs.columns) {
      this.itemAttrs.columns.forEach((col: any) => {
        col[key] = value;
        if (col.rowSettings) {
          col.rowSettings[key] = value;
        }
      });
    }
    console.log(this.itemAttrs, "this.itemAttrsthis.itemAttrs");

    this.setAttrs(this.itemAttrs);
  }

  setBindSource(code: string) {
    if (code && code !== "sequence") {
      const item = this.subItems.find((x: any) => x.code === code);
      if (item) {
        this.setItemProperty("bindSource", {
          code,
          name: item.name,
        });
      }
    } else if (code === "sequence") {
      this.setItemProperty("isSequence", true);
      this.setItemProperty("bindSource", {
        code,
        name: "序号",
      });
    } else {
      this.setItemProperty("bindSource", null);
    }
  }

  onDeleteCol(index: number) {
    this.itemAttrs.columns.splice(index, 1);

    let width = 0;
    this.itemAttrs.columns.forEach((col) => (width += col.widthValue));
    this.itemAttrs.widthValue = width;

    this.setAttrs(this.itemAttrs);
  }

  onAddColumn(item: any) {
    if (item === "empty") {
      const col = new SheetColumn(this.itemAttrs.code, "空白列", 50);

      this.itemAttrs.columns.push(col);
    } else if (item === "sequence") {
      const col = new SheetColumn(this.itemAttrs.code, "序号", 50);
      col.rowSettings.bindSource = {
        code: "sequence",
        name: "序号",
      };
      col.isSequence = true;

      this.itemAttrs.columns.unshift(col);
    } else if (item) {
      const col = new SheetColumn(this.itemAttrs.code, item.name, 50);

      col.rowSettings.bindSource = {
        code: item.code,
        name: item.name,
      };

      this.itemAttrs.columns.push(col);
    }

    this.setAttrs(this.itemAttrs);
  }

  onSortEnd() {}

  fourBorder(): object {
    let rectStr: string = "";
    let borStr: string = "";
    Object.keys(this.positionClick).forEach((key: string) => {
      // @ts-ignore
      if (this.positionClick[key]) {
        rectStr += `border-${key}: 1px solid #ccc;`;
        // @ts-ignore
        borStr += `border-${key}: ${this.itemAttrs.borderWidthValue} solid ${this.itemAttrs.borderColorValue};`;
      } else {
        rectStr += `border-${key}: 1px solid #fff;`;
        // @ts-ignore
        borStr += `border-${key}: 1px solid #fff;`;
      }
    });
    return { rectStr, borStr };
  }

  borderClick(position: string) {
    // @ts-ignore
    this.positionClick[position] = !this.positionClick[position];
    // @ts-ignore
    if (this.positionClick[position]) {
      // @ts-ignore
      this.borderStyle[position] = "background: rgba(118, 156, 249, 1)";
    } else {
      // @ts-ignore
      this.borderStyle[position] = "background: #ccc";
    }
    // @ts-ignore
    this.$refs.boxSide.style = this.fourBorder().rectStr;
    // @ts-ignore
    this.itemAttrs.hasWhereBorders = this.fourBorder().borStr;
  }

  @Watch("itemAttrs.lineDirection")
  xyChange(n: string, o: string) {
    // @ts-ignore
    this.itemAttrs.active = false;
    if (n.includes("x")) {
      // @ts-ignore
      this.itemAttrs.heightValue = 1;
      // @ts-ignore
      this.itemAttrs.widthValue = 85;
    } else {
      // @ts-ignore
      this.itemAttrs.heightValue = 85;
      // @ts-ignore
      this.itemAttrs.widthValue = 1;
    }
    // @ts-ignore
    this.changeXYWH({
      heightValue: this.itemAttrs.heightValue,
      widthValue: this.itemAttrs.widthValue,
    });
  }

  @Watch("itemAttrs", { deep: true })
  itemAttrsChange() {
    if (this.itemAttrs.sheetHeaderPagingAttr) {
      this.sheetHeaderPagingAttr = this.itemAttrs.sheetHeaderPagingAttr;
    } else {
      this.sheetHeaderPagingAttr = "first";
    }
  }

  bodyHeightChange(height: number) {
    const diffH =
      height - (this.itemAttrs.heightValue - this.itemAttrs.headHeight - 31);
    this.itemAttrs.heightValue += diffH;
  }

  handleSelectChange(item) {
    this.itemAttrs.sheetHeaderPagingAttr = item;
    this.setAttrs(this.itemAttrs);
  }

  onSelectChange(i, item) {
    this.itemAttrs.baseOperation[i].selected = item.target.checked;
    this.setAttrs(this.itemAttrs);
  }
}
</script>

<style lang="less" scoped>
.action-bar {
  margin-top: @base4-padding-md;
  text-align: center;

  & a {
    color: @primary-color;
  }
}

.draggable {
  cursor: move;
}

.col {
  padding: 5px;

  &.text {
    cursor: text;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & > .icons {
    &:not(:first-child) {
      margin-left: @base10-padding-sm;
    }

    & > i {
      font-size: @font-size-14;

      &.h-icon-all-delete-o {
        cursor: pointer;
      }
    }
  }
}

small {
  color: @light-color-3;
}

.ghostClass {
  border: 1px dashed @primary-color;

  & > * {
    opacity: 0;
  }
}
.row-checkbox {
  display: flex;
  flex-wrap: wrap;
  .check-item {
    font-size: 14px;
    margin: 5px 10px;
    line-height: 22px;
    .checkbox {
      font-size: 14px;
      margin-right: 6px;
    }
    .text {
      display: inline-block;
      vertical-align: middle;
      min-width: 42px;
      width: calc(100% - 16px);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .check-tips {
      color: rgba(0, 0, 0, 0.45);
      font-size: 12px;
      margin-left: 30px;
      min-width: 155px;
      width: calc(100% - 36px);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
