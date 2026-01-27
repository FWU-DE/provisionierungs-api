import * as client from 'openid-client';
import { getClientConfiguration } from '@/lib/auth';
import { getConfig } from '@/lib/config';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const config = getConfig();
  const clientConfig = await getClientConfiguration();
  (await cookies()).delete(config.sessionCookieName);

  return NextResponse.redirect(
    client.buildEndSessionUrl(clientConfig, {
      post_logout_redirect_uri: getConfig().selfBaseUrl,
    }),
  );
}
