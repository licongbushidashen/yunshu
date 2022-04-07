/*
 * @Author: your name
 * @Date: 2020-04-13 20:13:41
 * @LastEditTime: 2020-04-13 20:15:30
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /frontend/modules/@cloudpivot/form/src/common/data-item/typings.ts
 */
import { DataItemType, NumberFormatType } from "@cloudpivot/form/schema";
import { DateItemOperatorType } from "./data-item2";
export interface DataitemConditionItem {
  propertyCode: string;

  propertyType: DataItemType;

  operatorType: DateItemOperatorType;

  value: any;
}
export interface DataitemConditionValue {
  type: number;

  conditions: DataitemConditionItem[];
}
