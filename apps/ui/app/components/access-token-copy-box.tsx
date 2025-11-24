'use client';

export default function AccessTokenCopyBox({ token }: { token: string }) {
  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text);
    alert('Token copied!');
  };

  return (
    <div
      style={{
        padding: '1rem',
        backgroundColor: 'red',
        borderRadius: '1rem',
        wordBreak: 'break-word',
      }}
      onClick={() => {
        copyToClipboard(token);
      }}
    >
      {token}
    </div>
  );
}
