"use client";
import { useEffect, useState } from "react";
import { CarIcon, Heart, Loader } from "lucide-react";
import Image from "next/image";
import React from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { useRouter } from "next/navigation";
import { toggleSavedCars } from "@/actions/car-listing";
import useFetch from "../../hooks/use-fetch";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

const CarCard = ({ car }) => {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(car.wishliseted);
  const { isSignedIn } = useAuth();

  // Use the useFetch hook
  const {
    loading: toggleLoading,
    fn: toggleSavedCarFn,
    data: toggleResult,
    error: toggleError,
  } = useFetch(toggleSavedCars);

  // handle success operation
  useEffect(() => {
    if (toggleResult?.success && toggleResult.saved != isSaved) {
      setIsSaved(toggleResult.saved);
      toast.success(toggleResult.message);
    }
  }, [toggleResult, isSaved]);

  // handle error
  useEffect(() => {
    if (toggleError) {
      toast.error("Failed to update favorites");
    }
  }, [toggleError]);

  const handleToggleSave = async (e) => {
    e.preventDefault();

    if (!isSignedIn) {
      toast.error("Please sign in to save cars");
      router.push("/sign-in");
      return;
    }

    await toggleSavedCarFn(car.id);
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl trasition group py-0 shadow-lg bg-[#f8f8f8]">
      {/* Car image */}
      <div className="relative h-48">
        {car.images && car.images.length > 0 ? (
          <div className="relative w-full h-full">
            <Image
              src={car.images[0]}
              alt={`${car.make} ${car.model} `}
              fill
              className="object-cover group-hover:scale-105 trasition duration-300 "
            />
          </div>
        ) : (
          <div className="w-full h-full bg-grey-200 flex items-center justify-center">
            <CarIcon className="h-12 w-12 text-grey-400" />
          </div>
        )}

        {/*  Wishist button */}
        <Button
          onClick={handleToggleSave}
          variant="ghost"
          size="icon"
          className={`absolute top-2 right-2 bg-white/90 rounded-full p-1.5 ${
            isSaved
              ? "text-red-500 hover:text-red-600"
              : "text-gray-500 hover:text-gray-900"
          }  `}
        >
          {toggleLoading ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Heart className={isSaved ? "fill-current" : ""} />
          )}
        </Button>
      </div>

      {/* Card content */}
      <CardContent className="p-4">
        <div className="flex flex-col mb-2">
          <h3 className="text-lg font-bold line-clamp-1">
            {car.make} {car.model}
          </h3>
          <span className="text-xl font-bold text-blue-600">
            ${car.price.toLocaleString()}
          </span>
        </div>

        {/* Car details (badges)etc */}
        <div className="text-gray-600 mb-2 flex items-center ">
          <span>{car.year}</span>
          <span className="mx-2">•</span>
          <span>{car.transmission}</span>
          <span className="mx-2">•</span>
          <span>{car.fuelType}</span>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          <Badge variant="outline" className="bg-gray-50">
            {car.bodyType}
          </Badge>

          <Badge variant="outline" className="bg-gray-50">
            {car.mileage.toLocaleString()} miles
          </Badge>

          <Badge variant="outline" className="bg-gray-50">
            {car.color}
          </Badge>
        </div>

        <div className="flex justify-between">
          <Button
            className="flex-1"
            onClick={() => router.push(`/cars/${car.id}`)}
          >
            View Car
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CarCard;
