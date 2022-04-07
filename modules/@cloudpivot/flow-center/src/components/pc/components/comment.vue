<template>
  <div class="my-comments">
    <div class="left">
      <div>
        <a-upload
          :action="uploadUrl"
          :beforeUpload="beforeUpload"
          :multiple="true"
          listType="text"
          :fileList="fileList"
          :headers="headers"
          @preview="handlePreview"
          @change="onChange"
          class="upload"
        >

        <i class="icon aufontAll h-icon-all-upload-o"></i>
          <span style="font-size: 12px;">上传文件</span>
          <a-tooltip placement="top" overlayClassName="black-tooltip">
            <template slot="title">
              上传文件不限格式，限50个文件，每个文件在10MB之内
            </template>
            <i
              style="color: #2970ff; margin-left: 5px;"
              class="icon aufontAll h-icon-all-question-circle-o"
            ></i>
          </a-tooltip>
        </a-upload>
      </div>

      <div class="qrcode-wrapper">
        <a-popover
          v-model="QRCodeShow"
          overlayClassName="qrcode-wrapper-in"
          placement="right"
          trigger="click"
        >
          <i class="icon aufontAll h-icon-all-qrcode-o"></i>
          手写签名
          <a-tooltip placement="top" overlayClassName="black-tooltip">
            <template slot="title"> 签名完成前，请勿关闭二维码 </template>
            <i
              style="color: #2970ff"
              class="icon aufontAll h-icon-all-question-circle-o"
            ></i>
          </a-tooltip>
          <template slot="content">
            <div class="qrcode">
              <img :src="qrCodeUrl" alt="" />
              <p>手机扫码签名</p>
              <span>请用微信，企业微信和钉钉进行扫码签名</span>
            </div>
          </template>
        </a-popover>
      </div>
    </div>

    <div class="file-list-wrapper">
      <!-- <a-upload
        :action="uploadUrl"
        :beforeUpload="beforeUpload"
        :multiple="true"
        listType="text"
        :fileList="fileList"
        :headers="headers"
        @preview="handlePreview"
        @change="onChange"
        class="upload"
      >
      </a-upload> -->
      <div class="autograph-img" v-if="autographUrl">
        <div class="label">签名</div>
        <div class="autograph-img-wrapper">
          <img :src="autographUrl" alt="" />
          <span @click="removeAutograph"
            ><i class="icon aufontAll h-icon-all-close-circle"></i
          ></span>
        </div>
      </div>
    </div>

    <!-- <a-modal
      :visible="uploadVisible"
      :width="600"
      title="上传文件"
      centered
      :footer="null"
      @cancel="uploadVisible = false"
    >
      <a-upload
        :action="uploadUrl"
        :beforeUpload="beforeUpload"
        :multiple="true"
        listType="text"
        :fileList="fileList"
        :headers="headers"
        @preview="handlePreview"
        @change="onChange"
        class="upload"
      >
        <a-button>
          <a-icon type="upload" />{{
            $t("cloudpivot.form.renderer.tip.clickAndDropUpload")
          }}
        </a-button>
      </a-upload>
    </a-modal> -->
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { ApproveOpinionControl } from "@cloudpivot/form/src/renderer/controls";
import { workflowCenterApi, externalLinkApi, formApi } from "@cloudpivot/api";
import { Tooltip, Popover, Upload, Button, Icon, Modal } from "@h3/antd-vue";
import { DefaultFileService } from "@/config/h3-form/file-service";

@Component({
  name: "batchOperationComment",
  components: {
    ATooltip: Tooltip,
    APopover: Popover,
    AUpload: Upload,
    AButton: Button,
    AIcon: Icon,
    AModal: Modal,
  },
})
export default class batchOperationComment extends Vue {
  uploadVisible: boolean = false;
  QRCodeShow: boolean = false;
  currentRefID: string = ""; // 存储已经上传了签名的refid，以防再次打开签名二维码刷新覆盖
  refId: string = "";
  fileList: any[] = [];
  DefaultFileService: any = new DefaultFileService();
  get headers() {
    return this.DefaultFileService.getHeaders();
  }
  get uploadUrl() {
    return this.DefaultFileService.getUploadUrl();
  }

  removeAutograph() {
    this.refId = "";
    this.currentRefID = "";
    this.autographUrl = "";
  }

