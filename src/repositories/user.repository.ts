import { executeQuery, executeMutation } from "@/lib/db";
import type { Gender, RegisterInput, User, UserRecord } from "@/types/user";

interface DbUserRow {
  USER_ID: number;
  USERNAME: string;
  PASSWORD: string;
  NAME: string;
  SURNAME: string;
  EMAIL: string;
  BIRTH_DATE: Date;
  GENDER: Gender;
  CREATED_AT?: Date;
}

function mapUser(row: DbUserRow, includePassword = false): User | UserRecord {
  const base: User = {
    userId: row.USER_ID,
    username: row.USERNAME,
    name: row.NAME,
    surname: row.SURNAME,
    email: row.EMAIL,
    birthDate: row.BIRTH_DATE.toISOString().slice(0, 10),
    gender: row.GENDER,
    createdAt: row.CREATED_AT?.toISOString(),
  };

  if (includePassword) {
    return { ...base, password: row.PASSWORD };
  }

  return base;
}

export async function findUserByUsername(
  username: string
): Promise<UserRecord | null> {
  const rows = await executeQuery<DbUserRow>(
    `
    SELECT user_id, username, password, name, surname, email, birth_date, gender, created_at
    FROM users
    WHERE username = :username
    `,
    { username }
  );

  if (!rows[0]) {
    return null;
  }

  return mapUser(rows[0], true) as UserRecord;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const rows = await executeQuery<DbUserRow>(
    `
    SELECT user_id, username, password, name, surname, email, birth_date, gender, created_at
    FROM users
    WHERE email = :email
    `,
    { email }
  );

  if (!rows[0]) {
    return null;
  }

  return mapUser(rows[0]) as User;
}

export async function findUserById(userId: number): Promise<User | null> {
  const rows = await executeQuery<DbUserRow>(
    `
    SELECT user_id, username, password, name, surname, email, birth_date, gender, created_at
    FROM users
    WHERE user_id = :userId
    `,
    { userId }
  );

  if (!rows[0]) {
    return null;
  }

  return mapUser(rows[0]) as User;
}

export async function createUser(
  input: RegisterInput & { password: string }
): Promise<User> {
  await executeMutation(
    `
    INSERT INTO users (username, password, name, surname, email, birth_date, gender)
    VALUES (:username, :password, :name, :surname, :email, TO_DATE(:birthDate, 'YYYY-MM-DD'), :gender)
    `,
    {
      username: input.username,
      password: input.password,
      name: input.name,
      surname: input.surname,
      email: input.email,
      birthDate: input.birthDate,
      gender: input.gender,
    }
  );

  const user = await findUserByUsername(input.username);
  if (!user) {
    throw new Error("Failed to create user.");
  }

  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export async function listUsers(): Promise<User[]> {
  const rows = await executeQuery<DbUserRow>(
    `
    SELECT user_id, username, password, name, surname, email, birth_date, gender, created_at
    FROM users
    ORDER BY user_id
    `
  );

  return rows.map((row) => mapUser(row) as User);
}

export async function usernameExists(username: string): Promise<boolean> {
  const rows = await executeQuery<{ CNT: number }>(
    "SELECT COUNT(*) AS cnt FROM users WHERE username = :username",
    { username }
  );
  return (rows[0]?.CNT ?? 0) > 0;
}

export async function emailExists(email: string): Promise<boolean> {
  const rows = await executeQuery<{ CNT: number }>(
    "SELECT COUNT(*) AS cnt FROM users WHERE email = :email",
    { email }
  );
  return (rows[0]?.CNT ?? 0) > 0;
}
