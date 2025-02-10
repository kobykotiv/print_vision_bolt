'use client';
  
  import { Button } from "@/components/ui/button";
  
  export default function LogoutButton() {
  
  const handleLogout = async () => {
  alert("Logout functionality not yet implemented.");
  };
  
  return (
  <Button variant="ghost" onClick={handleLogout} className="hover:text-blue-500">
  Logout
  </Button>
  );
  }
