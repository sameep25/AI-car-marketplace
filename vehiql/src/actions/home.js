import { serializedCarsData } from "@/lib/helper";
import { db } from "@/lib/prisma";

export async function getFeaturedCars(limit = 3) {
  try {
    const cars = await db.Cars.findMany({
      where: { feature: true, status: "AVAILABLE" },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    if (!cars) {
      throw new Error("No cars found in DB", error);
    }
    const serializedCars = cars.map(serializedCarsData);

    if (!serializedCars) throw new Error("Error in formatting", error);
    return {
      success: true,
      data: serializedCars,
    };
  } catch (error) {
    console.error(`Error in getFeaturedCars server action -> ${error.message}`);
    return {
      success: false,
    };
  }
}
