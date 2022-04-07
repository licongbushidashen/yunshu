import {  Component, Watch } from "vue-property-decorator";

import { renderer } from '@cloudpivot/form';

import * as FormCommentIns from '@cloudpivot/api'

import FormCommentBase from '../common-base';

import {
  Button, Input, Upload, Modal, Icon
} from '@h3/antd-vue';

import At from '../share/vue-at/at.vue';

@Component({
  name: "pc-form-detail",
  components: {
    AButton: Button,
    ATextarea: Input.TextArea ,
    AUpload: Upload,
    AModal: Modal,
    AIcon: Icon,
    At,
  }
})


export default class FormComment extends FormCommentBase {
  reComment:string = '';

  commentList:Array<any> = [];

  // wordsLen:any = 0;

  isShowPreview:boolean = false;

  presrc:string = '';

  isPersonListLoaded:boolean = true;

  fileList: any = [];

  get fileNotAllUploaded(){
    if (this.fileLists.length <= 0) return false;

    return this.fileLists.some((file:any) => !file.refId);
  }

  get fileListDisplay(){
    return this.fileLists.map((list:any) => {
      list.src = renderer.UploadControl.service.getDownloadUrl(list)
      return list;
    })
  }

  get len() {
    return this.getHtmlLen(this.comment);
  }

  get apiHost() {
    return (window as any).config.apiHost;
  }  
  get token() {
    return window.localStorage.getItem("token");
  }
  getAvatarDownloadUrl(refId: string) {
    if (!refId) {
      return "";
    } else if (refId.indexOf("http") > -1) {
      return refId;
    } else {
      let url = `${this.apiHost}/api/aliyun/download?refId=${refId}`;
      if (this.token) {
        url += "&T=" + this.token;
      }
      return url;
    }
  }

