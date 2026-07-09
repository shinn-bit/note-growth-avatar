import { Card } from 'note-tree-ui';

export function Default() {
  return (
    <Card>
      <div style={{ fontSize: 14, color: '#1A1A18', fontWeight: 600 }}>今日はまだ投稿していない</div>
      <div style={{ fontSize: 11, color: '#9A9080', marginTop: 3 }}>投稿するたびに植物が育ちます</div>
    </Card>
  );
}

export function Selected() {
  return (
    <Card border="2px solid #3D7A50" borderRadius={20}>
      <div style={{ fontSize: 14, color: '#1A1A18', fontWeight: 600 }}>育成中の植物</div>
      <div style={{ fontSize: 11, color: '#9A9080', marginTop: 3 }}>選択中の状態</div>
    </Card>
  );
}
