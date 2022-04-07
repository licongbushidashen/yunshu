import * as renderer from "../../../renderer";

import { FormSheet } from "h3-forms";

import { FormDetail } from "../form-detail";

import * as schema from "../../../schema";
import { Modal } from "@h3/antd-vue";

export abstract class PcFormDetail extends FormDetail {
  get isMobile() {
    return false;
  }

  validate(onlyUpload?: boolean) {
    const formBody = document.querySelector(".form-body") as HTMLDivElement;

    let getOffsetTop = (el: any, body: any): any => {
      let offsetParent = el.offsetParent || body;
      let offsetTop = offsetParent.offsetTop;
      if (offsetTop === 0 && offsetParent !== body) {
        return getOffsetTop(offsetParent, body);
      } else {
        return offsetTop;
      }
    };
    const scrollTo = (key: string) => {
      const el = document.querySelector(`#${key}`) as HTMLDivElement;

      if (el && formBody) {
        let scrollTop = getOffsetTop(el, formBody);
        formBody.scrollTop = scrollTop;
      }
    };

    if (!onlyUpload) {
      // const formWrap = this.$refs.formRenderer as any;
      // const formRenderer = formWrap.$refs.formRenderer as any;
      const formRenderer = this.$refs.formRenderer as any;
      if (!formRenderer.validate()) {
        const errors = formRenderer.getErrors();
        if (errors) {
          let keys = Object.keys(errors);
          let msg = "";

          const formControls: renderer.RendererFormControl[] = [];
          renderer.components.FormRendererHelper.findFormControl(
            this.controls,
            formControls
          );

          if (keys.length > 0) {
            let key = keys[0];

            const control = formControls.find(c => c.key === key);

            if (control && control.type === schema.FormControlType.Sheet) {
              const map = errors[key];
              keys = Object.keys(map);
              const keys2 = Object.keys(map[keys[0]]);
              const err = formRenderer.getErrorMessage(
                keys2[0],
                map[keys[0]][keys2[0]][0],
                key
              );
              msg = err;
              // key = key + keys[0];
              this.showErrorMsg(msg, control, keys2[0]);
            } else {
              msg = formRenderer.getErrorMessage(key, errors[key][0]);
              this.showErrorMsg(msg, control);
            }
            // this.$message.error(msg);
            scrollTo(key);
            return false;
          }
        }
      }
    }

    let upload = super.findUploadBy(renderer.UploadStatus.Uploading);
    if (upload) {
      this.$message.error(`${upload.options.name}正在上传！`, 3);
      scrollTo(upload.key);
      return false;
    }

    upload = super.findUploadBy(renderer.UploadStatus.Error);
    if (upload) {
      this.$message.error(`${upload.options.name}上传失败！`, 3);
      scrollTo(upload.key);
      return false;
    }

    const pleaseInput = this.$t("cloudpivot.form.runtime.modal.pleaseInput");

    if (!onlyUpload) {
      if (this.approval) {
        const ctrl = this.approval.controller as any;
        if (ctrl.required && (!ctrl.value || !ctrl.value.content)) {
          this.$message.error(`${pleaseInput}${this.approval.options.name}`, 3);
          return false;
        }
      }
      const formControls: renderer.RendererFormControl[] = [];
      renderer.components.FormRendererHelper.findFormControl(
        this.controls,
        formControls
      );

      const rowEmpty = this.$t("cloudpivot.form.runtime.modal.rowEmpty");
      let isEmptyRow: boolean = formControls
        .filter(c => c.type === schema.FormControlType.Sheet && c.options.isEmptyRow)
        .some(c => {
          const ctrl = this.formRenderer.controller.findChild(
            c.key
          ) as FormSheet;
          const name = this.$i18n.locale === 'zh' ? c.options.name : c.options.name_i18n ? c.options.name_i18n : 'Subtable';
          const tips = c.options.isEmptyRowTips;
          if (ctrl && ctrl.value.length === 0) {
            scrollTo(c.key);
            this.$message.error(tips ? tips : `${name}${rowEmpty}`, 3);
            return true;
          } else if (ctrl && ctrl.value.length) {
            const isValue: boolean = ctrl.value.every((s: any) => {
              let resArr:any[] = []
              Object.keys(s).forEach(el => {
                if(!['id', 'rowStatus'].includes(el)){
                  resArr.push(s[el])
                }
              })
              return resArr.join('').length > 0
            })
            //子表空行校验时必须是显示状态才做校验
            if (!isValue && ctrl.display) {
              scrollTo(c.key);
              this.$message.error(tips ? tips : `${name}${rowEmpty}`, 3);
              return true;
            }
          }
          return false;
        });

      if (isEmptyRow) {
        return false;
      }

      // renderer.FormControlType.
      let isRequire: boolean = formControls
        .filter(c => c.type === renderer.FormControlType.Address)
        .some((c: any) => {
          const ctrl = this.formRenderer.controller.findChild(c.key);
          // const val: any = c.controller.value;
          if (
            ctrl &&
            ctrl.required &&
            (!ctrl.value || !ctrl.value.provinceAdcode)
          ) {
            // 
            scrollTo(c.key);
            c.controller.setError("required");
            this.$message.error(`${pleaseInput}${c.options.name}`, 3);
            return true;
          }

          return false;
        });

      if (!isRequire) {
        isRequire = formControls
          .filter(c => c.type === schema.FormControlType.Sheet && c.required)
          .some(c => {
            const ctrl = this.formRenderer.controller.findChild(
              c.key
            ) as FormSheet;
            if (ctrl && ctrl.rows.length === 0 && ctrl.display) {
              scrollTo(c.key);
              this.$message.error(`${pleaseInput}${c.options.name}`, 3);
              return true;
            }
            return false;
          });
      }

      if (isRequire) {
        return false;
      }
    }

    return true;
  }

