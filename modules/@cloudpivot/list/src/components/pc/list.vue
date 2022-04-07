
<template>
  <sheet
    class="list"
    :radio="isRadio"
    :checkbox="isCheckbox"
    :checkeds="checkeds"
    :columns="sheetCols"
    :rows="sheetRows"
    :frozenKeys="frozenKeys"
    @check="onCheck"
    @checkAll="checkAll"
    @columnResize="onResizeEnd"
    @rowClick="onRowClick"
    @freezeColumn="onFreezeColumn"
  ></sheet>

  <!-- <list-custom-template
    v-show="sheetCols.length > 0"
    :pageVM="pageVM"
    :tableConfig="tableConfig"
    :originalTableColumns="sheetCols"
    :originalTableData="[]"
    :originalNumberData="numberData"
    idTitle="list-custom-select-model"
    @onCheck="onCheck"
    @onResizeEnd="onResizeEnd"
  >
  </list-custom-template>-->
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

import { schema, renderer } from "@cloudpivot/form";

import Sheet from "@cloudpivot/form/src/renderer/components/pc/form-sheet/sheet.vue";

import { form } from "@cloudpivot/api";

import * as forms from "h3-forms";
import listCustomTemplate from "./listCustomTemplate.vue";
import { DataItemType } from "@cloudpivot/form/schema";
import cloneDeep from "lodash/cloneDeep";

@Component({
  name: "list",
  components: {
    Sheet,
    listCustomTemplate,
  },
})
export default class List extends Vue {
  @Prop({
    default: "",
  })
  checkType!: string;

  @Prop({
    default: () => [],
  })
  columns!: any[];

  @Prop({
    default: () => [],
  })
  rows!: any[];

  @Prop({
    default: () => {},
  })
  sheetParams!: any;

  sheetCols: any[] = [];

  sheetCtrl: any;

  checkeds: boolean[] = [];

  sheetRows: any[] = [];
  //数值汇总数据
  numberData: any = "";

  rowsNew: any = [];

  @Prop({
    default: () => [],
  })
  checkedKeys!: string[];

  @Prop({
    default: () => [],
  })
  checkedData!: any;

  @Inject()
  isMultiStatus!: () => boolean;

  frozenKeys: string[] = [];

  get isRadio() {
    return this.checkType === "radio";
  }

  get isCheckbox() {
    return this.checkType === "checkbox";
  }

  get pageVM() {
    return this;
  }

  tableConfig: any = {
    version: "2.0",
    presentationType: "table",
    keepInOldVersion: false,
    fixedHeader: true,
    fixedLeftColumns: ["__ordinalNo"],
    fixedRightColumns: [""],
    columnResizable: true,
    rowOrdinal: true,
    rowSelectable: false,
    scrollbarAutoHidding: false,
  };

  @Watch("columns")
  onColumnsChange() {
    //子表不显示在列表中
    // const cols = this.columns.map(this.convertCol).filter((c)=>{
    //   return c.type !== schema.FormControlType.Sheet
    // });
    let cols = JSON.parse(JSON.stringify(this.columns));
    cols = cols.map(this.convertCol).filter((i) => i.options.isShow);
    const sheet = {
      type: schema.FormControlType.Sheet,
      key: "list",
      columns: cols,
      options: {
        sheetParams: this.sheetParams,
      },
    };
    this.sheetCols = cols;
    const sheetOpts = renderer.FormBuilderHelper.buildOptionsOf(sheet);
    const group = forms.FormBuilder.build({
      list: sheetOpts,
    });
    this.sheetCtrl = group.children.list;
  }

  convertCol(col: any) {
    let width = Number(col.width);

    let type = schema.mapToControlType(col.propertyType);

    let options: any = renderer.FormControlOptionsService.buildFor(type, {
      name: col.name,
      name_i18n: col.name_i18n ? JSON.parse(col.name_i18n) : null,
    });
    options.vcTitle = options.name;
    options.propertyType = col.propertyType;
    if (options.propertyType === DataItemType.Sheet) {
      let cols = col.childColumns.filter((i) => i.isShow);
      width = cols.length * 152;
      options.width = cols.length * 152;
    }
    options.childColumns = col.childColumns;
    // options.childColumns = col.subSchema && col.subSchema.properties;
    // if (options.propertyType === DataItemType.Sheet && options.childColumns) {
    //   options.childColumns = options.childColumns.map((v) => {
    //     v.vcTitle = v.name;
    //     v.width = "60";
    //     return v;
    //   });
    // }

    options.isShow = col.isShow;
    //获取数值数据项数据
    if (options.sumMap) {
      let val = false;
      for (let k in options.sumMap) {
        if (JSON.stringify(options.sumMap[k]) !== "{}") {
          val = true;
        }
      }
      this.numberData = val ? options.sumMap : "";
    } else {
      this.numberData = "";
    }
    if (options) {
      if (type === schema.FormControlType.Date) {
        switch (col.displayFormat) {
          default:
          case 2:
            options.format1 = "YYYY-MM-DD hh:mm:ss";
            break;
          case 1:
            options.format1 = "YYYY-MM-DD";
            break;
          case 3:
            options.format1 = "YYYY-MM-DD hh:mm";
            break;
          case 5:
            options.format1 = "YYYY";
            break;
          case 6:
            options.format1 = "MM-DD";
            break;
          case 7:
            options.format1 = "hh:mm";
            break;
          case 8:
            options.format1 = "hh:mm:ss";
            break;
        }
      } else if (type === schema.FormControlType.Number) {
        switch (col.displayFormat) {
          default:
          case 0:
            options.format1 = schema.NumberFormatType.None;
            break;

          case 1:
            options.format1 = schema.NumberFormatType.Int;
            break;
          case 2:
            options.format1 = schema.NumberFormatType.Tenths;
            break;
          case 3:
            options.format1 = schema.NumberFormatType.Decimal;
            break;
          case 4:
            options.format1 = schema.NumberFormatType.Ratio;
            break;
          case 5:
            options.format1 = schema.NumberFormatType.Ratio2;
            break;
          case 6:
            options.format1 = schema.NumberFormatType.Ratio3;
            break;
          case 7:
            options.format1 = schema.NumberFormatType.CurrencyRMB;
            break;
          case 8:
            options.format1 = schema.NumberFormatType.CurrencyDollar;
            break;
          case 9:
            options.format1 = schema.NumberFormatType.CurrencyEuro;
            break;
          case 10:
            options.format1 = schema.NumberFormatType.CurrencyHK;
            break;
        }
      } else if (col.propertyType === schema.DataItemType.StaffSingle) {
        options.displayType = schema.DisplayType.Text;
      } else if (col.propertyType === schema.DataItemType.RelevanceForm) {
        options.schemaCode = col.relativeSchemaCode;
      }
    }

    return {
      key: col.code ? col.code : col.propertyCode,
      type,
      width,
      options,
      collapsible: true,
    };
  }

