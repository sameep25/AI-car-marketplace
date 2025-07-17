"use client";
import { Camera, Upload } from "lucide-react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const HomeSearch = () => {
  const [serachTerm, setSerachTerm] = useState("");
  const [isImageSearchActive, setIsImageSearchActive] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [searchImage, setSearchImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!serachTerm.trim()) {
      toast.error("Please enter a search term");
      return;
    }
  };

  const handleImageSearch = async (e) => {
    e.preventDefault();
    if (!searchImage) {
      toast.error("Please upload an image first");
      return;
    }

    // Ai logic
  };

  // handling image input
  const onDrop = (acceptedFiles) => {
    // Do something with the files
    const file = acceptedFiles[0];

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be lesser than 5MB");
      return;
    }

    setIsUploading(true);
    setSearchImage(file);
    const reader = new FileReader();

    reader.onloadend = () => {
      // image
      setImagePreview(reader.result);
      setIsUploading(false);
      toast.success("Image uploaded successfully");
    };

    reader.onerror = () => {
      setIsUploading(false);
      toast.error("Failed to read the image");
    };

    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "image/*": [".jpeg", "jpg", ".png"],
      },
      maxFiles: 1,
    });

  return (
    <div>
      {/* text search */}
      <form onSubmit={handleTextSubmit}>
        <div className="relative flex items-center ">
          <Input
            value={serachTerm}
            onChange={(e) => {
              setSerachTerm(e.target.value);
            }}
            type="text"
            placeholder="Enter make, model, or use our AI Image search"
            className="pl-8 pr-8 py-6 w-full rounded-full border-gray-300 bg-white/95 backdrop-blur-sm"
          />

          <div className="ml-4 absolute right-[100px]">
            <Camera
              size={30}
              className="cursor-pointer p-1.5 rounded-xl"
              variant="outline"
              onClick={() => setIsImageSearchActive(!isImageSearchActive)}
              style={{
                background: isImageSearchActive ? "black" : "",
                color: isImageSearchActive ? "white" : "",
              }}
            />
          </div>

          <Button type="submit" className="absolute right-2 rounded-full">
            Search
          </Button>
        </div>
      </form>

      {/* image search */}
      {isImageSearchActive && (
        <div className="mt-4">
          <form onSubmit={handleImageSearch}>
            {/* image search form area */}
            <div className="outline-1 outline-offset-1 outline-gray-600 rounded-lg p-4">
              {/* Image is uploaded - image preview */}
              {imagePreview ? (
                <div className="flex flex-col items-center ">
                  <img
                    src={imagePreview}
                    alt="Car Preview"
                    className="h-40 object-contain mb-4"
                  />
                  <Button
                    className="cursor-pointer"
                    variant="outline"
                    onClick={() => {
                      setSearchImage(null);
                      setImagePreview("");
                      toast.info("Image removed");
                    }}
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                // Upload the image
                <div {...getRootProps()} className="cursor-pointer">
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center">
                    <Upload className="h-12 w-12 text-gray-400 mb-2 " />
                    <p className="text-white">
                      {isDragActive && !isDragReject
                        ? "Leave the file here to upload"
                        : "Drag & drop a car image or click to select"}
                    </p>
                    {isDragReject && (
                      <p className="text-red-500 mb-2"> Invalid image type </p>
                    )}
                    <p className="text-gray-400 text-sm">
                      {" "}
                      Supports : JPG, PNG(max 5MB){" "}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* Image search button */}
          {imagePreview && (
            <Button
              className="cursor-pointer"
              type="submit"
              disabled={isUploading}
              variant="outline"
            >
              {isUploading ? "Uploading..." : "Search with this image"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default HomeSearch;
