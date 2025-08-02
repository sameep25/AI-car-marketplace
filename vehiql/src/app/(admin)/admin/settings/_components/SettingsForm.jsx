"use client";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Shield } from "lucide-react";
import WorkingHoursCard from "./WorkingHoursCard";
import AdminUsersCard from "./AdminUsersCard";

const SettingsForm = () => {
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
          <AdminUsersCard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsForm;
