
import { ObjectPropertyInfo, PropertyData, PropertiesData } from '../typings'
import { DataType, ArrayPropertyInfo, PropertyInfo, RefPropertyInfo, NumberPropertyInfo, StringPropertyInfo } from '../schema-typings'
import { register } from './register'

import * as forms from 'h3-forms'

// export function build(schemaInfo: ObjectPropertyInfo) {

//     const keys = Object.keys(schemaInfo.properties);

//     const map: PropertiesData = {};

//     for (const key of keys) {

//         let propInfo = schemaInfo.properties[key];

//         let value = null;
//         propInfo = propInfo as PropertyInfo;
//         const required = schemaInfo.required && schemaInfo.required.indexOf(key) > -1 ? true : false;

//         if (propInfo.default === undefined) {
//             if (propInfo.nullable === true) {
//                 value = null;
//             } else {
//                 const { $ref } = schemaInfo.properties[key] as RefPropertyInfo;
//                 if ($ref) {
//                     const pkg = register.packages[$ref];
//                     if (!pkg) {
//                         throw new Error('not found package');
//                     }

//                     value = build(pkg.schema);

//                 } else {
//                     switch (propInfo.type) {
//                         case DataType.String:
//                             value = "";
//                             break;

//                         case DataType.Integer:
//                         case DataType.Number:
//                             value = 0;
//                             break;

//                         case DataType.Boolean:
//                             value = false;
//                             break;

//                         case DataType.Object:
//                             value = build(propInfo as ObjectPropertyInfo);
//                             break;

//                         case DataType.Array:
//                             value = [];//(propInfo as ArrayPropertyInfo).items;
//                             break;
//                     }
//                 }
//             }
//         } else {
//             value = propInfo.default;
//         }

//         let data = Object.assign(
//             {
//                 title: "",
//                 nullable: false,
//                 hidden: false,
//                 disabled: false,
//                 required,
//                 value
//             },
//             propInfo
//         ) as PropertyData;

//         // delete (data as any).$ref;

//         map[key] = data;

//     }

//     return map;
// }


export function build(schemaInfo: ObjectPropertyInfo, id?: string, type?: string) {

    const keys = Object.keys(schemaInfo.properties);

    const map = {
    } as any;

    for (const key of keys) {

        let propInfo = schemaInfo.properties[key];

        let value:any = null;
        propInfo = propInfo as PropertyInfo;
        const required = schemaInfo.required && schemaInfo.required.indexOf(key) > -1 ? true : false;

        let data = Object.assign(
            {
                title: "",
                nullable: false,
                hidden: false,
                disabled: false,
                required,
            },
            propInfo
        ) as PropertyData;

        let type = forms.FormControlType.Radio;

        const opt = {
            required: data.required,
            display: !data.hidden,
            disabled: data.disabled,
            value: value,
        } as any;

        if (propInfo.default === undefined) {
            if (propInfo.nullable === true) {
                value = null;
            } else {
                const { $ref } = schemaInfo.properties[key] as RefPropertyInfo;
                if ($ref) {
                    const pkg = register.packages[$ref];
                    if (!pkg) {
                        throw new Error('not found package');
                    }

                    value = build(pkg.schema);

                } else {

                    switch (propInfo.type) {
                        case DataType.String:
                            type = forms.FormControlType.Text;
                            value = "";
                            if (typeof (propInfo as StringPropertyInfo).minLength === 'number') {
                                opt.min = (propInfo as StringPropertyInfo).minLength;
                            }
                            if (typeof (propInfo as StringPropertyInfo).maxLength === 'number') {
                                opt.max = (propInfo as StringPropertyInfo).maxLength;
                            }
                            if ((propInfo as StringPropertyInfo).pattern) {
                                opt.pattern = (propInfo as StringPropertyInfo).pattern;
                            }
                            break;

                        case DataType.Integer:
                        case DataType.Number:
                            type = forms.FormControlType.Number;
                            value = 0;
                            if (typeof (propInfo as NumberPropertyInfo).minimum === 'number') {
                                opt.min = (propInfo as NumberPropertyInfo).minimum;
                            }
                            if (typeof (propInfo as NumberPropertyInfo).maximum === 'number') {
                                opt.max = (propInfo as NumberPropertyInfo).maximum;
                            }
                            break;

                        case DataType.Boolean:
                            value = false;
                            break;

                        case DataType.Object:
                            value = build(propInfo as ObjectPropertyInfo);
                            break;

                        case DataType.Array:
                            value = [];//(propInfo as ArrayPropertyInfo).items;
                            type = forms.FormControlType.Select;
                            if (typeof (propInfo as ArrayPropertyInfo).minItems === 'number') {
                                opt.minCount = (propInfo as ArrayPropertyInfo).minItems;
                            }
                            if (typeof (propInfo as ArrayPropertyInfo).maxItems === 'number') {
                                opt.maxCount = (propInfo as ArrayPropertyInfo).maxItems;
                            }
                            break;
                    }
                }
            }
        } else {
            value = propInfo.default;
        }

        opt.value = value;

        map[key] = {
            type,
            options: opt
        };

    }

    const group = forms.FormBuilder.build(map);
    group.id = id;
    group.name = type;
    return group;
}
