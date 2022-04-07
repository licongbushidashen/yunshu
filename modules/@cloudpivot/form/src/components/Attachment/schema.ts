/*
 * @Author: your name
 * @Date: 2020-04-22 10:08:34
 * @LastEditTime: 2020-05-12 16:36:07
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \frontend\modules\@cloudpivot\form\src\components\Attachment\schema.ts
 */
import { ObjectPropertyInfo, DataType } from "@cloudpivot/form/typings";
import { baseUploadOptions } from "@cloudpivot/form/component-schema";
import { FormControlType } from "@cloudpivot/form/schema";
export default {
  $id: "attachment",
  type: DataType.Object,
  $ref: baseUploadOptions.$id,
  properties: {
    widgetType: {
      type: DataType.Number,
      title: "控件类型",
    },
    dataItemType: {
      type: DataType.String,
      title: "数据项类型",
    },
    fileTypes: {
      type: DataType.String,
      title: "限定文件类型",
      tip: {
        content:
          "设置附件上传的文件名格式，限定类型为office、图片、压缩包等，示例:.jpg,.gif.<br>以下类型不支持:<br>.php.php5.php4.php3.php2.php1&nbsp;.html.htm.phtml.pHp.pHp5.pHp4.pHp3.pHp2.pHp1&nbsp;.Html.Htm.pHtml.jsp.jspa.jspx.jsw.jsv.jspf.jtml.jSp&nbsp;.jSpx.jSpa.jSw.jSv.jSpf.jHtml.asp.aspx.asa.asax&nbsp;.ascx.ashx.asmx.cer.aSp.aSpx.aSa.aSax.aScx.aShx.aSmx.cEr.sWf.swf",
        icon: "question-circle-o",
      } as any
    },
    dataLinkage: {
      type: DataType.String,
      title: "数据联动",
    },
    displayTemplate: {
      type: DataType.Boolean,
      title: "附件模板",
      default: true,
    },
    templateFile: {
      type: DataType.String,
      title: "上传模板",
    },
    labelVisible: {
      type: DataType.Boolean,
      title: "标题显示",
      default: true,
    },
  },
} as ObjectPropertyInfo;
