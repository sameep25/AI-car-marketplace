// server actions -> bascially API calls
// All the cars related APIs

"use server";

import { db } from "@/lib/prisma";
import { createClient } from "@/lib/superbase";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

// function to convert File to Base64
async function fileToBase64(file) {
  const bytes = await file.arrayBuffer(); //Converting the file into a raw binary ArrayBuffer
  const buffer = Buffer.from(bytes); //Converting the ArrayBuffer into a Node.js Buffer
  return buffer.toString("base64"); //Encodes the buffer into a Base64 string
}

// processing the Car image with gemini api
export async function processCarImageWithAI(file) {
  try {
    //check if API key is available
    if (process.env.GEMENI_API_KEY) {
      throw new Error("Gemini API Key is not configured");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMENI_API_KEY);
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
      Analyze this car image and extract the following information:
      1. Make (manufacturer)
      2. Model
      3. Year (approximately)
      4. Color
      5. Body type (SUV, Sedan, Hatchback, etc.)
      6. Mileage
      7. Fuel type (your best guess)
      8. Transmission type (your best guess)
      9. Price (your best guess)
      9. Short Description as to be added to a car listing

      Format your response as a clean JSON object with these fields:
      {
        "make": "",
        "model": "",
        "year": 0000,
        "color": "",
        "price": "",
        "mileage": "",
        "bodyType": "",
        "fuelType": "",
        "transmission": "",
        "description": "",
        "confidence": 0.0
      }

      For confidence, provide a value between 0 and 1 representing how confident you are in your overall identification.
      Only respond with the JSON object, nothing else.
    `;

    const result = await model.generateContent([imagePart, prompt]); // generate a result
    const response = await result.response;
    const text = response.text; // take the text from the response
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim(); // clean the resposne text

    // validate the response and return the final resposnse
    try {
      const carDetails = JSON.parse(cleanedText);
      const requiredFields = [
        "make",
        "model",
        "year",
        "color",
        "price",
        "mileage",
        "bodyType",
        "fuelType",
        "transmission",
        "description",
        "confidence",
      ];

      const missingFields = requiredFields.filter(
        (field) => !(field in carDetails)
      );

      if (missingFields.length > 0) {
        throw new Error(
          `AI response missing required fields : ${missingFields.join(",")}`
        );
      }
      return {
        success: true,
        data: carDetails,
      };
    } catch (error) {
      console.error("Failed to parse AI response", parseError);
      return {
        success: false,
        error: "Failed to parse AI rsponse",
      };
    }
  } catch (error) {
    throw new Error("Gemini API error: " + error.message);
  }
}

// adding the cars data to the db
export async function addCarToDB({ carData, images }) {
  try {
    const { userId } = await auth(); // check if user is loggedin
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      // check if user exists in db
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const carId = uuidv4(); //unique id for cars
    const folderPath = `cars/${carId}`; //intialize a carfolder path in superbase storage

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const imageUrls = [];

    //loop through images
    for (let i = 0; i < images.length; i++) {
      const base64Data = images[i];

      // skip if image data is not valid
      if (!base64Data || !base64Data.startsWith("data:image/")) {
        console.warn("skipping invalid image data");
        continue;
      }

      // extract the base 64 part(remove the data:image/xyz;base64, prefix)
      const base64 = base64Data.split(",")[1];
      const imageBuffer = Buffer.from(base64, "base64");

      //determine image extension from the data URL
      const mimeMatch = base64Data.match(/data:image\/([a-zA-Z0-9]+);/);
      const fileExtenstion = mimeMatch ? mimeMatch[1] : "jpeg";

      // create filename
      const fileName = `image-${Date.now()}-${i}.${fileExtenstion}`;
      const filePath = `${folderPath}/${fileName}`;

      // uploading the images in storage bucket in superbase
      const { data, error } = await supabase.storage
        .from("car-images")
        .upload(filePath, imageBuffer, {
          contentType: `image/${fileExtenstion}`,
        });

      if (error) {
        console.error("Error while uploading the image : ", error);
        throw new Error(`Failed to upload the image : ${error.message}`);
      }

      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/car-images/${filePath}`;
      imageUrls.push(publicUrl);

      // Add the car to the database
      const car = await db.car.create({
        data: {
          id: carId, // Use the same ID we used for the folder
          make: carData.make,
          model: carData.model,
          year: carData.year,
          price: carData.price,
          mileage: carData.mileage,
          color: carData.color,
          fuelType: carData.fuelType,
          transmission: carData.transmission,
          bodyType: carData.bodyType,
          seats: carData.seats,
          description: carData.description,
          status: carData.status,
          featured: carData.featured,
          images: imageUrls, // Store the array of image URLs
        },
      });

      revalidatePath("/admin/cars");

      return {
        success: true,
      };
    }
  } catch (error) {
    throw new Error(`Error : ${error.message}`);
  }
}
