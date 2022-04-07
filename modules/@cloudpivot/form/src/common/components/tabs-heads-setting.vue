
<template>
  <div>
    <a-modal
      title="Tab设置"
      @cancel="onCancel"
      @ok="onOk"
      :cancelText="$t('languages.Apps.Cancel')"
      :okText="$t('languages.Apps.Ok')"
      :visible="true"
      :maskClosable="false"
      :keyboard="false"
    >
      <draggable
        element="div"
        v-model="heads"
        :options="dragOptions"
        @end="onSortEnd"
        class="draggable"
      >
        <a-row v-for="(item,index) in heads" :key="item.key" class="row" type="flex">
          <a-col class="col" :span="4" @pointerdown.stop>{{ 'Tab' + (index + 1) }}</a-col>

          <a-col class="col" :span="16" @pointerdown.stop>
            <a-input v-model="item.title" @pointerdown.stop />
          </a-col>

          <a-col class="col operation" :span="4">
            <span class="icons">
              <i class="aufontAll h-icon-all-drag"></i>
            </span>

            <span class="icons" @pointerdown.stop>
              <i class="aufontAll h-icon-all-setting-o" @click="setting(index)"></i>
            </span>

            <span class="icons" @pointerdown.stop>
              <a-icon v-show="heads.length > 1" type="delete" @click="remove(index)"></a-icon>
            </span>
          </a-col>
        </a-row>
      </draggable>

      <div class="actions">
        <a-button icon="plus" @click="add">新增Tab</a-button>
      </div>
    </a-modal>

    <a-modal
      title="Tab条件设置"
      @cancel="onConditionCancel"
      @ok="onConditionOk"
      cancelText="取消"
      okText="确定"
      :visible="conditionVisible"
      :maskClosable="false"
      :keyboard="false"
    >
      <dataitem-condition v-model="model" :items="dataItems"></dataitem-condition>
    </a-modal>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Vue,
  Prop,
  Watch,
  Model,
  Inject,
} from "vue-property-decorator";

import { schema } from "@cloudpivot/form";

import Draggable from "vuedraggable";

import DataitemCondition from "@cloudpivot/form/src/common/data-item/tab-dataitem-condition.vue";

import {
  OperatorService,
  DateItemOperatorType,
} from "@cloudpivot/form/src/common/data-item/tab-data-item";

import { DataitemConditionValue } from "@cloudpivot/form/src/common/data-item/typings";

import { DataItemState } from "@cloudpivot/form/src/stores/data-items.store";

import * as dataitemStore from "@cloudpivot/form/src/stores/data-items.store-helper";

import { DataItemType } from "@cloudpivot/form/src/typings";

@Component({
  name: "TabsHeadsSetting",
  components: {
    Draggable,
    DataitemCondition,
  },
})
export default class TabsHeadsSetting extends Vue {
  @Prop({
    default: () => {},
  })
  modalData!: any;

  @Prop()
  getControl!: () => schema.FormTabs;

  heads: any[] = [];

  addKeys: string[] = [];

  number = 0;

  model: DataitemConditionValue = {
    type: 1,
    conditions: [],
  };

  dataItems: DataItemState[] = [];

  conditionVisible: Boolean = false;

  //点击设置给定当前选中的行的下标
  currentIndex: number = 0;

  dragOptions = {
    animation: 150,
    ghostClass: "ghostClass",
  };

  @Watch("modalData", {
    immediate: true,
  })
  onModalDataChange() {
    this.addKeys = [];
    if (this.modalData.data.value) {
      this.heads = this.modalData.data.value.map((x) => Object.assign({}, x));

      const reg = /\d+/;
      this.number = this.modalData.data.value
        .map((h) => {
          const result = reg.exec(h.key);
          if (!result) {
            return 0;
          }
          return Number(result[0]);
        })
        .sort((a, b) => a - b)
        .pop();
    } else {
      this.heads = [];
    }
  }

  remove(index: number) {
    const key = this.heads[index].key;
    this.heads.splice(index, 1);
    const i = this.addKeys.findIndex((k) => k == key);
    if (i > -1) {
      this.addKeys.splice(i, 1);
    }
  }

  setting(index: number) {
    this.conditionVisible = true;
    this.currentIndex = index;
    let currentSource: any = this.heads[index];
    this.buildDataItems();
    if (currentSource.changeFormula) {
      this.handleExpToData(currentSource.changeFormula);
    }
    //currentSource.changeFormula &&
  }

  buildDataItems() {
    this.dataItems = dataitemStore.getDataItems(this).filter((x) => x.used);
  }

  add() {
    const key = "tab" + (++this.number).toString();

    this.heads.push({
      key,
      title: key,
    });
    this.addKeys.push(key);
  }

  onSortEnd() {}

  onCancel() {
    this.$emit("closeModal");
  }

  onOk() {
    const data: any = {
      value: this.heads,
    };
    for (let h of this.heads) {
      let { title } = h;
      if (/\"|\'|\‘|\“'/.test(title)) {
        console.error(title);
        this.$message.error("Tab名称不能包含:双引号和单引号");
        return;
      }
    }

    const tabs = this.getControl();

    tabs.panels
      .map((panel, index) => {
        if (this.heads.some((h) => h.key === panel.key)) {
          return -1;
        }
        return index;
      })
      .filter((index) => index !== -1)
      .reverse()
      .forEach((index) => tabs.panels.splice(index, 1));

    this.addKeys.forEach((key) => {
      tabs.panels.push({
        key,
        type: schema.FormControlType.TabsPanel,
        options: {},
        controls: {} as any,
        layout: [],
      });
    });

    this.$emit("backData", data);
  }

