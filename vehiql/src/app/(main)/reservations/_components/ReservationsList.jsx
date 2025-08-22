"use client";

import { deleteTestDrive } from "@/actions/test-drive";
import TestDriveCard from "@/components/TestDriveCard";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import Link from "next/link";
import React from "react";
import useFetch from "../../../../../hooks/use-fetch";

const ReservationsList = ({ initialData }) => {
  const upcomingBooking = initialData?.data?.filter((booking) =>
    ["PENDING", "CONFIRMED"].includes(booking.status)
  );

  const pastBooking = initialData?.data?.filter((booking) =>
    ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(booking.status)
  );

  const {
    loading: deleteLoading,
    fn: deleteFn,
    error: deleteError,
  } = useFetch(deleteTestDrive);

  const handleCancelBooking = async (bookingId) => {
    await deleteFn(bookingId);
  };

  // No reservations
  if (initialData?.data?.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-gray-50">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <Calendar className="h-8 w-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">No Reservations Found</h3>
        <p className="text-gray-500 mb-6 max-w-md">
          You don't have any test drive reservations yet. Browse our cars and
          book a test drive to get started.
        </p>
        <Button variant="default" asChild>
          <Link href="/cars">Browse Cars</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* upcoming test drives */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Upcoming Test Drives</h2>
        {upcomingBooking.length === 0 ? (
          <p className="text-gray-500 italic">No upcoming test-drives</p>
        ) : (
          <div className="space-y-3">
            {upcomingBooking.map((booking) => (
              <TestDriveCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancelBooking}
                isCancelling={deleteLoading}
                showActions
              />
            ))}
          </div>
        )}
      </div>

      {/* past test drives */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Past Test Drives</h2>
        {pastBooking.length === 0 ? (
          <p className="text-gray-500 italic">No Past test-drives</p>
        ) : (
          <div className="space-y-3">
            {pastBooking.map((booking) => (
              <TestDriveCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancelBooking}
                isCancelling={deleteLoading}
                showActions
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationsList;
