
# JSON Schema Specification

本文档规范了对数据类型、类型与类型的关系、函数的描述

## Data Type 数据类型

数据类型由type关键字定义，例如`type: string`，包含以下基本类型：

| key     | 示例                   | 说明                   |
| ------- | ---------------------- | ---------------------- |
| string  | abc                    | 字符串，包括日期和文件   |
| number  | 123.2                  | 数值                   |
| integer | 123                    | 整数                   |
| boolean | true                   | 布尔值                 |
| object  | { id: 1, name: "abc" } | 对象                   |
| array   | [ 1, 2, 3 ]            | 数组                   |

注意没有null类型，如果值可以为null，使用`nullable: true`描述。

如果有默认值，使用`default`描述，默认值必须符合数据类型的描述。

### number

有两种数值类型，`number`和`integer`，其中number包括整数和浮点数。可选format关键字用作工具使用特定数字类型的提示：

| type    | format | 说明                         |
| ------- | ------ | ---------------------------- |
| number  | -      | 任何数                       |
| number  | float  | 浮点数                       |
| number  | double | 双精度浮点数                 |
| integer | -      | 整数                         |
| number  | int32  | 有符号的32位整数             |
| number  | int64  | 有符号的64位整数（long类型） |

#### 数值范围

使用minimum和maximum关键字可指定值的范围：

| key     | type   | 说明         |
| ------- | ------ | ------------ |
| minimum | number | 值 ≥ minimum |
| maximum | number | 值≤ maximum  |

将值范围定义为0-50，即`0 ≤ value ≤ 50`：
```json
{
    "type": "integer",
    "minimum": 0,
    "maximum": 50
}
```

可指定`exclusiveMinimum: true`和`exclusiveMaximum: true`排除边界值：

| key              | type | 说明         |
| ---------------- | ---- | ------------ |
| exclusiveMinimum | true | 值 > minimum |
| exclusiveMaximum | true | 值 < maximum |

将值范围定义为0–50，并排除0值，即`0 < value ≤ 50`：
```json
{
    "type": "integer",
    "minimum": 0,
    "maximum": 50,
    "exclusiveMinimum": true,
}
```

### string

文本字符串定义为`type: string`，可以使用`minLength`和`maxLength`描述长度范围：
```json
{
    "type": "string",
    "minLength": 1,
    "maxLength": 50
}
```

#### string format 字符串格式

可使用`format`用来描述文本的格式：

| type      | 示例                           | 说明                     |
| --------- | ------------------------------ | ------------------------ |
| date      | 2017-07-21                     | 日期                     |
| time      | 17:32:28                       | 时间                     |
| date-time | 2017-07-21T17:32:28Z           | 日期和时间               |
| duration  | 1D1H                           | 持续时间，时间间隔       |
| password  | -                              | 密码，用于UI             |
| byte      | U3dhZ2dlciByb2Nrcw==           | base64编码字符           |
| binary    | -                              | 二进制数据，用于文件上传  |
| email     | luliang@authine.com            | 电子邮箱                 |
| uuid      | -                              | UUID                     |
| uri       | https://www.baidu.com/logo.svg | 资源路径                 |
| hostname  | www.baidu.com                  | 主机名                   |
| ipv4      | 192.168.1.1                    | IP4                      |
| ipv6      | -                              | IP6                      |

##### pattern

其他文本格式可使用`pattern`描述，其格式是文本形式的正则表达式：
```json
{
    "type": "string",
    "pattern": "^\d{3}-\d{2}-\d{4}$"
}
```

#### enum

可使用`enum`类列举字符串所有可能的值，使用enum时`format`设置将无效，其类型是字符串数组：
```json
{
    "type": "string",
    "enum": ["asc", "desc"]
}
```

### boolean

布尔定义为`type: boolean`

### object

自由格式的对象（任意属性/值对）定义为：
```json
{
    "type": "object"
}
```

可以使用properties关键字来定义对象属性：
```json
{
    "type": "object",
    "properties":{
        "id":{
            "type":"integer"
        },
        "name":{
            "type":"string"
        }
    }
}
```

#### required 必需的属性

默认情况下，所有对象属性都是可选的。可以在required列表中指定必需的属性：
```json
{
    "type": "object",
    "properties":{
        "id":{
            "type":"integer"
        },
        "name":{
            "type":"string"
        }
    },
    "required": ["id"]
}
```

#### readOnly writeOnly 只读和只写属性

可以使用`readOnly`和`writeOnly`关键字将特定属性标记为只读或只写。readOnly属性包含在响应中但不包含在请求中，并且writeOnly属性可以在请求中发送但不包含在响应中。
```json
{
    "type": "object",
    "properties":{
        "id":{
            "type":"integer",
            "readOnly":true
        },
        "password":{
            "type":"string",
            "writeOnly":true
        }
    }
}
```

#### title

可以使用`title`为属性添加标题

#### description

可以使用`description`为属性添加描述信息

#### disabled

可以使用`disabled: true`将属性标记为未启用

#### hidden

可以使用`hidden: true`将属性标记为隐藏

