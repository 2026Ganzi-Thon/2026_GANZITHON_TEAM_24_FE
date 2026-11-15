import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useOutletContext } from 'react-router-dom';
import CharacterPortrait, { defaultCharacter } from './CharacterPortrait';
import { getBackground } from './backgrounds';
import { useCharacterStore } from './store';
import './room-activity.css';

const compliments = [
  '오늘 하루를 보내느라 수고했어요. 지금은 잠깐 쉬어도 괜찮아요.',
  '내 마음을 돌아보는 시간을 낸 것만으로도 잘했어요.',
  '작은 한 걸음도 소중해요. 오늘 해낸 일을 하나만 떠올려 봐요.',
  '내 속도로 하루를 보내는 것도 잘하고 있는 거예요.',
];

const dragThreshold = 8;

function PlayCharacter({ character }) {
  const [pull, setPull] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [poke, setPoke] = useState(null);
  const pointer = useRef(null);
  const laughTimer = useRef(null);
  const pokeId = useRef(0);

  useEffect(() => () => window.clearTimeout(laughTimer.current), []);

  function laugh(side) {
    window.clearTimeout(laughTimer.current);
    setPoke({ side, id: ++pokeId.current });
    laughTimer.current = window.setTimeout(() => setPoke(null), 620);
  }

  function start(event) {
    if (event.button !== 0 || pointer.current) return;
    pointer.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      moved: false,
      cheek: event.target.dataset.cheek,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function move(event) {
    const gesture = pointer.current;
    if (gesture?.id !== event.pointerId) return;
    const distance = event.clientY - gesture.y;
    if (Math.hypot(event.clientX - gesture.x, distance) >= dragThreshold) gesture.moved = true;
    if (gesture.moved) {
      setDragging(true);
      setPull(Math.min(Math.max(distance, 0) / (event.currentTarget.clientHeight * 0.65), 1));
    }
  }

  function finish(event) {
    const gesture = pointer.current;
    if (gesture?.id !== event.pointerId) return;
    pointer.current = null;
    setPull(0);
    setDragging(false);
    const distance = Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y);
    if (event.type === 'pointerup' && !gesture.moved && distance < dragThreshold && gesture.cheek) {
      laugh(gesture.cheek);
    }
  }

  return (
    <>
      <button type="button" className="room-activity__toy" data-dragging={dragging}
        aria-label="캐릭터를 아래로 당기거나 볼을 콕 누르기"
        onPointerDown={start} onPointerMove={move} onPointerUp={finish}
        onPointerCancel={finish} onLostPointerCapture={finish}
        onClick={(event) => { if (event.detail === 0) laugh('left'); }}>
        <span className="room-activity__squish" style={{
          '--squish-x': 1 + pull * 0.24,
          '--squish-y': 1 - pull * 0.43,
        }}>
          <CharacterPortrait character={character} poke={poke} />
          <span className="room-activity__cheek room-activity__cheek--left" data-cheek="left" aria-hidden="true" />
          <span className="room-activity__cheek room-activity__cheek--right" data-cheek="right" aria-hidden="true" />
        </span>
      </button>
      <span className="room-activity__sr-only" role="status">{poke ? '캐릭터가 찡긋해요.' : ''}</span>
    </>
  );
}

export default function RoomActivityPage({ mode = 'play' }) {
  const { state } = useLocation();
  const { characters } = useOutletContext();
  const backgroundId = useCharacterStore((store) => store.backgroundId);
  const character = state?.characterId === null ? defaultCharacter
    : characters.find(({ id }) => id === state?.characterId) ?? characters[0] ?? defaultCharacter;
  const [message, setMessage] = useState(0);
  const praise = mode === 'compliments';

  return (
    <section className="room-activity" aria-labelledby="room-activity-title">
      <header className="room-activity__header">
        <h1 id="room-activity-title">{praise ? '칭찬해 줘!' : '스트레스 해소'}</h1>
        <Link to="/home" aria-label="홈으로 돌아가기" title="홈으로">↪</Link>
      </header>
      <div className="room-activity__scene" style={{ backgroundImage: `url(${getBackground(backgroundId).image})` }}>
        <div className="room-activity__stage">
          {praise ? (
            <>
              <p className="room-activity__bubble" role="status">{compliments[message]}</p>
              <button type="button" className="room-activity__toy room-activity__toy--praise"
                aria-label="다른 칭찬 듣기" onClick={() => setMessage((current) => (current + 1) % compliments.length)}>
                <CharacterPortrait character={{ ...character, eyes: 'STYLE_6', mouth: 'STYLE_3' }} />
                <span className="room-activity__sparkle" aria-hidden="true">✦</span>
              </button>
            </>
          ) : (
            <>
              <p className="room-activity__bubble">아래로 쭉 당기거나 볼을 콕 눌러 봐요.</p>
              <PlayCharacter character={character} />
            </>
          )}
        </div>
        {praise && (
          <button type="button" className="room-activity__next"
            onClick={() => setMessage((current) => (current + 1) % compliments.length)}>다른 칭찬 듣기</button>
        )}
      </div>
    </section>
  );
}