  onConditionOk() {
    this.conditionVisible = false;
    let currentSource: any = this.heads[this.currentIndex];
    currentSource["changeFormula"] = this.handleDataToExp(this.model);
    this.resetModel();
  }

  onConditionCancel() {
    this.conditionVisible = false;
    this.resetModel();
  }

  resetModel() {
    this.model = {
      type: 1,
      conditions: [],
    };
  }

  //把数据转化为表达式
  handleDataToExp(data: any) {
    let symbol = data.type === 1 ? "&&" : "||";
    let exp = data.conditions
      .map((cond) => {
        let operator = OperatorService.findByValue(
          cond.propertyType,
          cond.operatorType
        );
        if (!operator) {
          return null;
        }

        let text = "";

        let val = cond.value;

        if (cond.propertyType === DataItemType.Number) {
          if (
            cond.operatorType === DateItemOperatorType.IsNull ||
            cond.operatorType === DateItemOperatorType.IsNotNull
          ) {
            text = "";
          } else {
            val = Number(val);
            if (Number.isNaN(val)) {
              return null;
            }
            text = val.toString();
          }
        } else if (cond.propertyType === DataItemType.Logic) {
          val = val === "true" || val === 1;
          text = `${val}`;
        } else if (cond.propertyType === DataItemType.StaffSingle) {
          if (val && Array.isArray(val)) {
            const arr = val.map((x: any) => {
              return {
                id: x.id,
                name: x.name,
                type: x.type,
                parentId: x.parentId,
              };
            });

            text = JSON.stringify(arr);
          }
        } else {
          text = `"${val}"`;
        }

        let code = `{${cond.propertyCode}}`;
        if (
          operator.value === DateItemOperatorType.IsNull ||
          operator.value === DateItemOperatorType.IsNotNull
        ) {
          return `${code} ${operator.label}`;
        }

        return `${code} ${operator.label} ${text}`;
      })
      .filter((x) => x !== null)
      .join(` ${symbol} `);

    return exp;
  }
  //把表达式转化为数据
  handleExpToData(exp: string) {
    let segs: string[] = [];
    let type: number = 1;
    if (exp.indexOf("||") > -1) {
      type = 2;
      segs = exp.split(" || ");
    } else {
      if (exp.indexOf("&&") > -1) {
        segs = exp.split(" && ");
      } else {
        segs = [exp];
      }
    }
    const conditions: any[] = [];
    for (const seg of segs) {
      const fields = seg.split(" ");
      const code = fields[0].substring(1, fields[0].length - 1);

      let item: DataItemState | undefined;

      const idx = code.indexOf(".");
      if (idx > -1) {
        const parentCode = code.substring(0, idx);
        const childCode = code.substring(idx + 1);
        const sheet = this.dataItems.find((x) => x.code === parentCode);
        if (sheet && sheet.properties) {
          item = sheet.properties.find((x) => x.code === childCode) as any;
        }
      } else {
        item = this.dataItems.find((x) => x.code === code);
      }

      if (!item) {
        continue;
      }

      let operator = OperatorService.findByLabel(item.type, fields[1]);

      if (!operator) {
        continue;
      }

      let val: any;

      if (
        !(
          operator.value === DateItemOperatorType.IsNull ||
          operator.value === DateItemOperatorType.IsNotNull
        )
      ) {
        val = fields[2];

        switch (item.type) {
          case DataItemType.Number:
            val = Number(val);
            break;
          case DataItemType.Logic:
            val = val === "true" ? 1 : 0;
            break;
          case DataItemType.Date:
          case DataItemType.Time:
          case DataItemType.ShortText:
          case DataItemType.Radio:
          case DataItemType.Checkbox:
          case DataItemType.Dropdown:
          case DataItemType.DropdownMulti:
          case DataItemType.LongText:
            val = val.substring(1, val.length - 1);
            break;
          case DataItemType.StaffSingle:
          case DataItemType.StaffMulti:
          case DataItemType.StaffDeptMix:
          case DataItemType.DeptMulti:
          case DataItemType.DeptSingle:
            if (val) {
              try {
                val = JSON.parse(val);
              } catch (e) {
                console.log("initModel", e);
              }
            }
            break;
        }
      }

      conditions.push({
        propertyCode: code,
        propertyType: item.type,
        operatorType: operator.value,
        value: val,
      });
    }
    this.model = {
      type,
      conditions,
    };
  }
}
</script>

<style lang="less" scoped>
.row {
  margin-bottom: @base4-padding-md;
}

.col {
  display: flex;
  align-items: center;

  &.operation {
    & > .icons {
      margin-left: @base10-padding-sm;
    }

    & i {
      cursor: pointer;

      &.h-icon-all-drag {
        cursor: move;
      }
    }
  }
}

.actions {
  text-align: center;
  & > button {
    border: 0;
    box-shadow: none;
  }
}
</style>
