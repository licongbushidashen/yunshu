import * as typings from "@cloudpivot/form/schema";

import {
  UploadControl,
  UploadFile,
} from "@cloudpivot/form/src/common/controls/upload-control";

export abstract class FileUploadControl extends UploadControl<
  typings.ImageUploadOptions
> {
  uploadFunc?: Function;

  deleteFunc?: Function;

  max: number = -1; // 图片可以上传最大数量
  min: number = -1; // 图片可以上传最少数量

  get isImage() {
    return this.control.type === typings.FormControlType.Image;
  }

  get text() {
    // return this.isImage ? "图片" : "附件";
    return this.isImage
      ? this.$t("cloudpivot.form.renderer.image")
      : this.$t("cloudpivot.form.renderer.attachment");
  }

  get multi() {
    if (this.isImage) {
      let arr = this.controlOpts.number.split("_");
      let type = arr.shift();
      return type === "batch";
    }
    return true;
  }

  get canUpload() {
    if (!this.multi && this.ctrl.value && this.ctrl.value.length > 0) {
      return false;
    }
    return true;
  }

  get displayTemplate() {
    // console.log(this.controlOpts, 'controlOpts');
    return this.controlOpts.displayTemplate ? this.controlOpts.displayTemplate : false;
  }
  get hasTemplates() {
    const files:any = this.controlOpts.templateFile ? this.controlOpts.templateFile : [];
    return files.length > 0;
  }
  emitUpload(files: any[]) {
    if (!this.controlOpts.onUpload) {
      return;
    }

    if (!this.uploadFunc) {
      this.uploadFunc = new Function("files", this.controlOpts.onUpload);
    }

    this.uploadFunc.call(this.getThisProxy(), files);
  }

  emitDelete(files: any[]) {
    if (!this.controlOpts.onDelete) {
      return;
    }

    if (!this.deleteFunc) {
      this.deleteFunc = new Function("files", this.controlOpts.onDelete);
    }
    this.deleteFunc.call(this.getThisProxy(), files);
  }

  onFilesChange(files: UploadFile[]): void {
    const value = this.ctrl.value || [];

    let ids = value.map((f: any) => f.uid);

    const news = files.filter((f) => ids.indexOf(f.uid) === -1);
    if (news.length > 0) {
      this.emitUpload(news);
    }

    ids = files.map((f) => f.uid);

    const deletes = value.filter((f: any) => ids.indexOf(f.uid) === -1);
    if (deletes.length > 0) {
      this.emitDelete(deletes);
    }

    const val = files && files.length > 0 ? files : null;

    //解决多张上传时只显示一张和上传进度卡死并由此造成的死循环问题
    // setTimeout(() => {
      this.setValue(val);
    // }, 200);

  }
  // 根据 文件 在value 中index移除文件,移动端删除文件使用
  removedFile(file: any) {
    const value = this.ctrl.value || [];
    if (value.length) {
      let nValue = value.filter((v: any) => v.uid !== file.uid);
      let delValue = value.filter((s: any) => s.uid === file.uid);
      this.recordDelFile(delValue[0]);
      this.setValue(nValue);
    }
  }

  // 检测 图片上传最大数量
  checkImageNumber(showError: (msg: string) => void) {
    if (!this.isImage || !~this.max) {
      return true;
    }
    let currImageNum =
      this.ctrl.value && Array.isArray(this.ctrl.value)
        ? this.ctrl.value.length
        : 0;
    if (currImageNum === 0) return true;

    if (currImageNum < this.max) {
      return true;
    } else {
      showError(`${this.controlOpts.name}数量不能大于${this.max}张`);
      return false;
    }
  }
  // 检测 图片上传名称最大长度
  checkImageNameLength(name: string, showError: (msg: string) => void) {
    const idx = name.lastIndexOf(".");
    if (idx === -1) {
      return false;
    }
    let _fileName = name.split(".")[0];
    if (_fileName.length > 80) {
      if (this.isImage) {
        showError("图片名称不能大于80个字符!");
      } else {
        showError("附件名称不能大于80个字符!");
      }
      return false;
    }
    return true;
  }

  init() {
    if (this.isImage) {
      let arr = this.controlOpts.number.split("_");
      let type = arr.shift();
      if (arr.length) {
        for (let item of arr) {
          let [key, val] = item.split(":");
          switch (key) {
            case "min":
              this.min = +val;
              break;
            case "max":
              this.max = +val;
              break;
          }
        }
      }
    }
  }

  /**
   * 将数据库文件类型转换成file结构
   * @param value
   */
  convertFileData(value: any) {
    let result;
    if (value && Array.isArray(value)) {
      result = value.map((f: any) => ({
        uid: f.refId,
        name: f.name,
        status: 2,
        size: f.fileSize,
        response: {
          data: f
        }
      }));
    }
    return result || [];
  }
}