#### transient

使用`transient: true`关键字可以表示属性不用存储

#### 属性数量

使用`minProperties`和`maxProperties`关键字可以限制对象中允许的属性数量：
```json
{
    "type": "object",
    "minProperties": 2,
    "maxProperties": 10
}
```

#### 嵌套对象

一个对象可以包括嵌套对象：
```json
{
    "schemas":{
        "User":{
            "type": "object",
            "properties":{
                "id":{
                    "type":"integer"
                },
                "name":{
                    "type":"string"
                },
                "contact_info":{
                    "type": "object",
                    "properties":{
                        "email":{
                            "type":"integer",
                            "format":"email"
                        },
                        "phone":{
                            "type":"string"
                        }
                    }
                }
            }
        }
    }
}
```

如果需要将嵌套的对象拆分为多个描述，可以使用`&ref`引用嵌套的描述：
```json
{
    "schemas":{
        "User":{
            "type": "object",
            "properties":{
                "id":{
                    "type":"integer"
                },
                "name":{
                    "type":"string"
                },
                "contact_info":{
                    "&ref": "#/schemas/ContactInfo"
                }
            }
        },
        "ContactInfo":{
            "type": "object",
            "properties":{
                "email":{
                    "type":"integer",
                    "format":"email"
                },
                "phone":{
                    "type":"string"
                }
            }
        }
    }
}
```

#### Map

使用`type: object`和`additionalProperties`关键字来指定键/值对中值的类型，可以是基本数据类型任何一种。像这样的字典：
```js
{
  en: "English",
  fr: "French"
}
```

可以用以下描述定义：
```json
{
    "type": "object",
    "additionalProperties":{
        "type": "string"
    }
}
```

也可以在`additionalProperties`使用`&ref`：
```json
{
    "schemas": {
        "Messages": {
            "type": "object",
            "additionalProperties": {
                "&ref": "#/schemas/Message"
            }
        },
        "Message": {
            "type": "object",
            "properties": {
                "code": {
                    "type": "integer"
                },
                "text": {
                    "type": "string"
                }
            }
        }
    }
}
```

### array

使用`type: array`和`items`关键字类定义数组，items关键字在数组中是必需的，它描述数组项的类型和格式。任意类型的:
```json
{
    "type": "array",
    "items": { }
}
```

指定一种类型的：
```json
{
    "type": "array",
    "items":{
        "type":"string"
    }
}
```

嵌套的：
```json
{
    "type": "array",
    "items":{
        "type": "array",
        "items":{
            "type":"integer"
        }
    }
}
```

包含对象的：
```json
{
    "type": "array",
    "items":{
        "type": "object",
        "properties":{
            "id":{
                "type":"integer"
            }
        }
    }
}
```

也可以在`items`中使用`oneOf`和`anyOf`关联字表示混合类型，详见混合类型章节。

#### minItems maxItems 长度 

可以使用`minItems`和`maxItems`分别定义数组的最小和最大长度：
```json
{
    "type": "array",
    "items":{
        "type":"string"
    },
    "minItems": 1,
    "maxItems": 10
}
```

#### uniqueItems 唯一性 

可以用`uniqueItems: true`来指定数组中的所有项目都必须是唯一的：
```json
{
    "type": "array",
    "items":{
        "type":"integer"
    },
    "uniqueItems": true
}
```

### 混合类型

#### AnyValue 任意类型

使用`AnyValue: true`表示可以是任何类型：
```json
{
    "schema":{
        "AnyValue": true
    }
}
```

#### not 排除类型

除整数以外的任何类型：
```json
{
    "type": "object",
    "properties":{
        "id":{
            "not":{
                "type":"integer"
            }
        }
    }
}
```

#### oneOf 其中之一

使用`oneOf`关键字来确保给定的数据对指定的描述之一有效，不能同时匹配多个：
```json
{
    "schemas":{
        "User":{
            "type": "object",
            "properties":{
                "pet":{
                    "oneOf":[{
                        "&ref": "#/schemas/Dog"
                    },{
                        "&ref": "#/schemas/Cat"
                    }]
                }
            }
        },
        "Dog":{
            "type": "object",
            "properties":{
                "bark":{
                    "type":"boolean"
                },
                "breed":{
                    "type":"string",
                    "enum": ["Dingo", "Husky", "Retriever", "Shepherd"]
                }
            }
        },
        "Cat":{
            "type": "object",
            "properties":{
                "hunts":{
                    "type":"boolean"
                },
                "age":{
                    "type":"integer"
                }
            }
        }
    }
}
```

以下pet对象是有效的：
```js
{
  bark: true,
  breed: "Dingo" 
}
```
```js
{
  hunts: true,
  age: 1
}
```

无效的：
```js
{
  bark: true,
  hunts: true
}
```
```js
{
  bark: true,
  breed: "Dingo",
  hunts: true,
  age: 1
}
```

#### anyOf 多个模式

