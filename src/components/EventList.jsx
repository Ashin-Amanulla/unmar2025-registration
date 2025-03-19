import { useEvents } from "../hooks/useEvents";
import { Link } from "react-router-dom";

const EventCard = ({ event }) => {
  // Use the checkAvailability query from useEvents
  const { data: availability } = useEvents().checkAvailability(event.id);

  const isAvailable = availability?.available;
  const remainingSeats = availability?.remainingSeats || 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 bg-gray-200 relative">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-r from-blue-500 to-indigo-600">
            <h3 className="text-white text-xl font-bold px-4 text-center">
              {event.title}
            </h3>
          </div>
        )}

        <div className="absolute top-0 right-0 bg-indigo-600 text-white px-3 py-1 m-2 rounded-full text-sm font-medium">
          ₹{event.price}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
        <p className="text-gray-600 mb-3 line-clamp-2">{event.description}</p>

        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
          <div>
            <span className="inline-block mr-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 inline"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </span>
            {new Date(event.date).toLocaleDateString()}
          </div>
          <div>
            <span className="inline-block mr-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 inline"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </span>
            {event.location}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm">
            {isAvailable ? (
              <span className="text-green-600 font-medium">
                {remainingSeats} seats left
              </span>
            ) : (
              <span className="text-red-600 font-medium">Fully booked</span>
            )}
          </div>

          <Link
            to={`/events/${event.id}`}
            className={`px-4 py-2 rounded-md text-white font-medium text-sm ${
              isAvailable
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            disabled={!isAvailable}
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

const EventList = () => {
  const { events, isEventsLoading, isEventsError, refetchEvents } = useEvents();

  if (isEventsLoading) {
    return (
      <div className="w-full py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (isEventsError) {
    return (
      <div className="w-full py-12 text-center">
        <p className="text-red-500 mb-4">Failed to load events</p>
        <button
          onClick={() => refetchEvents()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="w-full py-12 text-center">
        <p className="text-gray-600">No events available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};

export default EventList;
