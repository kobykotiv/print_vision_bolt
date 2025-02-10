import { NextResponse } from 'next/server';
  import { syncWithProvider } from '@/lib/syncService'; // Import the sync service
  
  export async function POST(req: Request) {
  try {
  const { designIds } = await req.json();
  
  if (!designIds || designIds.length === 0) {
  return NextResponse.json({ error: 'No design IDs provided' }, { status: 400 });
  }
  
  //  Simulate fetching design details.  Replace with actual data fetching.
  const designs = designIds.map(id => ({
  id,
  name: `Design ${id}`,
  imageUrl: `/api/designs/${id}/image`, //  Placeholder URL.  You'll need an endpoint to serve design images.
  printfulProductId: 'YOUR_PRINTFUL_PRODUCT_ID' // Replace with the actual Printful product ID
  }));
  
  const mockupResults = [];
  
  for (const design of designs) {
  //  Call the Printful API (via the sync service) to generate mockups.
  const printfulResult = await syncWithProvider('Printful', {
  product_id: design.printfulProductId, //  The Printful product ID.
  variant_ids: [1, 2, 3], // Example variant IDs.  Get these from your Printful product.
  format: 'jpg', //  Or 'png'.
  files: [
  {
  type: 'front', //  Placement (front, back, sleeve, etc.)
  image_url: design.imageUrl, //  URL of the design image.
  },
  ],
  });
  
  if (printfulResult && printfulResult.mockups) {
  mockupResults.push({
  designId: design.id,
  mockups: printfulResult.mockups, //  Array of mockup URLs.
  });
  } else {
  console.error(`Error generating mockups for design ${design.id}:`, printfulResult);
  mockupResults.push({
  designId: design.id,
  error: `Failed to generate mockups for design ${design.id}`,
  });
  }
  }
  
  return NextResponse.json({ mockups: mockupResults });
  
  } catch (error: any) {
  console.error("Error in /api/generate-mockups:", error);
  return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
  }
