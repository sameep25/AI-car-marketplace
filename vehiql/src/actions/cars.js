// server actions -> bascially API calls
// All the cars related APIs

"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

// function to convert File to Base64
async function fileToBase64(file) {
  const bytes = await file.arrayBuffer(); //Converting the file into a raw binary ArrayBuffer
  const buffer = Buffer.from(bytes); //Converting the ArrayBuffer into a Node.js Buffer
  return buffer.toString("base64"); //Encodes the buffer into a Base64 string
}

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
