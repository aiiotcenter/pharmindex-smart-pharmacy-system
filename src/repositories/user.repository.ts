import { executeQuery, executeMutation } from "@/lib/db";
import { Role, type RoleId } from "@/lib/roles";
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
  ROLE_ID: number;
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
    roleId: (row.ROLE_ID ?? Role.USER) as RoleId,
    createdAt: row.CREATED_AT?.toISOString(),
  };

  if (includePassword) {
    return { ...base, password: row.PASSWORD };
  }

  return base;
}

const USER_SELECT = `
  user_id, username, password, name, surname, email, birth_date, gender, role_id, created_at
`;

export async function findUserByUsername(
  username: string
): Promise<UserRecord | null> {
  const rows = await executeQuery<DbUserRow>(
    `
    SELECT ${USER_SELECT}
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
    SELECT ${USER_SELECT}
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
    SELECT ${USER_SELECT}
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
    INSERT INTO users (username, password, name, surname, email, birth_date, gender, role_id)
    VALUES (:username, :password, :name, :surname, :email, TO_DATE(:birthDate, 'YYYY-MM-DD'), :gender, :roleId)
    `,
    {
      username: input.username,
      password: input.password,
      name: input.name,
      surname: input.surname,
      email: input.email,
      birthDate: input.birthDate,
      gender: input.gender,
      roleId: Role.USER,
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
    SELECT ${USER_SELECT}
    FROM users
    ORDER BY user_id
    `
  );

  return rows.map((row) => mapUser(row) as User);
}

export async function updateUserRole(
  userId: number,
  roleId: RoleId
): Promise<void> {
  await executeMutation(
    `UPDATE users SET role_id = :roleId WHERE user_id = :userId`,
    { userId, roleId }
  );
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
