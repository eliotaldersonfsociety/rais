import { createClient } from '@libsql/client';

const db2 = createClient({
  url: process.env.TURSO_URL!,
  authToken: process.env.TURSO_TOKEN!,
});

export default db2;
