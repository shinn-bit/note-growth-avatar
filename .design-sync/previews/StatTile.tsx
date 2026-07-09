import { StatTile } from 'note-tree-ui';

export function Streak() {
  return <StatTile label="STREAK" value={7} sublabel="日連続" />;
}

export function Completed() {
  return <StatTile label="COMPLETED" value={3} sublabel="植物完成" />;
}
