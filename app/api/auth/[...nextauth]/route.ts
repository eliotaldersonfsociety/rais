import NextAuth, { NextAuthOptions, User as NextAuthUser, Session, DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt'; // Correct import for JWT type
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import db from '@/lib/db'; // Ensure this is your database connection

// Extend the User type to include additional properties
interface CustomUser extends NextAuthUser {
  id: string;
  name: string;
  lastname: string;
  email: string;
  phone: string;
  address: string;
  house_apt: string;
  city: string;
  state: string;
  postal_code: string;
}

// Extend the Session type to include the custom user properties
interface CustomSession extends Session {
  user: {
    id: string;
    name: string;
    lastname: string;
    email: string;
    phone: string;
    address: string;
    house_apt: string;
    city: string;
    state: string;
    postal_code: string;
  } & Session['user'];
}

interface CustomJWT extends JWT {
  id: string;
  name: string;
  lastname: string;
  email: string;
  phone: string;
  address: string;
  house_apt: string;
  city: string;
  state: string;
  postal_code: string;
}

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { email, password } = credentials ?? {};

        if (!email || !password) {
          return null;
        }

        try {
          const result = await db.execute({
            sql: 'SELECT * FROM users WHERE email = ?',
            args: [email],
          });

          const rows = result.rows as any[];

          if (!rows.length) {
            return null;
          }

          const user = rows[0];
          const isPasswordValid = await bcrypt.compare(password, user.password);

          if (isPasswordValid) {
            return {
              id: String(user.id),
              name: user.name,
              lastname: user.lastname,
              email: user.email,
              phone: user.phone,
              address: user.address,
              house_apt: user.house_apt,
              city: user.city,
              state: user.state,
              postal_code: user.postal_code,
            } as CustomUser;
          } else {
            return null;
          }
        } catch (error) {
          console.error('Database query error:', error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: NextAuthUser | undefined }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.lastname = (user as CustomUser).lastname;
        token.email = user.email;
        token.phone = (user as CustomUser).phone;
        token.address = (user as CustomUser).address;
        token.house_apt = (user as CustomUser).house_apt;
        token.city = (user as CustomUser).city;
        token.state = (user as CustomUser).state;
        token.postal_code = (user as CustomUser).postal_code;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      // Map the token properties to the session.user object
      session.user = {
        ...session.user,
        id: token.id,
        name: token.name,
        lastname: token.lastname,
        email: token.email,
        phone: token.phone,
        address: token.address,
        house_apt: token.house_apt,
        city: token.city,
        state: token.state,
        postal_code: token.postal_code,
      };
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
