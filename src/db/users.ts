import { eq } from 'drizzle-orm';
import { db } from './index.ts';
import { users } from './schema.ts';

const PRIMARY_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'gnmnagaraj@gmail.com').toLowerCase();

export async function getOrCreateUser(uid: string, email: string, displayName?: string) {
  const normalizedEmail = email.toLowerCase();
  const isPrimaryAdmin = normalizedEmail === PRIMARY_ADMIN_EMAIL;

  try {
    const existing = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    const resolvedRole =
      existing[0]?.role && existing[0].role !== 'learner'
        ? existing[0].role
        : isPrimaryAdmin
          ? 'admin'
          : 'learner';

    const result = await db
      .insert(users)
      .values({
        uid,
        email: normalizedEmail,
        displayName: displayName || existing[0]?.displayName || normalizedEmail.split('@')[0],
        role: resolvedRole,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: normalizedEmail,
          ...(displayName ? { displayName } : {}),
          ...(isPrimaryAdmin ? { role: 'admin' } : {}),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database query failed in getOrCreateUser:', error);
    throw new Error('Failed to synchronize user account.', { cause: error });
  }
}

export async function getAllUsers() {
  try {
    return await db.select().from(users);
  } catch (error) {
    console.error('Database query failed in getAllUsers:', error);
    throw new Error('Failed to load user directory.', { cause: error });
  }
}

export async function updateUserRole(userId: number, role: 'learner' | 'editor' | 'admin') {
  try {
    const updated = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, userId))
      .returning();
    return updated[0] || null;
  } catch (error) {
    console.error('Database query failed in updateUserRole:', error);
    throw new Error('Failed to update user role.', { cause: error });
  }
}
