# 修改说明

组件传参列表：

+ defaultValue：默认初始值
+ title：选择角色弹窗标题
+ multiple：是否多选
+ expandAll：是否默认展开角色组
+ filterKey：过滤角色时的唯一性标记，默认为id
+ defaultValueKey：回显角色信息时的依据，用于请求角色相关角色组信息，与过滤时依据区别
+ showParent：是否在角色选择结果上展示角色组信息
+ allowEmpty：是否允许选择结果为空
+ keepRoles: 需要保留的角色id/code列表，取决于filterKey

组件捕获事件列表：

+ select(array) 选择完成，返回选择结果。
+ clearBlocked() 将选中结果清空时被阻止，仅在allowEmpty值为false，选择结果为空时触发。
+ selectBlocked(array): 保留的角色即将被取消勾选或清空时触发，附带阻止前的已选列表