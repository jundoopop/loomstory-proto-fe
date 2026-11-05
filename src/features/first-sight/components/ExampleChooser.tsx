/** Authored examples select a photograph; analysis remains an explicit, separate action. */
import { outfitExamples } from '../data/outfitExamples';
import { chloePhoto } from '../chloe';
import type { PhotoInput } from '../types';
import './outfit-examples.css';

interface Props {
  photo: PhotoInput | null;
  disabled: boolean;
  onChoose: (photo: PhotoInput) => void;
}

export function ExampleChooser({ photo, disabled, onChoose }: Props) {
  return <div className="fs-example-chooser" role="group" aria-label="Try an analysis example">
    <p className="fs-example-heading">Try an example <span>Real designs. Prepared stories.</span></p>
    {outfitExamples.map(example => <button key={example.id} type="button"
      className="fs-example-option" disabled={disabled}
      aria-pressed={photo?.kind === 'sample' && photo.exampleId === example.id}
      onClick={() => onChoose(example.photo)}>
      <img src={example.photo.url} alt="" loading="lazy" />
      <span><strong>Try {example.title}</strong><small>{example.description}</small></span>
      <span className="fs-example-arrow" aria-hidden="true">↗</span>
    </button>)}
    <button className="fs-example-legacy" type="button" disabled={disabled} onClick={() => onChoose(chloePhoto)}>
      Try the Chloé bag <span aria-hidden="true">↗</span>
    </button>
  </div>;
}
