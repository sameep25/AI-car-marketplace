"use server";

import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";
import { serializedCarsData } from "@/lib/helper";
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
    console.log(bookingDate);
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

export async function getUserTestDrives() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return;

    const bookings = await db.TestDriveBooking({
      where: { userId: user.id },
      include: { car: true },
      orderBy: { bookingDate: "desc" },
    });

    // Format the bookings
    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      carId: booking.carId,
      car: serializedCarsData(booking.car),
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
    console.error(
      "Error while call getUserTestDrives server action " + error.message
    );
    return {
      success: false,
      error: error.message || "Failed to get Test-Drive info",
    };
  }
}

export async function deleteTestDrive(bookingId) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) throw new Error("User not found");

    // fetch booking details
    const booking = await db.TestDriveBooking.findUnique({
      where: { id: bookingId },
    });

    // retunr if booking not found
    if (!booking)
      return {
        success: false,
        error: "Booking not found",
      };

    //   only admin and user who booked the test drive can delete the booking
    if (booking.userId !== user.id || user.role !== "ADMIN")
      return {
        success: false,
        error: "Unauthorised to cancel this booking",
      };

    // Check the status of the booking
    if (booking.status === "CANCELLED" || booking.status === "COMPLETED")
      return {
        success: false,
        error:
          booking.status === "CANCELLED"
            ? "Booking is already cancelled"
            : "Cannot cancel a completed booking",
      };

    //   update the status of booking in db(delete booking)
    await db.TestDriveBooking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    revalidatePath("/reservations");
    revalidatePath("admin/test-drives");

    return {
      success: true,
      message: "Test-Drive booking cancelled successfully",
    };
  } catch (error) {
    console.error(
      "Error while calling the deleteTestDrive server action" + deleteTestDrive
    );
    return {
      success: false,
      error: error.message || "Unable to delete the Test-Drive | Try Again!",
    };
  }
}
