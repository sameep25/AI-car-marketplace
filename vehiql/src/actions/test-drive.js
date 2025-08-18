"use server";

import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function bookTestDrive({
  carId,
  bookingDate,
  startTime,
  endTime,
  notes,
}) {
  try {
    // check user exist in db
    const user = await getAuthenticatedUser();
    if (!user) throw new Error("User not found");

    // check car exist in db
    const car = await db.Car.findUnique({
      where: { id: carId, status: "AVAILABLE" },
    });
    if (!car) throw new Error("Car is not available for test-drive");

    // check if a booking already exits
    const existingBooking = await db.TestDriveBooking.findFirst({
      where: {
        carId,
        bookingDate: new Date(bookingDate),
        startTime,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (existingBooking)
      throw new Error(
        "This time slot is already booked. Please select another time"
      );

    //   create  new booking in db
    const booking = await db.TestDriveBooking.create({
      data: {
        carId,
        userId: user.id,
        bookingDate: new Date(bookingDate),
        startTime,
        endTime,
        notes: notes || null,
        status: "PENDING",
      },
    });

    revalidatePath(`/test-drive/${carId}`);
    revalidatePath(`/cars/${carId}`);

    return {
      success: true,
      data: booking,
    };
  } catch (error) {
    console.error(
      "Error while calling the bookTestDrive server action ->" + error.message
    );
    return {
      success: false,
      error: error.message || "Failed to book the test drive",
    };
  }
}
