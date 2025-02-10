import axios from 'axios';
  
  async function syncWithProvider(provider: string, productData: any) {
  let endpoint = "";
  let headers = {};
  
  switch (provider) {
  case "Printify":
  endpoint = "https://api.printify.com/v1/shop/products.json";
  headers = { 'Authorization': `Bearer ${process.env.PRINTIFY_API_KEY}` };
  break;
  case "Printful":
  endpoint = "https://api.printful.com/mockup-generator/create-task/" + productData.product_id;
  headers = {
  'Authorization': `Basic ${Buffer.from(process.env.PRINTFUL_API_KEY + ':').toString('base64')}`,
  'Content-Type': 'application/json',
  'X-PF-Store-Id': process.env.PRINTFUL_STORE_ID // Add your store ID to .env
  };
  break;
  case "Gooten":
  endpoint = "https://api.gooten.com/api/product";
  headers = { 'Authorization': `Bearer ${process.env.GOOTEN_API_KEY}` };
  break;
  default:
  throw new Error("Unsupported provider");
  }
  
  try {
  if (provider === 'Printful') {
  //  Printful requires a separate task creation and status check.
  const taskResponse = await axios.post(endpoint, {
  variant_ids: productData.variant_ids,
  format: productData.format,
  files: productData.files
  }, { headers });
  
  if (taskResponse.data && taskResponse.data.task_key) {
  //  Now, poll for the task status until it's complete.
  let mockupResult;
  let attempts = 0;
  const maxAttempts = 10; //  Limit the number of attempts.
  const pollInterval = 2000; //  Wait 2 seconds between polls.
  
  do {
  await new Promise(resolve => setTimeout(resolve, pollInterval));
  mockupResult = await getPrintfulMockupResult(productData.product_id, taskResponse.data.task_key);
  attempts++;
  } while (mockupResult && mockupResult.status !== 'completed' && attempts < maxAttempts);
  
  if (mockupResult && mockupResult.status === 'completed') {
    if (mockupResult.result && mockupResult.result.mockups) {
        return { mockups: mockupResult.result.mockups }; // Return only the mockups
    } else {
        console.error(`Printful mockup generation completed, but no mockups found:`, mockupResult);
        return { error: 'Printful mockup generation completed, but no mockups found', result: mockupResult};
    }
  } else {
  console.error(`Printful mockup generation failed or timed out:`, mockupResult);
  return { error: 'Printful mockup generation failed or timed out', result: mockupResult };
  }
  } else {
  console.error(`Printful task creation failed:`, taskResponse.data);
  return { error: 'Printful task creation failed', result: taskResponse.data };
  }
  } else {
  //  For other providers (Printify, Gooten - assuming direct mockup generation)
  const response = await axios.post(endpoint, productData, { headers });
  return response.data;
  }
  } catch (error) {
  console.error(`Sync failed for ${provider}:`, error);
  return { error: `Sync failed for ${provider}: ${error}` };
  }
  }
  
  async function getPrintfulMockupResult(productId: string, taskKey: string) {
  const endpoint = `https://api.printful.com/mockup-generator/task/${productId}/${taskKey}`;
  const headers = {
  'Authorization': `Basic ${Buffer.from(process.env.PRINTFUL_API_KEY + ':').toString('base64')}`,
  'X-PF-Store-Id': process.env.PRINTFUL_STORE_ID
  };
  
  try {
  const response = await axios.get(endpoint, { headers });
  return response.data;
  } catch (error) {
  console.error(`Error getting Printful mockup result:`, error);
  return null; // Or throw the error, depending on how you want to handle it.
  }
  }
  
  export { syncWithProvider };
