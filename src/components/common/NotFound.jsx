import React from "react";
import { Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center">
        {/* Animated 404 */}
        <div className="mb-8">
          <div className="relative inline-block">
            <h1 className="text-9xl md:text-[12rem] font-bold text-gold-500 animate-bounce">
              4
            </h1>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-navy-900 rounded-full flex items-center justify-center animate-spin">
                <span className="text-gold-500 text-2xl md:text-4xl font-bold">0</span>
              </div>
            </div>
            <h1 className="text-9xl md:text-[12rem] font-bold text-gold-500 animate-bounce inline-block ml-4" style={{ animationDelay: "0.1s" }}>
              4
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-2xl p-8 md:p-12 border-2 border-gold-500/30">
          <div className="mb-6">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">
              Page Not Found
            </h2>
            <p className="text-gray-600 text-lg mb-2">
              Oops! The page you're looking for doesn't exist.
            </p>
            <p className="text-gray-500 text-sm">
              It might have been moved, deleted, or you entered the wrong URL.
            </p>
          </div>

          {/* Animated illustration */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 border-4 border-gold-500 rounded-full animate-pulse"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-navy-900 rounded-full flex items-center justify-center">
                  <span className="text-4xl md:text-6xl">🔍</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/")}
              className="py-3 px-6 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-navy-900 font-semibold rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-lg"
            >
              <Home size={20} />
              <span>Go to Home</span>
            </button>
            <button
              onClick={() => navigate(-1)}
              className="py-3 px-6 border-2 border-gold-300 hover:border-gold-600 text-gold-700 hover:text-gold-600 font-medium rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              <ArrowLeft size={20} />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

