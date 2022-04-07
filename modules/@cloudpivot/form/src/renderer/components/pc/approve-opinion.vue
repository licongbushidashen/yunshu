
<template>
  <div>
    <SmartApprove
      :value="content"
      :opinions="opinions"
      :fileList="fileList"
      :headers="headers"
      :accept="accept"
      :locale="locale"
      @input="onInput"
    ></SmartApprove>


    <!-- 常用审批意见对所有节点开放，不校验
    <div class="my-comments" v-if="commonCommentSwitch"> -->
    <div class="my-comments">
      <div class="left">
        <div>
          <a-upload
            v-if="supprotUpload"
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
            上传文件
            <a-tooltip  placement="top" overlayClassName="black-tooltip">
              <template slot="title">
                上传文件不限格式，限50个文件，每个文件在10MB之内
              </template>
              <i style="color: #2970FF" class="icon aufontAll h-icon-all-question-circle-o"></i>
            </a-tooltip>
          </a-upload>
        </div>
        
        <div class="qrcode-wrapper">
          <a-popover v-model="QRCodeShow" overlayClassName="qrcode-wrapper-in" placement="right" trigger="click">
            <i class="icon aufontAll h-icon-all-qrcode-o"></i>
            手写签名
            <a-tooltip  placement="top" overlayClassName="black-tooltip">
              <template slot="title">
                签名完成前，请勿关闭二维码
              </template>
              <i style="color: #2970FF" class="icon aufontAll h-icon-all-question-circle-o"></i>
            </a-tooltip>
            <template slot="content">
              <div class="qrcode">
                <img :src="qrCodeUrl" alt="">
                <p>手机扫码签名</p>
                <span>请用微信，企业微信和钉钉进行扫码签名</span>
              </div>
            </template>
          </a-popover>
        </div>
        
        <div class="multiplexing" @click="copyLastAutograph" v-if="lastAutographUrl">
          <a-popover overlayClassName="qrcode-wrapper-in" placement="bottomLeft" >
          <i class="icon aufontAll h-icon-all-copy-o"></i>
          复制上一次签名
          <template slot="content">
              <img class="lastAutograph" :src="lastAutographUrl" alt="">
            </template>
          </a-popover>
        </div>
      </div>

      <div class="my-comments-wrapper">
        <a-popover placement="top" v-model="popoverVisible" overlayClassName="my-comments-popover" trigger="click">
            <template slot="content">
              <div class="my-comments-pop">
                <div class="noData" v-if="myComments.length == 0">
                  <div class="nodata-img">
                    <PageNoData  :isShowNoData="true" :tipText="'暂无内容'"/></div>

                  <footer>
                    <div>
                      <span @click="visible=true">
                        <span class="icon aufontAll">&#xe8da;</span>新增
                      </span>
                    </div>
                  </footer>
                </div>
                <div v-if="myComments.length != 0">
                  <ul>
                      <header>
                        <span class="warn-info">仅限10条</span>
                        <span class="icon aufontAll close-btn" @click="closePop()">&#xe996;</span>
                      </header>
                      <div class="ul-content">
                        <li
                          :title="province.content" 
                          v-for="province in myComments" 
                          :key="province.id">
                          <span class="opinion-content"  @click="checkedCommentChange(province.content)" >{{ province.content }}</span>
                          <span class="operation-btn edit" @click="editComments(province)">
                            <i class="icon aufontAll h-icon-all-edit-o edit"></i>
                          </span>
                          <span class="operation-btn del" @click="delComments(province)">
                            <i class="icon aufontAll h-icon-all-delete-o"></i>
                          </span>
                        </li>
                      </div>
                      <footer>
                        <div>
                          <span @click="visible=true">
                            <span class="icon aufontAll">&#xe8da;</span>新增
                          </span>
                        </div>
                      </footer>
                  </ul>
                </div>
              </div>
            </template>
            <font>常用审批意见 
              <span v-if="!popoverVisible" class="icon aufontAll">&#xe88a;</span>
              <span v-if="popoverVisible" class="icon aufontAll">&#xe8ac;</span>
            </font>
          </a-popover>
      </div>
    </div>
    <!-- 审批意见上传文件 -->
    <a-upload
      v-if="supprotUpload"
      :action="uploadUrl"
      :beforeUpload="beforeUpload"
      :multiple="true"
      listType="text"
      :fileList="fileList"
      :headers="headers"
      @preview="handlePreview"
      @change="onChange"
      class="upload"
    />
    
    <a-modal
      :visible="visible"
      :width="600"
      :title="currentEdit ? '编辑' : '新增'"
      :zIndex="1040"
      centered
      @cancel="closeModal"
    >
      <div class="modal-wrapper">
        <p>审批意见</p>
        <textarea @input="commentChange" v-model="currentComment" placeholder="请输入" :rows="4" />
        <div>
          <span>{{currentComment.length}}</span>/450
        </div>
      </div>
      <template slot="footer">
        <a-button @click="visible = false">{{ $t("cloudpivot.flowCenter.pc.cancel") }}</a-button>
        <a-button @click="modalOK" type="primary">{{ $t("cloudpivot.flowCenter.pc.ok") }}</a-button>
      </template>
    </a-modal>
    <div class="autograph-img" v-if="autographUrl">
      <div class="label">
        签名
      </div>
      <div class="autograph-img-wrapper">
        <img :src="autographUrl" alt="">
        <span @click="removeAutograph"><i class="icon aufontAll h-icon-all-close-circle"></i></span>
      </div>
    </div>
    <!-- <div v-if="controlOpts.showSignature">
      <div class="title">
        <span>{{ $t('cloudpivot.form.renderer.sign') }} {{ $t('cloudpivot.form.renderer.tip.onlySupportMobileWrite') }}</span>
      </div>
    </div> -->
  </div>
