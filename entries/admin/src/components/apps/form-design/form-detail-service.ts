/*
 * @Author: Fan name
 * @Date: 2020-03-23 20:19:14
 * @LastEditTime: 2020-03-23 20:33:19
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /frontend/entries/admin/src/components/apps/form-design/form-detail-service.ts
 */
import { FormControlType, DataItem } from "./typings";
interface DataItemState extends DataItem {
  used: boolean;
  relativePropertyCode?: string | null | undefined;
}
/**
 * @Author: Fan
 * @Description: 同步表单设计关联表单数据和数据模型的 显示字段
 * @URL:
 * @param {type}
 * @return:
 * @Date: 2020-03-23 20:29:24
 */
export function SynRelevanceFormDisplayField(
  control: any,
  dataItem: DataItemState[]
) {
  const ctrlData = dataItem.find((d: any) => d.code === control.key);
  if (ctrlData) {
    control.options.relativePropertyCode = control.options.displayField =
      ctrlData.relativePropertyCode || control.options.displayField || "name";
    if (ctrlData.relativeCode !== control.options.schemaCode) {
      control.options.schemaCode = ctrlData.relativeCode;
      control.options.queryCode = "";
    }
  }
}

/**
 * @Author: Fan
 * @Description: 同步子表中 关联表单的显示字段
 * @URL:
 * @param {type}
 * @return:
 * @Date: 2020-03-23 20:33:00
 */
export function SynSheetRelevanceFormDisplayField(
  control: any,
  dataItem: DataItemState[]
) {
  const ctrlData = dataItem.find((d: any) => d.code === control.key);
  if (ctrlData) {
    let cols = control.columns;
    let pros = ctrlData.properties || [];
    for (let col of cols) {
      if (col.type === FormControlType.RelevanceForm || col.type === FormControlType.RelevanceFormEx) {
        let pro = pros.find((d: any) => d.code === col.key);
        if (pro) {
          col.options.relativePropertyCode = col.options.displayField =
            pro.relativePropertyCode || col.options.displayField || "name";
          if (pro.relativeCode !== col.options.schemaCode) {
            col.options.schemaCode = pro.relativeCode;
            col.options.queryCode = "";
          }
        }
      }
    }
  }
}
