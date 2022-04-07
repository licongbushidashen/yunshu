export default [
  {
    code: 'AVG()',
    name: 'AVG',
    desc: 'AVG函数是一个求平均值的函数',
    usage: 'AVG(v)返回所有参数的平均值，参数v是子表的某一个数字控件',
    example: '计算出学生成绩中平均分。【成绩明细】里面有3个科目，每个科目分数不同，【平均分】显示这三个科目【成绩】的平均分值',
    type: 'number'
  },
  {
    code: 'STRING()',
    name: 'STRING',
    desc: '可以将多个数据项的值合并成一个文本；',
    usage: 'STRING({字段1},{字段2},…)，支持短文本、单选文本、多选文本、日期、整数、含小数数值、人员单选、人员多选、部门单选、部门多选、人员部门混选类型的字段',
    example: 'STRING({奥哲云枢},{张三})会返回{奥哲云枢张三}',
    type: 'text'
  },
  {
    code: 'SUBSTRING()',
    name: 'SUBSTRING',
    desc: '(【参数】,s,e)，文本截取函数',
    usage: 'SUBSTRING(数据项,开始位置,结束位置)',
    example: 'SUBSTRING(数据项,2,7)，数据项的内容为“奥哲云枢低代码平台”，会返回“云枢低代码“；数据项只支持短文本类型的数据项；结束位置允许不输入，当结束位置不输入时，将截取到文本的最后位置。',
    type: 'text'
  },
  {
    code: 'REPLACE()',
    name: 'REPLACE',
    desc: 'REPLACE',
    usage: 'REPLACE(old_text,start_num,num_chars,new_text)，old_text为某文本字符串，start_num为要替换的起始位置编号，num_chars为要替换的字符个数，new_text为替换后的字符串',
    example: 'REPLACE(手机号,4,4,"")会返回1350101',
    type: 'text'
  },
  {
    code: 'UPPERMONEY()',
    name: 'UPPERMONEY',
    desc: 'UPPERMONEY函数将数值转为中文大写金额',
    usage: 'UPPERMONEY(数值)，在和金额相关的系统中，为了符合财务的标准或防涂改等，采用此函数即可将数值型转为中文大写金额',
    example: '【金额】输入100，【大写金额】显示为壹佰元整',
    type: 'text'
  },
  {
    code: 'IF()',
    name: 'IF',
    desc: 'IF函数可以对数据项进行判断，然后给出对应的显示文案。 比较操作=、>、>=、<、<= AND OR',
    usage: 'IF(数据项>n,\"显示值1\",\"显示值2\")，数据项是"数值"',
    example: 'IF(成绩>60,\"及格\",\"不及格\")录入【成绩】，通过IF函数的比对自动填入【及格】【不及格】',
    remark: '显示值为常量需要英文单引号\"\"，比如\"及格\"；如果显示值为数据项，不需要添加英文双引号。比如某数据项。',
    type: 'text'
  },
  {
    code: 'SUM()',
    name: 'SUM',
    desc: 'SUM函数是一个求和函数',
    usage: 'SUM(v)统计输入参数的数值之和，参数v是子表的某一个数字控件',
    example: '计算学生成绩总分。【成绩明细】里面有3个科目，【总分】显示这三个科目的成绩总和',
    type: 'number'
  },
  {
    code: 'MAX()',
    name: 'MAX',
    desc: 'MAX函数是一个求最大值的函数',
    usage: 'MAX(v)返回参数列表中的最大值，参数v是子表的某一个数字控件',
    example: '计算出学生成绩中最高分。【成绩明细】里面有3个科目，每个科目分数不同，【最高分】显示这三个科目【成绩】最高的分值',
    type: 'number'
  },
  {
    code: 'MIN()',
    name: 'MIN',
    desc: 'MIN函数是一个求最小值的函数',
    usage: 'MIN(v)返回参数列表中的最小值，参数v是子表的某一个数字控件',
    example: '计算出学生成绩中最低分。【成绩明细】里面有3个科目，每个科目分数不同，【最低分】显示这三个科目【成绩】最低的分值',
    type: 'number'
  },
  {
    code: 'COUNT()',
    name: 'COUNT',
    desc: 'COUNT统计参数列表中选项值的个数',
    usage: 'COUNT(v)统计参数列表中选项值的个数，参数v是子表的某一个控件',
    example: '计算【学生成绩】中的科目数，【科目数】显示【成绩明细】中科目的数量',
    type: 'number'
  },
  {
    code: 'COUNTIF()',
    name: 'COUNTIF',
    desc: '统计符合条件的子表参数v的个数，比较操作=、>、>=、<、<= AND OR，如条件可以表示为 "=68"、">68" 或 "=abc"',
    usage: 'COUNTIF(range , criteria)',
    example: 'COUNTIF(子表.性别,"男") 返回性别男的人数， COUNTIF(子表.年龄, ">18") 返回年龄大于18的人数， COUNTIF(子表.年龄, 18)返回年龄等于18的人数',
    type: 'number'
  },
  {
    code: 'CONTAINS()',
    name: 'CONTAINS',
    desc: '判断参数1是否包含参数2的值，包含则返回true，不包含则返回false',
    usage: 'CONTAINS(参数1,参数2)',
    example: '当用章类型不选择时，默认隐藏公用章、合同章控件，选择“公用章”时，显示公用章控件，选择“合同章”时，则显示合同章控件',
    type: 'text'
  },
  {
    code: 'GETADDRESS()',
    name: 'GETADDRESS',
    desc: '将地址控件的值转换为文本字符串',
    usage: 'GETADDRESS(地址控件)',
    example: '手动选择具体的客户地址信息然后转换为字符文本格式',
    type: 'text'
  },
  {
    code: 'ROUND()',
    name: 'ROUND',
    desc: 'ROUND将数字四舍五入到指定的位数',
    usage: 'ROUND(number, num_digits)将数字四舍五入到指定的位数，number为要处理的数字，num_digits为指定小数位数',
    example: '当数值相除后小数很多的情况，可以利用ROUND进行四舍五入到指定位数。【均价】四舍五入后保留位小数',
    type: 'number'
  },
  {
    code: 'INTUP()',
    name: 'INTUP',
    desc: 'INTUP参数中向上取整数',
    usage: 'INTUP(v)向上取整数，参数v为数值',
    example: '在计算采购桌子数量时，按人头一除，需要在小数点前面向上取整数来满足采购场景',
    type: 'number'
  },
  {
    code: 'INTDOWN()',
    name: 'INTDOWN',
    desc: 'INTDOWN参数中向下取整数',
    usage: 'INTDOWN(v)向下取整数，参数v为数值',
    example: '用于计算和统计时，比如预留座位，除以人头，32.1个座位，那么只能接纳32个人',
    type: 'number'
  },
  {
    code: 'DATEDIF()',
    name: 'DATEDIF',
    desc: 'DATEDIF函数可以计算两个日期时间相差的年数、月数、天数、小时数、分钟数、秒数',
    usage: 'DATEDIF(【结束时间】,【开始时间】,【单位】)，单位可以是”y”、”M”、”d”、”h”、”m“、”s”',
    example: 'DATEDIF(结束时间,开始时间,”h”)，如果下单时间是9:00，付款时间是当天10:30，计算得到的小时差为1.5小时。',
    type: 'date'
  },
  {
    code: 'YEAR()',
    name: 'YEAR',
    desc: 'YEAR函数可以获取某日期的年份',
    usage: 'YEAR(时间戳)，时间戳可以是日期类型的数据项，也可以之间输入时间格式的文本',
    example: 'YEAR(入职时间)，如果入职时间是2020-01-20 9:00:00，会返回2020年',
    type: 'date'
  },
  {
    code: 'MONTH()',
    name: 'MONTH',
    desc: 'MONTH函数可以获取某日期是当年的第几月',
    usage: 'MONTH(时间戳)，时间戳可以是日期类型的数据项，也可以之间输入时间格式的文本',
    example: 'MONTH(入职时间)，如果入职时间是2020-01-20 9:00:00，会返回1月',
    type: 'date'
  },
  {
    code: 'DAY()',
    name: 'DAY',
    desc: 'DAY函数可以获取某日期是当月的第几日',
    usage: 'DAY(时间戳)，时间戳可以是日期类型的数据项，也可以之间输入时间格式的文本',
    example: 'DAY(入职时间)，如果入职时间是2020-01-20 9:00:00，会返回20日',
    type: 'date'
  },
  {
    code: 'WEEKDAY()',
    name: 'WEEKDAY',
    desc: 'WEEKDAY函数可以返回指定日期date为星期几',
    usage: 'WEEKDAY(date)',
    example: '录入【填写日期】，通过WEEKDAY函数自动填入【星期】',
    type: 'date'
  },
  {
    code: 'WEEKNUM()',
    name: 'WEEKNUM',
    desc: 'WEEKNUM函数可以获取某日期是当年的第几周',
    usage: 'WEEKNUM(时间戳)，时间戳是日期类型的数据项',
    example: 'WEEKNUM(入职时间)，如果入职时间是2020-01-20 9:00:00，会返回第4周',
    type: 'date'
  },
  {
    code: 'QUARTER()',
    name: 'QUARTER',
    desc: 'QUARTER函数可以获取某日期是当年的第几季度',
    usage: 'QUARTER(时间戳)，时间戳可以是日期类型的数据项，也可以之间输入时间格式的文本',
    example: 'QUARTER(入职时间)，如果入职时间是2020-01-20 9:00:00，会返回1季度',
    type: 'date'
  },
  {
    code: 'HOUR()',
    name: 'HOUR',
    desc: 'HOUR函数可以获取某日期当中的小时数',
    usage: 'HOUR(时间戳)，时间戳可以是日期类型的数据项，也可以之间输入时间格式的文本',
    example: 'HOUR(入职时间)，如果入职时间是2020-01-20 9:00:00，会返回9时',
    type: 'date'
  },
  {
    code: 'MINUTE()',
    name: 'MINUTE',
    desc: 'MINUTE函数可以获取某日期当中的分钟数',
    usage: 'MINUTE(时间戳)，时间戳可以是日期类型的数据项，也可以之间输入时间格式的文本',
    example: 'MINUTE(入职时间)，如果入职时间是2020-01-20 9:30:00，会返回30分',
    type: 'date'
  },
  {
    code: 'SECOND()',
    name: 'SECOND',
    desc: 'SECOND函数可以获取某日期当中的秒钟数',
    usage: 'SECOND(时间戳)，时间戳可以是日期类型的数据项，也可以之间输入时间格式的文本',
    example: 'SECOND(入职时间)，如果入职时间是2020-01-20 9:30:30，会返回30秒',
    type: 'date'
  },
  {
    code: 'ADDDAY()',
    name: 'ADDDAY',
    desc: 'ADDDAY函数可以指定日期加/减指定天数，指定天数为负数是为减，时间单位为天',
    usage: 'ADDDAY(【指定时间】,【指定天数】)，单位是"d"',
    example: 'ADDDAY(项目开始时间,项目天数)，录入【项目开始时间】、【项目预计天数】，通过ADDDAY函数自动填入【项目预计完成时间】',
    type: 'date'        
  },
  {
    code: 'ADDMONTH()',
    name: 'ADDMONTH',
    desc: 'ADDMONTH函数可以指定日期加/减指定月份，指定月份为负数是为减，时间单位为月',
    usage: 'ADDMONTH(【指定时间】,【指定月份】)，单位是"M"',
    example: 'ADDMONTH(项目开始时间,项目天数)，录入【项目开始时间】、【项目预计天数】，通过ADDMONTH函数自动填入【项目预计完成时间】',
    type: 'date'  
  },
  {
    code: 'ADDYEAR()',
    name: 'ADDYEAR',
    desc: 'ADDYEAR函数可以指定日期加/减指定年数，指定年数份为负数是为减，时间单位为年',
    usage: 'ADDYEAR(【指定时间】,【指定年数】)，单位是"y"',
    example: 'ADDYEAR(合同开始时间,合同有效年限)，录入【合同开始时间】、【合同有效年限】，通过ADDYEAR函数自动填入【合同到期时间】ADDMONTH(项目开始时间,项目天数)，录入【项目开始时间】、【项目预计天数】，通过ADDMONTH函数自动填入【项目预计完成时间】',
    type: 'date'  
  },
  {
    code: 'TODAY()',
    name: 'TODAY',
    desc: 'TODAY函数可以获取当天日期',
    usage: '返回今天的日期，格式为:yyyy-MM-dd',
    example: 'TODAY()，通过TODAY函数自动填入【日期】',
    type: 'date'  
  }
]