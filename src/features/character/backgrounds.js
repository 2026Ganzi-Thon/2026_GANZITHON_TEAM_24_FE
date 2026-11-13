import background1 from '../../assets/backgrounds/background1.png';

// 배경 목록. 새 배경은 assets/backgrounds 에 넣고 import 해서 추가한다.
export const backgrounds = [{ id: 'default', name: '기본', image: background1 }];

export function getBackground(id) {
  return backgrounds.find((b) => b.id === id) ?? backgrounds[0];
}
