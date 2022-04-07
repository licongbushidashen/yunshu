
import { ObjectPropertyInfo, PropertyData, PropertiesData } from '../typings';
import { DataType, ArrayPropertyInfo, PropertyInfo, RefPropertyInfo, NumberPropertyInfo, StringPropertyInfo, AnyValuePropertyInfo, EnumPropertyInfo } from '../schema-typings';

import * as forms from 'h3-forms';

import stringFormatPatterns from '../string-format-patterns';

export interface Packages {
    [key: string]: {
      schema: ObjectPropertyInfo, // | ArrayPropertyInfo,
    }
  }

let packages = {} as Packages;

export function setPackages(pkgs: Packages) {
    packages = pkgs;
}

export function build(schemaInfo: ObjectPropertyInfo, id?: string, type?: string, defaultValue? : any) {
    const opts = buildObjectOptions(schemaInfo, defaultValue);

    const group = forms.FormBuilder.build(opts);
    group.id = id;
    group.name = type;
    return group;
}

function buildOptions(propInfo: PropertyInfo | RefPropertyInfo | AnyValuePropertyInfo, required = false, defaultValue? : any) : any {
    const { $ref } = propInfo as RefPropertyInfo;
    const { type, nullable } = propInfo as PropertyInfo;
    const { AnyValue } = propInfo as AnyValuePropertyInfo;
    let default1 = (propInfo as any).default;

    if (defaultValue !== undefined) {
        default1 = defaultValue;
    }

    if ($ref) {
        if (!packages[$ref]) {
            throw new Error('not found package');
        }

        return buildOptions(packages[$ref].schema, required, default1);
    }

    const stringProp = propInfo as StringPropertyInfo;

    let data = Object.assign(
        {
            title: '',
            nullable: false,
            hidden: false,
            disabled: false,
            required
        },
        propInfo
    ) as PropertyData;

    let ctrlType;

    let value;// buildPropValue(propInfo);

    const opt = {
        required: data.required,
        display: !data.hidden,
        disabled: data.disabled
    } as any;

    const isNull = nullable && default1 === null;
    switch (type) {
    default:
        ctrlType = forms.FormControlType.Radio;
        break;

    case DataType.String:
        ctrlType = forms.FormControlType.Text;
        value = isNull ? null : '';
        if (typeof stringProp.minLength === 'number') {
            opt.minLength = stringProp.minLength;
        }
        if (typeof stringProp.maxLength === 'number') {
            opt.maxLength = stringProp.maxLength;
        }
        const format = stringProp.format;
        if (format) {
            opt.pattern = stringFormatPatterns[format];
        } else if (stringProp.pattern) {
            opt.pattern = stringProp.pattern;
        }
        break;

    case DataType.Integer:
    case DataType.Number:
        ctrlType = forms.FormControlType.Number;
        value = isNull ? null : 0;
        if (typeof (propInfo as NumberPropertyInfo).minimum === 'number') {
            opt.min = (propInfo as NumberPropertyInfo).minimum;
        }
        if (typeof (propInfo as NumberPropertyInfo).maximum === 'number') {
            opt.max = (propInfo as NumberPropertyInfo).maximum;
        }
        break;

    case DataType.Boolean:
        ctrlType = forms.FormControlType.Radio;
        value = isNull ? null : false;
        break;

    case DataType.Object:
        opt.children = buildObjectOptions(propInfo as ObjectPropertyInfo, default1);
        break;

    case DataType.Array:
        ctrlType = buildArrayOptions(opt, propInfo as ArrayPropertyInfo, default1);
        break;
    }

    if (default1 !== undefined && default1 !== null) {
        // if (!Array.isArray(propInfo.default) && typeof propInfo.default === 'object') {
        //     value = Object.assign(value, propInfo.default);
        // } else
        if (AnyValue) {
            value = default1;
        } else if (typeof default1 !== 'object' && typeof default1 === typeof value) {
            value = default1;
        }
    }

    if (value !== undefined) {
        opt.value = value;
    }

    return { type: ctrlType, options: opt };
}

export function buildObjectOptions(schemaInfo: ObjectPropertyInfo, defaultValue? : any) {
    const map = {
    } as any;

    const keys = Object.keys(schemaInfo.properties);

    for (const key of keys) {
        let propInfo = schemaInfo.properties[key];

        propInfo = propInfo as PropertyInfo;
        const required = !!(schemaInfo.required && schemaInfo.required.indexOf(key) > -1);

        let value = propInfo.default;
        if (defaultValue && defaultValue[key] !== undefined) {
            value = defaultValue[key];
        }

        const item = buildOptions(propInfo, required, value);

        if (item.type) {
            map[key] = item;
        } else {
            map[key] = item.options;
        }
    }

    return map;
}

export function buildArrayOptions(opt:any, propInfo: ArrayPropertyInfo, defaultValue? : any[]) {
    const { AnyValue } = propInfo.items as AnyValuePropertyInfo;
    const enums = (propInfo.items as EnumPropertyInfo).enum;

    if (AnyValue || enums) {
        if (typeof propInfo.minItems === 'number') {
            opt.minCount = propInfo.minItems;
        }

        if (typeof propInfo.maxItems === 'number') {
            opt.maxCount = propInfo.maxItems;
        }

        opt.value = defaultValue;
        return forms.FormControlType.Select;
    } else {
        if (Array.isArray(defaultValue)) {
            opt.children = defaultValue.map(val => {
                const item = buildOptions(propInfo.items, false, val);
                return item.type ? item : item.options;
            });
        } else {
            opt.children = [];
        }
    }
}