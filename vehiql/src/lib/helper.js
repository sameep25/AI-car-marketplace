export const serializedCarsData = (car, wishliseted = "false") => {
  return {
    ...car,
    price: car.price ? parseFloat(cars.price.toString()) : 0,
    createdAt: car.createdAt?.toISOString(),
    updatedAt: car.updatedAt?.toISOString(),
    wishliseted: wishliseted,
  };
};
