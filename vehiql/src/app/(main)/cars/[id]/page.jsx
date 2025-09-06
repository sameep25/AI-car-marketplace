import { getCarById } from "@/actions/cars";
import NotFound from "@/app/not-found";
import CarDetails from "./_components/CarDetails";

export async function generateMetaData({ params }) {
  const { id } = await params;
  const result = await getCarById(id);

  if (!result.success) {
    return {
      title: "Car not found | Vehiql",
      description: "The requested car cound not be found",
    };
  }

  const car = result.data;

  return {
    title: `${car.year} ${car.make} ${car.model} | Vehiql`,
    description: car.description.substring(0, 160),
    openGraph: {
      images: car.images?.[0] ? [car.images[0]] : [],
    },
  };
}

const CarPage = async ({ params }) => {
  // Fetch car details
  const { id } = await params;
  const result = await getCarById(id);

  // If car not found, show 404
  if (!result.success) {
    NotFound();
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <CarDetails
        car={result.data}
        testDriveInfo={result?.data.testDriveInfo}
        user={result?.user}
      />
    </div>
  );
};

export default CarPage;
