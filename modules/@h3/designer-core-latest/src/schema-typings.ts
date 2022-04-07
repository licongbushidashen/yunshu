
export enum DataType {

    Object = 'object',

    String = 'string',

    Boolean = 'boolean',

    Integer = 'integer',

    Array = 'array',

    Number = 'number'

}

export enum StringFormat {

    /**
     * 日期
     */
    Date = 'date',

    /**
     * 日期+时间
     */
    DateTime = 'date-time',

    /**
     * 时间
     */
    Time = 'time',

    /**
     * 持续时间
     */
    Duration = 'duration',

    Password = 'password',

    /**
     * base64-encoded
     */
    Byte = 'byte',

    /**
     * 文件上传格式
     * binary file contents
     */
    Binary = 'binary',

    Email = 'email',

    Uuid = 'uuid',

    Uri = 'uri',

    Hostname = 'hostname',

    IPv4 = 'ipv4',

    IPv6 = 'ipv6'

}

export enum NumberFormat {

    Int32 = 'int32',

    Int64 = 'int64',

    Float = 'float',

    Double = 'double'

}

export interface PropertyInfo {

    title?: string

    type: string

    nullable?: boolean

    readOnly?: boolean

    writeOnly?: boolean

    default?: any

}

export interface StringPropertyInfo extends PropertyInfo {

    format?: StringFormat

    minLength?: number

    maxLength?: number

    pattern?: string
}

export interface EnumPropertyInfo extends PropertyInfo {

    enum: string[]
}

export interface NumberPropertyInfo extends PropertyInfo {

    format?: NumberFormat

    minimum?: number

    maximum?: number

    exclusiveMinimum?: boolean

    exclusiveMaximum?: boolean

}

export interface ObjectPropertyInfo extends PropertyInfo {

    properties: { [key: string]: PropertyInfo | RefPropertyInfo | AnyValuePropertyInfo}

    actions?: { [key: string]: ActionInfo }

    required?: string[]

    /**
     * Map类型
     * true表示值类型可以是任何类型
     */
    additionalProperties?: boolean | PropertyInfo
}

export interface ArrayPropertyInfo extends PropertyInfo {

    items: PropertyInfo | RefPropertyInfo | AnyValuePropertyInfo

    minItems?: number

    maxItems?: number

    uniqueItems?: boolean
}

export interface ActionsInfo {

    [key: string]: ActionInfo

}

export interface ActionInfo {

    name: string

    http?: string

    parameters?: ParameterInfo[]

    return?: PropertyInfo | OneOfPropertyInfo

}

/**
 * 参数信息
 */
export interface ParameterInfo {

    name: string

    schema: PropertyInfo | OneOfPropertyInfo | AnyOfPropertyInfo

    default?: any

}

export interface RefPropertyInfo {

    $ref: string

    title?: string

    nullable?: boolean

    readOnly?: boolean

    writeOnly?: boolean

    default?: any

}

/**
 * 匹配一个模式，可以存在未声明的多余属性
 */
export interface OneOfPropertyInfo {

    oneOf: PropertyInfo[]

    discriminator?: DiscriminatorPropertyInfo

}

/**
 * 匹配一个模式，不能存在未声明的多余属性
 */
export interface AllOfPropertyInfo {

    allOf: PropertyInfo[]

}

/**
 * 匹配一个或多个模式，可以存在未声明的多余属性
 */
export interface AnyOfPropertyInfo {

    anyOf: PropertyInfo[]

    discriminator?: DiscriminatorPropertyInfo

}

export interface AnyValuePropertyInfo {

    AnyValue:true

}

/**
 * 除此以外的任何类型
 */
export interface NotPropertyInfo {

    not: PropertyInfo

}

/**
 * 鉴别器
 * 通过指定的属性区分多态
 */
export interface DiscriminatorPropertyInfo {

    propertyName: string

    /**
     * 指定的属性的名称与类型的映射表
     */
    mapping?: {
        [key: string]: ObjectPropertyInfo
    }
}