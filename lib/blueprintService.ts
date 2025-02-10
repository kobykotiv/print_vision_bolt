// lib/blueprintService.ts
  
  import { supabase } from './supabase';
  import { printifyClient, printfulClient } from './apiClients'; // Import API clients
  
  export async function fetchAndStoreBlueprints() {
  // Fetch blueprints from Printify
  const printifyBlueprints = await printifyClient.getBlueprints();
  for (const blueprint of printifyBlueprints) {
  const { error } = await supabase
  .from('blueprints')
  .upsert({
  id: blueprint.id,
  provider: 'Printify',
  provider_blueprint_id: blueprint.provider_blueprint_id,
  metadata: blueprint.metadata,
  last_fetched: new Date().toISOString(),
  });
  if (error) {
  console.error("Error storing Printify blueprint:", error);
  //  Handle error (e.g., log, retry, etc.)
  }
  }
  
  // Fetch blueprints from Printful
  const printfulBlueprints = await printfulClient.getBlueprints();
  for (const blueprint of printfulBlueprints) {
  const { error } = await supabase
  .from('blueprints')
  .upsert({
  id: blueprint.id,
  provider: 'Printful',
  provider_blueprint_id: blueprint.provider_blueprint_id,
  metadata: blueprint.metadata,
  last_fetched: new Date().toISOString(),
  });
  if (error) {
  console.error("Error storing Printful blueprint:", error);
  //  Handle error
  }
  }
  
  //  Add similar logic for other providers (Gooten, Gelato, etc.)
  }
  
  
  export async function getBlueprintsByProvider(provider: string) {
  const { data, error } = await supabase
  .from('blueprints')
  .select('*')
  .eq('provider', provider);
  
  if (error) {
  console.error("Error fetching blueprints:", error);
  return []; // Or throw the error, depending on your error handling strategy.
  }
  
  return data || [];
  }
