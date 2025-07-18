// Saving a user in the database

import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    // finding if the cureentUser is present User-table
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    // if a user is found return it otherwise create a new user
    if (loggedInUser) return loggedInUser;

    // user not found so create a newUser
    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name: `${user.firstname} ${user.lastName}`,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
      },
    });
    return newUser;
  } catch (error) {
    console.log(error.message);
  }
};