  @Watch("checkedKeys")
  onCheckedKeysChange() {
    const checkeds = this.rowsNew.map(() => false);
    if (this.checkedKeys.length > 0) {
      this.rowsNew.forEach(
        (x: any, i) => (checkeds[i] = this.checkedKeys.indexOf(x.id) > -1)
      );
    }
    this.checkeds = checkeds;
  }

  @Watch("rows", {
    immediate: true,
  })
  onRowsChange(val) {
    const isZh = this.$i18n.locale === "zh";
    this.rowsNew = cloneDeep(val);
    setTimeout(() => {
      this.sheetRows = this.rowsNew.map((val, i) => {
        if (val.sequenceStatus && isZh) {
          val.sequenceStatus = form.sequenceStatusZh[val.sequenceStatus];
        }

        const g = this.addRow(val, i);
        let arr = [];
        if (this.checkedData.length > 0) {
          arr = this.checkedData.filter((i) => i.id === val.id);
        }
        return this.buildRow(i, g, arr);
      });

      this.onCheckedKeysChange();
      if (this.isMultiStatus && this.isMultiStatus()) {
        this.rowsNew = this.rowsNew.map((val, i) => {
          let arr = [];
          if (this.checkedData.length > 0) {
            arr = this.checkedData.filter((i) => i.id === val.id);
            if (arr.length > 0) val = arr[0];
          }
          return val;
        });
      }
    }, 0);
  }

  buildRow(index: number, group: forms.FormGroup, arr: any) {
    const row: schema.RendererFormControl[] = JSON.parse(
      JSON.stringify(this.sheetCols)
    );
    // console.log(this.checkedData, "dd", this.rows);

    row.forEach((col: any, idx) => {
      col.edit = false;

      const sheetParams = this.sheetParams;
      if (sheetParams) {
        col.options.sheetParams = sheetParams;
      }
      if (group) {
        let _ctrl: any = group.findChild(col.key);
        if (_ctrl) {
          col.controller = _ctrl;
          if (
            Array.isArray(col.controller._value) &&
            this.isMultiStatus &&
            this.isMultiStatus()
          ) {
            if (arr.length > 0) {
              arr.forEach((i) => {
                if (i[col.key]) {
                  col.controller._value = i[col.key];
                }
              });
              //  arr.forEach((i) => {
              //   if (i[col.key]) {
              //     col.controller._value = col.controller._value.map((v) => {
              //       const a = i[col.key].filter(
              //         (o) => o.id === v.id && o.checked
              //       );
              //       if (a.length > 0) {
              //         v = a[0];
              //       }else{
              //         v.checked = false;
              //       }
              //       return v;
              //     });
              //   }
              // });
            } else {
              col.controller._value = col.controller._value.map((i) => {
                if (typeof i === "object") {
                  i.checked = false;
                }
                return i;
              });
            }
          }
        }
      }
    });
    return row;
  }

  addRow(vals?: any, idx?: number) {
    if (vals) {
      this.sheetCols.forEach((col) => {
        vals[col.key] = renderer.FormControlValueService.convert(
          col.type,
          vals[col.key]
        );
      });
    }

    // 删除有值表达的值
    this.sheetCols.forEach((col) => {
      if (col.options.computeFormula) {
        delete vals[col.key];
      }
    });

    const ctrl = this.sheetCtrl;
    const group =
      idx !== undefined ? ctrl.insertRow(idx, vals) : ctrl.appendRow(vals);
    return group;
  }

  onResizeEnd() {}

  onCheck(checkeds: boolean[], index: number) {
    this.checkeds = checkeds;

    const vals = checkeds
      .map((c, i) => (c ? this.rowsNew[i] : null))
      .filter((x) => !!x);

    this.$emit("check", vals, {
      row: this.rowsNew[index],
      isChecked: checkeds[index],
    });
  }

  checkAll(checkeds: boolean[]) {
    this.checkeds = checkeds;
    const vals = checkeds
      .map((c, i) => (c ? this.rowsNew[i] : null))
      .filter((x) => !!x);
    this.$emit("check", vals);
  }

  onRowClick(index: number) {
    const row = this.rowsNew[index];
    this.$emit("rowClick", row);
  }

  onFreezeColumn(columnKey: string, freeze: boolean) {
    if (freeze) {
      this.frozenKeys.push(columnKey);
    } else {
      const index = this.frozenKeys.findIndex((k) => k === columnKey);
      if (index > -1) {
        this.frozenKeys.splice(index, 1);
      }
    }
  }
}
</script>


<style lang="less" scoped>
</style>