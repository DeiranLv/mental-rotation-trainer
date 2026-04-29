import { useNavigate } from 'react-router-dom';
import { t } from '../i18n/i18n';
import MRScene from '../components/MRScene';
import { stimulusPool } from '../data/stimulusPool';
import { mirrorCubes } from '../utils/shapeUtils';

// Use shape_01 for the visual examples
const exampleShape = stimulusPool[0].cubes;
const mirroredShape = mirrorCubes(exampleShape);

export default function InstructionView() {
  const navigate = useNavigate();

  return (
    <div className="view instruction-view">
      <h1>{t('instructions.title')}</h1>
      <p className="instruction-intro">{t('instructions.intro')}</p>

      <div className="example-pair-row">
        {/* SAME example */}
        <div className="example-pair">
          <span className="example-label same-label">{t('instructions.sameLabel')}</span>
          <div className="example-scene">
            <MRScene leftCubes={exampleShape} rightCubes={exampleShape} compact />
          </div>
          <p className="example-desc">{t('instructions.sameDesc')}</p>
        </div>

        {/* DIFFERENT example */}
        <div className="example-pair">
          <span className="example-label diff-label">{t('instructions.differentLabel')}</span>
          <div className="example-scene">
            <MRScene leftCubes={exampleShape} rightCubes={mirroredShape} compact />
          </div>
          <p className="example-desc">{t('instructions.differentDesc')}</p>
        </div>
      </div>

      <div className="keys-info">
        <h3>{t('instructions.keysTitle')}</h3>
        <div className="keys-row">
          <span className="key-badge">←</span>
          <span>{t('instructions.keyLeft')} — <strong>{t('instructions.keyLeftAction')}</strong></span>
        </div>
        <div className="keys-row">
          <span className="key-badge">→</span>
          <span>{t('instructions.keyRight')} — <strong>{t('instructions.keyRightAction')}</strong></span>
        </div>
      </div>

      <p className="speed-note">{t('instructions.speedNote')}</p>

      <button onClick={() => navigate('/practice')}>
        {t('instructions.practiceButton')}
      </button>
    </div>
  );
}
