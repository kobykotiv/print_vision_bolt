import TemplateList from '@/components/template-list';
  import Link from 'next/link';
  
  export default function TemplatesPage() {
  return (
  <div className="container mx-auto mt-10">
  <h1 className="text-2xl font-bold mb-5">Templates</h1>
  <Link href="/templates/create" className="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 mb-5">
  Create New Template
  </Link>
  <TemplateList />
  </div>
  );
  }
