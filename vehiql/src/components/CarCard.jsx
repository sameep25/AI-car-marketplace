"use client";
import { useState } from "react";
import { CarIcon, Heart } from "lucide-react";
import Image from "next/image";
import React from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { useRouter } from "next/navigation";

const CarCard = ({ car }) => {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(car.wishlisted);

  const handleToggleSave = () => {
    setIsSaved(!isSaved);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg trasition group py-0">
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
          <Heart className={isSaved ? "fill-current" : ""} />
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
