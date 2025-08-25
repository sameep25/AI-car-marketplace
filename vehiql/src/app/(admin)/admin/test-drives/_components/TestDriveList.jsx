"use client";
import { getAdminTestDrives, updateTestDriveStatus } from "@/actions/admin";
import { deleteTestDrive } from "@/actions/test-drive";
import React, { useEffect, useState } from "react";
import useFetch from "../../../../../../hooks/use-fetch";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Search, Loader2, CalendarRange, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TestDriveCard from "@/components/TestDriveCard";
import { toast } from "sonner";

const TestDriveList = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Custom hooks for API calls
  const {
    loading: getTestDriveLoading,
    fn: getTestDriveFn,
    data: getTestDriveResult,
    error: getTestDriveError,
  } = useFetch(getAdminTestDrives);
  const {
    loading: updateTestDriveLoading,
    fn: updateTestDriveFn,
    data: updateTestDriveResult,
    error: updateTestDriveError,
  } = useFetch(updateTestDriveStatus);
  const {
    loading: deleteTestDriveLoading,
    fn: deleteTestDriveFn,
    data: deleteTestDriveResult,
    error: deleteTestDriveError,
  } = useFetch(deleteTestDrive);

  // get test drives
  useEffect(() => {
    if (statusFilter === "all") {
      setStatusFilter("");
      return;
    }
    getTestDriveFn({ search, status: statusFilter });
  }, [search, statusFilter]);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    await getTestDriveFn({ search, status: statusFilter });
  };

  // Handle booking cancellation
  const handleCancel = async (bookingId) => {
    await deleteTestDriveFn(bookingId);
  };

  // Handle status update
  const handleUpdateStatus = async (bookingId, newStatus) => {
    if (newStatus) {
      await updateTestDriveFn({ bookingId, newStatus });
    }
  };

  // Handle errors
  useEffect(() => {
    if (getTestDriveError) {
      toast.error("Failed to load test drives");
    }
    if (updateTestDriveError) {
      toast.error("Failed to update test drive status");
    }
    if (deleteTestDriveError) {
      toast.error("Failed to cancel test drive");
    }
  }, [getTestDriveError, updateTestDriveError, deleteTestDriveError]);

  // Handle successful operations
  useEffect(() => {
    if (updateTestDriveResult?.success) {
      toast.success("Test drive status updated successfully");
      getTestDriveFn({ search, status: statusFilter });
    }
    if (deleteTestDriveResult?.success) {
      toast.success("Test drive cancelled successfully");
      getTestDriveFn({ search, status: statusFilter });
    }
  }, [updateTestDriveResult, deleteTestDriveResult]);

  return (
    <div className="space-y-4 ">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
            className="w-full sm:w-48"
          >
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="NO_SHOW">No Show</SelectItem>
            </SelectContent>
          </Select>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex w-full">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search by car or customer..."
                className="pl-9 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="submit" className="ml-2">
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Test Drives List */}
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarRange className="h-5 w-5" />
            Test Drive Bookings
          </CardTitle>
          <CardDescription>
            Manage all test drive reservations and update their status
          </CardDescription>
        </CardHeader>

        <CardContent>
          {getTestDriveLoading && !getTestDriveResult ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : getTestDriveError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load test drives. Please try again.
              </AlertDescription>
            </Alert>
          ) : getTestDriveResult?.data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <CalendarRange className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No test drives found
              </h3>
              <p className="text-gray-500 mb-4">
                {statusFilter || search
                  ? "No test drives match your search criteria"
                  : "There are no test drive bookings yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {getTestDriveResult?.data?.map((booking) => (
                <div key={booking.id} className="relative">
                  <TestDriveCard
                    booking={booking}
                    onCancel={handleCancel}
                    showActions={["PENDING", "CONFIRMED"].includes(
                      booking.status
                    )}
                    isAdmin={true}
                    isCancelling={deleteTestDriveLoading}
                    cancelError={deleteTestDriveError}
                    renderStatusSelector={() => (
                      <Select
                        value={booking.status}
                        onValueChange={(value) =>
                          handleUpdateStatus(booking.id, value)
                        }
                        disabled={updateTestDriveLoading}
                      >
                        <SelectTrigger className="w-full h-8">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          <SelectItem value="NO_SHOW">No Show</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestDriveList;
