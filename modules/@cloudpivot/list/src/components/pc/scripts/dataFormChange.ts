import { components, UploadStatus } from "@cloudpivot/form/renderer";
import {
  FormControlType,
  RendererFormControl,
  DropdownOptions,
} from "@cloudpivot/form/schema";
import { FormRendererHelper } from "@cloudpivot/form/src/renderer/components/form-renderer-helper";
import { RendererControl } from "@cloudpivot/form/src/renderer/typings";
import * as renderer from "@cloudpivot/form/renderer";
import { FormControlOptionsService } from "@cloudpivot/form/src/renderer/services";
import * as schema from "@cloudpivot/form/schema";

export default {
  initSystemForm(formObj: any) {
    const formDefine = formObj.bizSheet;
    //获取数据模型中关联表单配置的字段引用信息
    const schemaCode: any = formObj.bizObject.schemaCode || "";
    let qouteList: Array<any> = [];

    //处理日期控件默认值
    const formControls = components.FormRendererHelper.handleDataDefault(
      formObj.bizSchema.properties,
      JSON.parse(formDefine.publishedAttributesJson),
      qouteList
    );
    const layout = JSON.parse(formDefine.publishedViewJson) as string[][];
    const controls = components.FormRendererHelper.convertDesign(
      formControls,
      layout
    );
    return this.initForm(controls, formObj);
  },
  initForm(controls: any, formObj: any) {
    const formControls: RendererFormControl[] = [];
    components.FormRendererHelper.findFormControl(controls, formControls);

    const formControlsNew = formControls;

    const titleControl = formControls.find(
      (c) => c.type === FormControlType.Title
    );
    if (titleControl && formObj.instanceName) {
      titleControl.options.name = formObj.instanceName;
      titleControl.options.name_i18n.en = formObj.instanceName;
    }

    const data = formObj.bizObject.data;

    data.schemaCode = formObj.bizObject.schemaCode;
    data.sheetCode = formObj.bizObject.sheetCode;
    this.toFormData(controls, formObj.bizObject.data, formObj);
    components.FormRendererHelper.synthetize(
      formControls,
      formObj.bizObject.data,
      formObj.formPermission.dataPermissions,
      false
    );
    return this.setControls(controls, formControlsNew);
  },
  /**
   * 将API数据转换为表单控件数据
   * @param controls
   * @param data
   */
  toFormData(
    controls: RendererControl[],
    data: { [key: string]: any },
    formObj: any
  ) {
    for (const key in data) {
      if (Array.isArray(data[key])) {
        for (const item of data[key]) {
          if (Array.isArray(item.departments)) {
            item.parentId = item.departments
              .filter((d: any) => d && d.id)
              .map((d: any) => d.id);
          }
        }
      }
    }

    const formControls: RendererFormControl[] = [];
    components.FormRendererHelper.findFormControl(controls, formControls);

    const user = renderer.StaffSelectorControl.service.getCurrentUser() as any;
    const owner = formControls.find((c) => c.type === FormControlType.OwnerId);
    // 如果没有提交过，则更改选人控件
    if (owner) {
      if (!(this as any).formObj) {
        return;
      }
    }

    formControls
      .filter((c) => c.type === FormControlType.Sheet)
      .forEach((c) => {
        const sheetParams = {
          id: formObj.bizObject.id,
          sheetid: formObj.bizSheet.id,
          formCode: formObj.bizSheet.code, // 表单编码
          schemaCode: formObj.bizSchema.code, // 模型编码
          objectId: formObj.bizObject.id, // 表单id
          sequenceStatus: formObj.bizObject.sequenceStatus, // 流程状态
          subSchemaCode: c.key,
          workitemId: formObj.workItemId,
        };
        const sheetValue = data[c.key];
        c.options.sheetParams = sheetParams;
        if (Array.isArray(sheetValue)) {
          sheetValue.sort((a, b) => a.sortKey - b.sortKey);
          sheetValue.forEach((v) =>
            this.toFormData((c as any).columns, v, formObj)
          );
        }
      });

    formControls
      .filter(
        (c) =>
          c.type === FormControlType.Attachment ||
          c.type === FormControlType.Image
      )
      .forEach((c) => {
        const files = data[c.key];
        if (files && Array.isArray(files)) {
          data[c.key] = files.map((f: any) => {
            if (f.refId) {
              return {
                uid: f.refId,
                name: f.name,
                status: UploadStatus.Done,
                size: f.fileSize,
                response: {
                  data: f,
                },
                url: renderer.UploadControl.service.getDownloadUrl(f),
              };
            } else if (f.uid) {
              return f;
            }
          });
        }
      });

    formControls
      .filter(
        (c) =>
          c.type === FormControlType.Checkbox ||
          c.type === FormControlType.Dropdown ||
          c.type === FormControlType.DropdownMulti
      )
      .forEach((c) => {
        const str = data[c.key] as string;
        if (
          c.type === FormControlType.Checkbox ||
          c.type === FormControlType.DropdownMulti ||
          (c.type === FormControlType.Dropdown &&
            (c.options as DropdownOptions).multi)
        ) {
          if (typeof str === "string") {
            data[c.key] = str ? str.split(";") : [];
          }
        }
      });

    formControls
      .filter((c) => c.type === FormControlType.Location)
      .forEach((c) => {
        const str = data[c.key];
        if (str) {
          try {
            if (typeof str === "object") {
              data[c.key] = str;
            } else {
              data[c.key] = JSON.parse(str);
            }
          } catch (error) {
            console.log(error);
          }
        }
      });

    formControls
      .filter((c) => c.type === FormControlType.Date)
      .forEach((c) => {
        let str = data[c.key];
        if (typeof str === "string") {
          try {
            // iOS兼容
            str = str.replace(/-/g, "/");
            data[c.key] = new Date(str);
          } catch (error) {
            console.log(error);
          }
        }
      });

    formControls
      .filter((c) => c.type === FormControlType.Address)
      .forEach((c) => {
        const str = data[c.key];
        if (typeof str === "string") {
          try {
            // iOS兼容
            data[c.key] = JSON.parse(str);
          } catch (error) {
            console.log(error);
          }
        }
      });

    formControls
      .filter(
        (c) =>
          c.type === FormControlType.RelevanceForm ||
          c.type === FormControlType.RelevanceFormEx
      )
      .forEach((c) => {
        if (data[c.key] && !data[c.key].id) {
          data[c.key] = {};
        }
        const sheetParams = {
          id: formObj.bizObject.id,
          sheetid: formObj.bizSheet.id,
        };
        c.options.sheetParams = sheetParams;
      });

    formControls
      .filter((c) => c.type === FormControlType.ReverseRelevance)
      .forEach((c) => {
        const sheetParams = {
          id: formObj.bizObject.id,
          sheetid: formObj.bizSheet.id,
          formCode: formObj.bizSheet.code,
          schemaCode: formObj.bizSheet.schemaCode,
          sequenceStatus: formObj.bizObject.sequenceStatus,
        };
        c.options.sheetParams = sheetParams;
      });
  },
  setControls(controls: RendererControl[], formControlsNew: any) {
    let formControls: RendererFormControl[] = [];
    FormRendererHelper.findFormControl(controls, formControls);
    const map: any = {};
    formControls.filter((c) => c.key).forEach((c) => (map[c.key] = c));
    return { map, formControls: formControlsNew };
  },
};
