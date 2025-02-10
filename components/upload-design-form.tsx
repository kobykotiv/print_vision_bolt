import React from 'react';
  
  export default function UploadDesignForm() {
  return (
  <form className="max-w-lg">
  <div className="mb-4">
  <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
  Name:
  </label>
  <input type="text" id="name" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
  </div>
  <div className="mb-4">
  <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
  Description:
  </label>
  <textarea id="description" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"></textarea>
  </div>
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">Upload</button>
  </form>
  );
  }
