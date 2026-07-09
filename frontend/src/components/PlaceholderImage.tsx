import { placeholderImageStyle } from '../theme/styles';

export function PlaceholderImage({ nome, url, aspect }: { nome: string; url?: string; aspect?: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt={nome}
        loading="lazy"
        style={{ width: '100%', aspectRatio: aspect || '4 / 3', objectFit: 'cover', borderRadius: 12 }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    );
  }
  return <div style={placeholderImageStyle(aspect)}>Foto: {nome}</div>;
}
