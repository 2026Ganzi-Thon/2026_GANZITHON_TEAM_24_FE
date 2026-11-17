import { useState } from 'react';
import { Link, useLocation, useOutletContext } from 'react-router-dom';
import ExitIcon from '../../components/icons/ExitIcon';
import { Button, Input, Modal } from '../../components/ui';
import CharacterPortrait, { defaultCharacter } from './CharacterPortrait';
import { CharacterPartPreview } from './CharacterParts';
import { categories, features, shades, toolbar } from './customizationOptions';
import { backgrounds, getBackground } from './backgrounds';
import { createCharacter, deleteCharacter, requestMessage, updateCharacter, updateProfile } from './roomApi';
import { useCharacterStore } from './store';
import './customization.css';

// 서버가 받는 꾸미기 값(백엔드 명세): 눈·입·눈썹은 STYLE_1~6, 코·악세서리는 STYLE_1~6 또는 '' (선택 안 함).
// 화면의 기본 캐릭터는 'DEFAULT'(코·입·눈썹), 'NIGHTCAP'(기본 수면 모자) 같은 화면 전용 값을 쓰므로 저장할 때만 바꿔서 보낸다.
//   - 눈·입·눈썹의 'DEFAULT'는 STYLE_1과 똑같이 그려지고, 코의 'DEFAULT'는 코 없음('')과 같다
//   - 'NIGHTCAP'은 서버가 저장할 수 없어서 ''(악세서리 없음)으로 보낸다
const STYLE_VALUE = /^STYLE_[1-6]$/;
const requiredStyle = (value) => (STYLE_VALUE.test(value) ? value : 'STYLE_1');
const optionalStyle = (value) => (STYLE_VALUE.test(value) ? value : '');

