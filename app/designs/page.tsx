import Link from 'next/link';
  import DesignList from '@/components/design-list';
  
  export default function DesignsPage() {
  return (
  <div className="container mx-auto mt-10">
  <h1 className="text-2xl font-bold mb-5">Your Designs</h1>
  <Link href="/designs/upload" className="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 mb-5">
  Upload New Design
  </Link>
  <DesignList />
  </div>
  );
  }