</template>


<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator";

import SmartApprove from "../shared/smart-approve/index.vue";

import { RendererFormControl } from "../../typings";

import myComments from "../../../../../flow-center/src/components/pc/my-comments.vue"

import { Icon, Button, Upload, Modal,  Select, Checkbox, Tooltip, Input, Popover} from "@h3/antd-vue";

import { ApproveOpinionControl } from "../../controls";

import { workflowCenterApi, externalLinkApi, formApi } from "@cloudpivot/api";

import common from "@cloudpivot/common/pc";
@Component({
  name: "approve-opinion",
  components: {
    AIcon: Icon,
    AButton: Button,
    AUpload: Upload,
    AModal: Modal,
    SmartApprove,
    ASelect: Select,
    ASelectOption: Select.Option,
    ACheckbox: Checkbox,
    ATooltip: Tooltip,
    AInput: Input,
    AInputSearch: Input.Search,
    APopover: Popover,
    myComments,
    PageNoData: common.components.PageNoData,
  }
})
export default class ApproveOpinion extends ApproveOpinionControl {
  QRCodeShow:boolean = false
  currentRefID:string = '' // 存储已经上传了签名的refid，以防再次打开签名二维码刷新覆盖
  refId:string = ''

  removeAutograph(){
    this.val.resources = this.val.resources.filter(el => el.refId !== this.currentRefID && el !== '');
    (this.ctrl as any).value = Object.assign(this.val, {});
    this.fileList = this.fileList.filter(el => el.uid !== this.currentRefID && el !== '');
    this.refId = ''
    this.currentRefID = ''
    this.autographUrl = ''
  }

  @Watch('QRCodeShow')
  onQRCodeShowChange(value){
    if(value){
      this.setRefId()
      this.getQrCodeUrl()
    }
  }

  exist(){ // 检测签名是否存在
    formApi.exist({
      refId: this.refId
    }).then(res => {
      if(res.errcode === 0 && res.data){
        this.QRCodeShow = false
        this.currentRefID = this.refId
        this.getAutographUrl(this.refId)
        this.setAutographToList(this.refId)
      }else if(this.QRCodeShow){
        setTimeout(() => {
          this.exist()
        }, 500);
      }
    })
  }

  copyLastAutograph(){ // 复制上一次签名
    if(!this.lastAutographRefId){
      return
    }
    this.getAutographUrl(this.lastAutographRefId)
    this.setAutographToList(this.lastAutographRefId, true)
  }

