import { Link } from "react-router-dom";
import { HotelCard } from "./HotelCard";

export const HotelSection = ({ trip }) => {
  return (
    <div>
      <h2 className="font-bold text-xl my-5">Hotel Recommendation</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
        {(Array.isArray(trip?.tripData?.hotels) ? trip.tripData.hotels : Object.values(trip?.tripData?.hotels || {})).map((item, index) => (
          <HotelCard key={item?.hotelName ?? item?.HotelName ?? index} item={item} index={index} />
        ))}
      </div>
    </div>
  );
};
