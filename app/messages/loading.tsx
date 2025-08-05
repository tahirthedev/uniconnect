import { MessageCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <MessageCircle className="h-6 w-6 text-orange-600 mx-auto mb-2" />
        <p className="text-gray-600">Loading your messages...</p>
      </div>
    </div>
  );
}
