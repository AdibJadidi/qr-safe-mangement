import React from "react";
import Link from "next/link";
interface ItemsProps {
  items: any[];
  setSelectedItem: (item: any) => void;
}
const Items = ({ items, setSelectedItem }: ItemsProps) => {
  if (items.length === 0) {
    return (
      <div className="mt-12 text-gray-500 italic">
        No items registered yet. Add one above!
      </div>
    );
  }

  const getStaticMapUrl = (lat: number, lng: number) => {
    const zoom = 15;
    const size = "300,200";

    return `https://static-maps.yandex.ru/1.x/?lang=en_US&ll=${lng},${lat}&z=${zoom}&l=map&size=${size}&pt=${lng},${lat},pm2rdl`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 w-full max-w-4xl">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-neutral-700 p-6 gap-2 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between hover:border-blue-200 transition-colors"
          style={{ height: "fit-content" }}
        >
          <div>
            <h3 className="font-bold text-lg text-white-800">{item.name}</h3>
            <p className="text-gray-400 text-xs mb-4">
              Registered on:{" "}
              {new Date(item.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/chat/${item.id}?role=owner`}
              className="flex-1 bg-cyan-800 text-white-600 text-center py-2 rounded-lg text-sm font-medium hover:bg-cyan-950 transition-colors"
            >
              View Chats
            </Link>
            <button
              onClick={() => setSelectedItem(item)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-gray-500 transition-colors cursor-pointer"
            >
              QR Code
            </button>
          </div>
          {item?.last_lat && item?.last_lng && (
            <div>
              <a
                href={`https://www.google.com/maps?q=${item?.last_lat},${item?.last_lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-xs text-blue-500 underline flex items-center gap-1"
              >
                <img
                  src={getStaticMapUrl(
                    item?.last_lat, // Latitude
                    item?.last_lng, // Longitude
                  )}
                  alt="Location Map"
                  className="w-full h-auto object-cover border-b rounded-2xl"
                />
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Items;
