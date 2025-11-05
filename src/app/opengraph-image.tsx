import { ImageResponse } from 'next/og';

// Image metadata
export const alt = 'Study Buddy AI - Your Intelligent Learning Companion';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 50%, #3B82F6 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: '40px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 120,
            marginBottom: 30,
          }}
        >
          📚✨
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 20,
          }}
        >
          Study Buddy AI
        </div>
        <div
          style={{
            fontSize: 36,
            textAlign: 'center',
            opacity: 0.9,
            maxWidth: 900,
          }}
        >
          Your Intelligent Learning Companion
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
