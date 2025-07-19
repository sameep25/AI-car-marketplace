// server actions -> bascially API calls
// All the admin related APIs

"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// fetch a admin user from a db through userId
export async function getAdmin() {
  // check is a user is logged in
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // check is user exists in db
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  //   check if user does not exist in db or is not a admin
  if (!user || user.role !== "ADMIN") {
    return {
      authorized: false,
      reason: "not-admin",
    };
  }
  return {
    authorized: true,
    user,
  };
}
