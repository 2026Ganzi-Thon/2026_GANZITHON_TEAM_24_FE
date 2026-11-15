import background1 from '../../assets/backgrounds/background1.png';
import reading from '../../assets/room/reading.png';
import terrace from '../../assets/room/terrace.png';
import kitchen from '../../assets/room/kitchen.png';
import studio from '../../assets/room/studio.png';
import green from '../../assets/room/green.png';

export const backgrounds = [
  { id: 'default', name: '체크무늬 방', image: background1 },
  { id: 'READING', name: '다락 독서 공간', image: reading },
  { id: 'TERRACE', name: '정원 테라스', image: terrace },
  { id: 'KITCHEN', name: '카툰 주방', image: kitchen },
  { id: 'STUDIO', name: '보라색 작업실', image: studio },
  { id: 'GREEN', name: '초록빛 침실', image: green },
];

export function getBackground(id) {
  return backgrounds.find((background) => background.id === id) ?? backgrounds[0];
}