export default function CustomizationPage() {
  const { characters, token, loaded, error, reload } = useOutletContext();
  const { state } = useLocation();
  const [selectedId, setSelectedId] = useState(state?.selectedId ?? null);
  const selected = characters.find(({ id }) => id === selectedId);
  const [edits, setEdits] = useState({});
  const character = { ...defaultCharacter, ...selected, ...edits };
  if (character.eyes === 'HAPPY') character.eyes = defaultCharacter.eyes;
  const [tab, setTab] = useState('overview');
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState('');
  const [dialog, setDialog] = useState(null);
  const [replaceId, setReplaceId] = useState('');
  const backgroundId = useCharacterStore((store) => store.backgroundId);
  const setBackground = useCharacterStore((store) => store.setBackground);
  const choices = [{ id: null }, ...characters];
  const selectedIndex = Math.max(0, choices.findIndex(({ id }) => id === selectedId));
  const options = tab === 'color' ? shades : features[tab];

  function select(id) {
    setSelectedId(id);
    setEdits({});
    setNotice('');
  }

  function cycle(direction) {
    select(choices[(selectedIndex + direction + choices.length) % choices.length].id);
  }

  function chooseOption(id) {
    const optional = tab === 'nose' || tab === 'accessory';
    setEdits((previous) => {
      const current = { ...(selected ?? defaultCharacter), ...previous }[tab];
      if (current === id && !optional) return previous;
      return { ...previous, [tab]: current === id ? '' : id };
    });
  }

  async function saveCharacter(event) {
    event.preventDefault();
    if (pending || !token || !loaded) return;
    if (!character.name.trim()) {
      setNotice('캐릭터 이름을 입력해 주세요.');
      return;
    }
    if (!selected && characters.length >= 3 && dialog !== 'replace') {
      setReplaceId('');
      setDialog('replace');
      return;
    }
    const { color, eyes, nose, mouth, eyebrows, accessory } = character;
    const fields = {
      name: character.name.trim(),
      color,
      eyes: requiredStyle(eyes),
      nose: optionalStyle(nose),
      mouth: requiredStyle(mouth),
      eyebrows: requiredStyle(eyebrows),
      accessory: optionalStyle(accessory),
    };
    setPending(true);
    setNotice('');
    try {
      const saved = selected ? await updateCharacter(selected.id, fields)
        : (await createCharacter({ ...fields, ...(replaceId ? { replaceId: Number(replaceId) } : {}) })).character;
      setSelectedId(saved.id);
      setEdits(saved);
      setReplaceId('');
      setDialog(null);
      setNotice('캐릭터를 저장했어요.');
      reload();
    } catch (error) {
      setNotice(requestMessage(error));
      reload();
    } finally {
      setPending(false);
    }
  }

  async function chooseBackground(id) {
    if (pending || getBackground(backgroundId).id === id) return;
    setNotice('');
    if (!token) {
      setBackground(id);
      return;
    }
    setPending(true);
    try {
      const profile = await updateProfile({ background: id === 'default' ? 'DEFAULT' : id });
      setBackground(profile.background ?? id);
    } catch (error) {
      setNotice(requestMessage(error));
    } finally {
      setPending(false);
    }
  }

  async function removeCharacter() {
    if (pending || !selected) return;
    setPending(true);
    setNotice('');
    try {
      await deleteCharacter(selected.id);
      select(null);
      setDialog(null);
      setNotice('캐릭터를 삭제했어요.');
      reload();
    } catch (error) {
      setNotice(requestMessage(error));
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="room-custom">
      <header className="room-custom__heading"><h1>커스터마이징</h1><Link to="/home" aria-label="홈으로" title="홈으로"><ExitIcon /></Link></header>
      <div className="room-custom__preview" style={{ backgroundImage: 'url(' + getBackground(backgroundId).image + ')' }}>
        <button type="button" className="room-custom__name" onClick={() => setTab('name')}>
          {character.name || '말랑이'}
        </button>
        <div className="room-custom__arrows">
          <button type="button" aria-label="이전 캐릭터" disabled={pending || choices.length < 2}
            onClick={() => cycle(-1)}>‹</button>
          <button type="button" aria-label="다음 캐릭터" disabled={pending || choices.length < 2}
            onClick={() => cycle(1)}>›</button>
        </div>
        <CharacterPortrait character={character} />
        <div className="room-custom__preview-actions">
          <Button disabled={pending || !selected} onClick={() => {
            setNotice(''); setDialog('delete');
          }}>삭제</Button>
          <Button disabled={pending} onClick={() => { select(null); setTab('name'); }}>추가</Button>
        </div>
      </div>
      <div className="room-card room-custom__panel">
        <div className="room-custom__toolbar" role="group" aria-label="꾸미기 항목">
          {categories.map(([id, label, icon]) => (
            <button key={id} type="button" aria-pressed={tab === id} title={label}
              onClick={() => setTab(id)}>
              <span aria-hidden="true" style={{ backgroundImage: `url(${toolbar})`, backgroundPosition: `${icon / 9 * 100}% center` }} />
              {label}
            </button>
          ))}
        </div>
        <form className="room-form" onSubmit={saveCharacter}>
          <fieldset disabled={pending} className="room-custom__fields">
            {tab === 'overview' && <div className="room-custom__tiles">
              {categories.slice(1).map(([id, label, icon]) => (
                <button key={id} type="button" onClick={() => setTab(id)}>
                  <span className="room-custom__tile-icon" aria-hidden="true"
                    style={{ backgroundImage: `url(${toolbar})`, backgroundPosition: `${icon / 9 * 100}% center` }} />
                  {label}
                </button>
              ))}
            </div>}
            {tab === 'name' && <div className="room-custom__rename">
              <Input label="닉네임 변경하기" value={character.name} required maxLength={10}
                onChange={(event) => setEdits({ ...edits, name: event.target.value })} />
              <small>{character.name.length}/10자</small>
            </div>}
            {options && <div className="room-custom__tiles">
              {options.map(({ id, label, image }) => (
                <button key={id} type="button" aria-pressed={character[tab] === id}
                  onClick={() => chooseOption(id)}>
                  {tab === 'color' ? <img src={image} alt="" /> : <CharacterPartPreview kind={tab} style={id} />}
                  {label}
                </button>
              ))}
            </div>}
            {tab === 'background' && <div className="room-options room-backgrounds">
              {backgrounds.map(({ id, name, image }) => (
                <button key={id} type="button" aria-pressed={getBackground(backgroundId).id === id}
                  onClick={() => chooseBackground(id)}><img src={image} loading="lazy" alt="" />{name}</button>
              ))}
            </div>}
          </fieldset>
          {!token && <p>로그인하면 캐릭터를 저장할 수 있어요.</p>}
          {token && !loaded && <p role="status">{error || '캐릭터를 불러오는 중이에요.'}
            {error && <Button variant="ghost" onClick={reload}>다시 시도</Button>}
          </p>}
          <p role="status">{!dialog && notice}</p>
          <Button className="room-custom__save" type="submit" disabled={pending || !token || !loaded}>
            {selected ? '변경하기' : '캐릭터 저장'}
          </Button>
        </form>
      </div>
      <Modal open={Boolean(dialog)} title={dialog === 'replace' ? '교체할 캐릭터 선택' : '캐릭터 삭제'}
        onClose={() => { if (!pending) { setDialog(null); setReplaceId(''); setNotice(''); } }}>
        {dialog === 'replace' ? <form className="room-form" onSubmit={saveCharacter}>
          <label className="room-custom__choose">교체할 캐릭터
            <select required disabled={pending} value={replaceId} onChange={(event) => setReplaceId(event.target.value)}>
              <option value="">선택해 주세요</option>
              {characters.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
            </select>
          </label>
          <p role="status">{notice}</p>
          <Button type="submit" disabled={pending || !replaceId}>교체하기</Button>
        </form> : <div className="room-form">
          <p>{character.name} 캐릭터를 삭제할까요?</p>
          <p role="status">{notice}</p>
          <Button disabled={pending} onClick={removeCharacter}>삭제하기</Button>
          <Button variant="secondary" disabled={pending} onClick={() => setDialog(null)}>취소</Button>
        </div>}
      </Modal>
    </section>
  );
}
