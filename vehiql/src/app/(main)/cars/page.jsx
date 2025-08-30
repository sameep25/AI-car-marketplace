import { getCarFilters } from "@/actions/car-listing";
import React from "react";
import CarFilters from "./_components/CarFilters";
import CarListings from "./_components/CarListings";

export const metaData = {
  title: "Cars | Vehiql",
  description: "Browse and search for your dream car",
};

const CarsPage = async () => {
  const filtersData = await getCarFilters();
  return (
    <div className="container mx-auto px-6 pl-8">
      <h1 className="text-6xl mb-4 gradient-title">Browse Cars</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-80 flex-shrink-0">
          {/* filters */}
          <CarFilters filters={filtersData} />
        </div>

        <div className="flex-1">
          {/* Listings */}
          <CarListings />
        </div>
      </div>
    </div>
  );
};

export default CarsPage;
