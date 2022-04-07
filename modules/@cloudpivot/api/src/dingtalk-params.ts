

export interface SignParams {

    url: string,
    corpId?: string

}

export interface SignResult {

    timeStamp: string

    nonceStr: string

    signature: string

}

export interface LoginParams {

    client_id: string

    code: string

    scope?: string

    state?: string

    corpId?:string

}

export interface LoginResult {

    T: string

    userinfo: any

    refresh_token: string

    expiration: number
}
