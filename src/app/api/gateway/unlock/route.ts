import { NextResponse } from 'next/server';

const MASTER_GATEWAY_KEY = 'miellet-admin-secret-2026';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { key } = body;

    if (key === MASTER_GATEWAY_KEY) {
      const response = NextResponse.json({
        success: true,
        message: 'Acesso liberado com sucesso para este dispositivo!'
      });

      response.cookies.set('filipem2_admin_gateway', MASTER_GATEWAY_KEY, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: 'Chave mestra de acesso incorreta.' },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
