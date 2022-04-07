import { schema } from "@cloudpivot/form";

type DataItemType = schema.DataItemType;

export interface DataItem {
  id?: string;

  code: string;

  name: string;

  name_i18n?: string;

  type: DataItemType;

  formPropertyType?: any,

  dataLinkage?: any;

  isSystem: boolean;

  published: boolean;

  properties?: DataItem[];

  parentCode?: string;

  defaultValue?: any;

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
