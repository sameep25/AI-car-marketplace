"use server";

import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";
import { serializedCarsData } from "@/lib/helper";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// creating filter on the basis of cars in db
export async function getCarFilters() {
  try {
    // get unique makes
    const makes = await db.Car.findMany({
      where: { status: "AVAILABLE" },
      select: { make: true },
      distinct: ["make"],
      orderBy: { make: "asc" },
    });

    // get unique bodyTypes
    const bodyTypes = await db.Car.findMany({
      where: { status: "AVAILABLE" },
      select: { bodyType: true },
      distinct: ["bodyType"],
      orderBy: { bodyType: "asc" },
    });

    // get unique fuelTypes
    const fuelTypes = await db.Car.findMany({
      where: { status: "AVAILABLE" },
      select: { fuelType: true },
      distinct: ["fuelType"],
      orderBy: { fuelType: "asc" },
    });

    // get unique transmissions
    const transmissions = await db.Car.findMany({
      where: { status: "AVAILABLE" },
      select: { transmission: true },
      distinct: ["transmission"],
      orderBy: { transmission: "asc" },
    });

    //   get min and max prices using Prisma Aggregations
    const priceAggregations = await db.Car.aggregate({
      where: { status: "AVAILABLE" },
      _min: { price: true },
      _max: { price: true },
    });

    return {
      success: true,
      data: {
        makes: makes.map((item) => item.make),
        bodyTypes: bodyTypes.map((item) => item.bodyType),
        transmissions: transmissions.map((item) => item.transmission),
        priceRange: {
          min: priceAggregations._min.price
            ? parseFloat(priceAggregations._min.price.toString())
            : 0,
          max: priceAggregations._max.price
            ? parseFloat(priceAggregations._max.price.toString())
            : 100000,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching car filters:", error);
    throw new Error(`Error fetching car filters: ${error.message}`);
  }
}

// fetch cars as per filters
export async function getCarsByFilters({
  search = "",
  make = "",
  bodyType = "",
  fuelType = "",
  transmission = "",
  minPrice = 0,
  maxPrice = Number.MAX_SAFE_INTEGER,
  sortBy = "newest", // Options: newest, priceAsc, priceDesc
  page = 1,
  limit = 6,
}) {
  try {
    const user = getAuthenticatedUser();

    // Build where conditions
    let where = {
      status: "AVAILABLE",
    };

    if (search) {
      where.OR = [
        { make: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (make) where.make = { equals: make, mode: "insensitive" };
    if (bodyType) where.bodyType = { equals: bodyType, mode: "insensitive" };
    if (fuelType) where.fuelType = { equals: fuelType, mode: "insensitive" };
    if (transmission)
      where.transmission = { equals: transmission, mode: "insensitive" };

    // Add price range
    where.price = {
      gte: parseFloat(minPrice) || 0, //gte - price is greater then minPrice
    };

    if (maxPrice && maxPrice < Number.MAX_SAFE_INTEGER) {
      where.price.lte = parseFloat(maxPrice); //lte - price is lower then maxPrice
    }

    const skip = (page - 1) * limit;

    // Determine sort order
    let orderBy = {};
    switch (sortBy) {
      case "priceAsc":
        orderBy = { price: "asc" };
        break;

      case "priceDesc":
        orderBy = { price: "desc" };
        break;

      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    const totalCarsCount = await db.Car.count({ where });

    // execute the main query
    const cars = await db.Car.findMany({
      where,
      take: limit,
      skip,
      orderBy,
    });

    let wishlisted = new Set(); //create a set so cars are not repeated
    if (user) {
      const savedCars = await db.UserSavedCars.findMany({
        where: { userId: user.id },
        select: { carId: true },
      });

      wishlisted = new Set(savedCars.map((saved) => saved.carId));

      const serializedCars = cars.map((car) => {
        serializedCarsData(car, wishlisted.has(car.id));
      });

      return {
        success: true,
        data: serializedCars,
        pagination: {
          total: totalCars,
          page,
          limit,
          pages: Math.ceil(totalCars / limit),
        },
      };
    }
  } catch (error) {
    throw new Error(
      "Error fetchin cars in getCarsByFilters server-action ->",
      error.message
    );
  }
}

export async function toggleSavedCars(carId) {
  try {
    const user = getAuthenticatedUser();

    if (!user) throw new Error("User not found");

    // check if car exits
    const car = await db.Car.findUnique({ where: { id: carId } });
    if (!car) {
      return {
        succes: false,
        error: "Car not found",
      };
    }

    // check if car  is already saved
    const existingCar = await db.UserSavedCar.findUnique({
      where: {
        userId_carId: {
          userId: user.id,
          carId,
        },
      },
    });

    // if   car is already saved ,then remove the car
    if (existingCar) {
      await db.UserSavedCar.delete({
        where: {
          userId_carId: {
            userId: user.id,
            carId,
          },
        },
      });
      revalidatePath(`/saved-cars`);
      return {
        success: true,
        saved: false,
        message: "Car removed from favorites",
      };
    }

    // if car is not saved ,then save the car
    await db.UserSavedCar.create({
      data: {
        userId: user.id,
        carId,
      },
    });
    revalidatePath(`/saved-cars`);
    return {
      success: true,
      saved: true,
      message: "Car added to favorite",
    };
  } catch (error) {
    throw new Error("Error toggling saved cars : " + error.message);
  }
}