  showErrorMsg(errorMsg: string, control: any, sheet = "") {
    let ctl = control;
    if (control.type === schema.FormControlType.Sheet && sheet) {
      ctl = control.columns.find((v: any) => v.key === sheet);
    }
    if (
      ctl &&
      (ctl.type === schema.FormControlType.Number ||
        ctl.type === schema.FormControlType.Date ||
        ctl.type === schema.FormControlType.Time)
    ) {
      let verifyFormula = ctl.options.verifyFormula;
      if (verifyFormula) {
        if (isJSONString(verifyFormula)) {
          let obj = JSON.parse(verifyFormula);
          let type = obj.dialogBox || 1;
          if (+type === 2) {
            this.dialogError(errorMsg);
            return;
          }
        } else {
          let arr = /dialogBox:\d/.exec(verifyFormula);
          if (arr) {
            let type = arr[0].split(":")[1];
            if (+type === 2) {
              this.dialogError(errorMsg);
              return;
            }
          }
        }
      }
    }
    this.messageError(errorMsg);
    // 校验失败获取赋予输入框焦点
    let input:any = (document.querySelector('#'+control.key + ' input') as any)
    let textarea:any = (document.querySelector('#'+control.key + ' textarea') as any)
    input && input.focus()
    textarea && textarea.focus()
  }
  // 用提示框 展示错误信息
  messageError(err: string) {
    this.$message.error(err);
  }
  dialogError(err: string) {
    Modal.error({
      title: "错误提示",
      content: err
    });
  }
  // /**
  //  * 驳回
  //  */
  // async reject(data: any) {
  //   if (this.approval && !this.approval.controller.value.content) {
  //     this.$message.error("请填写审批意见");
  //     return;
  //   }

  //   return super.reject(data) as any;
  // }
}
function isJSONString(str: string) {
  try {
    if (typeof JSON.parse(str) == "object") {
      return true;
    }
  } catch (e) { }
  return false;
}
