import { Vue, Prop, Watch } from "vue-property-decorator";

import * as FormCommentIns from '@cloudpivot/api'

import { renderer } from '@cloudpivot/form';

export default class FormCommentBase extends Vue {
  comment:any = '';

  commentList:Array<any> = [];

  wordsLen:number = 0;

  fileLists:any = [];

  num:number = 0; // 评论数

  maxlength:number = 2000; // 最大字节数

  singleFileSize:number = 5242880; // 5M

  members:any = []; // 可@人员列表

  defaultMembers:any = []; // 缓存一份默认数据

  page:number = 0;

  pageSize:number = 15;

  listPage:number = 0;

  searchDataCache:any = []; // 实时搜索的数据

  keyword:string = ''; // 搜索人员姓名

  isLazyload:boolean = true; // 是否可以懒加载

  loading:boolean = true; // 是否加载完成

  replayObj:any = ''; // 回复某人 obj

  replayPlaceholder:string = ''; // 回复某人占位符
  
  image_types:string[] = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".tif"];

  doc_types:string[] = [".docx", ".xlsx", ".pptx", ".doc", ".xls", ".ppt", ".wpt", ".dot", ".rtf", ".txt", ".xml", ".pdf"];

  isBlock:boolean = false;

  userInfo:any = {};

  maxFilesNum:number = 8;

  isListload:boolean = true;

  isShowLoading:boolean = false; // 触底加载更多

  isLoaded: boolean = true;

  replyPageSize:number = 10; // 更多回复列表分页

  callBackHandler:Function = () => { }; // 回调处理函数

  @Prop() formObj !:any; // load方法提供的数据，用以获取后端接口需要的参数

  @Prop() collspanForPc?:any; // pc端表单评论面板展开隐藏

  get headers() {
    return {
      Authorization: `Bearer ${window.localStorage.getItem('token')}`
    }
  }

  get uploadUrl(){
    return renderer.UploadControl.service.getUploadUrl();
  }

  get bizObjectId(){
    return this.formObj.bizObject ? this.formObj.bizObject.id : '';
  }

  get schemaCode(){
    return this.formObj.bizObject ? this.formObj.bizObject.schemaCode : '';
  }

  get workflowInstanceId(){
    return this.formObj.bizObject ? this.formObj.bizObject.workflowInstanceId : '';
  }

  get accept(){
    const { image_types, doc_types } = this;
    return  image_types.concat(doc_types).join(',')
  }

  /**
   * 获取用户信息
   * */ 
  async getUserInfo(){
    const res:any = await FormCommentIns.FormCommentApi.getUserInfo();
    if (res.errcode === 0) {
      this.userInfo = res.data;
    } else {
      console.error(res.errmsg);
    }
  }

  getDelBtnPermission(item:any){
    const { userInfo } = this;
    const { permissions } = userInfo;
    const isAppAdmin:boolean =  permissions.includes('APP_MNG');
    const isSysAdmin:boolean =  permissions.includes('SYS_MNG');
    const isDtaAdmin:boolean =  permissions.includes('DATA_MNG');
    const isRootAdmin:boolean = permissions.includes('ADMIN');
    const isAdmin:boolean = isAppAdmin || isSysAdmin || isRootAdmin || isDtaAdmin;
    const isSelf = item.commentator === userInfo.id;

    return isAdmin || isSelf;
  }

  /**
   * 将b转化成mb
   * */ 
  conver(limit:any){  
    let size = "";  
    if( limit < 0.1 * 1024 ){ //如果小于0.1KB转化成B  
        size = limit.toFixed(2) + "B";    
    }else if(limit < 0.1 * 1024 * 1024 ){//如果小于0.1MB转化成KB  
        size = (limit / 1024).toFixed(2) + "KB";              
    }else if(limit < 0.1 * 1024 * 1024 * 1024){ //如果小于0.1GB转化成MB  
        size = (limit / (1024 * 1024)).toFixed(2) + "MB";  
    }else{ //其他转化成GB  
        size = (limit / (1024 * 1024 * 1024)).toFixed(2) + "GB";  
    }  
      
    const sizestr = size + "";   
    const len = sizestr.indexOf("\.");  
    const dec = sizestr.substr(len + 1, 2);  
    if(dec == "00"){//当小数点后为00时 去掉小数部分  
        return sizestr.substring(0,len) + sizestr.substr(len + 3,2);  
    }  
    return sizestr;  
  } 
  

  getAttachmentUrl(item:any){
    return renderer.UploadControl.service.getDownloadUrl(item)
  }

  /**
   * 去除字符串中的html标签及内容
   * */ 
  filterHtmlOrContainer(str:any,isbool:boolean = false) {
    const reg =  new RegExp('<[^>]+>','gi');  //过滤所有的html标签，不包括内容

    const reg2 = new RegExp('<(img|br|hr|input)[^>]*>','gi');  //只匹配img、br、hr、input标签

    const reg3 = new RegExp('<(\\S*)[^>]*>[^<]*<\\/(\\1)>','gi');  //分组匹配，过滤所有的html标签，包括内容
    if(typeof str !='string'){  //不是字符串
        return str;
    }
    var result = str;
    if(!isbool){  //先把单标签过滤了
        result = result.replace(reg2, '');
    }
    result = result.replace(reg3,'');    //先经过分组匹配，把双标签去除，如果是嵌套标签，则会先将嵌套标签内的双标签过滤掉
    if(reg3.test(result)) { //如果为true，则代表还有标签
        return this.filterHtmlOrContainer(result, true);
    }else {
        return result;
    }
  }

  /*
  * 将所有的标签过滤，不过滤标签内内容
  * */
  filterHtml(str:any){
    const reg =  new RegExp('<[^>]+>','gi');  //过滤所有的html标签，不包括内容
    if(typeof str !='string'){  //不是字符串
        return str;
    }

    return str.replace(reg,'');
  }

  /**
   * @desc 实时搜索 当最后输入的字符是 @ 的时候, 调用接口查找列表
   * @desc 先于当前列表中搜索，有则过滤，无则加载
   * @params atwhoEditWrap获取内部html
   * */ 
  handleInputBase(atwhoEditWrap:any, atPane:any){
    if (!atwhoEditWrap || !atPane) return ; 

    const htmlString:any = atwhoEditWrap.innerHTML;

    if (!htmlString) return ; 

    const strWithoutHtmlTag = this.filterHtmlOrContainer(htmlString, false);

    if (strWithoutHtmlTag.indexOf('@') <= -1) return ; // 没有输入@ 
    
    this.isLazyload = true; // 每次输入@  都允许懒加载
    this.keyword = ''; // 每次输入@  重置关键词
    this.page = 0; // // 每次输入@  重置页码

    const strAfterAt:string = strWithoutHtmlTag.substr(strWithoutHtmlTag.lastIndexOf('@')).split('@')[1].trim();
    
    if (!strAfterAt) {
      if (this.searchDataCache.length <= 0) {
        this.members = this.defaultMembers;
      }
      return;
    }

    // console.log('搜索条件是：',strAfterAt);
    
    // 先在当前列表搜索, 存在即添加
    // todo: 同名但是不在当前页如何处理
    const filteredM:Array<any> = this.members.filter((m:any) => {
      return m.name.indexOf(strAfterAt) > -1;
    });

    new Promise( async (resolve:any, reject:any) => {
      const res = await this.getAtUsers(strAfterAt);
      if (!res || !res.length) {
        atPane.closePanel();
      }
      resolve();
      
      // 需要实时搜索，故移除本段逻辑
      // if (filteredM.length > 0) {
      //   this.members = filteredM;
      //   resolve();
      // } else { // 调取接口获取
      //   await this.getAtUsers(strAfterAt);
      //   resolve();
      // }
    }).then((res:any) => {
      this.$nextTick(() => {
        atPane.handleInput();        
      });
    })
  }

  // 选中人员
  onSelectUser(){
    // this.members = this.defaultMembers;
  }

  /**
   * @desc 获取可 @ 人员
   * */
  async getAtUsers(username?:string){
    if (username) this.keyword =  username;
    const { bizObjectId, schemaCode, workflowInstanceId, page, pageSize } = this;
    
    if (!bizObjectId || !schemaCode) return; 

    const params: FormCommentIns.formCommentParams.GetAtUser = {
      bizObjectId,
      schemaCode,
      keyword: username ? username : '' ,
      wfInstanceId: workflowInstanceId,
      page,
      pageSize
    }

    const res:any = await FormCommentIns.FormCommentApi.getAtUsers(params);

    if (res.errcode === 0) {
      const { data } = res;
      if (!username) { // 说明加载的是默认数据， 保存一份
        this.defaultMembers = JSON.parse(JSON.stringify(data.content));
      } else {
        if (data.content.length > 0) { // 当搜索无结果的时候，把默认数据赋值回去
          this.members = JSON.parse(JSON.stringify(data.content));
        } else {
          this.searchDataCache = JSON.parse(JSON.stringify(data.content));
          this.members = JSON.parse(JSON.stringify(data.content));
        }
      }
      return data.content;
      // this.members = JSON.parse(JSON.stringify(data.content));
    } else {
      console.error(res.errmsg);
    }
  }

  /**
   * @desc 获取评论列表
   * */ 
  async getCommListBase(){
    // 先获取用户信息
    await this.getUserInfo();

    const { formObj, listPage, pageSize } = this;
    if (!formObj || !formObj.bizObject) return;
    const params:FormCommentIns.formCommentParams.CommentList = {
      bizObjectId: formObj.bizObject.id as string,
      schemaCode: formObj.bizObject.schemaCode as string,
      page:listPage,
      pageSize
    } 
    const res:any = await FormCommentIns.FormCommentApi.getCommentList(params);

    const p:any = new Promise((resolve:any, reject:any) => {
      if ( res.errcode === 0 ) {
        resolve(res);
      } else {
        reject(res.errmsg)
      }
    });

    return p;
  }


  /**
   * 获取评论列表数量
   * */ 
  async getCommListNum(){
    const { formObj, bizObjectId, schemaCode } = this;
    if (!formObj || !bizObjectId || !schemaCode) return;
    const params:FormCommentIns.formCommentParams.CommentList = {
      bizObjectId,
      schemaCode
    } 

    const res:any = await FormCommentIns.FormCommentApi.getCommentListNum(params);
    if ( res.errcode === 0 ) {
      const { data } = res;
      this.num = data;
    } else {
      console.error(res.errmsg);
    }
  }

  
  getInnerHtmlLen(str:any){
    let oDiv = document.createElement('div');
    oDiv.innerHTML = str;
    return (oDiv.innerText.trim()).length
  }

  // 保留换行格式
  keepNewLine(html:string){
    const h:string = html.replace(/\n/g, '<br />');
    // 先去除文字后面的所有换行
    const reg:any = /(<br \/>)+$/g; 
    const str:string = h.replace(reg, '');
    return str;
  }

  /* 
  * 加载更多回复列表
  */
 async moreReply(item:any) {
    if (!item.page && item.page !== 0) return;
    item.page += 1;
    const params:FormCommentIns.formCommentParams.MoreReply = {
      commentId: item.id,
      page: item.page,
      pageSize: this.replyPageSize
    };
    const res:any = await FormCommentIns.FormCommentApi.getMoreReply(params);
    if (res.errcode || !res.data || !res.data.content) {
      return;
    }
    // 回复会默认加载2条，故第一次加载会加载第一页剩余的内容
    res.data.content.forEach((replyItem:any) => {
      replyItem.collspaned = true; // 控制展开收起
      replyItem.isShowColspan = false; // 是否展示展开按钮
      replyItem.isShowReplay = false; // 是否展示回复弹窗
      replyItem.reComment = ''; // 回复的内容，默认给空
      replyItem.isShowDelBtn = this.getDelBtnPermission(replyItem) // 是否展示删除按钮
    });
    if (item.page === 0) {
      item.replys = res.data.content;
    } else {
      item.replys = item.replys.concat(res.data.content);
    }
    // 剩余未加载回复条数
    item.replySize = this.calcReplyCounts(item);

    this.$nextTick(() => {
      item.replys.forEach((replayItem:any) => {
        this.callBackHandler(replayItem);
      })
    });
 }

  calcReplyCounts(item:any) {
    // 第一页展示剩余未加载回复条数，必须减去默认加载的2条
    if (item.page === -1) {
      return item.replyCount - (item.page + 1)*this.replyPageSize - 2;
    }
    return item.replyCount - (item.page + 1)*this.replyPageSize;
  }

  /**
   * @prams replayCommentId 被回复评论的id
   * */ 
  async sendBase(item:any, replayComment:any, type?:string){ 
    const { bizObjectId, schemaCode, fileLists, comment, isBlock } = this;

    if (isBlock) return; // 防止重复提交

    let rid:string = '';
    let con:any = this.filterHtml(comment);
    let txt:any = this.keepNewLine(comment).trim();
    if (item) {
      rid = item.id;
      con = this.filterHtml(replayComment),
      txt = this.keepNewLine(replayComment).trim();
    } 

    const params:FormCommentIns.formCommentParams.CreateComment = {
      attachmentModelList: fileLists,
      bizObjectId,
      content: con,
      replyCommentId: rid,
      schemaCode,
      text: txt
    }

    this.isBlock = true;

    const res:any = await FormCommentIns.FormCommentApi.createComment(params);

    this.isBlock = false;

    const p:any = new Promise((resolve:any, reject:any) => {
      if (res.errcode === 0) {
        resolve(res);
      } else {
        reject(res.errmsg);
      }
    })
    return p;
  }

  async handleDeleteCommBase(id:string){
    const res:any = await FormCommentIns.FormCommentApi.deleteComment(id);
    const p:any = new Promise((resolve:any, reject:any) => {
      if (res.errcode === 0) {
        resolve(res);
      } else {
        reject(res.errmsg)
      }
    });

    return p;
  }

  calculateWords () {
    this.wordsLen = (this.$refs.atwhoEditWrap as any).innerText.length;
    if (this.wordsLen > this.maxlength) {
     this.comment = this.comment.substr(0, this.maxlength);
    }
  }
  
  initFieName(name){
    const nameWidth = this.getWidth();
    let size = 14; // 字的大小
    let len = name.length * size;
    if (len <= nameWidth) return name;
    let start = name.slice(0, 6);
    let idex = name.lastIndexOf('.')
    let middle = name.slice(idex -6, idex)
    let end = name.slice(idex,)
    return `${start}...${middle}${end}`
  }


  getWidth() {
    let size:number = 0;
    let el = document.querySelector('.attachment-box.preview > ul > li:first-of-type > .attachment-info');
    if (el) {
      size = el.clientWidth;
    }
    return Math.ceil(size * 0.7);
  }

  getExt(name:string):string{
    if (!name) return '';
    
    return name.substr(name.lastIndexOf('.'));
  }

  showImgThumb(item:any){
    const { name } = item as any

    const ext:string = this.getExt(name);

    return this.image_types.indexOf(ext) > -1;
  }

  /**
   * 获取下载连接
   * */ 
  getDownloadUrl(list:any){
    return renderer.UploadControl.service.getDownloadUrl(list);
  }

  loadingGif:any = require('./images/loading-preview.gif');
  getDownloadUrlPc(list:any) {
    if (!list.refId) {
      return this.loadingGif;
    } else {
      return renderer.UploadControl.service.getDownloadUrl(list);
    }
  }

  /**
   * 根据文件类型获取展示图标
   * */ 
  getIconType(item:any){
    if (!item.refId) {
      return '';
    } 
    const name:string = item.name as string;
    const ext:string = name.substr(name.lastIndexOf('.'));
    const prefix:string = 'h-icon-all-';
    switch (ext) {
      case '.docx':
        return `${prefix}word`;
      case '.doc':
        return `${prefix}word`;
      case '.xlsx':
        return `${prefix}excel`;
      case '.xls':
        return `${prefix}excel`;
      case '.pptx':
        return `${prefix}ppt`;
      case '.ppt':
        return `${prefix}ppt`;
      case '.wpt':
        return `${prefix}ppt`;
      case '.dot':
        return `${prefix}word`;
      case '.rtf':
        return `${prefix}t`;
      case '.txt':
        return `${prefix}t`;
      case '.pdf':
      return `${prefix}pdf`;
      default:
        return `${prefix}unknow-file-o`;
    } 

  }

  /**
   * 检测上传数量是否超过
   * */ 
  checkFilesNum(fileList:any){
    return fileList.length <= this.maxFilesNum;
  }

  /**
   * 检测文件类型
  */
  checkFileType(file:any){
    const ext:string = this.getExt(file.name) as string;
    return this.accept.includes(ext);
  }

  /**
   * 检测文件大小
   * */ 
  checkFileSize(file:any) {
    const size:number = file.size;
    return size <= this.singleFileSize;
  }
} 
