import Axios from './axios';


import { HttpResponse } from './response';

import * as FormCommentParams from './form-comment.params';
import axios from './axios';


export class FormComment {
  /* *
  * 评论列表
  */
 getCommentList(params:FormCommentParams.CommentList){
   return Axios.get('/api/form/comment/comment_list', { params })
 }

  /**
   * 评论列表的数量
   * */  
  getCommentListNum(params:FormCommentParams.CommentList){
    return Axios.get('/api/form/comment/comment_num', { params })
  } 

  /**
   * 添加评论
   * */ 
  createComment(params:FormCommentParams.CreateComment){
    return Axios.post('/api/form/comment/create', params);
  }

  /**
   * 删除评论
   * */ 
  deleteComment(id:string){
    return Axios.get('/api/form/comment/delete', {
      params: {
        id
      }
    })
  }

  /**
   * 获取评论可 @ 的人
   * */ 
  getAtUsers(params:FormCommentParams.GetAtUser){
    return Axios.get('/api/form/comment/list_pull_person', { params })
  }

  /**
   * 获取更多回复列表
   * */ 
  getMoreReply(params:FormCommentParams.MoreReply){
    return Axios.get('/api/form/comment/reply_list', { params })
  }

  /**
   * 获取用户信息以判断是否展示删除按钮
   * */ 
  getUserInfo(){
    const userInfoUrl:string = `/api/organization/user/info_login`
    return Axios.get(`${userInfoUrl}`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
  }

  /**
   * 删除上传附件模板
   */
  deleteTempFile(params: FormCommentParams.DelFile) {
    return Axios.post('/api/aliyun/delete', params)
  }
}