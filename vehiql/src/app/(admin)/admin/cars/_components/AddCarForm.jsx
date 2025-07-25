"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Camera, ImagePlus, Loader2, X, Upload, Loader } from "lucide-react";
import { useDropzone } from "react-dropzone";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { addCarToDB, processCarImageWithAI } from "@/actions/cars";

import Image from "next/image";
import useFetch from "../../../../../../hooks/use-fetch";
// Predefined options
const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid"];
const transmissions = ["Automatic", "Manual", "Semi-Automatic"];
const bodyTypes = [
  "SUV",
  "Sedan",
  "Hatchback",
  "Convertible",
  "Coupe",
  "Wagon",
  "Pickup",
];
const carStatuses = ["AVAILABLE", "UNAVAILABLE", "SOLD"];

const AddCarForm = () => {
  // Define form schema with Zod
  const carFormSchema = z.object({
    make: z.string().min(1, "Make is required"),
    model: z.string().min(1, "Model is required"),
    year: z.string().refine((val) => {
      const year = parseInt(val);
      return (
        !isNaN(year) && year >= 1900 && year <= new Date().getFullYear() + 1
      );
    }, "Valid year required"),
    price: z.string().min(1, "Price is required"),
    mileage: z.string().min(1, "Mileage is required"),
    color: z.string().min(1, "Color is required"),
    fuelType: z.string().min(1, "Fuel type is required"),
    transmission: z.string().min(1, "Transmission is required"),
    bodyType: z.string().min(1, "Body type is required"),
    seats: z.string().optional(),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    status: z.enum(["AVAILABLE", "UNAVAILABLE", "SOLD"]),
    featured: z.boolean().default(false),
    // Images are handled separately
  });

  const {
    register,
    setValue,
    getValues,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      make: "",
      model: "",
      year: "",
      price: "",
      mileage: "",
      color: "",
      fuelType: "",
      transmission: "",
      bodyType: "",
      seats: "",
      description: "",
      status: "AVAILABLE",
      featured: false,
    },
  });

  const [activeTab, setActiveTab] = useState("ai");
  const [imageError, setImageError] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);

  const [aiImagePreview, setAiImagePreview] = useState(null);
  const [uploadedAiImage, setUploadedAiImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const router = useRouter();

  // initializeing the custom UseFetch hook to add car in db
  const {
    data: addCarResult,
    loading: addCarLoading,
    fn: addCarFn,
  } = useFetch(addCarToDB);

  // check if the car is added or not
  useEffect(() => {
    if (addCarResult?.success) {
      toast.success("Car added successfully");
      router.push("/admin/cars");
    }
  }, [addCarResult]);

  // handle form submit
  const onSubmitForm = async (data) => {
    if (uploadedImages.length === 0) {
      setImageError("Please upload atleast one image");
      return;
    }
    console.log(data);

    //restructure the carData
    const carData = {
      ...data,
      year: parseInt(data.year),
      price: parseInt(data.price),
      mileage: parseInt(data.mileage),
      seats: data.seats ? parseInt(data.seats) : null,
    };

    await addCarFn({ carData, images: uploadedImages }); //from useFetch
  };

  // multi-image dropbox logic
  const onMultiImagesDrop = (acceptedFiles) => {
    // filter the images by file size
    const validFiles = acceptedFiles.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB and will be skipped`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const newImages = []; //store images here

    // loop through each file and store it in reader
    validFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        // image
        newImages.push(e.target.result);
        if (newImages.length === validFiles.length) {
          setUploadedImages((prev) => [...prev, ...newImages]);
          setImageError("");
          toast.success(`Successfully uploaded ${newImages.length} images`);
        }
      };
      reader.readAsDataURL(file);
    });
  };
  // multi-image dropzone
  const {
    getRootProps: getMultiImageRootProps,
    getInputProps: getMultiImageInputProps,
  } = useDropzone({
    onDrop: onMultiImagesDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    multiple: true,
  });

  //removing the image from the uploaded images list
  const removeImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i != index));
  };

  // ai-image dropbox logic
  const onAiImageDrop = (acceptedFiles) => {
    // Do something with the files
    const file = acceptedFiles[0];

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be lesser than 5MB");
      return;
    }

    setUploadedAiImage(file);
    const reader = new FileReader();
    reader.onloadend = (e) => {
      // image
      setAiImagePreview(e.target.result);
      toast.success("Image uploaded successfully");
    };

    reader.readAsDataURL(file);
  };
  // ai-image dropzone
  const {
    getRootProps: getAiImageRootProps,
    getInputProps: getAiImageInputProps,
  } = useDropzone({
    onDrop: onAiImageDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
    multiple: false,
  });

  // initializeing the custom UseFetch hook to processCarImageWithAI
  const {
    loading: processAiIamgeLoading,
    fn: processAiImageFn,
    data: processAiImageResult,
    error: processAiImageError,
  } = useFetch(processCarImageWithAI);

  // handle image process by AI
  const processImageWithAi = async () => {
    if (!uploadedAiImage) {
      toast.error("Please upload an image first");
      return;
    }

    await processAiImageFn(uploadedAiImage);
  };

  // check if there is a error while processing image with AI
  useEffect(() => {
    if (processAiImageError) {
      toast.error(processAiImageError.message || "Failed to uploadcar");
    }
  }, [processAiImageError]);

  // check if the image is processed bt Ai
  useEffect(() => {
    if (processAiImageResult?.success) {
      const carDetails = processAiImageResult.data;

      // Update form with AI results
      setValue("make", carDetails.make);
      setValue("model", carDetails.model);
      setValue("year", carDetails.year.toString());
      setValue("color", carDetails.color);
      setValue("bodyType", carDetails.bodyType);
      setValue("fuelType", carDetails.fuelType);
      setValue("price", carDetails.price);
      setValue("mileage", carDetails.mileage);
      setValue("transmission", carDetails.transmission);
      setValue("description", carDetails.description);

      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImages((prev) => [...prev, e.target.result]);
      };
      if (uploadedImages.length > 0) {
        reader.readAsDataURL(uploadedAiImage);
      }

      toast.success("Successfully extracted car details", {
        description: `Detected ${carDetails.year} ${carDetails.make} ${
          carDetails.model
        } with ${Math.round(carDetails.confidence * 100)}%  confidence`,
      });
      setActiveTab("manual");
    }
  }, [processAiImageResult, uploadedAiImage]);

  return (
    <div>
      <Tabs
        defaultValue="ai"
        className="mt-6"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="ai">Ai Upload</TabsTrigger>
        </TabsList>

        {/* manual form */}
        <TabsContent value="manual" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Car Details</CardTitle>
              <CardDescription>
                Enter the details of the car you want to add.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
                {/* form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Make */}
                  <div className="space-y-2">
                    <Label htmlFor="make">Make</Label>
                    <Input
                      id="make"
                      {...register("make")}
                      placeholder="e.g. Toyota"
                      className={errors.make ? "border-red-500" : ""}
                    />
                    {errors.make && (
                      <p className="text-xs text-red-500">
                        {errors.make.message}
                      </p>
                    )}
                  </div>

                  {/* Model */}
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      {...register("model")}
                      placeholder="e.g. Camry"
                      className={errors.model ? "border-red-500" : ""}
                    />
                    {errors.model && (
                      <p className="text-xs text-red-500">
                        {errors.model.message}
                      </p>
                    )}
                  </div>

                  {/* Year */}
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      {...register("year")}
                      placeholder="e.g. 2022"
                      className={errors.year ? "border-red-500" : ""}
                    />
                    {errors.year && (
                      <p className="text-xs text-red-500">
                        {errors.year.message}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      {...register("price")}
                      placeholder="e.g. 25000"
                      className={errors.price ? "border-red-500" : ""}
                    />
                    {errors.price && (
                      <p className="text-xs text-red-500">
                        {errors.price.message}
                      </p>
                    )}
                  </div>

                  {/* Mileage */}
                  <div className="space-y-2">
                    <Label htmlFor="mileage">Mileage</Label>
                    <Input
                      id="mileage"
                      {...register("mileage")}
                      placeholder="e.g. 15000"
                      className={errors.mileage ? "border-red-500" : ""}
                    />
                    {errors.mileage && (
                      <p className="text-xs text-red-500">
                        {errors.mileage.message}
                      </p>
                    )}
                  </div>

                  {/* Color */}
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      {...register("color")}
                      placeholder="e.g. Blue"
                      className={errors.color ? "border-red-500" : ""}
                    />
                    {errors.color && (
                      <p className="text-xs text-red-500">
                        {errors.color.message}
                      </p>
                    )}
                  </div>

                  {/* Fuel Type */}
                  <div className="space-y-2">
                    <Label htmlFor="fuelType">Fuel Type</Label>
                    <Select
                      onValueChange={(value) => setValue("fuelType", value)}
                      defaultValue={getValues("fuelType")}
                    >
                      <SelectTrigger
                        className={errors.fuelType ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                      <SelectContent>
                        {fuelTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.fuelType && (
                      <p className="text-xs text-red-500">
                        {errors.fuelType.message}
                      </p>
                    )}
                  </div>

                  {/* Transmission */}
                  <div className="space-y-2">
                    <Label htmlFor="transmission">Transmission</Label>
                    <Select
                      onValueChange={(value) => setValue("transmission", value)}
                      defaultValue={getValues("transmission")}
                    >
                      <SelectTrigger
                        className={errors.transmission ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select transmission" />
                      </SelectTrigger>
                      <SelectContent>
                        {transmissions.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.transmission && (
                      <p className="text-xs text-red-500">
                        {errors.transmission.message}
                      </p>
                    )}
                  </div>

                  {/* Body Type */}
                  <div className="space-y-2">
                    <Label htmlFor="bodyType">Body Type</Label>
                    <Select
                      onValueChange={(value) => setValue("bodyType", value)}
                      defaultValue={getValues("bodyType")}
                    >
                      <SelectTrigger
                        className={errors.bodyType ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select body type" />
                      </SelectTrigger>
                      <SelectContent>
                        {bodyTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.bodyType && (
                      <p className="text-xs text-red-500">
                        {errors.bodyType.message}
                      </p>
                    )}
                  </div>

                  {/* Seats */}
                  <div className="space-y-2">
                    <Label htmlFor="seats">
                      Number of Seats{" "}
                      <span className="text-sm text-gray-500">(Optional)</span>
                    </Label>
                    <Input
                      id="seats"
                      {...register("seats")}
                      placeholder="e.g. 5"
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      onValueChange={(value) => setValue("status", value)}
                      defaultValue={getValues("status")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {carStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Enter detailed description of the car..."
                    className={`min-h-32 ${
                      errors.description ? "border-red-500" : ""
                    }`}
                  />
                  {errors.description && (
                    <p className="text-xs text-red-500">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Featured */}
                <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                  <Checkbox
                    id="featured"
                    checked={watch("featured")}
                    onCheckedChange={(checked) => {
                      setValue("featured", checked);
                    }}
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="featured">Feature this car</Label>
                    <p className="text-sm text-gray-500">
                      Featured cars appear on the homepage
                    </p>
                  </div>
                </div>

                {/* Image Upload Dropzone */}
                <div>
                  <Label
                    htmlFor="images"
                    className={imageError ? "text-red-500" : ""}
                  >
                    Images
                    {imageError && <span className="text-red-500">*</span>}
                  </Label>

                  {/* Image Dropzone UI */}
                  <div
                    {...getMultiImageRootProps()}
                    className={`cursor-pointer border-2 border-dashed rounded-lg mt-2 p-6 text-center cursor-pointer hover:bg-gray-50 transition ${
                      imageError ? "border-red-500" : "border-gray-300"
                    } `}
                  >
                    <input {...getMultiImageInputProps()} />
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="h-12 w-12 text-gray-400 mb-3 " />
                      <p className="text-sm text-gray-600">
                        {`Drag & drop or click to upload multiple images`}
                      </p>

                      <p className="text-gray-400 text-xs">
                        Supports : JPG, PNG ,Webp(max 5MB)
                      </p>
                    </div>
                  </div>

                  {imageError && (
                    <p className="text-xs text-red-500 mt-1">{imageError}</p>
                  )}

                  {/* preview uploaded images */}
                  {uploadedImages.length > 0 && (
                    <div>
                      <h3>Uploaded {uploadedImages.length} Images </h3>
                      <div className="grid sm:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 ">
                        {uploadedImages.map((image, index) => {
                          return (
                            <div
                              key={index}
                              className="relative group rounded-md"
                            >
                              <Image
                                src={image}
                                alt={`Car Image ${index + 1} `}
                                height={50}
                                width={50}
                                className="h-32 w-full rounded-lg p-2 mx-auto "
                                priority
                              />
                              <Button
                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                type="button"
                                size="icon"
                                variant="destructive"
                                onClick={() => removeImage(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full md:w-auto cursor-pointer"
                  disabled={addCarLoading}
                >
                  {" "}
                  {addCarLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Car...
                    </>
                  ) : (
                    "Add Car"
                  )}{" "}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ai upload  */}
        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>AI Powered Car Detail Extraction</CardTitle>
              <CardDescription>
                Upload an image of a car and let AI extract its details
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                {/* Image div */}
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  {/* Preview image */}
                  {aiImagePreview ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={aiImagePreview}
                        alt="Car Preview"
                        className="max-h-56 max-w-full object-contain mb-4"
                      />
                      {/* Buttons */}
                      <div className="flex gap-3">
                        <Button
                          variant="outlined"
                          className="bg-gray-200 hover:bg-gray-400  cursor-pointer"
                          size="sm"
                          onClick={() => {
                            setAiImagePreview(null);
                            setUploadedAiImage(null);
                            toast.info("Image removed");
                          }}
                        >
                          Remove
                        </Button>
                        <Button
                          className="cursor-pointer"
                          size="sm"
                          onClick={processImageWithAi}
                          disabled={processAiIamgeLoading}
                        >
                          {processAiIamgeLoading ? (
                            <>
                              <Loader className="mr-2 h-4 w-4 animate-spin" />
                              Processing...{" "}
                            </>
                          ) : (
                            <>
                              {" "}
                              <Camera /> Extract Details
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // image dropbox
                    <div
                      {...getAiImageRootProps()}
                      className="cursor-pointer hover:bg-gray-50-transition "
                    >
                      <input {...getAiImageInputProps()} />
                      <div className="flex flex-col items-center justify-center">
                        <Camera className="h-12 w-12 text-gray-400 mb-2 " />
                        <p className="text-gray-600 text-sm">
                          Drag and drop or click to upload an image
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          {" "}
                          Supports : JPG, PNG, WebP(max 5MB){" "}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* How it works */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">How it works</h3>
                  <ol className="space-y-2 text-sm text-gray-600 list-decimal pl-4">
                    <li>Upload a clear image of the car</li>
                    <li>Click "Extract Details" to analyze with Gemini AI</li>
                    <li>Review the extracted information</li>
                    <li>Fill in any missing details manually</li>
                    <li>Add the car to your inventory</li>
                  </ol>
                </div>

                {/* Tips for best results */}
                <div className="bg-amber-50 p-4 rounded-md">
                  <h3 className="font-medium text-amber-800 mb-1">
                    Tips for best results
                  </h3>
                  <ul className="space-y-1 text-sm text-amber-700">
                    <li>• Use clear, well-lit images</li>
                    <li>• Try to capture the entire vehicle</li>
                    <li>• For difficult models, use multiple views</li>
                    <li>• Always verify AI-extracted information</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AddCarForm;
