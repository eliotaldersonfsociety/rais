import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import db from '@/lib/db'; // Asegúrate de que esta ruta sea correcta
import { eq } from "drizzle-orm"; // Asegúrate de importar eq
import { users } from '@/lib/register/schema'; // Asegúrate de importar el esquema

// Extend the User type to include additional properties
interface CustomUser {
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
  saldo: number;
  role: string;
}

// Extend the Session type to include the custom user properties
interface CustomSession {
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
    saldo: number;
    role: string;
  };
}

interface CustomJWT {
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
  saldo: number;
  role: string;
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
          // Consulta correcta con Drizzle
          const usersArray = await db.users
            .select({
              id: users.id,
              name: users.name,
              lastname: users.lastname,
              email: users.email,
              phone: users.phone,
              address: users.address,
              house_apt: users.house_apt,
              city: users.city,
              state: users.state,
              postal_code: users.postal_code,
              saldo: users.saldo,
              role: users.role,
              password: users.password,
            })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          const user = usersArray[0];

          if (!user) {
            return null;
          }

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
              saldo: user.saldo,
              role: user.role ?? "user",
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.lastname = user.lastname;
        token.email = user.email;
        token.phone = user.phone;
        token.address = user.address;
        token.house_apt = user.house_apt;
        token.city = user.city;
        token.state = user.state;
        token.postal_code = user.postal_code;
        token.saldo = user.saldo;
        token.role = user.role ?? "user";
      }
      return token;
    },
    async session({ session, token }) {
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
        saldo: token.saldo,
        role: token.role,
      };
      return session;
    },
  },
};

export { authOptions };
