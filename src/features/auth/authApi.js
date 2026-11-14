import api from '../../lib/api';

async function getData(request) {
  const { data } = await request;
  if (data?.success !== true || !data.data) {
    throw Object.assign(new Error('인증 요청을 처리하지 못했어요.'), { authCode: data?.error?.code });
  }
  return data.data;
}

export function checkEmail(email) {
  return getData(api.get('/api/v1/auth/email-check', { params: { email } }));
}

export function checkNickname(nickname) {
  return getData(api.get('/api/v1/auth/nickname-check', { params: { nickname } }));
}

export function signup(payload) {
  return getData(api.post('/api/v1/auth/signup', payload));
}

export function signIn(payload) {
  return getData(api.post('/api/v1/auth/login', payload));
}

export function getAuthErrorCode(error) {
  return error.response?.data?.error?.code ?? error.authCode;
}
