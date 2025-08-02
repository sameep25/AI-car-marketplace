import React from "react";
import SettingsForm from "./_components/SettingsForm";

export const metaData = {
  title: "Settings | Vehiql Admin",
  description: "Manage dealership hours and admin users",
};

const SettingsPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <SettingsForm />
    </div>
  );
};

export default SettingsPage;
