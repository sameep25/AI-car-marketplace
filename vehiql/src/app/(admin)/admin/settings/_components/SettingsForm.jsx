"use client";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Shield } from "lucide-react";
import {
  getDealershipInfo,
  getUsers,
  saveWorkingHours,
  updateUserRole,
} from "@/actions/settings";
import WorkingHoursCard from "./WorkingHoursCard";
import useFetch from "../../../../../../hooks/use-fetch";

const SettingsForm = () => {
  // Custom hooks for API calls
  const {
    loading: getDealershipInfoLoading,
    fn: getDealershipInfoFn,
    data: getDealershipInfoData,
    error: getDealershipInfoError,
  } = useFetch(getDealershipInfo);

  const {
    loading: saveWorkingHoursLoading,
    fn: saveWorkingHoursFn,
    data: saveWorkingHoursData,
    error: saveWorkingHoursError,
  } = useFetch(saveWorkingHours);

  const {
    loading: getUsersLoading,
    fn: getUsersFn,
    data: getUsersData,
    error: getUsersError,
  } = useFetch(getUsers);

  const {
    loading: updateUserRoleLoading,
    fn: updateUserRoleFn,
    data: updateUserRoleData,
    error: updateUserRoleError,
  } = useFetch(updateUserRole);

  // Fetch settings and users on component mount
  useEffect(() => {
    getDealershipInfoFn();
    getUsersFn();
  }, [getDealershipInfo, getUsers]);

  return (
    <div>
      <Tabs defaultValue="hours">
        <TabsList>
          <TabsTrigger value="hours">
            <Clock className="h-4 w-4 mr-2" /> Working Hours
          </TabsTrigger>
          <TabsTrigger value="admins">
            <Shield className="h-4 w-4 mr-2" /> Admin Users
          </TabsTrigger>
        </TabsList>
        <TabsContent value="hours" className="space-y-6 mt-6">
          <WorkingHoursCard />
        </TabsContent>
        <TabsContent value="admins" className="space-y-6 mt-6">
          Change your password here.
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsForm;
