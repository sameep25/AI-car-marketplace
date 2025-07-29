"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CarIcon,
  Edit,
  Loader2,
  Plus,
  Search,
  Star,
  StarOff,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { React, useEffect, useState } from "react";

import useFetch from "../../../../../../hooks/use-fetch";
import { deleteCars, getCars, updateCarStatus } from "@/actions/cars";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { formatCurrency } from "@/lib/helper";
import { Badge } from "@/components/ui/badge";
const CarList = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  // getCars
  const {
    loading: getCarsLoading,
    fn: getCarFn,
    data: getCarsData,
    error: getCarsError,
  } = useFetch(getCars);

  // update car
  const {
    loading: updateCarLoading,
    fn: updateCarFn,
    data: updatedCarData,
    error: updatedCarsError,
  } = useFetch(updateCarStatus);

  // delete cars
  const {
    loading: deleteCarLoading,
    fn: deleteCarFn,
    data: deletedCarData,
    error: deleteCarError,
  } = useFetch(deleteCars);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    //api call
  };

  // cuatom badges for car availability
  const getStatusBadge = (status) => {
    switch (status) {
      case "AVAILABLE":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 ">
            Available
          </Badge>
        );
      case "UNAVAILABLE":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 ">
            Unavailable
          </Badge>
        );
      case "SOLD":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 ">
            Sold
          </Badge>
        );
    }
  };

  // handling status update
  const handleToggleFeatured = async (car) => {
    await updateCarFn(car.id, { featured: !car.featured });
  };

  useEffect(() => {
    getCarFn(searchTerm);
  }, [searchTerm]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Add car page */}
        <Link href="/admin/cars/create">
          <Button className="cursor-pointer">
            <Plus className="h-4 w-4" /> Add Car
          </Button>
        </Link>

        {/* Search Field */}
        <form onSubmit={handleSearchSubmit} className="flex w-full sm:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              type="search"
              placeholder="Search cars..."
              className="pl-9 w-full sm:w-60"
            />
          </div>
        </form>
      </div>

      {/* Cars Table */}
      <Card>
        <CardContent className="p-0">
          {getCarsLoading && !getCarsData ? (
            <div className="flex items-centr justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : getCarsData?.success && getCarsData.data.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead></TableHead>
                    <TableHead>Make & Model</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getCarsData.data.map((car) => {
                    return (
                      <TableRow key={car.id}>
                        <TableCell className="w-10 h-10 rounded-md overflow-hidden">
                          {car.images && car.images.length > 0 ? (
                            // Image
                            <Image
                              src={car.images[0]}
                              alt={`${car.make} ${car.model}`}
                              height={40}
                              width={40}
                              className="w-full h-full object-cover"
                              priority
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <CarIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {car.make} {car.model}
                        </TableCell>
                        <TableCell>{car.year}</TableCell>
                        <TableCell>{formatCurrency(car.price)}</TableCell>
                        <TableCell>{getStatusBadge(car.status)} </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-9 w-9 cursor-pointer"
                            onClick={() => handleToggleFeatured(car)}
                            disabled={updateCarLoading}
                          >
                            {car.featured ? (
                              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                            ) : (
                              <StarOff className="h-5 w-5 text-gray-400" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          {" "}
                          <Edit />{" "}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div></div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CarList;
