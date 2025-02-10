'use client';
  
  import React, { useState, useEffect } from 'react';
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
  import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
  import { Input } from "@/components/ui/input"
  import { Button } from "@/components/ui/button"
  import { Label } from "@/components/ui/label"
  import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
  import { useForm } from "react-hook-form";
  import { z } from "zod";
  import { zodResolver } from "@hookform/resolvers/zod"
  import ImageSlot from './ImageSlot'; // Import the ImageSlot component
  import { getBlueprintsByProvider } from '@/lib/blueprintService'; // Import
  import { supabase } from '@/lib/supabase';
  
  
  const SUPPLIERS = ['Printify', 'Printful', 'Gooten', 'SPOD'];
  
  
  const templateFormSchema = z.object({
  templateName: z.string().min(2, {
  message: "Template name must be at least 2 characters.",
  }),
  });
  
  type TemplateFormValues = z.infer<typeof templateFormSchema>;
  
  export default function TemplateConfigForm() {
  const [templateBlueprints, setTemplateBlueprints] = useState<{ supplier: string; blueprint: any; image: string | null; }[]>([]);
  const [blueprintsBySupplier, setBlueprintsBySupplier] = useState<{ [key: string]: any[] }>({});
  
  const form = useForm<TemplateFormValues>({
  resolver: zodResolver(templateFormSchema),
  defaultValues: {
  templateName: "",
  },
  mode: "onChange",
  });
  
  useEffect(() => {
  const fetchBlueprints = async () => {
  const fetchedBlueprints: { [key: string]: any[] } = {};
  for (const supplier of SUPPLIERS) {
  fetchedBlueprints[supplier] = await getBlueprintsByProvider(supplier);
  }
  setBlueprintsBySupplier(fetchedBlueprints);
  };
  
  fetchBlueprints();
  }, []);
  
  
  const handleAddBlueprint = (supplier: string, blueprint: any) => {
  setTemplateBlueprints([...templateBlueprints, { supplier, blueprint, image: null }]);
  };
  
  const handleRemoveBlueprint = (indexToRemove: number) => {
  setTemplateBlueprints(templateBlueprints.filter((_, index) => index !== indexToRemove));
  };
  
  const handleImageSelect = (index: number, imageFile: string | null) => {
  const updatedBlueprints = [...templateBlueprints];
  updatedBlueprints[index] = { ...updatedBlueprints[index], image: imageFile }; // Create a new object
  setTemplateBlueprints(updatedBlueprints);
  };
  
  
  const handleSubmit = async (data: TemplateFormValues) => {
  
  const { error: insertError } = await supabase
  .from('templates')
  .insert([{
  user_id: 'user-id', //  Replace with actual user ID
  name: data.templateName,
  description: 'Template Description', //  Add a description field if needed
  }]);
  
  if (insertError) {
  console.error("Error inserting template:", insertError);
  alert("Error creating template.");
  return;
  }
  
  //  Get the ID of the newly inserted template.  Supabase returns the inserted row(s).
  const { data: templateData, error: selectError } = await supabase
  .from('templates')
  .select('id')
  .eq('name', data.templateName)  // Assumes template names are unique per user
  .single(); // Use .single() to get a single object, not an array
  
  
  if (selectError || !templateData) {
  console.error("Error fetching template ID:", selectError);
  alert("Error getting template ID.");
  return;
  }
  
  const templateId = templateData.id;
  
  //  Insert into template_blueprints
  for (const item of templateBlueprints) {
  const { error: relationError } = await supabase
  .from('template_blueprints')
  .insert([{
  template_id: templateId,
  blueprint_id: item.blueprint.id,
  //  Add other fields as needed (e.g., position, layout)
  }]);
  if (relationError) {
  console.error("Error inserting into template_blueprints:", relationError);
  alert("Error associating blueprints with template.");
  //  Consider rolling back the template creation if this fails.
  return;
  }
  }
  
  alert(`Template "${data.templateName}" created successfully!`);
  //  Redirect to the templates page or show a success message.
  };
  
  return (
  <Form {...form}>
  <form onSubmit={form.handleSubmit(handleSubmit)} className="max-w-2xl">
  <FormField
  control={form.control}
  name="templateName"
  render={({ field }) => (
  <FormItem>
  <FormLabel>Template Name</FormLabel>
  <FormControl>
  <Input placeholder="Template Name" {...field} />
  </FormControl>
  <FormMessage />
  </FormItem>
  )}
  />
  
  <Tabs defaultValue="Printify" className="mb-4 mt-4">
  <TabsList>
  {SUPPLIERS.map(supplier => (
  <TabsTrigger key={supplier} value={supplier}>{supplier}</TabsTrigger>
  ))}
  </TabsList>
  {SUPPLIERS.map(supplier => (
  <TabsContent key={supplier} value={supplier}>
  <div className="grid grid-cols-3 gap-4">
  {blueprintsBySupplier[supplier]?.map((blueprint: any) => (
  <Card key={blueprint.id} className="cursor-pointer hover:bg-gray-100" onClick={() => handleAddBlueprint(supplier, blueprint)}>
  <CardHeader>
  <CardTitle>{blueprint.metadata.name}</CardTitle>
  </CardHeader>
  <CardContent>
  <CardDescription>{blueprint.metadata.description}</CardDescription>
  </CardContent>
  </Card>
  ))}
  </div>
  </TabsContent>
  ))}
  </Tabs>
  
  <div>
  <h3 className="text-2xl font-semibold mb-2">Template Blueprints</h3>
  {templateBlueprints.map((item, index) => (
  <div key={index} className="flex items-center border rounded p-2 mb-2">
  <div className="flex-1">
  {item.blueprint.metadata.name} ({item.supplier})
  </div>
  <ImageSlot index={index} onImageSelect={handleImageSelect} initialImage={item.image} />
  <Button
  variant="destructive"
  size="sm"
  type="button"
  onClick={() => handleRemoveBlueprint(index)}
  >
  Remove
  </Button>
  </div>
  ))}
  </div>
  
  <Button type="submit" className="mt-4">Create Template</Button>
  </form>
  </Form>
  );
  }
