import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import CharacterPortrait, { defaultCharacter } from './CharacterPortrait';
import { getBackground } from './backgrounds';
import { useCharacterStore } from './store';

const prompts = [
  { label: '나랑 같이 놀래?', path: '/play' },
  { label: '혹시 힘든 일 있어?' },
  { label: '오늘의 칭찬, 들어볼래?', path: '/compliments' },
];

export default function HomePage() {
  const { characters, error, reload, token, loaded } = useOutletContext();
  const [selectedId, setSelectedId] = useState(null);
  const [prompt, setPrompt] = useState(false);
  const [notice, setNotice] = useState('');
  const backgroundId = useCharacterStore((state) => state.backgroundId);
  const active = characters.find(({ id }) => id === selectedId) ?? characters[0] ?? defaultCharacter;
  const slots = characters.length ? characters : [defaultCharacter];
  const emptySlots = Math.max(0, 3 - slots.length);

  return (
    <section className="room-home" aria-label="토로의 방"
      style={{ backgroundImage: `url(${getBackground(backgroundId).image})` }}>
      <div className="room-home__scene">
        <div className="room-home__prompts">
          {prompt ? prompts.map(({ label, path }) => path ? (
            <Link key={label} className="room-bubble" to={path}
              state={{ characterId: active.id ?? null }}>{label}</Link>
          ) : (
            <button key={label} className="room-bubble" type="button"
              onClick={() => setNotice('이 기능은 준비 중이에요.')}>{label}</button>
          )) : (
            <button className="room-bubble room-bubble--intro" type="button" onClick={() => setPrompt(true)}>
              나를 한번 터치해볼래?
            </button>
          )}
        </div>
        <button className="room-home__character-button" type="button" aria-label={`${active.name} 터치하기`}
          aria-expanded={prompt} onClick={() => { setPrompt(!prompt); setNotice(''); }}>
          <CharacterPortrait character={active} className="room-home__character" />
        </button>
      </div>
      <section className="room-card room-character-list">
        <header><h2>🐾 내 캐릭터</h2><small>캐릭터는 최근 순으로 저장돼요.</small></header>
        <div className="room-character-list__grid">
          {slots.map((character) => (
            <div key={character.id ?? 'default'} className="room-character-list__slot">
              <button className="room-character-list__select" type="button" aria-pressed={active === character}
                aria-label={character.name} title={character.name}
                onClick={() => { setSelectedId(character.id); setPrompt(false); setNotice(''); }}>
                <CharacterPortrait character={character} />
              </button>
              <Link className="room-character-list__edit" to="/customization"
                state={{ selectedId: character.id ?? null }} aria-label={`${character.name} 꾸미기`}>
                꾸미기
              </Link>
            </div>
          ))}
          {Array.from({ length: emptySlots }, (_, index) => (
            <Link key={`empty-${index}`} className="room-character-list__empty" to="/customization"
              aria-label={`새 캐릭터 만들기 (${index + 1})`}>+</Link>
          ))}
        </div>
        {notice && <p role="status">{notice}</p>}
        {token && !loaded && !error && <p role="status">캐릭터를 불러오는 중이에요.</p>}
        {error && <p role="status">{error} <button type="button" onClick={reload}>다시 시도</button></p>}
      </section>
    </section>
  );
}
