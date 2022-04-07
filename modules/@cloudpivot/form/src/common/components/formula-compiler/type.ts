import { FormulaCompiler } from './compiler';
export namespace Formula {
  export type Identifier<T = IdentifierType | IdentifierType> = {
    name: string;
    type: T;
    inputType?: Param[];
    parameterless?: boolean;
    outputType?: Param;
    validate?: (identifier: Identifier, param: Param[], compiler: FormulaCompiler) => Param | FieldParam | KeywordParam | undefined;
    calculate: (identifier: Identifier, param: Param[], compiler: FormulaCompiler) => Param;
  };

  export interface Param {
    paramType: ParamType;
    sourceType: SourceType;
    value?: any;
    isNull?: boolean; // 字段默认值
    unary?: number;
  };

  export interface KeywordParam extends Param {
    name: string;
  };

  export interface FieldParam extends Param {
    id: string;
    name: string;
    fieldType: FieldType;
    formula?: string;
    formulaFormat?(value: any, type?: ParamType): any;
  };

  export enum FieldType {
    BASIC = 'basic',
    SUBLIST = 'sublist',
    RELEVANCE = 'relevance',
  }

  export enum SourceType {
    FIELD = 'field',
    EDIT = 'edit',
    ANY = 'any',
  }

  export enum ConstType {
    NULL = 'null',
    TRUE = 'true',
    FALSE = 'false',
  }

  export enum ParamType {
    TEXT = 'text',
    NUMBER = 'number',
    DATE = 'date',
    BOOL = 'bool',
    ADDRESS = 'address',
    Radio = 'radio',
    Checkbox = 'checkbox',
    Dropdown = 'dropdown',
    DropdownMulti = 'dropdownmulti',
    STAFFSINGLE = 'staffsingle',
    STAFFMULTI = 'staffmulti',
    DEPTSINGLE= 'deptsingle',
    DEPTMULTI = 'deptmulti',
    STAFFDEPTMIX = 'staffdeptmix',
    ANY = 'any',
    VOID = 'void',
  }

  export enum IdentifierType {
    FUNC = 'func',
    OPERATOR = 'operator',
  }

  export enum TokenType {
    KEYWORD = 'keyword',
    FIELD = 'field',
  }

  export interface TokenInfo {
    name: string;
    type: IdentifierType | TokenType;
  };
  export interface IdentifierTokenInfo extends TokenInfo {
    parameterless: boolean;
  };

  export interface FieldTokenInfo extends TokenInfo {
    id: string;
    paramType: ParamType;
    fieldType: FieldType;
  };

  export interface Field {
    id: string;
    name: string;
    sourceType: TokenType.FIELD;
    paramType: ParamType;
    fieldType: FieldType;
    value?: string;
    formula?: string;
    formulaFormat?(value: any, type: ParamType): any;
    // color?: string; // 字体颜色
    // bgColor?: string; // 背景颜色
  }

}
