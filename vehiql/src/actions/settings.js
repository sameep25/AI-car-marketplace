"use server";

import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getDealershipInfo() {
  try {
    // check if user is authorizsed
    const user = await getAuthenticatedUser();

    // Get the dealership record
    let dealership = await db.DealershipInfo.findFirst({
      include: {
        workingHours: {
          orderBy: {
            dayOfWeek: "asc",
          },
        },
      },
    });
    console.log(dealership);

    // If no dealership exists, create a default one
    if (!dealership) {
      dealership = await db.dealershipInfo.create({
        data: {
          // Default values will be used from schema
          workingHours: {
            create: [
              {
                dayOfWeek: "MONDAY",
                openTime: "09:00",
                closeTime: "18:00",
                isOpen: true,
              },
              {
                dayOfWeek: "TUESDAY",
                openTime: "09:00",
                closeTime: "18:00",
                isOpen: true,
              },
              {
                dayOfWeek: "WEDNESDAY",
                openTime: "09:00",
                closeTime: "18:00",
                isOpen: true,
              },
              {
                dayOfWeek: "THURSDAY",
                openTime: "09:00",
                closeTime: "18:00",
                isOpen: true,
              },
              {
                dayOfWeek: "FRIDAY",
                openTime: "09:00",
                closeTime: "18:00",
                isOpen: true,
              },
              {
                dayOfWeek: "SATURDAY",
                openTime: "10:00",
                closeTime: "16:00",
                isOpen: true,
              },
              {
                dayOfWeek: "SUNDAY",
                openTime: "10:00",
                closeTime: "16:00",
                isOpen: false,
              },
            ],
          },
        },
        include: {
          workingHours: {
            orderBy: {
              dayOfWeek: "asc",
            },
          },
        },
      });
    }

    // Format the data
    return {
      success: true,
      data: {
        ...dealership,
        createdAt: dealership.createdAt.toISOString(),
        updatedAt: dealership.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error(
      `Error in getDealerShipInfo server action -> ${error.message}`
    );
    return {
      success: false,
    };
  }
}

export async function saveWorkingHours() {
  try {
    // check if user is authorizsed
    const user = await getAuthenticatedUser();
    if (user.role !== "ADMIN") {
      throw new Error("Unauthorized : Admin access required");
    }

    // Get current dealership info
    const dealership = await db.dealershipInfo.findFirst();
    if (!dealership) {
      throw new Error("Dealership info not found");
    }

    //update dealership hours-first deleteexisting hours
    await db.workingHour.deleteMany({
      where: { dealershipId: dealership.id },
    });

    // Then create new hours
    for (const hour of workingHours) {
      await db.workingHour.create({
        data: {
          dayOfWeek: hour.dayOfWeek,
          openTime: hour.openTime,
          closeTime: hour.closeTime,
          isOpen: hour.isOpen,
          dealershipId: dealership.id,
        },
      });
    }

    revalidatePath("/admin/settings");
    revalidatePath("/");

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      `Error in saveWorkingHours server action -> ${error.message}`
    );
    return {
      success: false,
    };
  }
}

export async function getUsers() {
  try {
    const user = getAuthenticatedUser();
    if (user.role !== "ADMIN") {
      throw new Error("Unauthorized : Admin access required");
    }

    // get all users
    const users = db.User.findMany({
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: users.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error(`Error in getUsers server action -> ${error.message}`);
    return {
      success: false,
    };
  }
}

export async function updateUserRole(userId, role) {
  try {
    const user = getAuthenticatedUser();
    if (user.role !== "ADMIN") {
      throw new Error("Unauthorised : Admin access required");
    }

    await db.User.update({
      where: { id: userId },
      data: { role },
    });

    revalidatePath("/");
    return {
      success: true,
    };
  } catch (error) {
    console.error(`Error in updateUserRole server action ${error.message}`);
  }
}
