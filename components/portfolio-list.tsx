'use client';
  
  import React, { useState } from 'react';
  import { Button } from "@/components/ui/button"
  import { Checkbox } from "@/components/ui/checkbox"
  import { toast } from "@/components/ui/use-toast"
  
  //  Simulate design data.  Replace with actual data fetching.
  const designs = [
  { id: 'design-1', name: 'Design 1', imageUrl: '/placeholder-image.jpg' },
  { id: 'design-2', name: 'Design 2', imageUrl: '/placeholder-image.jpg' },
  { id: 'design-3', name: 'Design 3', imageUrl: '/placeholder-image.jpg' },
  ];
  
  export default function PortfolioList() {
  const [selectedDesigns, setSelectedDesigns] = useState<string[]>([]);
  
  const handleSelectDesign = (designId: string) => {
  setSelectedDesigns((prevSelected) => {
  if (prevSelected.includes(designId)) {
  return prevSelected.filter((id) => id !== designId);
  } else {
  return [...prevSelected, designId];
  }
  });
  };
  
  const handleGenerateMockups = async () => {
  if (selectedDesigns.length === 0) {
  toast({
  title: "No Designs Selected",
  description: "Please select at least one design to generate mockups.",
  variant: "destructive",
  });
  return;
  }
  
  try {
  toast({
  title: "Generating Mockups",
  description: "Please wait while mockups are being generated...",
  });
  
  const response = await fetch('/api/generate-mockups', {
  method: 'POST',
  headers: {
  'Content-Type': 'application/json',
  },
  body: JSON.stringify({ designIds: selectedDesigns }),
  });
  
  if (response.ok) {
  const data = await response.json();
  
  //  Update the UI to display the mockups.  This is a simplified example.
  //  You'll likely want to create a separate component to display the mockups.
  let mockupDisplayString = "";
  for (const result of data.mockups) {
  if (result.error) {
  mockupDisplayString += `Design ${result.designId}: Error: ${result.error}\n`;
  } else {
  mockupDisplayString += `Design ${result.designId}: Mockups:\n`;
  result.mockups.forEach(mockup => {
  mockupDisplayString += `  - ${mockup.mockup_url}\n`;
  });
  }
  }
  
  toast({
  title: "Mockups Generated",
  description: mockupDisplayString, // Or update a state variable to display mockups.
  });
  
  } else {
  const errorData = await response.json(); // Attempt to get error details
  toast({
  title: "Error Generating Mockups",
  description: `Error: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`,
  variant: "destructive",
  });
  }
  } catch (error: any) {
  console.error("Error generating mockups:", error);
  toast({
  title: "Error Generating Mockups",
  description: `An unexpected error occurred: ${error.message || 'Unknown error'}`,
  variant: "destructive",
  });
  }
  };
  
  return (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {designs.map((design) => (
  <div key={design.id} className="border p-4 rounded flex items-center">
  <Checkbox
  checked={selectedDesigns.includes(design.id)}
  onCheckedChange={() => handleSelectDesign(design.id)}
  className="mr-2"
  />
  <img src={design.imageUrl} alt={design.name} className="w-16 h-16 object-cover mr-4" />
  <div>{design.name}</div>
  </div>
  ))}
  <Button onClick={handleGenerateMockups} disabled={selectedDesigns.length === 0} className="mt-4">
  Generate Mockups
  </Button>
  </div>
  );
  }
