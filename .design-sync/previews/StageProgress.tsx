import { StageProgress } from 'note-tree-ui';

export function Pills() {
  return <StageProgress stage={3} maxStage={5} />;
}

export function Bars() {
  return <StageProgress stage={2} maxStage={5} variant="bars" />;
}
