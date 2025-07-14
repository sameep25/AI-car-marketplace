"use client";

import HomeSearch from "@/components/HomeSearch";
import { Button } from "@/components/ui/button";
import { ChevronRight, Car, Calendar, Shield } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { featuredCars, bodyTypes, carMakes, faqItems } from "@/lib/data";
import CarCard from "@/components/CarCard";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SignedOut } from "@clerk/nextjs";

export default function Home() {
  const router = useRouter();

  return (
    <div className="pt-20 flex flex-col bg-blue-50">
      {/* Hero */}
      <section className="relative py-16 md:py-28 dotted-background">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-8xl mb-4 gradient-title">
              Find your Dream Car with Vehiql AI
            </h1>
            <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto">
              Advanced AI car search and test drive from thousands of vehicles.
            </p>
          </div>

          {/* Search */}
          <HomeSearch />
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-12 px-12 ">
        {/* Headings */}
        <div className="container mx-auto ">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Featured Cars</h2>
            <Button variant="ghost" className="flex items-center" asChild>
              <Link href={`/cars`}>
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Featured Cars Car-card*/}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCars.map((car) => {
            return <CarCard key={car.id} car={car} />;
          })}
        </div>
      </section>

      {/* Browse by makes */}
      <section className="py-12 px-12 bg-blue-50">
        {/* wrapper div */}
        <div className="container mx-auto ">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Featured Cars</h2>
            <Button variant="ghost" className="flex items-center" asChild>
              <Link href={`/cars`}>
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Makes*/}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {carMakes.map((make) => {
            return (
              <Link
                key={make.name}
                href={`/car?make=${make.name}`}
                className="bg-white rounded shadow p-4 text-center hover:shadow-md transition cursor-pointer"
              >
                <div className="h-16 w-auto mx-auto mb-2 relative mb-4">
                  <Image
                    src={make.image}
                    alt={make.name}
                    fill
                    className={{ ObjectFit: "contain" }}
                  />
                </div>
                {/* <h3 className="font-medium">{make.name}</h3> */}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">
            Why choose our platform
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Car className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Wide Selection</h3>
              <p className="text-gray-600">
                Thousands of verified vehicles from trusted dealerships and
                private sellers.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 text-blue-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Easy Test Drive</h3>
              <p className="text-gray-600">
                Book a test drive online in minutes, with flexible scheduling
                options.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 text-blue-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Process</h3>
              <p className="text-gray-600">
                Verified listings and secure booking process for peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* browse by model */}
      <section className="py-12 px-12 bg-blue-50">
        {/* wrapper div */}
        <div className="container mx-auto ">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Featured Models</h2>
            <Button variant="ghost" className="flex items-center" asChild>
              <Link href={`/cars`}>
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* browse models*/}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 ">
          {bodyTypes.map((type) => {
            return (
              <Link
                key={type.name}
                href={`/car?bodyType=${type.name}`}
                className="relative group cursor-pointer bg-gradient-to-t from-black/70 to transparent rounded-lg"
              >
                <div className="overflow-hidden rounded-lg flex justify-end h-38 mb-4 relative ">
                  <Image
                    src={type.image}
                    alt={type.name}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300 "
                  />
                </div>

                <div className="absolute inset-0 rounded-lg flex items-end ">
                  <h3 className="pl-4 pb-2 text-white font-bold ">
                    {type.name}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FAQs */}
      <section className="py-12 px-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold">FAQs</h2>

          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((faq, index) => {
              return (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 dotted-background text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Find Your Dream Car?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who found their perfect
            vehicle through our platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/cars">View All Cars</Link>
            </Button>
            <SignedOut>
              <Button size="lg" asChild>
                <Link href="/sign-up">Sign Up Now</Link>
              </Button>
            </SignedOut>
          </div>
        </div>
      </section>
    </div>
  );
}
