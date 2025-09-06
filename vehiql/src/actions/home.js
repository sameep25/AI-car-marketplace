"use server";

import aj from "@/lib/arcjet";
import { serializedCarsData } from "@/lib/helper";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Function to convert File to base64
async function fileToBase64(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return buffer.toString("base64");
}

export async function getFeaturedCars(limit = 4) {
  try {
    const cars = await db.Car.findMany({
      where: {
        featured: true,
        status: "AVAILABLE",
      },
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

export async function processAiImageSearch(file) {
  try {
    // // rate limitin gwith arcjet
    // const req = await request();
    // const decision = await aj.protect(req, { requested: 1 });

    // if (decision.isDenied()) {
    //   if (decision.reason.isRateLimit()) {
    //     const { remaining, reset } = decision.reason;

    //     console.error({
    //       code: "RATE_LIMIT_EXCEEDEED",
    //       details: {
    //         remaining,
    //         resetInSeconds: reset,
    //       },
    //     });
    //     throw new Error("Too many requests. Please try again later");
    //   }
    //   throw new Error("Request Blocked");
    // }

    //check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API Key is not configured");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // converting the image into base64 string
    const base64Image = await fileToBase64(file);

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: file.type,
      },
    };

    // Define the prompt for car detail extraction
    const prompt = `
      Analyze this car image and extract the following information for a search query:
      1. Make (manufacturer)
      2. Body type (SUV, Sedan, Hatchback, etc.)
      3. Color

      Format your response as a clean JSON object with these fields:
      {
        "make": "",
        "bodyType": "",
        "color": "",
        "confidence": 0.0
      }

      For confidence, provide a value between 0 and 1 representing how confident you are in your overall identification.
      Only respond with the JSON object, nothing else.
      `;

    const result = await model.generateContent([imagePart, prompt]); // generate a result
    const response = result.response;
    const text = response.text(); // take the text from the response
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim(); // clean the resposne text

    try {
      const carDetails = JSON.parse(cleanedText);
      return {
        success: true,
        data: carDetails,
      };
    } catch (error) {}
  } catch (error) {
    throw new Error("Ai Search error : " + error.message);
  }
}
