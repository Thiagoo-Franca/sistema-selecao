import * as bcrypt from "bcryptjs";
import { and, asc, eq, or } from "drizzle-orm";
import { type Context } from "hono";
import { z } from "zod";
import {
  feedbackSubmissions,
  resetPasswords,
  Users,
} from "../../database/schema.js";
import { databaseError, logDatabaseError } from "../../database/errors.js";
import { type AppResult, err, ok } from "../../result.js";
import { type AppVariables } from "../../types.js";
import { getUsuarioAutenticado } from "../auth/index.js";
import { createUserSchema, updateUserSchema } from "./usuario.schema.js";
import {
  toUsuarioPublico,
  usuarioPublicoProjection,
  type UsuarioPublico,
} from "./usuario.dto.js";

type GetUserByIdError =
  { type: "user_not_found" } | { type: "database_error"; error: unknown };
type UpdateUserError =
  | { type: "user_not_found" }
  | { type: "duplicate_username" }
  | { type: "database_error"; error: unknown };
type DeleteUserError =
  | { type: "user_not_found" }
  | { type: "user_referenced_elsewhere" }
  | { type: "database_error"; error: unknown };
type UpdateUserRoleError =
  { type: "user_not_found" } | { type: "database_error"; error: unknown };
type GetAllUsersError = { type: "database_error"; error: unknown };
export const getAllUsers = async (
  c: Context<{ Variables: AppVariables }>,
): Promise<AppResult<UsuarioPublico[], GetAllUsersError>> => {
  const dbInstance = c.get("db");
  try {
    const allUsers = await dbInstance
      .select(usuarioPublicoProjection)
      .from(Users)
      .orderBy(asc(Users.nome));

    return ok(allUsers);
  } catch (error) {
    logDatabaseError("Error fetching all users:", error);
    return databaseError(error);
  }
};

type GetTeachersError = { type: "database_error"; error: unknown };
export const getTeachers = async (
  c: Context<{ Variables: AppVariables }>,
): Promise<AppResult<UsuarioPublico[], GetTeachersError>> => {
  const dbInstance = c.get("db");
  try {
    const teachers = await dbInstance
      .select(usuarioPublicoProjection)
      .from(Users)
      .where(and(or(eq(Users.role, "TEACHER"), eq(Users.role, "ADMIN"))))
      .orderBy(Users.nome);

    return ok(teachers);
  } catch (error) {
    logDatabaseError("Error fetching teachers:", error);
    return databaseError(error);
  }
};

export const getTeachersSimplified = async (
  c: Context<{ Variables: AppVariables }>,
): Promise<AppResult<{ name: string; id: string }[], GetTeachersError>> => {
  const dbInstance = c.get("db");

  try {
    const teachers = await dbInstance
      .select({
        name: Users.nome,
        id: Users.id,
      })
      .from(Users)
      .where(and(or(eq(Users.role, "TEACHER"), eq(Users.role, "ADMIN"))))
      .orderBy(Users.nome);

    return ok(teachers);
  } catch (error) {
    logDatabaseError("Error fetching teachers (simplified):", error);
    return databaseError(error);
  }
};

type CreateUserError =
  | { type: "duplicate_email" }
  | { type: "duplicate_username" }
  | { type: "hashing_error"; error: unknown }
  | { type: "database_error"; error: unknown };

export const createUser = async (
  c: Context<{ Variables: AppVariables }>,
  userData: z.infer<typeof createUserSchema>,
): Promise<AppResult<UsuarioPublico, CreateUserError>> => {
  const dbInstance = c.get("db");

  try {
    const existingUser = await dbInstance
      .select({ id: Users.id })
      .from(Users)
      .where(eq(Users.email, userData.email))
      .limit(1);

    if (existingUser.length > 0) {
      return err({ type: "duplicate_email" });
    }

    let passwordHash: string | undefined = undefined;
    try {
      passwordHash = await bcrypt.hash(userData.password, 10);
    } catch (hashError) {
      console.error("Password hashing failed during user creation:", hashError);
      return err({ type: "hashing_error", error: hashError });
    }

    const now = new Date();
    const [newUserResult] = await dbInstance
      .insert(Users)
      .values({
        nome: userData.nome.trim(),
        academicTitle: userData.academicTitle.trim(),
        email: userData.email.trim(),
        matricula: userData.matricula.trim(),
        passwordHash: passwordHash,
        role: userData.role,
        createdAt: now,
        updatedAt: now,
        school: userData.school,
      })
      .returning();

    if (!newUserResult) {
      console.error("Failed to insert user or retrieve data after insert.");
      return err({
        type: "database_error",
        error: "Insert operation did not return expected data.",
      });
    }

    return ok(toUsuarioPublico(newUserResult));
  } catch (error) {
    logDatabaseError("Database error during user creation:", error);
    return databaseError(error);
  }
};

export const getUserById = async (
  c: Context<{ Variables: AppVariables }>,
  id: string,
): Promise<
  AppResult<UsuarioPublico, GetUserByIdError>
> => {
  const dbInstance = c.get("db");
  try {
    const result = await dbInstance
      .select(usuarioPublicoProjection)
      .from(Users)
      .where(eq(Users.id, id))
      .limit(1);
    const user = result[0];

    if (!user) {
      return err({ type: "user_not_found" });
    }
    return ok(user);
  } catch (error) {
    logDatabaseError(`Error fetching user with ID ${id}:`, error);
    return databaseError(error);
  }
};

