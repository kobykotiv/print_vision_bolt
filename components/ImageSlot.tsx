'use client';
  
  import React, { useState } from 'react';
  import { Button } from "@/components/ui/button";
  import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input"; // Import Input
  
  interface ImageSlotProps {
  index: number;
  onImageSelect: (index: number, imageFile: string | null) => void;
  initialImage?: string | null; // Allow an initial image
  }
  
  
  export default function ImageSlot({ index, onImageSelect, initialImage = null }: ImageSlotProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(initialImage);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
  const reader = new FileReader();
  reader.onloadend = () => {
  setSelectedImage(reader.result as string);
  onImageSelect(index, reader.result as string); // Pass base64 data
  setIsDialogOpen(false); // Close dialog after selection
  };
  reader.readAsDataURL(file);
  } else {
  // Handle case where user cancels file selection
  setSelectedImage(null);
  onImageSelect(index, null);
  }
  };
  
  const handleRemoveImage = () => {
  setSelectedImage(null);
  onImageSelect(index, null);
  }
  
  return (
  <div className="w-20 h-20 border rounded mr-4 flex items-center justify-center bg-gray-50 relative">
  {selectedImage ? (
  <>
  <img src={selectedImage} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
  <Button
  variant="destructive"
  size="icon"
  className="absolute top-0 right-0 m-1"
  onClick={handleRemoveImage}
  >
  X
  </Button>
  </>
  ) : (
  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
  <DialogTrigger asChild>
  <Button size="sm" variant="outline" onClick={() => setIsDialogOpen(true)}>Select Image</Button>
  </DialogTrigger>
  <DialogContent>
  <DialogHeader>
  <DialogTitle>Select an Image</DialogTitle>
  <DialogDescription>
  Choose an image to upload.
  </DialogDescription>
  </DialogHeader>
  {/* Use a standard file input */}
  <Input type="file" accept="image/*" onChange={handleImageChange} className='mb-4'/>
  
  <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
  </DialogContent>
  </Dialog>
  )}
  </div>
  );
  }
