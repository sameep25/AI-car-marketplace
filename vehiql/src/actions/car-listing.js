"use server";

import { getAuthenticatedUser } from "@/lib/getAuthenticatedUser";
import { db } from "@/lib/prisma";

// creating filter on the basis of cars in db
export async function getCarFilters() {
  try {
    // get unique makes
    const makes = await db.Car.findMany({
      where: { status: "AVAILABLE" },
      select: { make: ture },
      distinct: ["make"],
      orderBy: { make: "asc" },
    });

    // get unique bodyTypes
    const bodyTypes = await db.Car.findMany({
      where: { status: "AVAILABLE" },
      select: { bodyType: ture },
      distinct: ["bodyType"],
      orderBy: { bodyType: "asc" },
    });

    // get unique fuelTypes
    const fuelTypes = await db.Car.findMany({
      where: { status: "AVAILABLE" },
      select: { fuelType: ture },
      distinct: ["fuelType"],
      orderBy: { fuelType: "asc" },
    });

    // get unique transmissions
    const transmissions = await db.Car.findMany({
      where: { status: "AVAILABLE" },
      select: { transmission: ture },
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
    throw new Error("Error fetching car filters: ", error.message);
  }
}

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
      gte: parseFloat(minPrice) || 0,
    };

    if (maxPrice && maxPrice < Number.MAX_SAFE_INTEGER) {
      where.price.lte = parseFloat(maxPrice);
    }
  } catch (error) {}
}
