import React from "react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <div className="flex flex-col items-center mx-10 md:mx-56 gap-9 mt-16">
      <h1 className="font-extrabold text-4xl text-center">
        <span className="text-red-500 ">
          Smart Travel Starts Here:
        </span>{" "}
        Custom AI Itineraries Made for You
      </h1>
      <p className="text-xl text-gray-600 text-center">
        Build your dream trip effortlessly with a travel companion tailored to your unique style and budget.
      </p>
      <Link to={"/create-trip"}>
        <Button>Get Started</Button>
      </Link>
    </div>
  );
};
