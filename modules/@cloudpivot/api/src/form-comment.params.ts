import { name } from './../../form/src/schema/system-data-item-codes';
export interface CommentList {
  bizObjectId: string,
  schemaCode: string,
  page?:number,
  pageSize?: number
}

export interface CreateComment {
  attachmentModelList: Array<Attachemnt>,
  bizObjectId: string,
  content: string,
  replyCommentId: string,
  schemaCode: string,
  text: string
}

export interface MoreReply {
  commentId: string,
  page: number,
  pageSize: number
}

export interface  Attachemnt {
  deleted: true,
  fileExtension: string,
  fileSize: number,
  id: string,
  mimeType: string,
  modifiedTime: string,
  name: string,
  refId: string,
  schemaCode: string
}

export interface GetAtUser {
  bizObjectId: string,
  schemaCode: string,
  keyword: string,
  wfInstanceId: string,
  page: number,
  pageSize: number
}

export interface FileItem {
  name: string,
  id: string,
  refId: string
}
export interface DelFile {
  deleteList: FileItem[]
}