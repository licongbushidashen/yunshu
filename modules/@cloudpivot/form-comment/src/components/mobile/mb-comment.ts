import { Vue, Component, Prop, Watch } from "vue-property-decorator";

import { renderer } from '@cloudpivot/form';

import common from '@cloudpivot/common';

import mobile from '@cloudpivot/form/src/renderer/components/mobile';

import * as FormCommentIns from '@cloudpivot/api'

import FormCommentBase from '../common-base';

import UploadHelper from '../helper';

import * as platform from '@cloudpivot/platform';

import {H3Upload} from 'h3-mobile-vue';

import At from '../share/mobile/vue-at/at.vue';

import UserPicker from './user-picker.vue';

import dd from 'dingtalk-jsapi';

import * as Back from '../../../../../../entries/mobile/src/config/back';


@Component({
  name: "mb-form-detail",
  components: {
    At,
    H3Upload,
    UserPicker,
    H3Scroll: mobile.H3Scroll,
  },
  directives: {
    ControlBack : common.directives.controlBack,
    TransferDom: common.directives.transferDom
  }
})

export default class FormComment extends FormCommentBase{

  isShowCommentPanel:boolean = false; // 是否展示评论模块
 
  loading:boolean = true; // 是否加载完成

  replayComment:any = ''; // 回复的内容

  isShowReplayBox:boolean = false; // 是否展示回复模块

  maxHeight:string = '0px';

  alreadyFiles:number = 0;

  atClickTrigger:boolean = false;

  isShowUserPicker:boolean = false;

  isReplayMode:boolean = false;

  firstLoad:boolean = true;

  isInit:boolean = true;

  get $confirm() {
    return ((opts: {
      title: string;
      content: string;
      onOk?: () => void;
      onCancel?: () => void;
    }) => {
      this.$h3.modal.show({
        type: "alert",
        title: opts.title,
        content: opts.content,
        actions: [
          {
            text: this.$t("cloudpivot.form.renderer.cancel").toString(),
            onPress() {
              if (opts.onCancel) {
                opts.onCancel();
              }
            }
          },
          {
            text: this.$t("cloudpivot.form.renderer.ok").toString(),
            onPress() {
              if (opts.onOk) {
                opts.onOk();
              }
            }
          }
        ]
      });
    }) as any;
  }

  get $messager() {
    const { $message } = this as any;
    const vm:any = this as any;
    if ($message) { // pc端
      return $message;
    } else { // mobile端
      return {
        success(text:string){
          vm.$h3.toast.show({
            text,
            autoHide: true,
            iconType: "check",
            duration: 1000
          });
        },
        error(text:string){
          vm.$h3.toast.show({
            text,
            autoHide: true,
            iconType: "close",
            duration: 1000
          });
        },
        lading(text?:string){
          vm.$h3.toast.show({
            text,
            autoHide: false,
            iconType: "loading"
          })
        },

      }
    }
  }

