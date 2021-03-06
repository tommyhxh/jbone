import { setToken, getToken,clearToken,setRToken, getRToken,clearRToken, canTurnTo, setTitle } from '@/libs/util'
import axios from '@/libs/api.request'

const OAUTH_RESPONSE_CODE = 'code'
const OAUTH_CLIENT_ID = 'cmsadminvue'
const OAUTH_CLIENT_SECRET = 'cmsadminvue'
const OAUTH_GRANT_TYPE = 'authorization_code'
const OAUTH_GRANT_TYPE_REFRESH_TOKEN = 'refresh_token'
const OAUTH_REDIRECT_URI = 'http://jbone-cms-admin-vue.majunwei.com:8080/'
const SSO_BASE_URL = 'http://jbone-cas.majunwei.com:30001/cas/'
const SSO_OAUTH_AUTHOIZE_URL = SSO_BASE_URL + 'oauth2.0/authorize?response_type=' + OAUTH_RESPONSE_CODE + '&client_id=' + OAUTH_CLIENT_ID + '&redirect_uri=' + OAUTH_REDIRECT_URI
const SSO_OAUTH_ACCESSTOKEN_URL = 'oauth2.0/accessToken'


export const handleAuth = (code) => {
  let token = getToken();
  console.info("token:" + token)
  //没有token，表示未登录/已登录但还没获取token
  if(!token){
    //登录过但未获取token
    if(code){
      requestToken(code);
    }
    //还未登录，重定向到登录页
    else{
      toLogin();
    }
  }
  //有token，表示已经登录过，需要刷新token
  else{
    refreshToken();
  }
}

export const toLogin = () => {
  clearAllToken()
  window.location.href = SSO_OAUTH_AUTHOIZE_URL;
}

export const requestToken = (code) => {
  console.info('requestToken')
  axios.requestByBaseUrl(SSO_BASE_URL,{
    url: SSO_OAUTH_ACCESSTOKEN_URL,
    method: 'get',
    params:{
      grant_type: OAUTH_GRANT_TYPE,
      client_id: OAUTH_CLIENT_ID,
      client_secret: OAUTH_CLIENT_SECRET,
      redirect_uri:OAUTH_REDIRECT_URI,
      code:code
    }
  }).then(function (res) {
    console.info(res)
    let accessToken = res.data.access_token
    let refreshToken = res.data.refresh_token
    let timeout  = res.data.expires_in
    if(accessToken && refreshToken){
      setToken(accessToken)
      setRToken(refreshToken)
    }else{
      toLogin();
    }


  }).catch(function (error) {
    console.info(error)
    //获取accesstoken失败，表示code过期，需重新登录
    toLogin();
  });
}

//刷新token
export const refreshToken = () => {

  let refreshToken = getRToken()
  console.info('refreshToken' + refreshToken)
  if(!refreshToken || refreshToken == 'undefined'){
    toLogin();
    return;
  }
  axios.requestByBaseUrl(SSO_BASE_URL,{
    url: SSO_OAUTH_ACCESSTOKEN_URL,
    method: 'get',
    params:{
      grant_type: OAUTH_GRANT_TYPE_REFRESH_TOKEN,
      client_id: OAUTH_CLIENT_ID,
      client_secret: OAUTH_CLIENT_SECRET,
      refresh_token:refreshToken
    }
  }).then(function (res) {
    console.info(res)
    let accessToken = res.data.access_token
    setToken(accessToken)
    setRToken(refreshToken)
  }).catch(function (error) {
    console.info(error)
    //刷新token失败，表示所token都已过期，需重新登录
    toLogin();
  });
}

//token交互失败时，清空所有token，重新获取
export const clearAllToken = () => {
  clearToken()
  clearRToken()
}
