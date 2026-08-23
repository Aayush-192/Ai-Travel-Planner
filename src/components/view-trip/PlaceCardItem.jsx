import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPlacePhotoUrl } from "@/service/globalApi";

export const PlaceCardItem = ({ place }) => {
  const [photoUrl, setPhotoUrl] = useState();

  // Support both new camelCase keys and old PascalCase keys
  const placeName = place?.placeName ?? place?.PlaceName;
  const placeDetails = place?.placeDetails ?? place?.PlaceDetails;
  const timeTravel = place?.timeTravel ?? place?.TimeTravel;

  useEffect(() => {
    if (placeName) {
      getPlacePhotoUrl(placeName).then(url => setPhotoUrl(url));
    }
  }, [placeName]);

  return (
    <Link
      to={`https://www.google.com/maps/search/?api=1&query=${placeName}`}
      target="_blank"
    >
      <div className="border p-3 rounded-xl flex gap-5 hover:scale-105 transition-all hover:shadow-sm cursor-pointer">
        <img
          src={photoUrl ? photoUrl : "/placeholder.jpg"}
          className="w-[100px] h-[130px] rounded-xl object-cover"
        />
        <div>
          <h2 className="font-bold text-lg">{placeName}</h2>
          <p className="text-sm text-gray-600">{placeDetails}</p>
          <h2 className="mt-2">🕗 {timeTravel}</h2>
        </div>
      </div>
    </Link>
  );
};
