import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/mysql';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    const { guideId, password } = await req.json();

    if (!guideId || !password) {
        return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute(
            'SELECT is_password_protected, password FROM guides WHERE id = ?',
            [guideId]
        );
        const guide = (rows as any[])[0];

        if (!guide) {
            return NextResponse.json({ success: false, error: 'Guide not found' }, { status: 404 });
        }

        if (!guide.is_password_protected) {
            return NextResponse.json({ success: true });
        }

        const isValid = await bcrypt.compare(password, guide.password);
        if (isValid) {
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
    } catch (error) {
        console.error('Verify error:', error);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    } finally {
        connection.release();
    }
}
