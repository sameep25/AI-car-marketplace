"use client";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar, Car, DollarSign, Info, TrendingUp } from "lucide-react";
import OverviewTab from "./OverviewTab";
import TestDriveTab from "./TestDriveTab";

const Dashboard = ({ initialData }) => {
  const { cars, testDrives } = initialData.data;
  const [activeTab, setActiveTab] = useState("overview");

  if (!initialData || !initialData.success) {
    return (
      <Alert variant="destructive">
        <Info className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {initialData?.error || "Failed to load Dashboard"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="testDrives">Test-Drives</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab cars={cars} testDrives={testDrives} />
        </TabsContent>

        <TabsContent value="testDrives">
          <TestDriveTab testDrives={testDrives} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
