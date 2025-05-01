import React, { useEffect, useState } from "react";

export default function ResultsPage() {
  const [data, setData] = useState(null);

 
useEffect(() => {
  chrome.runtime.sendMessage({ type: "GET_PRODUCT_INFO" }, (response) => {
    console.log("Popup received:", response); // 👈 check this
    if (response) {
      setData({
        baxusMatches: response.baxusMatches || [],
      });
    } else {
      setData({ baxusMatches: [] });
    }
  });
}, []);

  if (!data) return <div>Loading...</div>;

  


const topBaxusDeals = Array.from(
  new Map(
    (data?.baxusMatches || [])
      .filter((match) => match.betterDeal === "baxus")
      .map((match) => [match.baxus.name, match]) // dedupe by name
  ).values()
)

console.log("Top Baxus Deals:", topBaxusDeals);



  
return (
  <div className="flex flex-col items-center justify-center p-4">
    <h1 className="font-bold text-4xl my-10">BAXUS Price Comparison</h1>

    {topBaxusDeals.length === 0 ? (
      <p>No BAXUS listings beat original prices.</p>
    ) : (
      topBaxusDeals.map((match, i) => (
        <div
          key={i}
          className="my-6 w-[80vw] lg:w-[60vw] border border-gray-300 rounded-xl p-4 shadow-md">
          <div className="flex justify-between items-center gap-4">
            {/* Scraped */}
            <div className="w-1/2 text-center">
              <img
                src={match.scraped.image || "default.jpg"}
                className="w-full h-[350px] lg:h-[500px] object-cover rounded-md mb-2"
              />
              <p className="font-semibold">{match.scraped.name}</p>
              <p>
                Price: {match.scraped.price ? `$${match.scraped.price}` : "N/A"}
              </p>
            </div>

            {/* BAXUS */}
            <div className="w-1/2 text-center">
              <img
                src={
                  match.baxus.images?.[0] || match.baxus.image || "default.jpg"
                }
                className="w-full h-[350px] lg:h-[500px] object-cover rounded-md mb-2"
              />
              <p className="font-semibold">{match.baxus.name}</p>
              <p>Price: ${match.baxus.price}</p>
              <p className="font-bold">BAXUS PRODUCT</p>
            </div>
          </div>

          {/* Deal Info */}
          <div className="mt-4 text-center">
            <p className="text-green-600 font-semibold">
              BAXUS has the better price!
            </p>
            <p>
              <strong>Savings:</strong> ${match.savings}
            </p>
            <a
              href={`https://baxus.co/asset/${match.baxus._id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 bg-[rgb(28,109,114)] text-white px-4 py-2 rounded-xl hover:bg-[#1c6d72]">
              View on BAXUS
            </a>
          </div>
        </div>
      ))
    )}
  </div>
);


}
