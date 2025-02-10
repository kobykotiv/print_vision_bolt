import BlueprintList from '@/components/blueprint-list';
  import Link from 'next/link';
  
  export default function BlueprintsPage() {
  return (
  <div className="container mx-auto mt-10">
  <h1 className="text-2xl font-bold mb-5">Blueprints</h1>
  <Link href="/blueprints/create" className="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 mb-5">
  Create New Blueprint
  </Link>
  <BlueprintList />
  </div>
  );
  }
