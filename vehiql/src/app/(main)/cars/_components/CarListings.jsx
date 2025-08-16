"use client";
import { getCarsByFilters } from "@/actions/car-listing";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import useFetch from "../../../../../hooks/use-fetch";
import CarsListingLoading from "./CarsListingLoading";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import CarCard from "@/components/CarCard";
const CarListings = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 6;

  // Extract filter values from searchParams
  const search = searchParams.get("search") || "";
  const make = searchParams.get("make") || "";
  const bodyType = searchParams.get("bodyType") || "";
  const fuelType = searchParams.get("fuelType") || "";
  const transmission = searchParams.get("transmission") || "";
  const minPrice = searchParams.get("minPrice") || 0;
  const maxPrice = searchParams.get("maxPrice") || Number.MAX_SAFE_INTEGER;
  const sortBy = searchParams.get("sortBy") || "newest";
  const page = parseInt(searchParams.get("page") || "1");

  // cuotom hook to fetch cars
  const {
    loading: getCarsLoading,
    fn: fecthCarsFn,
    data: carsData,
    error: fetchCarsError,
  } = useFetch(getCarsByFilters);

  // Fetch cars when filters change
  useEffect(() => {
    fecthCarsFn({
      search,
      make,
      bodyType,
      fuelType,
      transmission,
      minPrice,
      maxPrice,
      sortBy,
      page,
      limit,
    });
  }, [
    search,
    make,
    bodyType,
    fuelType,
    transmission,
    minPrice,
    maxPrice,
    sortBy,
    page,
  ]);

  // Loading skaleton
  if (getCarsLoading && carsData) {
    return <CarsListingLoading />;
  }

  // Error if unable to fect cars data
  if (fetchCarsError || (!carsData && !carsData?.data)) {
    <Alert variant="destructive">
      <Info className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Failed to load cars. Please try again later.
      </AlertDescription>
    </Alert>;
  }

  //
  if (!carsData || !carsData?.data) {
    return null;
  }

  const { data: cars, pagination } = carsData;

  // No results then show
  if (cars.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-gray-50">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <Info className="h-8 w-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">No cars found</h3>
        <p className="text-gray-500 mb-6 max-w-md">
          We couldn't find any cars matching your search criteria. Try adjusting
          your filters or search term.
        </p>
        <Button variant="outline" asChild>
          <Link href="/cars">Clear all filters</Link>
        </Button>
      </div>
    );
  }

  console.log(carsData);
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">
          Showing{" "}
          <span className="font-medium">
            {(page - 1) * limit + 1}-{Math.min(page * limit, pagination.total)}
          </span>{" "}
          of <span className="font-medium">{pagination.total}</span> cars
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
        {cars?.map((car) => {
          return <CarCard key={car.id} car={car} />;
        })}
      </div>
    </div>
  );
};

export default CarListings;
