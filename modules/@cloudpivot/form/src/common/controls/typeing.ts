import {
  DataItemType
} from "@cloudpivot/form/schema";

export interface RelevanceFormSearchParams {
  code: string;
  type: DataItemType;
  value: any;
}

export interface RelevanceFormSearchResult {
  id: string;
  name: string;
  [key: string]: any;
}

export interface Segment<T> {
  total: number;

  data: T[];
}