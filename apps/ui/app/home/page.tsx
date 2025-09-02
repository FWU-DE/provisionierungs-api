import { verifySession } from '../lib/session';

export default async function Home() {
  const session = await verifySession();
  return (
    <div>
      Here you should be logged in<pre>{JSON.stringify(session)}</pre>
    </div>
  );
}
