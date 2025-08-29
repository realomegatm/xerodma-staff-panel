import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { pool } from '@/lib/mysql';
import bcrypt from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                const connection = await pool.getConnection();
                try {
                    const [rows] = await connection.execute(
                        'SELECT id, username, password, role FROM users WHERE username = ?',
                        [credentials.username]
                    );
                    const user = (rows as any[])[0];

                    if (!user) {
                        return null;
                    }

                    const isValid = await bcrypt.compare(credentials.password, user.password);
                    if (!isValid) {
                        return null;
                    }

                    return {
                        id: user.id,
                        username: user.username,
                        role: user.role,
                    };
                } finally {
                    connection.release();
                }
            },
        }),
    ],
    pages: {
        signIn: '/staff',
    },
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub as string;
                session.user.role = token.role as string;
            }
            return session;
        },
    },
});
