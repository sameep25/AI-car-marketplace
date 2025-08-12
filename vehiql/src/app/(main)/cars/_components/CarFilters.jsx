"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CarFiltersControl from "./CarFiltersControl";

const CarFilters = ({ filters }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  //Get current filter values from searchParams
  const currentMake = searchParmas.get("make") || "";
  const currentBodyType = searchParmas.get("bodyType") || "";
  const currentFuelType = searchParmas.get("fuelType") || "";
  const currentTransmission = searchParmas.get("transmission") || "";
  const currentMinPrice = searchParmas.get("minPrice")
    ? parseInt(searchParmas.get("minPrice"))
    : filters?.data.priceRange.min;
  const currentMaxPrice = searchParmas.get("maxPrice")
    ? parseInt(searchParmas.get("maxPrice"))
    : filters?.data.priceRange.max;
  const currentSortBy = searchParmas.get("sortBy") || "newest";

  // Local state for filters
  const [make, setMake] = useState(currentMake);
  const [bodyType, setBodyType] = useState(currentBodyType);
  const [fuelType, setFuelType] = useState(currentFuelType);
  const [transmission, setTransmission] = useState(currentTransmission);
  const [priceRange, setPriceRange] = useState([
    currentMinPrice,
    currentMaxPrice,
  ]);
  const [sortBy, setSortBy] = useState(currentSortBy);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Update local state when URL parameters change
  useEffect(() => {
    setMake(currentMake);
    setBodyType(currentBodyType);
    setFuelType(currentFuelType);
    setTransmission(currentTransmission);
    setPriceRange([currentMinPrice, currentMaxPrice]);
    setSortBy(currentSortBy);
  }, [
    currentMake,
    currentBodyType,
    currentFuelType,
    currentTransmission,
    currentMinPrice,
    currentMaxPrice,
    currentSortBy,
  ]);

  const activeFilterCount = [
    make,
    bodyType,
    fuelType,
    transmission,
    currentMinPrice > filters.data.priceRange.min ||
      currentMaxPrice < filters.data.priceRange.max,
  ].filter(Boolean).length;

  const currentFilters = {
    make,
    bodyType,
    fuelType,
    transmission,
    priceRange,
    priceRangeMin: filters?.data.priceRange.min,
    priceRangeMax: filters?.data.priceRange.max,
  };

  // handle filter change
  const handleFilterChange = (filterName, value) => {
    switch (filterName) {
      case "make":
        setMake(value);
        break;
      case "fuelType":
        setFuelType(value);
        break;
      case "bodyType":
        setBodyType(value);
        break;
      case "transmission":
        setTransmission(value);
        break;
      case "priceRange":
        setPriceRange(value);
        break;
    }
  };

  // clear filters
  const handleClearFilter = (filterName) => {
    handleFilterChange(filterName, "");
  };

  // clear all filters
  const clearAllfilters = () => {
    setMake("");
    setBodyType("");
    setFuelType("");
    setTransmission("");
    setPriceRange([filters.priceRange.data.min, filters.priceRange.data.max]);
    setSortBy("newest");

    const params = new URLSearchParams();
    const search = searchParmas.get("search");
    if (search) params.set("search", search);

    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;

    router.push(url);
    setIsSheetOpen(false);
  };

  // apply filters
  const applyFilters = () => {
    const params = new URLSearchParams();
    if (make) params.set("make", make);
    if (bodyType) params.set("bodyType", bodyType);
    if (fuelType) params.set("fuelType", fuelType);
    if (transmission) params.set("transmission", transmission);
    if (priceRange[0] > filters.data.priceRange.min) {
      params.set("minPrice", priceRange[0].toString());
    }
    if (priceRange[1] < filters.data.priceRange.min) {
      params.set("minPrice", priceRange[0].toString());
    }

    const search = searchParams.get("search");
    const page = searchParams.get("page");

    if (search) params.set("search", search);
    if (page && page !== "1") params.set("page", page);

    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;

    router.push(url);
    setIsSheetOpen(false);
  };

  return (
    <>
      {/* mobile view */}
      <div className="lg:hidden mb-4">
        <div className="flex items-center">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" /> Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-full sm:max-w-md overflow-y-auto"
            >
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>

              {/* Car filters control */}
              <div className="py-6">
                <CarFiltersControl
                  filters={filters}
                  currentFilters={currentFilters}
                  onFilterChange={handleFilterChange}
                  onClearFilter={handleClearFilter}
                />
              </div>

              {/* Buttons */}
              <SheetFooter className="sm:justify-between flex-row pt-2 border-t space-m-4 mt-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearAllfilters}
                  className="flex-1"
                >
                  Reset
                </Button>
                <Button type="button" onClick={applyFilters} className="flex-1">
                  Show Results
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* sort seletion */}
    </>
  );
};

export default CarFilters;