  getHtmlLen(html){
    html = this.filterHtml(html)
    let oDiv = document.createElement('div');
    html = html.replace(/amp;/g, '');
    oDiv.innerHTML = html.replace(/[\%\^\&\*\(\$]/g, '文');
    return oDiv.innerText.length;
  }

  /**
   * at 组件编辑时
   * */
  handleInput(index?:any){
    let atwhoEditWrap:any;
    let atPane:any;
    if (typeof index === 'number') {
      atwhoEditWrap = null; // 回复框无需@人，故通过此方式阻断逻辑执行
      atPane = null;
    } else {
      atwhoEditWrap = (this.$refs.atwhoEditWrap as any);
      atPane = (this.$refs.atPane as any);
    }


    super.handleInputBase(atwhoEditWrap, atPane);
  }

  /**
   * at组件失去焦点
   * */
  onAtwhoViewBlur (index?:number) {
    setTimeout(() => {
      if (typeof index === 'number') {
        (this.$refs[`atPane${index}`][0] as any).onAtwhoViewBlur();
      } else {
        (this.$refs.atPane as any).onAtwhoViewBlur();
      }
    }, 300);
  }

    /**
   * @desc  输入 @ 出现可以艾特人备选列表 备选框触底懒加载
  */
 async onTouchBottom(index?:number){
   if (!this.isPersonListLoaded) return ;
   this.isPersonListLoaded = false;
  const { isLazyload, keyword } = this;
  if (!isLazyload) return;
  this.page += 1;

  const { bizObjectId, schemaCode, workflowInstanceId, page, pageSize } = this;
  const params: FormCommentIns.formCommentParams.GetAtUser = {
    bizObjectId,
    schemaCode,
    keyword,
    wfInstanceId: workflowInstanceId,
    page,
    pageSize
  }

  const res:any = await FormCommentIns.FormCommentApi.getAtUsers(params);

  if (res.errcode === 0) {
    const { data } = res;
    if (data.content.length > 0) {
      this.isLazyload = true;
      this.members = this.members.concat(data.content);
      this.$nextTick(() => {
        if (typeof index === 'number') {
          (this.$refs[`atPane${index}`][0] as any).handleInput();
          (this.$refs[`atPane${index}`][0] as any).scroll2Bottom();
        } else {
          (this.$refs.atPane as any).handleInput();
          this.$nextTick(() => {
            (this.$refs.atPane as any).scroll2Bottom();
          })
        }
      });
    } else {
      this.isLazyload = false;
    }
    this.isPersonListLoaded = true;
    // this.members = JSON.parse(JSON.stringify(data.content));
  } else {
    console.error(res.errmsg);
  }
}

  // 选中人员
  onSelectUser(){
    // this.members = this.defaultMembers;
  }

  caculateLen (item:any) {
   return this.getHtmlLen(item.reComment);
  }

  doFocus(){
    this.$nextTick(() => {
      (this.$refs.atPane as any).setFocus();
    })
  }

  time:number = 0;
  setDurationStart(){
    this.time = new Date().getTime();
  }
   //注释掉是因为光标移动到前面会自动到后面
  // setDurationEnd(){
  //   const now:number = new Date().getTime();
  // if (now - this.time <= 200) { // 代表click
  //     this.doFocus();
  //   }
  // }

  /**
   * 获取评论列表
   * */
  getCommList(type?:string){
    if (!this.isLoaded) return;
    this.isLoaded = false;
    super.getCommListBase()
      .then((res) => {
        if ( res.errcode === 0 ) {
          const { content } = res.data;

          if (!content) return ;

          // 添加一些交互辅助字段
          content.forEach((item:any, index:number) => {
            item.collspaned = true; // 控制展开收起
            item.isShowColspan = false; // 是否展示展开按钮
            item.isShowReplay = false; // 是否展示回复弹窗
            item.reComment = ''; // 回复的内容，默认给空
            item.isShowDelBtn = super.getDelBtnPermission(item) // 是否展示删除按钮
            item.page = -1; // 回复默认分页，默认页码为-1
            item.replySize = this.calcReplyCounts(item);

            if (item.replys) { // 回复的评论，同理
              item.replys.forEach((replyItem:any) => {
                replyItem.collspaned = true; // 控制展开收起
                replyItem.isShowColspan = false; // 是否展示展开按钮
                replyItem.isShowReplay = false; // 是否展示回复弹窗
                replyItem.reComment = ''; // 回复的内容，默认给空
                replyItem.isShowDelBtn = super.getDelBtnPermission(replyItem) // 是否展示删除按钮
              });
            }
          })

          if (type === 'init') {
            this.commentList = content;
          } else {
            this.commentList = this.commentList.concat(content);
          }

          if (content.length <= 0 || this.commentList.length === res.data.totalElements) {
            this.isListload = false;
          }
          // 计算是否需要
          this.$nextTick(() => {
            this.commentList.forEach((item:any) => {
              this.setCollspan(item);

              if (item.replys) {
                item.replys.forEach((replayItem:any) => {
                  this.setCollspan(replayItem);
                })
              }
            });
            this.callBackHandler = this.setCollspan;
          })
          this.isShowLoading = false;

          this.isLoaded = true;

        }
      })
      .catch((errMsg:any) => {
        this.isShowLoading = false;
        console.log(this.isShowLoading)
        // console.error(errMsg);
      })
  }

  initLazyLoad(){
    const commentWrap:HTMLDivElement = this.$refs.commentWrap as HTMLDivElement;
    const wrapHeight:number = commentWrap.clientHeight as number;
    commentWrap.addEventListener('scroll', () => {
      const docHeight:number = (this.$refs.commentListWrap as HTMLDivElement).clientHeight as number;
      const scrollTop:number =  commentWrap.scrollTop as number;

      if (docHeight - (wrapHeight + scrollTop) <= 0) {
        if (this.isListload) {
          this.isShowLoading = true;
          this.listPage += 1;
          this.getCommList();
        }
      }
    });
  }

  /**
   * 发送
   * */
  send(item:any, type?:any){
    if (type === 'comment') {
      const { fileLists } = this;
      if (fileLists.length > 8) {
        (this as any).$message.error(`${this.$t('cloudpivot.formComment.pc.imageTips1')}`);
        return false;
      }
    }

    this.listPage = 0;
    super.sendBase(item, item.reComment ,type)
          .then((res:any) => {
            if (res.errcode === 0) {
              if (type === 'comment') {
                this.comment = '';
                this.fileList = [];
                this.fileLists = [];
                this.alreadyFiles = 0;
              } else {
                item.reComment = null;;
                item.isShowReplay = false;
              }
              this.listPage = 0;
              this.getCommList('init');
              this.getCommListNum();
            }
          })
          .catch((errMsg:any) => {
            console.error(errMsg)
          })
  }

  /**
   * 文件上传
   * */
  handleChange(info:any, fileList:any) {
    if (info.file.status !== 'uploading') {
    }
    if (info.file.status === 'done') { // 文件上传成功
      const { response } = info.file;
      if (response.errcode === 0) {
        const index:number = this.fileLists.findIndex((item:any) => item.name === response.data.name) as number;
        this.fileLists.splice(index, 1, response.data);
        // this.fileList.splice(index, 1, response.data);
        // this.fileLists.push(response.data);
      }
      // (this as any).$message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      this.deleteErrorFile(info.file.name);
      (this as any).$message.error(`${info.file.name} ${this.$t('cloudpivot.formComment.pc.uploadFail')}`);
    } else if (info.file.status === 'removed'){
      const index:number = this.fileList.findIndex((item:any) => item.name === info.file.name) as number;
      this.fileList.splice(index, 1);
      this.fileLists.splice(index, 1);
    }
  }

  deleteFile(index:number){
    this.fileLists.splice(index, 1);
    this.fileList.splice(index, 1);
    this.alreadyFiles -= 1;
  }

  deleteErrorFile(name:string) {
    // 移除掉不合法的文件
    const idx:number = this.fileLists.findIndex((item:any) => item.name === name);
    if (idx > -1) {
      this.fileLists.splice(idx, 1)
      this.fileList.splice(idx, 1)
    }
  }

  alreadyFiles:number = 0;
  beforeUpload(file:any, fileList:any){
    const item:any = this.fileLists.find((item:any) => item.name ===file.name );
    if (!item) {
      this.fileLists.push({ name: file.name });
      this.fileList.push(file);
    }
    if (!super.checkFilesNum(fileList)) {
      (this as any).$message.error(`${this.$t('cloudpivot.formComment.pc.imageTips1')}`);
      this.deleteErrorFile(file.name);
      return false;
    }

    if (this.fileLists.length > 8) {
      (this as any).$message.error(`${this.$t('cloudpivot.formComment.pc.imageTips1')}`);
      this.deleteErrorFile(file.name);
      return false;
    }

    if (!super.checkFileType(file)) {
      const ext:string = super.getExt(file.name);
      (this as any).$message.error(`${this.$t('cloudpivot.formComment.pc.imageTips2', {text: ext })}`);
      this.deleteErrorFile(file.name);
      return false;
    }

    if (!super.checkFileSize(file)) {
      const { name } = file;
      (this as any).$message.error(`【${name}】${this.$t('cloudpivot.formComment.pc.moreThan')}`);
      this.deleteErrorFile(name);
      return false;
    }

    // if (this.alreadyFiles >= 8 ) {
    //   this.alreadyFiles = 8;
    // }
    // if (fileList.length > 8 ) {
    //   (this as any).$message.error('最多可上传8个文件/图片');
    //   return false;
    // } else {
    //   if (this.alreadyFiles > 8) {
    //     (this as any).$message.error('最多可上传8个文件/图片');
    //     return false;
    //   }
    //   const { size } = file;
    //   if (size > this.singleFileSize) {
    //     (this as any).$message.error(`【${file.name}】大小超过5M`);
    //     return false;
    //   }
    // }

    return true;
  }


  onClickReply(item:any){
    this.replayPlaceholder = item.commentatorName || '';
    this.replayObj = item;
    item.isShowReplay = true;
    this.members = this.defaultMembers;
  }

  closeRelay(item){
    item.isShowReplay = false;
    this.reComment = '';
  }

  replay(item:any){
    this.send(item);
  }

  deleteComm(id: string){
    const vm = this as any;
    vm.$confirm({
      title: `${this.$t('cloudpivot.formComment.pc.sureDeleteComment')}`,
      okText: `${this.$t('cloudpivot.formComment.pc.sure')}`,
      cancelText: `${this.$t('cloudpivot.formComment.pc.cancel')}`,
      onOk() {
        vm.handleDeleteComm(id);
      },
    })
  }

  async handleDeleteComm(id:string){
    super.handleDeleteCommBase(id)
          .then((res:any) => {
            if (res.errcode === 0) {
              (this as any).$message.success(`${this.$t('cloudpivot.formComment.pc.deleteCommentSuccess')}`);
              setTimeout(() => {
                this.listPage = 0;
                this.getCommList('init');
                this.getCommListNum();
              }, 500);
            }
          })
          .catch((errMsg:any) => {
            (this as any).$message.error(errMsg);
          })
  }

  /**
   * 预览图
   * */
  preview(item:any){
    const src:string = super.getDownloadUrl(item) as string;
    this.isShowPreview = true;
    this.presrc = src;
  }

  handleCancel(){
    this.isShowPreview = false;
    this.presrc = '';
  }

  downloadFile(item:any){
    const src:string = super.getDownloadUrl(item) as string;
    window.open(src);
  }


  mounted () {
    if (!this.formObj || Object.keys(this.formObj).length <= 0) return ;
    this.getCommList();
    this.getCommListNum();
    this.getAtUsers();

  }

  setCollspan(item) {
    const selector:string = `#cc-${item.id}`;
    const heightStandard:number = 65; // 判断是否需要折叠得标准高度
    const height:number = (document.querySelector(selector) as any).getBoundingClientRect().height;
    if (height > heightStandard) {
      item.collspaned = true;
      item.isShowColspan = true;
    } else {
      item.collspaned = false;
      item.isShowColspan = false;
    }
  }

  @Watch('collspanForPc', { immediate: true })
  collspanChange(val:any) {
     // 计算是否需要
     if (val) {
      this.commentList.forEach((item:any) => {
        this.setCollspan(item);

        if (item.replys) {
          item.replys.forEach((replayItem:any) => {
            this.setCollspan(replayItem);
          })
        }
      });

      this.$nextTick(() => {
        this.initLazyLoad();
      })
    }
  }

  // @Watch('formObj')
  // onFormObjChange(v:any) {
  //   if (v) {
  //     if (Object.keys(v).length <= 0) return ;
  //     this.getCommList();
  //     this.getCommListNum();
  //     this.getAtUsers();
  //   }
  // }
}
