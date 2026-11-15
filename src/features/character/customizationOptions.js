const artwork = import.meta.glob('../../assets/room/options/{toolbar,peach,pink,yellow,blue,gray,lavender,mint}.png', {
  eager: true,
  import: 'default',
  query: '?url',
});

function asset(name) {
  return artwork[`../../assets/room/options/${name}.png`];
}

export const categories = [
  ['overview', '꾸미기 항목', 1],
  ['name', '이름', 2],
  ['eyes', '눈', 3],
  ['nose', '코', 4],
  ['mouth', '입', 5],
  ['eyebrows', '눈썹', 6],
  ['accessory', '액세서리', 7],
  ['color', '색상', 8],
  ['background', '배경', 9],
];

const labels = {
  eyes: ['동그란 눈', '반쯤 감은 눈', '반짝이는 눈', '윙크', '초롱초롱한 눈', '웃는 눈'],
  nose: ['하트 코', '납작한 코', '동그란 코', '세모 코', '반달 코', '물방울 코'],
  mouth: ['활짝 웃는 입', '놀란 입', '크게 웃는 입', '미소', '시무룩한 입', '한쪽 미소'],
  eyebrows: ['둥근 눈썹', '일자 눈썹', '살짝 휜 눈썹', '아래로 휜 눈썹', '걱정 눈썹', '짧은 눈썹'],
  accessory: ['파란 모자', '노란 리본', '파티 모자', '보라색 모자', '줄무늬 밴드', '안경'],
};

export const features = Object.fromEntries(Object.entries(labels).map(([key, names]) => [
  key,
  names.map((label, index) => ({ id: 'STYLE_' + (index + 1), label })),
]));

features.accessory.unshift({ id: 'NIGHTCAP', label: '기본 수면 모자' });

export const shades = [
  ['PEACH', '복숭아'], ['PINK', '분홍'], ['YELLOW', '노랑'], ['BLUE', '파랑'],
  ['GRAY', '회색'], ['LAVENDER', '라벤더'], ['MINT', '민트'],
].map(([id, label]) => ({ id, label, image: asset(id.toLowerCase()) }));

export const toolbar = asset('toolbar');
