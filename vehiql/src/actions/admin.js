// server actions -> bascially API calls
// All the admin related APIs

"use server";

import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";
import { serializedCarsData } from "@/lib/helper";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

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

export async function getAdminTestDrives({ search = "", status = "" }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) throw new Error("User not found");

    if (user.role !== "ADMIN") throw new Error("Unauthoirzed access");

    let where = {};
    if (status) {
      where.status = status;
    }

    // Add search filter
    if (search) {
      where.OR = [
        {
          car: {
            OR: [
              { make: { contains: search, mode: "insensitive" } },
              { model: { contains: search, mode: "insensitive" } },
            ],
          },
        },
        {
          user: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    const bookings = await db.TestDriveBooking.findMany({
      where,
      include: {
        car: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
            phone: true,
          },
        },
      },
      orderBy: [{ bookingDate: "desc" }, { startTime: "asc" }],
    });

    // Format the bookings
    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      carId: booking.carId,
      car: serializedCarsData(booking.car),
      userId: booking.userId,
      user: booking.user,
      bookingDate: booking.bookingDate.toISOString(),
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      notes: booking.notes,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    }));

    return {
      success: true,
      data: formattedBookings,
    };
  } catch (error) {
    console.error("Error while calling getAdminTestDrive ->" + error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function updateTestDriveStatus({ bookingId, newStatus }) {
  try {
    console.log(bookingId);
    const user = await getAuthenticatedUser();
    if (!user) throw new Error("User not found");

    if (user.role !== "ADMIN") throw new Error("Unauthoirzed access");

    // get the booking
    const booking = await db.TestDriveBooking.findUnique({
      where: { id: bookingId },
    });

    // throw error if booking is not found
    if (!booking) throw new Error("Booking not found");

    // check if the new-status is valid
    const validStatus = [
      "PENDING",
      "CONFIRMED",
      "COMPLETED",
      "NO_SHOW",
      "CANCELLED",
    ];
    if (!validStatus.includes(newStatus)) {
      return {
        success: false,
        error: "Invalid status",
      };
    }

    // update the status of test drive booking
    await db.TestDriveBooking.update({
      where: { id: bookingId },
      data: { status: newStatus },
    });

    revalidatePath("/admin/test-drives");
    revalidatePath("/reservations");

    return {
      success: true,
      message: "Test Drives status is successfully updated",
    };
  } catch (error) {
    console.error(
      "Error while calling updateTestDriveStatus ->" + error.message
    );
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getDashboardData() {
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized access",
      };
    }

    // ==================================================================================================
    // get cars count-----------------------------------------------------------------------------

    // const totalCars = await db.Cars.count();
    // const availableCars = await db.Cars.count({
    //   where: { status: "AVAILABLE" },
    // });
    // const soldCars = await db.Cars.count({
    //   where: { status: "SOLD" },
    // });
    // const unavailableCars = await db.Cars.count({
    //   where: { status: "UNAVAILABLE" },
    // });
    // const featuredCars = await db.Cars.count({
    //   where: { featured: true },
    // });

    // Test drives statistics----------------------------------------------------------------------

    // const totalTestDrives = await db.TestDriveBooking.count();
    // const pendingTestDrives = await db.TestDriveBooking.count({
    //   where: { status: "PENDING" },
    // });
    // const confirmedTestDrives = await db.TestDriveBooking.count({
    //   where: { status: "CONFIRMED" },
    // });
    // const completedTestDrives = await db.TestDriveBooking.count({
    //   where: { status: "COMPLETED" },
    // });
    // const cancelledTestDrives = await db.TestDriveBooking.count({
    //   where: { status: "CANCELLED" },
    // });
    // const noShowTestDrives = await db.TestDriveBooking.count({
    //   where: { status: "NO_SHOW" },
    // });

    // calculate test drive conversion rate(completed test drives that led to sales)----------------

    // const completedTestDrivesCarIds = await db.TestDriveBooking.findMany({
    //   where: { status: "COMPLETED" },
    //   select: { carId: true },
    // });
    // const soldCarsAfterTestDrives = await db.Car.count({
    //   where: {
    //     id: { in: completedTestDrivesCarIds.map((item) => item.carId) },
    //     status: "SOLD",
    //   },
    // });

    // const convertionRate =
    //   completedTestDrives > 0
    //     ? (soldCarsAfterTestDrives / completedTestDrives) * 100
    //     : 0;

    // =================================================================================================

    // Fetch all necessary data in single operation
    const [cars, testDrives] = await Promise.all([
      // get all cars with minimal field
      db.Car.findMany({
        select: {
          id: true,
          status: true,
          featured: true,
        },
      }),

      // Get all test drives with minimal fields
      db.TestDriveBooking.findMany({
        select: {
          id: true,
          status: true,
          carId: true,
        },
      }),
    ]);

    // calculate car statistics
    const totalCars = cars.length;
    const availableCars = cars.filter(
      (car) => car.status === "AVAILABLE"
    ).length;
    const unavailableCars = cars.filter(
      (car) => car.status === "UNAVAILABLE"
    ).length;
    const soldCars = cars.filter((car) => car.status === "SOLD").length;
    const featuredCars = cars.filter((car) => car.status === "FEATURED").length;

    // calculate test-drives statistics
    const totalTestDrives = testDrives.length;
    const pendingTestDrives = testDrives.filter(
      (testDrive) => testDrive.status === "PENDING"
    ).length;
    const confirmedTestDrives = testDrives.filter(
      (testDrive) => testDrive.status === "CONFIRMED"
    ).length;
    const completedTestDrives = testDrives.filter(
      (testDrive) => testDrive.status === "COMPLETED"
    ).length;
    const cancelledTestDrives = testDrives.filter(
      (testDrive) => testDrive.status === "CANCELLED"
    ).length;
    const noShowTestDrives = testDrives.filter(
      (testDrive) => testDrive.status === "NO_SHOW"
    ).length;

    // calculate test drive conversion rate
    const completedTestDrivesCarIds = testDrives
      .filter((td) => td.status === "COMPLETED")
      .map((td) => td.carId);

    const soldCarsAfterTestDrive = cars.filter(
      (car) =>
        car.status === "SOLD" && completedTestDrivesCarIds.includes(car.id)
    ).length;

    const conversionRate =
      completedTestDrives > 0
        ? (soldCarsAfterTestDrive / completedTestDrives) * 100
        : 0;

    return {
      success: true,
      data: {
        cars: {
          total: totalCars,
          available: availableCars,
          sold: soldCars,
          unavailable: unavailableCars,
          featured: featuredCars,
        },
        testDrives: {
          total: totalTestDrives,
          pending: pendingTestDrives,
          confirmed: confirmedTestDrives,
          completed: completedTestDrives,
          cancelled: cancelledTestDrives,
          noShow: noShowTestDrives,
          conversionRate: parseFloat(conversionRate.toFixed(2)),
        },
      },
    };
  } catch (error) {
    console.error(
      "Error while calling the getDashboardData server action : ",
      error.message
    );
    return {
      success: false,
      error: error,
    };
  }
}
