import { Suspense } from "react";
import DiscoverContent from "./DiscoverContent";

export default function Discover() {
  return (
    <Suspense
      fallback={
        <div className="w-full bg-white">
          <div className="w-full mr-auto ml-auto max-w-[1000px]">
            <div className="px-4 md:px-0 py-3 border-b border-gray-100">
              <h1 className="text-xl font-semibold text-(--fly-text-primary)">
                Discover
              </h1>
            </div>
            <div>
              <div className="grid grid-cols-3 gap-[2px]">
                {[...Array(18)].map((_, index) => (
                  <div
                    key={index}
                    className="w-full aspect-square bg-gray-200 animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      }
    >
      <DiscoverContent />
    </Suspense>
  );
}