  getValue() {
    let res: any = [];
    this.fileList.forEach((el) => {
      res.push(el.response.data);
    });
    if (this.currentRefID) {
      res.push({
        name: "signsture.png",
        refId: this.currentRefID,
        mimeType: "image/png",
      });
    }
    return res
  }

  @Watch("QRCodeShow")
  onQRCodeShowChange(value) {
    if (value) {
      this.setRefId();
      this.getQrCodeUrl();
    }
  }

  exist() {
    // 检测签名是否存在
    formApi
      .exist({
        refId: this.refId,
      })
      .then((res) => {
        if (res.errcode === 0 && res.data) {
          this.QRCodeShow = false;
          this.currentRefID = this.refId;
          this.getAutographUrl(this.refId);
        } else if (this.QRCodeShow) {
          setTimeout(() => {
            this.exist();
          }, 500);
        }
      });
  }

  onChange(info: { file: any; fileList: any[]; event: any }): void {
    if (!this.checkFile(info.file)) {
      return;
    }

    this.fileList = info.fileList;
  }

  @Watch("fileList", {
    deep: true,
  })
  onFileListChange(list) {
    if (list.some((el) => el.uid === this.currentRefID)) {
      this.fileList = this.fileList.filter(
        (el) => el.uid !== this.currentRefID && el !== ""
      );
    }
  }

  autographUrl: string = ""; // 签名地址
  getAutographUrl(refId: string) {
    this.autographUrl =
      this.DefaultFileService.getDownloadUrlByRefId(refId) || "";
  }

  qrCodeUrl: string = "";
  getQrCodeUrl() {
    this.qrCodeUrl = "";
    let token: string = localStorage.getItem("token") || "";
    let origin = location.origin;
    let signinUrl = `${origin}/mobile/#/signature?refId=${this.refId}&T=${token}`;
    // window.open(signinUrl);

    externalLinkApi.generateQrcode(signinUrl).then((res: any) => {
      let bytes = new Uint8Array(res);
      let data = "";
      let len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        data += String.fromCharCode(bytes[i]);
      }
      this.qrCodeUrl = "data:image/png;base64," + window.btoa(data);
      this.exist();
    });
  }

  uploading = false;

  handlePreview() {}

  // handleValueChange(value: any) {
  //   if (this.uploading) {
  //     this.uploading = false;
  //     return;
  //   }
  //   if (value && value.resources) {
  //     this.fileList = value.resources.map((x: any) => this.map(x));
  //     this.fileList.filter((el) => {
  //       if (el.name === "signsture.png") {
  //         this.getAutographUrl(el.response.data.refId);
  //       }
  //     });
  //   }
  // }

  showError(msg: string) {
    this.$message.error(msg);
  }

  beforeUpload(file: File) {
    return this.checkFile(file, this.showError);
  }

  checkFile(file: File, showError?: (msg: string) => void) {
    // if (!this.checkFileType(file.name, showError)) {
    //   return false;
    // }

    // if (!this.checkFileSize(file, showError)) {
    //   return false;
    // }

    return true;
  }

  setRefId() {
    let user = JSON.parse(sessionStorage.getItem("user") || "{}");
    this.refId = user.username + new Date().getTime();
  }

  commonCommentSwitch: boolean = false;

  created() {
    this.setRefId();
    this.DefaultFileService = new DefaultFileService();
  }

  visible: boolean = false;
  currentComment: string = "";
  currentEdit: any = "";

  closeModal() {
    this.visible = false;
  }

  editComments(record) {
    this.currentComment = record.content;
    this.currentEdit = record;
    this.visible = true;
  }

  delVisible: boolean = false;

  @Watch("visible")
  onVisibleChange(val) {
    if (!val) {
      this.currentEdit = "";
      this.currentComment = "";
    }
  }

  commentChange() {
    if (this.currentComment.length > 450) {
      this.currentComment = this.currentComment.substr(0, 450);
    }
  }
}
</script>
<style lang="less" scoped>
.file-list-wrapper {
  width: 100%;
}
.my-comments {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 8px;
  justify-content: space-between;
  & > div {
    margin-right: 8px;
  }
  .left {
    flex: 1;
    // display: flex;
    font-size: 12px;
    position: relative;
    & > div {
      margin-right: 20px;
      cursor: pointer;
      line-height: 23px;
      &:hover {
        color: #2970ff;
      }
    }
    i {
      font-size: 12px;
    }

    .qrcode-wrapper{
      position: absolute;
      left: 100px;
      top: 0px;
    }
  }
}

