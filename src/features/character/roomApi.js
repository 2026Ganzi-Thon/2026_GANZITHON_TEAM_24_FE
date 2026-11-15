import api from '../../lib/api';

const account = '/api/v1/users/me';
const characters = '/api/v1/characters';

async function read(request) {
  const { data } = await request;
  if (data?.success !== true || data.data == null) {
    throw Object.assign(new Error('API request failed'), { code: data?.error?.code });
  }
  return data.data;
}

export const getProfile = (signal) => read(api.get(account, { signal }));
export const updateProfile = (fields) => read(api.patch(account, fields));
export const updatePassword = (fields) => api.patch(account + '/password', fields);
export const updateEmail = (fields) => read(api.patch(account + '/email', fields));
export const deleteAccount = () => api.delete(account);
export const getCharacters = (signal) => read(api.get(characters, { signal }));
export const createCharacter = (fields) => read(api.post(characters, fields));
export const updateCharacter = (id, fields) => read(api.put(characters + '/' + id, fields));
export const deleteCharacter = (id) => api.delete(characters + '/' + id);

const messages = {
  AUTH_001: '이미 사용 중인 이메일이에요.',
  AUTH_003: '현재 비밀번호를 다시 확인해 주세요.',
  AUTH_004: '이미 사용 중인 닉네임이에요.',
  COMMON_001: '입력한 내용을 확인해 주세요.',
  COMMON_002: '로그인이 필요해요. 다시 로그인해 주세요.',
  CHAR_001: '캐릭터를 찾을 수 없어요. 목록을 새로고침해 주세요.',
  CHAR_003: '저장할 캐릭터가 가득 찼어요. 교체할 캐릭터를 골라 주세요.',
  CHAR_004: '캐릭터 이름에는 연락처나 SNS 계정을 넣을 수 없어요.',
};

export function requestMessage(error) {
  const code = error.response?.data?.error?.code ?? error.code;
  return messages[code] ?? '요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.';
}
