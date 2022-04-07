import { schema } from "@cloudpivot/form";
import { FormControlType } from 'h3-forms';

type DataItemType = schema.DataItemType;

export interface DataItem {
  id?: string;

  code: string;

  name: string;

  name_i18n?: string;

  type: DataItemType;

  isSystem: boolean;

  published: boolean;

  properties?: DataItem[];

  parentCode?: string;

  defaultValue?: any;

  formPropertyType?: any;

  propertyIndex?: boolean;

  propertyEmpty?: boolean;

  schemaCode?: string;

  relativeCode?: string;

  relativeName?: string;

  appFunctionCode?: string;

  appPackageCode?: string;

  displayField?: string;

  relativePropertyCode?: string | null | undefined;

  noRepeat?: boolean;
  
}
