import { auth } from "@clerk/nextjs/server";
import { db } from "./prisma";

export async function getAuthenticatedUser() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorised User");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    return user;
  } catch (error) {
    console.error(`Error in getAuthenticatedUser helper -> ${error.message}`);
    return {
      success: false,
    };
  }
}
