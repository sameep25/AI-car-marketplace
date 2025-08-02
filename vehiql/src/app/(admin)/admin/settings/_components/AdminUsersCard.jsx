import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Shield, Users, UserX } from "lucide-react";
import useFetch from "../../../../../../hooks/use-fetch";
import { getUsers, updateUserRole } from "@/actions/settings";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
const AdminUsersCard = () => {
  const [userSearch, setUserSearch] = useState("");
  const [confirmAdminDialog, setConfirmAdminDialog] = useState(false);
  const [userToPromote, setUserToPromote] = useState(null);
  const [confirmRemoveDialog, setConfirmRemoveDialog] = useState(false);
  const [userToDemote, setUserToDemote] = useState(null);

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

  // Fetch users on component mount
  useEffect(() => {
    getUsersFn();
  }, [getUsers]);

  //   find user by searchUser state
  const filteredData = getUsersData?.success
    ? getUsersData?.data.filter(
        (user) =>
          user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
          user.email?.toLowerCase().includes(userSearch.toLowerCase())
      )
    : [];

  // remove admin status
  const handleRemoveAdminUser = async (user) => {
    if (
      confirm(
        `Are you sure want to remove admin privilages from ${
          user.name || user.email
        } ? They will not be able to access Admin Dashboard`
      )
    ) {
      await updateUserRoleFn(user.id, "USER");
    }
  };

  // give admin status
  const handleMakeAdminUser = async (user) => {
    if (
      confirm(
        `Are you sure want to give admin privilages ${
          user.name || user.email
        } ? Admin users can manage all aspects of Dealership`
      )
    ) {
      await updateUserRoleFn(user.id, "ADMIN");
    }
  };

  // handle error
  useEffect(() => {
    if (updateUserRoleError) {
      toast.error(
        `Error while updating User status ${updateUserRoleError.message}`
      );
    }
    if (getUsersError) {
      toast.error(`Error while updating User status ${getUsersError.message}`);
    }
  }, [updateUserRoleError, getUsersError]);

  // handle succes operations
  useEffect(() => {
    if (updateUserRoleData?.success) {
      toast.success(`Successfully updated user status`);
      getUsersFn();
    }
  }, [updateUserRoleData]);

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Admin Users</CardTitle>
          <CardDescription>Manage Users with admin privilages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 relative">
            {/* Serach User */}
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              className="pl-9 w-full"
              type="search"
              placeholder="Serach Users..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />

            {getUsersLoading ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : getUsersData?.success && filteredData.length > 0 ? (
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredData.map((user) => {
                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden relative">
                                {user.imageUrl ? (
                                  <img
                                    src={user.imageUrl}
                                    alt={user.name || "User"}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Users className="h-4 w-4 text-gray-500" />
                                )}
                              </div>
                              <span>{user.name || "Unnamed User"}</span>
                            </div>
                          </TableCell>

                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                user.role === "ADMIN"
                                  ? "bg-green-800"
                                  : "bg-gray-800"
                              }
                            >
                              {user.role}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-right">
                            {user.role === "ADMIN" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600"
                                onClick={() => handleRemoveAdminUser(user)}
                                disabled={updateUserRoleLoading}
                              >
                                {updateUserRoleLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <UserX className="h-4 w-4 mr-2" />
                                    Remove Admin
                                  </>
                                )}
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMakeAdminUser(user)}
                                disabled={updateUserRoleLoading}
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Make Admin
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No Users Found
                </h3>
                <p>
                  {userSearch
                    ? "No users match your criteria"
                    : "There are no users attached here"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsersCard;
