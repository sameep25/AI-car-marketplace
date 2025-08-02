import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Clock, Loader2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import useFetch from "../../../../../../hooks/use-fetch";
import {
  getDealershipInfo,
  getUsers,
  saveWorkingHours,
  updateUserRole,
} from "@/actions/settings";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Day names for display
const DAYS = [
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
  { value: "SUNDAY", label: "Sunday" },
];

const WorkingHoursCard = () => {
  //custom hooks to for settings server action
  const {
    loading: saveWorkingHoursLoading,
    fn: saveWorkingHoursFn,
    data: saveWorkingHoursData,
    error: saveWorkingHoursError,
  } = useFetch(saveWorkingHours);

  const {
    loading: getDealershipInfoLoading,
    fn: getDealershipInfoFn,
    data: getDealershipInfoData,
    error: getDealershipInfoError,
  } = useFetch(getDealershipInfo);

  const {
    loading: getUsersLoading,
    fn: getUsersFn,
    data: getUsersData,
    error: getUsersError,
  } = useFetch(getUsers);

  // intiating default working hours
  const [workingHours, setWorkingHours] = useState(
    DAYS.map((day) => ({
      dayOfWeek: day.value,
      openTime: "09:00",
      closeTime: "18:00",
      isOpen: day.value !== "SUNDAY",
    }))
  );
  // Handle working hours change
  const handleWorkingHourChange = (index, field, value) => {
    const updatedHours = [...workingHours];
    updatedHours[index] = {
      ...updatedHours[index],
      [field]: value,
    };
    setWorkingHours(updatedHours);
  };

  const handleSaveHours = async () => {
    await saveWorkingHoursFn(workingHours);
  };

  useEffect(() => {
    if (saveWorkingHoursData?.success) {
      toast.success("Working hours saved successfully");
      getDealershipInfoFn();
    }
  }, [saveWorkingHoursData]);

  useEffect(() => {
    if (getDealershipInfoData?.success && getDealershipInfoData) {
      const dealership = getDealershipInfoData.data;

      if (dealership.workingHours.length > 0) {
        const mappedHours = DAYS.map((day) => {
          // Find mathing working hour
          const hourData = dealership.workingHours.find(
            (h) => h.dayOfWeek === day.value
          );

          if (hourData) {
            return {
              dayOfWeek: hourData.dayOfWeek,
              openTime: hourData.openTime,
              closeTime: hourData.closeTime,
              isOpen: hourData.isOpen,
            };
          }

          // return default value is no working hours is found
          return {
            dayOfWeek: day.value,
            openTime: "09:00",
            closeTime: "18:00",
            isOpen: day.value !== "SUNDAY",
          };
        });

        setWorkingHours(mappedHours);
      }
    }
  }, [getDealershipInfoData]);

  // Fetch settings and users on component mount
  useEffect(() => {
    getDealershipInfoFn();
    getUsersFn();
  }, [getDealershipInfo, getUsers]);

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Working Hours</CardTitle>
          <CardDescription>
            Set your dealership's working hour for each day of the week
          </CardDescription>
        </CardHeader>
        {/* Days and hours setup */}
        <CardContent>
          <div className="space-y-4">
            {DAYS.map((day, index) => {
              return (
                <div
                  key={day.value}
                  className="grid grid-cols-12 gap-4 items-center py-3 px-1 rounded-lg hover:bg-slate-50"
                >
                  {/* Days Label */}
                  <div className="col-span-6 md:col-span-3">
                    <div className="font-medium">{day.label}</div>
                  </div>

                  {/* Checkbox */}
                  <div className="col-span-5 md:col-span-2 flex items-center">
                    <Checkbox
                      id={`is-open-${day.value}`}
                      checked={workingHours[index]?.isOpen}
                      onCheckedChange={(checked) => {
                        handleWorkingHourChange(index, "isOpen", checked);
                      }}
                    />
                    <Label
                      htmlFor={`is-Open-${day.value}`}
                      className="ml-2 cursor-pointer"
                    >
                      {workingHours[index]?.isOpen ? "Open" : "Close"}
                    </Label>
                  </div>

                  {/* Open */}
                  {workingHours[index]?.isOpen && (
                    <>
                      {/* open time */}
                      <div className="col-span-5 md:col-span-3">
                        <div className="flex items-center">
                          <Clock className="hidden md:flex h-4 w-4 text-gray-400 mr-2" />
                          <Input
                            type="time"
                            value={workingHours[index]?.openTime}
                            onChange={(e) =>
                              handleWorkingHourChange(
                                index,
                                "openTime",
                                e.target.value
                              )
                            }
                            className="text-sm"
                          />
                        </div>
                      </div>

                      <div className="text-center col-span-1">to</div>

                      {/* close time */}
                      <div className="col-span-5 md:col-span-3">
                        <div className="flex items-center">
                          <Clock className="hidden md:flex h-4 w-4 text-gray-400 mr-2" />
                          <Input
                            type="time"
                            value={workingHours[index]?.closeTime}
                            onChange={(e) =>
                              handleWorkingHourChange(
                                index,
                                "closeTime",
                                e.target.value
                              )
                            }
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Close all day */}
                  {!workingHours[index]?.isOpen && (
                    <div className="col-span-5 md:col-span-5 text-gray-500 italic text-sm">
                      Closed all day
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
        <CardFooter>
          <div className="mt-6 flex justify-end">
            <Button
              disabled={saveWorkingHoursLoading}
              onClick={handleSaveHours}
            >
              {saveWorkingHoursLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4 " />
                  Save Working Hours
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WorkingHoursCard;
