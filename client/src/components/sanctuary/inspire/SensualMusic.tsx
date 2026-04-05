import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
} from "@/components/ui/glass-card";

export default function SensualMusic() {
  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle>Sensual Music</GlassCardTitle>
      </GlassCardHeader>
      <GlassCardContent>
        <iframe
          src="https://open.spotify.com/embed/playlist/37i9dQZF1DX4pBJMCj4Igb"
          width="100%"
          height={380}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          style={{ borderRadius: 12, border: "none" }}
          title="Sensual Music Playlist"
        />
      </GlassCardContent>
    </GlassCard>
  );
}