  setAutographToList(rerId:string, isCopy = false){ // 将签名添加到列表
    if(this.val.resources){
      // 删除已经使用的签名，使用新的签名
      this.val.resources = this.val.resources.filter(el => el.name !== 'signsture.png')
      if(isCopy){
        this.val.resources.push(this.lastAttachment)
      }else{
        this.val.resources.push({
          name: "signsture.png",
          refId: rerId,
          mimeType: "image/png"
        })
      }
      
    } else {
      if(isCopy){
        this.val.resources = [
          this.lastAttachment
        ]
      }else{
        this.val.resources = [
          {
            name: "signsture.png",
            refId: rerId,
            mimeType: "image/png"
          }
        ]
      }
      
    }
    (this.ctrl as any).value = Object.assign(this.val, {});
  }

  @Watch('fileList',{
    deep: true
  })
  onFileListChange(list){
    if(list.some(el => el.uid === this.currentRefID)){
      this.fileList = this.fileList.filter(el => el.uid !== this.currentRefID && el !== '');
    }
  }


  autographUrl: string = '' // 签名地址
  getAutographUrl(refId: string){
    this.autographUrl = this.getDownloadUrlByRefId(refId) || ''
  }

  qrCodeUrl:string = ''
  getQrCodeUrl(){
    this.qrCodeUrl = ''
    let token:string = localStorage.getItem('token') || ''
    let origin = location.origin 
    let signinUrl = `${origin}/mobile/#/signature?refId=${this.refId}&T=${token}`
    // window.open(signinUrl)
    
    externalLinkApi.generateQrcode(signinUrl).then((res: any) => {
      let bytes = new Uint8Array(res);
      let data = '';
      let len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        data += String.fromCharCode(bytes[i]);
      }
      this.qrCodeUrl = 'data:image/png;base64,' + window.btoa(data);
      this.exist()
    })
  }

  get val(){
    return this.ctrl.value || {};
  }
  uploading = false;

  handlePreview() {}

  setControl() {
    this.handleValueChange(this.ctrl.value);
  }

  handleValueChange(value : any){
    if(this.uploading){
      this.uploading = false;
      return;
    }
    if (value && value.resources) {
      this.fileList = value.resources.map((x: any) => this.map(x));
      this.fileList.filter(el => {
        if(el.name === "signsture.png"){
          this.getAutographUrl(el.response.data.refId)
        }
      })
    }
  }

  showError(msg: string) {
    this.$message.error(msg);
  }

  beforeUpload(file: File) {
    return this.checkFile(file, this.showError);
  }

  checkFile(file: File, showError?: (msg: string) => void) {
    if (!this.checkFileType(file.name, showError)) {
      return false;
    }

    if (!this.checkFileSize(file, showError)) {
      return false;
    }

    return true;
  }

  scrollHandle(){
    if(this.popoverVisible){
      this.popoverVisible = false
    }
  }
  mounted(){
    let oDiv = document.querySelector('.form-wrap')
    if(oDiv){
      oDiv.addEventListener('scroll', this.scrollHandle)
    }
  }
  destroyed(){
    let oDiv = document.querySelector('.form-wrap')
    if(oDiv){
      oDiv.removeEventListener('scroll', this.scrollHandle)
    }
    
  }

  setRefId(){
    let user = JSON.parse(sessionStorage.getItem('user') || '{}')
    this.refId = user.username + new Date().getTime() 
  }

  commonCommentSwitch: boolean = false

  lastAutographUrl: string = '' // 上一次使用的签名
  lastAutographRefId: string = ''
  lastAttachment: any = ''

  get attachmentValue(){
    return this.control.controller && this.control.controller.value && this.control.controller.value || ''
  }
  @Watch('attachmentValue', {deep: true})
  onControlValChange(value){
    if(value && value.lastAttachment){
      this.lastAttachment = value.lastAttachment
      this.lastAutographRefId = this.lastAttachment.refId
      // 获取上一次签名
      this.lastAutographUrl = this.getDownloadUrlByRefId(this.lastAutographRefId)
    }
  }

  created(){
    this.setRefId()

    try {
      // @ts-ignore
      this.commonCommentSwitch = this.ctrl.options.commonCommentSwitch
    } catch (error) {}

    this.getCommentList()
  }

  // 常用审批意见
  popoverVisible:boolean = false
  searchText: string = ''
  isCommon:boolean = false
  checkedCommentChange(CommentText){
    (this.ctrl as any).value = Object.assign(this.val,{
      content : CommentText
    });
    this.popoverVisible = false
  }
  checkedComment:any = undefined
  myComments: any[] = []
  async getCommentList(){
    let res:any = await workflowCenterApi.getCommonCommentList({})
    if(res.errcode === 0){
      this.myComments = res.data
    }else{}
  }
  setCommon(){
    if(this.isCommon && this.myComments.length >= 10){
      this.$message.error('最多只能设置10条常用审批意见！')
      this.isCommon = false
      return
    }
    // @ts-ignore
    this.ctrl.isCommon = this.isCommon
  }


  onChange(info: { file: any; fileList: any[]; event: any }): void {
    if (!this.checkFile(info.file)) {
      return;
    }

    this.fileList = info.fileList;
    this.uploading = true;
    const resources = info.fileList
      .filter(f => f.status === "done")
      .map(f => f.response.data);

    (this.ctrl as any).value = Object.assign(this.val, {
      resources
    });
  }

  onInput(val: string) {
    // this.ctrl.value.content = val;

    (this.ctrl as any).value = Object.assign(this.val,{
      content : val
    });
  }

  // onCheckboxChange(checked: boolean) {
  //   this.ctrl.value.saveCommon = checked;
  // }

  onSelectFocus() {
    super.search("");
  }

  closePop() {
    this.popoverVisible = false;
  }

  visible:boolean = false
  currentComment:string = ''
  currentEdit: any  = ''

  closeModal(){
    this.visible=false;
  }
  
  async modalOK(){
    let testTxt = this.currentComment.trim()
    if(testTxt === ''){
      this.$message.error('审批意见不能为空！')
      return
    }

    let params:any = {
      content: this.currentComment,
      sortKey: 0
    }
    if(this.currentEdit){
      params.id = this.currentEdit.id
      params.sortKey = this.currentEdit.sortKey
    }else{
      if(this.myComments.length === 10){
        this.$message.error('最多设置10条常用审批意见！')
        return
      }
    }
    let res:any = await workflowCenterApi.saveCommonComment(params)
    if(res.errcode === 0){
      this.getList()
      this.visible = false
      // this.popoverVisible = true;
      this.$message.success('新增成功！')
    }else{
      this.$message.error(res.errmsg)
    }
  }

  editComments(record){
    this.currentComment = record.content
    this.currentEdit = record
    this.visible = true
  }

  delVisible : boolean = false;
  delComments(record){
    if(this.delVisible) return;
    let _this = this;
    this.delVisible = true;
    this.$confirm({
      title: '确定要删除？',
      okText: '确认',
      cancelText: '取消',
      zIndex: 1040,
      onOk: () => {
        this.deleteCommonComment(record.id);
        this.delVisible = false;
        // this.popoverVisible = true;
      },
      onCancel: () => {
        this.delVisible = false;
        this.popoverVisible = true;
      }
    });
  }

  async deleteCommonComment(ids){
    let res:any = await workflowCenterApi.deleteCommonComment({
      ids: ids
    })
    const vm: any = this;
    if(res.errcode === 0){
      vm.$message.success('删除成功');
      this.getList()
    }else{
      this.$message.error(res.errmsg)
    }
  }

  @Watch('visible')
  onVisibleChange(val){
    if(!val){
      this.currentEdit = ''
      this.currentComment = ''
    }
  }

  commentChange(){
    if(this.currentComment.length > 450){
      this.currentComment = this.currentComment.substr(0, 450)
    }
  }

  async getList(){
    let res:any = await workflowCenterApi.getCommonCommentList({})
    if(res.errcode === 0){
      res.data.forEach((e,index) => {
        e.orderNumber = index + 1
      });
      this.myComments = res.data
    }else{
      this.$message.error(res.errmsg)
    }

    //判断当前常用审批意见是否超过十条（历史数据）如果超过删除多余部分
    if(res.data.length > 10) {
      for(let i=10;i<res.data.length;i++) {
        this.deleteCommonComment(res.data[i].id);
      }
    }
  }
}
</script>

