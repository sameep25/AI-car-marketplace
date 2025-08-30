import React from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
const CarFiltersControl = ({
  filters,
  currentFilters,
  onFilterChange,
  onClearFilter,
}) => {
  const { make, bodyType, fuelType, transmission, priceRange } = currentFilters;

  const filterSections = [
    {
      id: "make",
      title: "Make",
      options: filters?.data.makes.map((make) => ({
        value: make,
        label: make,
      })),
      currentValue: make,
      onChange: (value) => onFilterChange("make", value),
    },
    {
      id: "bodyType",
      title: "Body Type",
      options: filters?.data.bodyTypes.map((bodyType) => ({
        value: bodyType,
        label: bodyType,
      })),
      currentValue: bodyType,
      onChange: (value) => onFilterChange("bodyType", value),
    },
    {
      id: "fuelType",
      title: "Fuel Type",
      options: filters?.data.fuelTypes.map((fuelType) => ({
        value: fuelType,
        label: fuelType,
      })),
      currentValue: fuelType,
      onChange: (value) => onFilterChange("fuelType", value),
    },
    {
      id: "transmission",
      title: "Transmission",
      options: filters?.data.transmissions.map((transmission) => ({
        value: transmission,
        label: transmission,
      })),
      currentValue: transmission,
      onChange: (value) => onFilterChange("transmission", value),
    },
  ];

  return (
    <div className="px-4 space-y-4">
      {/* Price Range */}
      <div className="space-y-4 border-b">
        <h3 className="font-medium">Price Range</h3>
        <div className="px-2 space-y-4">
          <Slider
            min={filters.data.priceRange.min}
            max={filters.data.priceRange.max}
            step={100}
            value={priceRange}
            onValueChange={(value) => onFilterChange("priceRange", value)}
          />
          <div className="flex items-center justify-between">
            <div className="font-medium text-sm">$ {priceRange[0]}</div>
            <div className="font-medium text-sm">$ {priceRange[1]}</div>
          </div>
        </div>
      </div>

      {/* filters */}
      {filterSections.map((section) => {
        return (
          <div key={section.id} className="space-y-3">
            {/* Filter title */}
            <h4 className="text-sm font-medium flex justify-between">
              <span>{section.title}</span>
              {section.currentValue && (
                <Button
                  variant="outline"
                  className="text-xs text-gray-600 flex items-center"
                  onClick={() => onClearFilter(section.id)}
                >
                  <X className="mr-1 h-3 w-3" />
                  Clear
                </Button>
              )}
            </h4>

            {/* Filter options */}
            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-1">
              {section.options.map((option) => (
                <Badge
                  key={`${section.id}-${option.value}`}
                  variant={
                    section.currentValue === option.value
                      ? "Default"
                      : "outline"
                  }
                  className={`cursor-pointer px-3 py-1 ${
                    section.currentValue === option.value
                      ? "bg-blue-100 hover:bg-blue-200 text-blue-900 border-blue-200"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => {
                    section.onChange(
                      section.currentValue === option.value ? "" : option.value
                    );
                  }}
                >
                  {option.label}
                  {section.currentValue === option.value && (
                    <Check className="ml-1 h-3 w-3 inline" />
                  )}
                </Badge>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CarFiltersControl;
