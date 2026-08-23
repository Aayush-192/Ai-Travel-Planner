import { PlaceCardItem } from "./PlaceCardItem";

export const VisitSection = ({ trip }) => {
  return (
    <div>
      <h2 className="font-bold text-xl my-5">Places to Visit</h2>
      <div>
        {(Array.isArray(trip?.tripData?.itinerary) ? trip.tripData.itinerary : Object.values(trip?.tripData?.itinerary || {})).map((item, dayIndex) => (
          <div key={item?.day ?? item?.Day ?? dayIndex}>
            {/* Support both camelCase (new SDK) and PascalCase (old data) */}
            <h2 className="font-medium text-lg">Day : {item?.day ?? item?.Day}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Support both camelCase (new SDK) and PascalCase (old data) plans, fallback to flat item */}
              {(Array.isArray(item?.plan ?? item?.Plan) ? (item?.plan ?? item?.Plan) : [item]).map((place, placeIndex) => (
                <div key={placeIndex} className="my-3">
                  <h2 className="font-medium text-sm text-orange-700">
                    {place?.time ?? place?.Time}
                  </h2>
                  <PlaceCardItem place={place} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