<style lang="less">
.black-tooltip .ant-tooltip-inner{
  max-width: 200px;
}
.qrcode-wrapper-in .ant-popover-inner-content{
  padding: 0;
  margin: 0;
  .qrcode{
    padding: 0;
    img{
      width: 176px;
      height: 176px;
    }
    p{
      padding: 0 20px;
      margin-top: -4px;
      margin-bottom: 4px;
    }
    span{
      display: block;
      padding: 0 20px 15px;
      text-align: justify;
    }
  }
}
</style>

<style lang="less" scoped>
img.lastAutograph{
  width: 136px;
  height: 136px;
}
.autograph-img{
  position: relative;
  margin-top: 24px;
  .autograph-img-wrapper{
    width: 120px;
    height: 120px;
    background-color: #fff;
    border: 1px solid #D8D8D8;
    position: relative;
    img{
      width: 100%;
      height: 100%;
    }
    span{
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
      i{
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        color: #F4454E;
        font-size: 14px;
        background-color: transparent;
      }
    }
  }
  .label{
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
    // position: absolute;
    // top: 100%;
    // left: 50%;
    // margin-left: -88px;
    // z-index: 2;
    // box-shadow: 0px 4px 11px 0px rgba(0, 0, 0, 0.19);
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

/deep/ .ant-modal {
  top: 0;
}
.title{
  line-height: 32px;
  span{
    color: rgba(0, 0, 0, 0.65);
  }
}

.my-comments{
  display: flex;
  width: 100%;
  margin-top: 8px;
  flex-direction: row;
  justify-content: space-between;
  &>div{
    margin-right: 8px;
  }
  .left{
    flex: 1;
    display: flex;
    font-size: 12px;
    &>div{
      margin-right: 20px;
      cursor: pointer;
      &:hover{
        color: #2970FF;
      }
    }
    i{
      font-size: 12px;
    }
    /deep/ .ant-upload-list-item{
      display: none;
    }
  }
}

.my-comments-pop{
    width: 294px;
    footer {
        cursor: pointer;
        display: flex;
        align-items: center;
        flex-direction: column;
        color: #2970FF;
        padding-top: 10px;
        margin-top: 8px;
        border-top: 1px solid #e8e8e8;
        div {
          text-align: center;
          .icon.aufontAll{
            font-size: 10px;
            vertical-align: 2px;
            margin-right: 2px;
          }
        }
      }
    ul{
      margin: 0;
      padding: 0;
      overflow: auto;
      width: 100%;
      header{
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin-bottom: 10px;
        .warn-info{
          font-size: 12px;
          color: #ccc;
        }
        .close-btn{
          cursor: pointer;
        }
      }
      .ul-content{
        max-height: 198px;
        overflow-y: scroll;
        li{
          line-height: 1.5;
          font-size: 14px;
          padding: 6px 0;
          position: relative;
          width: 100%;
          color: rgba(0,0,0,0.85);
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
          &:hover{
            background: #F9F9F9;
            color: #2970FF;
          }
          .operation-btn{
            color:rgba(0, 0, 0, 0.65);
            &.edit{
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
        color: #2970FF;
        padding-top: 10px;
        margin-top: 8px;
        border-top: 1px solid #e8e8e8;
        div {
          text-align: center;
          .icon.aufontAll{
            font-size: 10px;
            vertical-align: 2px;
            margin-right: 2px;
          }
        }
      }
    }

    .noData{
      width: 284px;
      text-align: center;
      color: rgba(0,0,0,0.0.85);
      /deep/img{
        width:100px;
      }
    }
  }

  .my-comments-wrapper{
    font{
      color: #2970FF;
      font-size: 14px;
      cursor: pointer;
      .icon{
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
      color: #5291FF;
    }
  }
  .my-comments-popover .ant-popover-arrow{
    margin-left: 48px !important;
  }

  .manageComment:hover {
    cursor: pointer;
  }

  .inlineManage {
    color: rgb(25,143,255);
  }

  .inlineManage:hover {
    cursor: pointer;
  }

  .modal-wrapper{
    p{
      font-size: 14px;
      color: rgba(0, 0, 0, 0.65);
      margin-bottom: 0;
    }
    textarea{
      width: 100%;
      border: 1px solid rgba(217,217,217,1);
      border-radius: 4px;
      padding: 8px;
      line-height: 1.5;
      margin: 8px 0 0;
      &:hover{
        border: 1px solid #40a9ff;
      }
      &:focus{
        outline: 0;
        border: 1px solid #40a9ff;
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
      }
    }
    div{
      font-size: 14px;
      color: rgba(0, 0, 0, 0.65);
    }
  }
</style>