  getHtmlLen(html){
    html = this.filterHtml(html)
    let oDiv = document.createElement('div');
    html = html.replace(/amp;/g, '');
    oDiv.innerHTML = html.replace(/[\%\^\&\*\(\$]/g, '文');
    return oDiv.innerText.length;
  }

  get atWordsCount() {
    return this.getHtmlLen(this.comment);
  }

  get atWordsCountReplay(){
    let oDiv = document.createElement('div');
    oDiv.innerHTML = this.replayComment;
    return oDiv.innerText.length
  }

  embeddedItemTemplate(item:any){
    return `<span data-at-embedded contenteditable="false" dataValue="${item.id}">@${item.name}</span>`
  }

  get locale() {
    return this.$i18n.locale || "zh";
  }

  uploadError(err:any) {
    if (!err) {
      return
    }
    let msg = '';
    switch(err) {
      
      // case 'overQuantity':
      //   this.showError(`一次最多允许上传张`);
      //   break;
      // case 'uploadError':
      //   this.showError(`文件错误`);
      //   break;
      // case 'overSize':
      //   msg = this.$t(
      //     "cloudpivot.form.renderer.tip.overSize",
      //     {
      //       label: this.limitSize
      //     }
      //   ).toString();
      //   this.showError(msg);
      //   break;
      default:
        msg = this.$t(
          "cloudpivot.form.renderer.tip.uploadError"
        ).toString();
        this.$messager.error(msg)
        // this.showError(msg);
        // this.showError('上传失败请重试');
        break;  
    }
  }

  showCommentPanel(){
    platform.service.setTitle(`${ this.$t('cloudpivot.formComment.mobile.writeComment') }`);
    this.isShowCommentPanel = true;

    this.isReplayMode = false;

    Back.subscribeBack({
      callback: () => {
        this.isShowCommentPanel = false;
      }
    })
  }

  show(){
    this.isShowUserPicker = true;
  }

  close(){
    this.isShowUserPicker = false;
  }
  

  onAtwhoViewBlur (index?:number) {
    setTimeout(() => {
      if (typeof index === 'number') {
        if(!this.$refs[`atPane${index}`]) return;
        (this.$refs[`atPane${index}`] as any).onAtwhoViewBlur();
      } else {
        if (!this.$refs.atPane) return;
        (this.$refs.atPane as any).onAtwhoViewBlur();
      }
    }, 300);
  }

  /**
   * 附件预览
   * */ 
  handlePreview(file: any) {
    if (file.response) {
      const ext =  UploadHelper.getExt(file.name);
      if (UploadHelper.testIamge(ext)) {
        return;
      }

      if (UploadHelper.testDocument(ext)) {
        UploadHelper.download(file.response.data);
      } else {
        const msg = this.$t(
          "文件类型不支持，请在PC查看"
        ).toString();
        this.$messager.error(msg);
      }
    }
  }

  preview(item:any){
    const ext =  UploadHelper.getExt(item.name);
    // if (!UploadHelper.testIamge(ext)) {
    //   const msg = this.$t(
    //     "文件类型不支持预览"
    //   ).toString();
    //   this.$messager.error(msg);
    //   return;
    // } 

    if (UploadHelper.testDocument(ext)) {
      UploadHelper.download(item);
      return ;
    }

    const url = super.getAttachmentUrl(item);
    if (platform.IS_DINGTALK) {      
      dd.biz.util.previewImage({
        urls: [url],//图片地址列表
        current: url,//当前显示的图片链接
      })
    }
  }


  inputAt( ev:any ) {
    const { isReplayMode } = this;
    if (!isReplayMode) {
      (this.$refs.atwhoEditWrap as any).blur();
    } else {
      (this.$refs.replayAtwhoEditWrap as any).blur();
    }
    
    if( ev ){
      //说明用户进入的是通过键盘触发@按钮
      this.atClickTrigger = true;
      this.isShowUserPicker = true;

      Back.subscribeBack({
        callback: () => {
          this.isShowUserPicker = false;
        }
      })
    }
  }

  // 实时搜索
  // 当最后输入的字符是@的时候
  // 调用接口查找列表
  /**
   * @desc 先于当前列表中搜索，有则过滤，无则加载
   * @params index 第几个
   * */ 
  handleInput(index?:any){
    let atwhoEditWrap:any;
    let atPane:any;

    if (typeof index === 'number') {
      atwhoEditWrap = (this.$refs[`atwhoEditWrap${index}`] as any);
      atPane = (this.$refs[`atPane${index}`] as any);
    } else {
      atwhoEditWrap = (this.$refs.atwhoEditWrap as any);
      atPane = (this.$refs.atPane as any);
    }
    super.handleInputBase(atwhoEditWrap, atPane)
  }

  // 选中人员
  onSelectUser(){
    // this.members = this.defaultMembers;
  }



  mounted(){
    // this.init();
  }

  // 关闭弹窗逻辑
  closeLogic(){
    if (this.isShowUserPicker) {
      this.isShowUserPicker = false;
      return ;
    } 

    if (this.commentList.length > 0) { // 有评论
      if (this.isShowCommentPanel) {
        this.isShowCommentPanel = false;
      } else {
        this.$emit('close', true)  
      }
    } else { // 没有评论
      this.$emit('close', true)
    } 
  }

  // type 为空 初次加载
  init(type?:string){
    Promise.all([this.getCommList(), this.getCommListNum()])
          .then(() => {
            // 设置钉钉title
            if (this.isShowCommentPanel) { // 评论面板
              platform.service.setTitle(`${ this.$t('cloudpivot.formComment.mobile.writeComment') }`);
            } else { // 评论列表面板
              platform.service.setTitle(`${ this.$t('cloudpivot.formComment.mobile.comment') }（${this.num}）`);
            }

            this.firstLoad = false;
          })
  }


  /**
   * 获取评论列表
   * */ 
  
  async loadMoreS(pager: any, done: any){
    this.listPage = pager.num - 1;

    if (this.listPage === 0) {
      // this.commentList = [];
      this.isInit = true;
      this.loading = true;
    }

    await super.getCommListBase()
    .then((res:any) => {
      if (done) {
        done(this.pageSize, res.data.totalElements);
      }

      if ( res.errcode === 0 ) {
        this.loading = false;
        (this as any).$h3.toast.hide();

        const { content } = res.data;
        
        if (!content) return ;
  
        // 添加一些交互辅助字段
        content.forEach((item:any, index:number) => {
          item.collspaned = true; // 控制展开收起
          item.isShowColspan = false; // 是否展示展开按钮
          item.isShowDelBtn = super.getDelBtnPermission(item) // 是否展示删除按钮
          item.page = -1; // 回复默认分页，默认页码为-1
          item.replySize = this.calcReplyCounts(item);
          if (item.replys) { // 回复的评论，同理
            item.replys.forEach((replyItem:any) => {
              replyItem.collspaned = true; // 控制展开收起
              replyItem.isShowColspan = false; // 是否展示展开按钮
              replyItem.isShowDelBtn = super.getDelBtnPermission(replyItem) // 是否展示删除按钮
            });
          }
        })
        
        if (this.isInit) {
          this.commentList = content;
          this.isInit = false;
        } else {
          this.commentList = this.commentList.concat(content);
        }
  
        // 移动端根据评论判断是否显示评论列表
        this.isShowCommentPanel = this.commentList.length <= 0;
  
        // 计算是否需要
        this.$nextTick(() => {
          function setCollspan(item){
            const selector:string = `#cc-${item.id}`;
            const heightStandardRem:number = 1.3; // 判断是否需要折叠得标准高度 1.3 rem
            const remStandard:number = parseFloat((document as any).querySelector('html').style.fontSize.replace('px', '')) as number;
            const heightRem:number = ((document as any).querySelector(selector) as any).getBoundingClientRect().height / remStandard;
            if (heightRem > heightStandardRem) {
              item.collspaned = true;
              item.isShowColspan = true;
            } else {
              item.collspaned = false;
              item.isShowColspan = false;
            }
          }
          this.callBackHandler = setCollspan;
          this.commentList.forEach((item:any) => {
            setCollspan(item);
  
            if (item.replys) {
              item.replys.forEach((replayItem:any) => {
                setCollspan(replayItem);
              })
            }
          });
        })
  
        if (this.commentList.length <= 0) return;
        this.$nextTick(() => {
          const doc = document as any;
          const bodyH:number = doc.querySelector('body').clientHeight 
          const btnH:number = doc.querySelector('#submitBtn').clientHeight;
          const maxHeight:any = `${btnH}px`;
          (document.querySelector('.mescroll') as any).style.bottom = maxHeight;

        })

        // 设置title
        this.getCommListNum().then(() => {
          if (this.isShowCommentPanel) { // 评论面板
            platform.service.setTitle(`${ this.$t('cloudpivot.formComment.mobile.writeComment') }`);
          } else { // 评论列表面板
            platform.service.setTitle(`${ this.$t('cloudpivot.formComment.mobile.comment') }（${this.num}）`);
          }
        })
      }
    })
    .catch((errMsg:any) => {
      console.error(errMsg);
    })

  }

  async getCommList(){
    this.loading = true; 
    (this as any).$h3.toast.show({
      text: '',
      autoHide: false,
      iconType: "loading"
    })
    await super.getCommListBase()
          .then((res:any) => {
            if ( res.errcode === 0 ) {
              this.loading = false;
              (this as any).$h3.toast.hide();

              const { content } = res.data;
              
              if (!content) return ;
        
              // 添加一些交互辅助字段
              content.forEach((item:any, index:number) => {
                item.collspaned = true; // 控制展开收起
                item.isShowColspan = false; // 是否展示展开按钮
                item.isShowDelBtn = super.getDelBtnPermission(item) // 是否展示删除按钮
                if (item.replys) { // 回复的评论，同理
                  item.replys.forEach((replyItem:any) => {
                    replyItem.collspaned = true; // 控制展开收起
                    replyItem.isShowColspan = false; // 是否展示展开按钮
                    replyItem.isShowDelBtn = super.getDelBtnPermission(replyItem) // 是否展示删除按钮
                  });
                }
              })
        
              this.commentList = this.commentList.concat(content);
        
              // 移动端根据评论判断是否显示评论列表
              this.isShowCommentPanel = this.commentList.length <= 0;
        
              // 计算是否需要
              this.$nextTick(() => {
                function setCollspan(item){
                  const selector:string = `#cc-${item.id}`;
                  const heightStandardRem:number = 1.3; // 判断是否需要折叠得标准高度 1.3 rem
                  const remStandard:number = parseFloat((document as any).querySelector('html').style.fontSize.replace('px', '')) as number;
                  const heightRem:number = ((document as any).querySelector(selector) as any).getBoundingClientRect().height / remStandard;
                  if (heightRem > heightStandardRem) {
                    item.collspaned = true;
                    item.isShowColspan = true;
                  } else {
                    item.collspaned = false;
                    item.isShowColspan = false;
                  }
                }
                this.commentList.forEach((item:any) => {
                  setCollspan(item);
        
                  if (item.replys) {
                    item.replys.forEach((replayItem:any) => {
                      setCollspan(replayItem);
                    })
                  }
                });
              })
        
              if (this.commentList.length <= 0) return;
              this.$nextTick(() => {
                const doc = document as any;
                const bodyH:number = doc.querySelector('body').clientHeight 
                const btnH:number = doc.querySelector('#submitBtn').clientHeight;
                const maxHeight:any = `${btnH}px`;
                (document.querySelector('.mescroll') as any).style.bottom = maxHeight;

              })

              // 设置title
              
            }
          })
          .catch((errMsg:any) => {
            console.error(errMsg);
          })
  }


  /**
   * 移动端upload file change
   * */ 
  isUploaded:boolean = false;
  uploadedStatus:any = [];
  onChange(info:any){
    const { status, response } = info.value;
    // status 1 准备上传 2 已上传 3上传失败 -1正在上传
    if (status === 2) {
      this.fileLists.push(response.data);
      this.uploadedStatus.push(info.value); 
      this.isUploaded = this.alreadyFiles === this.uploadedStatus.length;
      return ;
    } 

    if (status === 3) {
      this.$messager.error(`${ this.$t('cloudpivot.formComment.mobile.uploadFail') }`);
      return ;
    }
  }


  beforeUploadMobile(files:any) {
    if (!super.checkFilesNum(files)) {
      (this as any).$messager.error(`${ this.$t('cloudpivot.formComment.mobile.imageTips1') }`);
      return false;
    }

    if (this.fileLists.length >= 8) {
      (this as any).$messager.error(`${ this.$t('cloudpivot.formComment.mobile.imageTips1') }`);
      return false;
    } 

    const fileList = Array.from(files);

    // 检查类型
    const isAllTypeOk:any = fileList.every((file:any) => super.checkFileType(file));
    const notAllowExt:any = fileList
                            .map((file:any) => {
                              const ext:string = super.getExt(file.name)
                              if (!this.accept.includes(ext)) {
                                return ext;
                              }
                            }).filter((item:any) => !!item);
    if (!isAllTypeOk) {
      (this as any).$messager.error(`${this.$t('cloudpivot.formComment.mobile.imageTips2', {text: notAllowExt.join(',')})}`);
      return false;
    }

    // 检查大小
    const isAllSizeOk = fileList.every((file:any) => super.checkFileSize(file));
    const oversizeFiles = fileList
                          .map((file:any) => {
                            const isSizeOk:boolean = super.checkFileSize(file) as boolean;
                            if (!isSizeOk) {
                              return file.name;
                            }
                          }).filter((item:any) => !!item);                
    if (!isAllSizeOk) {
      (this as any).$messager.error(`${ this.$t('cloudpivot.formComment.mobile.moreThan') }`);
      return false;
    }

    return true;
  }

  onRemovedImg(file:any){
    const { response } = file;
    const refId:string = response.data.refId;
    const index:number = this.fileLists.findIndex((item:any) => item.refId === refId);

    this.fileLists.splice(index, 1);
  }

  /**
   * @prams replayCommentId 被回复评论的id
   * */ 
  async send(item:any, type?:string){ 
    if (type === 'comment') {
      if (this.alreadyFiles > 0) {
        if (!this.isUploaded) {
          return ;
        }
      }
      const { comment, fileLists } = this;
      
      if (super.getInnerHtmlLen(comment)<=0 && fileLists.length <= 0) {
        this.$messager.error(`${ this.$t('cloudpivot.formComment.mobile.contentNoEmpty') }`);
        return ;
      } 
    } else {
      if (super.getInnerHtmlLen(this.replayComment)<=0) {
        this.$messager.error(`${ this.$t('cloudpivot.formComment.mobile.replyNoEmpty') }`);
        return ;
      }
    }

    this.isInit = true;
    super.sendBase(item, this.replayComment ,type)
          .then((res:any) => {
            if (res.errcode === 0) {
              if (type === 'comment') {
                this.comment = '';
                this.fileLists = [];
                this.alreadyFiles = 0;
              } else {
                item.reComment = '';;
                item.isShowReplay = false;
              }
        
              this.closeRelay();
              this.loadMoreS({ num: 1 }, null)
            }
          })
          .catch((errMsg:any) => {
            console.error(errMsg);
          });
  }

  onClickReply(item:any){
    this.replayPlaceholder = item.commentatorName || '';
    this.replayObj = item;
    this.isShowReplayBox = true;
    this.members = this.defaultMembers;
    this.isReplayMode = true;
  }

  closeRelay(){
    this.isShowReplayBox = false;
    this.replayComment = '';
  } 

  replay(){
    this.send(this.replayObj, 'replay');
  }

  deleteComm(id: string){
    const vm = this as any;
    vm.$confirm({
      title: `${ this.$t('cloudpivot.formComment.mobile.sureDeleteComment') }`,
      onOk() {
        vm.handleDeleteComm(id);
      },
    })
  }

  async handleDeleteComm(id:string){
    this.isInit = true;
    super.handleDeleteCommBase(id)
          .then((res:any) => {
            if (res.errcode === 0) {
              (this as any).$messager.success(`${ this.$t('cloudpivot.formComment.mobile.deleteCommentSuccess') }`);
              setTimeout(() => {
                // this.getCommList();
                this.loadMoreS({ num: 1 }, null)
                this.getCommListNum();
              }, 500);
            }
          })
          .catch((errMsg:any) => {
            (this as any).$messager.error(`${ this.$t('cloudpivot.formComment.mobile.deleteCommentFailed') }`);
          })
  }

  /**
   * 选人确定
   * data 为所选人的数据
   * */ 
  ok(data:any){
    this.isShowUserPicker = false;
    if (!data.length)  return;

    // 判断是回复框还是评论框
    const { isReplayMode } = this;

    // 删除最后一个@字符
    // if (!isReplayMode) {
    //   const atIndex:string = this.comment.lastIndexOf('@');
    //   this.comment = this.comment.substring(0, atIndex);
    // } else {
    //   const atIndex:string = this.replayComment.lastIndexOf('@');
    //   this.replayComment = this.replayComment.substring(0, atIndex);
    // }

    if(this.atClickTrigger){
      if (!isReplayMode) {
        let comp:any = this.$refs.comment as any;
        data.forEach((d:any) => {
          comp.insertItem(d)
          // tem += `${this.embeddedItemTemplate(d)}`; // 不能使用 &nbsp;  否则删除的时候 光标会错乱
        })

        this.$nextTick(() => {
          (this.$refs.comment as any).setFocus();
        // (this.$refs.atwhoEditWrap as any).focus();
        });
      } else {
        data.forEach((d:any) => {
          this.replayComment = this.replayComment + `${this.embeddedItemTemplate(d)} `;
        })
      }
    }
    this.atClickTrigger = false;
  }

  closeUP(){
    this.isShowUserPicker = false;
  }

  doFocus(){
    // (this.$refs.comment as any).setFocus();
  }

  @Watch('replayComment')
  replayCommentChange(v){
    if (v.length > this.maxlength) {
      this.replayComment = this.replayComment.substr(0, this.maxlength);
      (this.$refs.replayAtwhoEditWrap as any).innerHTML = this.replayComment;
      this.$nextTick(() => {
        (this.$refs.replayComment as any).setFocus();
      })
    }
  }

  @Watch('comment')
  commentChange(v){
    if (v) {
      // console.log(v);
      // if (this.atWordsCount > this.maxlength) {
      //   this.comment = this.comment.substr(0, this.maxlength);
      //   (this.$refs.atwhoEditWrap as any).innerHTML = this.comment;
      //   this.$nextTick(() => {
      //     (this.$refs.comment as any).setFocus();
      //   })
      // }
    }
  }
} 