'use client';

// @todo: Remove after core development!

export default function AccessTokenCopyBox({ token }: { token: string }) {
  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text);
    alert('Token copied!');
  };

  return (
    <div
      className="my-10 cursor-pointer break-all rounded-2xl bg-gray-200 px-6 py-4"
      onClick={() => {
        copyToClipboard(token);
      }}
    >
      {token}
    </div>
  );
}
