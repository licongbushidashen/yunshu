import { ObjectPropertyInfo, DataType } from "@cloudpivot/form/typings";
import { styleControlOptions } from "@cloudpivot/form/component-schema";
import { SheetDisplayMode } from "@cloudpivot/form/src/common/component-schema/complex-control-options";
export default {
  $id: "sheet",
  type: DataType.Object,
  $ref: styleControlOptions.$id,
  properties: {
    width: {
      type: DataType.Number,
      title: "列宽px",
      default: 150,
    },
    widgetType: {
      type: DataType.String,
      title: "控件类型",
      default: "子表",
    },
    dataItemType: {
      type: DataType.String,
      title: "数据项类型",
    },
    //默认行数
    rows: {
      type: DataType.Number,
      title: "默认行数",
      default: 2,
    },
    editable: {
      type: DataType.Boolean,
      title: "是否编辑",
      default: true,
    },
    isEmptyRow: {
      type: DataType.Boolean,
      title: "空行校验",
      default: false,
    },
    importable: {
      type: DataType.Boolean,
      title: "是否导入",
      default: true,
    },
    exportable: {
      type: DataType.Boolean,
      title: "是否能导出",
      default: true,
    },
    importFormRelevanceForm: {
      type: DataType.String,
      title: "从关联表单导入",
    },
    showTotal: {
      type: DataType.Boolean,
      title: "是否显示汇总行",
    },
    showAllEdit: {
      type: DataType.Boolean,
      title: "是否批量编辑",
    },
    sheetFiters: {
      type: DataType.Array,
      title: "子表筛选条件",
    },
    displayFormula: {
      type: DataType.String,
      title: "显示条件",
    },
    onAddRow: {
      type: DataType.String,
      title: "行新增事件",
    },
    onDeleteRow: {
      type: DataType.String,
      title: "行删除事件",
    },
    mobileDisplayMode: {
      type: DataType.String,
      title: "移动端样式",
      default: SheetDisplayMode.Page,
    },
    labelVisible: {
      type: DataType.Boolean,
      title: "标题显示",
      default: true,
    },
  },
} as ObjectPropertyInfo;
