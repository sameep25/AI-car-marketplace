import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle, Clock } from "lucide-react";

const TestDriveTab = ({ testDrives }) => {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Total */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Test-Drives
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testDrives.total}</div>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testDrives.pending}</div>
            <p className="text-xs text-muted-foreground">
              {((testDrives.pending / testDrives.total) * 100).toFixed(1)}% of
              bookings
            </p>
          </CardContent>
        </Card>

        {/* Confirmed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testDrives.confirmed}</div>
            <p className="text-xs text-muted-foreground">
              {((testDrives.confirmed / testDrives.total) * 100).toFixed(1)}% of
              bookings
            </p>
          </CardContent>
        </Card>

        {/*  completed*/}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testDrives.completed}</div>
            <p className="text-xs text-muted-foreground">
              {((testDrives.completed / testDrives.total) * 100).toFixed(1)}% of
              bookings
            </p>
          </CardContent>
        </Card>

        {/* cancelled */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testDrives.cancelled}</div>
            <p className="text-xs text-muted-foreground">
              {((testDrives.cancelled / testDrives.total) * 100).toFixed(1)}% of
              bookings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Test Drive Statistics */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Test Drive Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-sm mb-2">Conversion Rate</h3>
              <span className="text-3xl font-bold text-blue-600">
                {testDrives.conversionRate} %
              </span>
              <p className="text-sm text-gray-600 mt-1">
                Test Drives resulting in car purcahses
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-sm mb-2">Conversion Rate</h3>
              <span className="text-3xl font-bold text-green-600">
                {(testDrives.completed / testDrives.total) * 100} %
              </span>
              <p className="text-sm text-gray-600 mt-1">
                Test Drives completed successfully
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking status breakdown*/}
      <div className="mt-4 bg-gray-50 p-4 rounded-lg space-y-4">
        <h3 className="font-medium text-sm mb-2"> Booking Status Breakdown</h3>
        {/* pending */}
        <div>
          <div className="flex items-center">
            <div className="w-96/100 bg-gray-200 rounded-full h-2.5 ">
              <div
                className="bg-amber-600 h-2.5 rounded-full"
                style={{
                  width: `${(testDrives.pending / testDrives.total) * 100}%`,
                }}
              ></div>
            </div>
            <span className="ml-2 text-sm pl-2">
              {((testDrives.pending / testDrives.total) * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Pending Test drives</p>
        </div>
        {/* confirmed */}
        <div>
          <div className="flex items-center">
            <div className="w-96/100 bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-600 h-2.5 rounded-full"
                style={{
                  width: `${(testDrives.confirmed / testDrives.total) * 100}%`,
                }}
              ></div>
            </div>
            <span className="ml-2 text-sm pl-2">
              {((testDrives.confirmed / testDrives.total) * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Confirmed Test drives</p>
        </div>
        {/* completed */}
        <div>
          <div className="flex items-center">
            <div className="w-96/100 bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{
                  width: `${(testDrives.completed / testDrives.total) * 100}%`,
                }}
              ></div>
            </div>
            <span className="ml-2 text-sm pl-2">
              {((testDrives.completed / testDrives.total) * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Completed Test drives</p>
        </div>
        {/* Cancelled */}
        <div>
          <div className="flex items-center">
            <div className="w-96/100 bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-red-600 h-2.5 rounded-full"
                style={{
                  width: `${(testDrives.cancelled / testDrives.total) * 100}%`,
                }}
              ></div>
            </div>
            <span className="ml-2 text-sm pl-2">
              {((testDrives.cancelled / testDrives.total) * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Cancelled Test drives</p>
        </div>
        {/* no show */}
        <div>
          <div className="flex items-center">
            <div className="w-96/100 bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-gray-600 h-2.5 rounded-full"
                style={{
                  width: `${(testDrives.noShow / testDrives.total) * 100}%`,
                }}
              ></div>
            </div>
            <span className="ml-2 text-sm pl-2">
              {((testDrives.noShow / testDrives.total) * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">No-show Test drives</p>
        </div>
      </div>
    </>
  );
};

export default TestDriveTab;