type UpdateUserInput = z.infer<typeof updateUserSchema.shape.body>;

export const updateUser = async (
  c: Context<{ Variables: AppVariables }>,
  id: string,
  updateData: UpdateUserInput,
): Promise<AppResult<UsuarioPublico, UpdateUserError>> => {
  const dbInstance = c.get("db");
  const { nome, school, academicTitle, role } = updateData;

  try {
    const userCheck = await dbInstance
      .select({ id: Users.id })
      .from(Users)
      .where(eq(Users.id, id))
      .limit(1);
    if (userCheck.length === 0) {
      return err({ type: "user_not_found" });
    }

    const [updatedUser] = await dbInstance
      .update(Users)
      .set({
        nome: nome,
        school: school,
        academicTitle: academicTitle,
        role: role,
        updatedAt: new Date(),
      })
      .where(eq(Users.id, id))
      .returning();

    if (!updatedUser) {
      console.error(
        `Update failed unexpectedly for user ID ${id} after existence check.`,
      );
      return err({ type: "user_not_found" });
    }

    return ok(toUsuarioPublico(updatedUser));
  } catch (error) {
    console.error(`Error updating user with ID ${id}:`, error);

    if (
      error instanceof Error &&
      error.message.includes("UNIQUE constraint failed: usuarios.username")
    ) {
      return err({ type: "duplicate_username" });
    }
    return err({ type: "database_error", error });
  }
};


export const deleteUser = async (
  c: Context<{ Variables: AppVariables }>,
  id: string,
  cascade = false,
): Promise<AppResult<void, DeleteUserError>> => {
  const dbInstance = c.get("db");
  try {
    const userCheck = await dbInstance
      .select({ id: Users.id })
      .from(Users)
      .where(eq(Users.id, id))
      .limit(1);
    if (userCheck.length === 0) {
      return err({ type: "user_not_found" });
    }
    

    await dbInstance
      .delete(resetPasswords)
      .where(eq(resetPasswords.userId, id));
    await dbInstance
      .delete(feedbackSubmissions)
      .where(eq(feedbackSubmissions.userId, id));

    // }

    await dbInstance.delete(Users).where(eq(Users.id, id));

    return ok(undefined);
  } catch (error) {
    console.error(`Error deleting user with ID ${id}:`, error);

    const isFkError =
      error instanceof Error &&
      (error.message.includes("FOREIGN KEY constraint failed") ||
        error.message.includes("violates foreign key constraint"));
    if (isFkError) {
      return err({ type: "user_referenced_elsewhere" });
    }
    return err({ type: "database_error", error });
  }
};

export const updateUserRole = async (
  c: Context<{ Variables: AppVariables }>,
  id: string,
  newRole: "TEACHER" | "ADMIN",
): Promise<AppResult<{ id: string; role: string }, UpdateUserRoleError>> => {
  const dbInstance = c.get("db");
  try {
    const userCheck = await dbInstance
      .select({ id: Users.id })
      .from(Users)
      .where(eq(Users.id, id))
      .limit(1);
    if (userCheck.length === 0) {
      return err({ type: "user_not_found" });
    }

    const updatedUserResult = await dbInstance
      .update(Users)
      .set({ role: newRole, updatedAt: new Date() })
      .where(eq(Users.id, id))
      .returning({ id: Users.id, role: Users.role });

    const updatedUser = updatedUserResult[0];
    if (!updatedUser) {
      console.error(`Update role failed unexpectedly for user ID ${id}.`);
      return err({ type: "user_not_found" });
    }

    return ok(updatedUser);
  } catch (error) {
    console.error(`Error updating role for user ID ${id}:`, error);
    return err({ type: "database_error", error });
  }
};

type ChangePasswordServiceError =
  | { type: "user_not_found" }
  | { type: "invalid_current_password" }
  | { type: "hashing_error" }
  | { type: "database_error" };

export const changeUserPassword = async (
  c: Context<{ Variables: AppVariables }>,
  currentPassword: string,
  newPassword: string,
): Promise<AppResult<void, ChangePasswordServiceError>> => {
  const dbInstance = c.get("db");
  const userId = getUsuarioAutenticado(c).id;

  try {
    const [user] = await dbInstance
      .select({
        id: Users.id,
        passwordHash: Users.passwordHash,
      })
      .from(Users)
      .where(eq(Users.id, userId))
      .limit(1);

    if (!user) {
      return err({ type: "user_not_found" });
    }

    const passwordIsValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );
    if (!passwordIsValid) {
      return err({ type: "invalid_current_password" });
    }

    let newPasswordHash: string;
    try {
      newPasswordHash = await bcrypt.hash(newPassword, 10);
    } catch (hashError) {
      console.error(
        "Password hashing failed during password change:",
        hashError,
      );
      return err({ type: "hashing_error" });
    }

    await dbInstance
      .update(Users)
      .set({
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      })
      .where(eq(Users.id, userId));

    return ok(undefined);
  } catch (error) {
    console.error("Error changing user password:", error);
    return err({ type: "database_error" });
  }
};