使用`anyOf`关键字来确保给定的数据对指定的描述中的一个或者多个有效：
```json
{
    "schemas":{
        "User":{
            "type": "object",
            "properties":{
                "pet":{
                    "anyOf":[{
                        "&ref": "#/schemas/Dog"
                    },{
                        "&ref": "#/schemas/Cat"
                    }]
                }
            }
        },
        "Dog":{
            "type": "object",
            "properties":{
                "bark":{
                    "type":"boolean"
                },
                "breed":{
                    "type":"string",
                    "enum": ["Dingo", "Husky", "Retriever", "Shepherd"]
                }
            }
        },
        "Cat":{
            "type": "object",
            "properties":{
                "hunts":{
                    "type":"boolean"
                },
                "age":{
                    "type":"integer"
                }
            }
        }
    }
}
```

与`oneOf`不同，该对象是有效的：
```js
{
  bark: true,
  breed: "Dingo",
  hunts: true,
  age: 1
}
```


## actions 行为

使用`actions`关键字定义行为，一个没有参数和返回值的行为定义：
```json
{
    "actions": {
        "getCurrentUser": { }
    }
}
```

使用`parameters`和`return`可分别定义参数列表和返回值：
```json
{
    "actions": {
        "login": {
            "parameters": [
                {
                    "name": "username",
                    "schema": {
                        "type": "string",
                        "minLength": 1,
                        "maxLength": 20
                    }
                },
                {
                    "name": "password",
                    "schema": {
                        "type": "string",
                        "format": "password",
                        "minLength": 1,
                        "maxLength": 20
                    }
                }
            ],
            "return": {
                "&ref": "#/schemas/dtos/LoginResult"
            }
        }
    }
}
```

`return`可以是数据类型其中一种，也可以是混合类型

### parameters

`parameters`只能是数组，数组项的类型定义如下：

| key     | type   | 说明                       |
| ------- | ------ | -------------------------- |
| name    | string | 参数名称                   |
| schema  | -      | 数据类型，包含混合类型      |

与object的properties中的属性不同，parameter默认是必需的，如果可以为null，可使用`schema/nullable: true`标识。

### http

可以使用`http`关键字指定http请求方法：
```json
{
    "actions": {
        "login": {
            "http": "post"
        }
    }
}
```

## 继承与多态

### 继承

使用`allOf/&ref`关键字定义继承关系：
```json
{
    "Result": {
        "properties": {
            "ok": {
                "type": "boolean"
            },
            "errCode": {
                "type": "string"
            }
        }
    },
    "LoginResult": {
        "allOf": {
            "&ref": "#/schemas/dtos/Result",
            "type": "object",
            "properties": {
                "token": {
                    "type": "string"
                },
                "customer": {
                    "&ref": "#/schemas/entities/Root"
                }
            }
        }
    }
}
```

### 多态

为了帮助代码生成工具、UI设计器、API使用者检测对象类型，可以将`discriminator/propertyName`关键字添加到模型定义中，指明用来区分数据类型属性的名称

```json
{
    "schemas":{
        "User":{
            "type": "object",
            "properties":{
                "pet":{
                    "oneOf":[{
                        "&ref": "#/schemas/Dog"
                    },{
                        "&ref": "#/schemas/Cat"
                    }],
                    "discriminator":{
                        "propertyName": "petType"
                    }
                }
            }
        },
        "Pet":{
            "type": "object",
            "properties":{
                "petType":{
                    "type":"string"
                }
            },
            "required": ["petType"]
        },
        "Dog":{
            "allOf": {
                "&ref": "#/schemas/Pet",
                "type": "object",
                "properties":{
                    "bark":{
                        "type":"boolean"
                    }
                }
            }
        },
        "Cat":{
            "allOf": {
                "&ref": "#/schemas/Pet",
                "type": "object",
                "properties":{
                    "hunts":{
                        "type":"boolean"
                    },
                    "age":{
                        "type":"integer"
                    }
                }
            }
        }
    }
}
```

#### mapping

如果属性值与架构名称不匹配，可以使用`discriminator/mapping`关键字将值映射到名称：
```json
{
    "schemas":{
        "User":{
            "type": "object",
            "properties": {
                "pet":{
                    "oneOf": [{
                        "&ref": "#/schemas/Dog"
                    },{
                        "&ref": "#/schemas/Cat"
                    }],
                    "discriminator": {
                        "propertyName": "petType",
                        "mapping": {
                            "dog1": "#/schemas/Dog",
                            "cat1": "#/schemas/Cat",
                        }
                    }
                }
            }
        },
        "Pet":{
            "type": "object",
            "properties":{
                "petType":{
                    "type":"string"
                }
            },
            "required": ["petType"]
        },
        "Dog":{
            "allOf": {
                "&ref": "#/schemas/Pet",
                "type": "object",
                "properties":{
                    "bark":{
                        "type":"boolean"
                    }
                }
            }
        },
        "Cat":{
            "allOf": {
                "&ref": "#/schemas/Pet",
                "type": "object",
                "properties":{
                    "hunts":{
                        "type":"boolean"
                    },
                    "age":{
                        "type":"integer"
                    }
                }
            }
        }
    }
}
```