.my-comments-pop {
  width: 294px;
  footer {
    cursor: pointer;
    display: flex;
    align-items: center;
    flex-direction: column;
    color: #2970ff;
    padding-top: 10px;
    margin-top: 8px;
    border-top: 1px solid #e8e8e8;
    div {
      text-align: center;
      .icon.aufontAll {
        font-size: 10px;
        vertical-align: 2px;
        margin-right: 2px;
      }
    }
  }
  ul {
    margin: 0;
    padding: 0;
    overflow: auto;
    width: 100%;
    header {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      margin-bottom: 10px;
      .warn-info {
        font-size: 12px;
        color: #ccc;
      }
      .close-btn {
        cursor: pointer;
      }
    }
    .ul-content {
      max-height: 198px;
      overflow-y: scroll;
      li {
        line-height: 1.5;
        font-size: 14px;
        padding: 6px 0;
        position: relative;
        width: 100%;
        color: rgba(0, 0, 0, 0.85);
        cursor: pointer;
        overflow: hidden;
        .opinion-content {
          width: 220px;
          margin-left: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: block;
        }
        &:hover {
          background: #f9f9f9;
          color: #2970ff;
        }
        .operation-btn {
          color: rgba(0, 0, 0, 0.65);
          &.edit {
            position: absolute;
            left: 245px;
            top: 5px;
          }
          &.del {
            position: absolute;
            left: 270px;
            top: 5px;
          }
        }
      }
    }
    footer {
      cursor: pointer;
      display: flex;
      align-items: center;
      flex-direction: column;
      color: #2970ff;
      padding-top: 10px;
      margin-top: 8px;
      border-top: 1px solid #e8e8e8;
      div {
        text-align: center;
        .icon.aufontAll {
          font-size: 10px;
          vertical-align: 2px;
          margin-right: 2px;
        }
      }
    }
  }

  .noData {
    width: 284px;
    text-align: center;
    color: rgba(0, 0, 0, 0.85);
    /deep/img {
      width: 100px;
    }
  }
}

.my-comments-wrapper {
  font {
    color: #2970ff;
    font-size: 14px;
    cursor: pointer;
    .icon {
      font-size: 10px;
      vertical-align: 2px;
    }
  }
}

.question-icon {
  color: rgba(0, 0, 0, 0.65);
  &:hover {
    color: #2970ff;
  }
}

.manageComment {
  margin: 0 20px;
  color: #2970ff;
  &:hover {
    color: #5291ff;
  }
}
.my-comments-popover .ant-popover-arrow {
  margin-left: 48px !important;
}

.manageComment:hover {
  cursor: pointer;
}

.inlineManage {
  color: rgb(25, 143, 255);
}

.inlineManage:hover {
  cursor: pointer;
}

.modal-wrapper {
  p {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.65);
    margin-bottom: 0;
  }
  textarea {
    width: 100%;
    border: 1px solid rgba(217, 217, 217, 1);
    border-radius: 4px;
    padding: 8px;
    line-height: 1.5;
    margin: 8px 0 0;
    &:hover {
      border: 1px solid #40a9ff;
    }
    &:focus {
      outline: 0;
      border: 1px solid #40a9ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }
  }
  div {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.65);
  }
}

.autograph-img {
  position: relative;
  margin-top: 24px;
  .autograph-img-wrapper {
    width: 120px;
    height: 120px;
    background-color: #fff;
    border: 1px solid #d8d8d8;
    position: relative;
    img {
      width: 100%;
      height: 100%;
    }
    span {
      position: absolute;
      top: 0;
      right: 0;
      // background-color: #F4454E;
      border-radius: 7px;
      height: 14px;
      width: 14px;
      transform: translate(50%, -50%);
      overflow: hidden;
      cursor: pointer;
      i {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        color: #f4454e;
        font-size: 14px;
        background-color: transparent;
      }
    }
  }
  .label {
    position: absolute;
    right: 100%;
    text-align: left;
    width: 102px;
    margin-right: 8px;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.65);
  }
}

.qrcode{
    width: 176px;
    max-height: 260px;
    padding: 15px 15px;
    background-color: #fff;
    img{
      width: 147px;
      height: 147px;
      display: block;
    }
    p{
      font-size: 14px;
      color: #000;
    }
    span{
      font-size: 12px;
      color: rgba(0, 0, 0, 0.45);
    }
  }
</style>


<style lang="less">
.my-comments{
  .ant-upload-list-item-info{
    max-width: 374px;
    overflow: hidden;
  }
}
</style>