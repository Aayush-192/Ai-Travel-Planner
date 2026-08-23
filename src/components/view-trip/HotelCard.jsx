import { getPlacePhotoUrl } from "@/service/globalApi";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export const HotelCard = ({ item, index }) => {
  const [photoUrl, setPhotoUrl] = useState();

  // Support both old PascalCase keys and new camelCase keys from the updated Gemini SDK
  const name = item?.hotelName ?? item?.HotelName;
  const address = item?.hotelAddress ?? item?.HotelAddress;
  const price = item?.price ?? item?.Price;
  const rating = item?.rating ?? item?.Rating;

  useEffect(() => {
    if (name) {
      getPlacePhotoUrl(`${name} hotel`).then(url => setPhotoUrl(url));
    }
  }, [name]);

  return (
    <Link
      to={`https://www.google.com/maps/search/?api=1&query=${name}, ${address}`}
      target="_blank"
    >
      <div key={index} className="hover:scale-105 transition-all cursor-pointer">
        <img
          src={photoUrl}
          className="rounded-xl h-[180px] w-full object-cover"
        />
        <div className="my-2 flex flex-col gap-2">
          <h2 className="font-medium">{name}</h2>
          <h2 className="text-xs text-gray-500">📍 {address}</h2>
          <h2 className="text-sm">💰 {price}</h2>
          <h2 className="text-sm">⭐ {rating}</h2>
        </div>
      </div>
    </Link>
  );
};
