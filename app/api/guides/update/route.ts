 import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/mysql';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    const session = await auth(req, NextResponse.next());

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { guideId, newPassword } = await req.json();

    if (!guideId) {
        return NextResponse.json({ error: 'Missing guideId' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
        const hashedPassword = newPassword ? await bcrypt.hash(newPassword, 10) : null;
        await connection.execute(
            'UPDATE guides SET password = ?, is_password_protected = ? WHERE id = ?',
            [hashedPassword, !!newPassword, guideId]
        );
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    } finally {
        connection.release();
    }
}