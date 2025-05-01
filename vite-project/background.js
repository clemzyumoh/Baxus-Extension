

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SCRAPED_PRODUCTS") {
    console.log("📦 Received products from content script:", message.payload);

    (async () => {
      try {
        const response = await fetch("http://localhost:5000/scrape", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bottles: message.payload }),
        });

        const data = await response.json();
        console.log("✅ Matching results from backend:", data);

        if (Array.isArray(data)) {
          const matchedResults = data.filter((match) => match.baxus !== null);

          chrome.storage.local.set(
            {
              matches: matchedResults,
              bottleInfo: matchedResults[0]?.scraped || {},
            },
            () => {
              console.log("💾 Stored only matched bottles in chrome.storage");

              // ✅ Immediately update badge after storing matches
              updateBadge(matchedResults.length > 0);
            }
          );
        } else {
          console.warn("⚠️ No valid matches found in backend response.");
          chrome.storage.local.set({ matches: [] }, () => {
            updateBadge(false); // clear badge if no matches
          });
        }
      } catch (error) {
        console.error("❌ Error sending products to backend:", error);
        updateBadge(false); // clear badge on error
      }
    })();
  }

  if (message.type === "GET_PRODUCT_INFO") {
    console.log("📩 Popup requested product info");
    chrome.storage.local.get(["matches"], (result) => {
      console.log("📤 Sending product info to popup:", result);
      const baxusMatches = result.matches || [];

      sendResponse({
        baxusMatches: baxusMatches,
      });

      // ✅ Optional: update badge again if you want, but backend already handled it
      updateBadge(baxusMatches.length > 0);
    });
    return true; // ✅ Required to keep response channel open
  }
});

function updateBadge(hasMatches) {
  if (hasMatches) {
    chrome.action.setBadgeText({ text: " " }); // empty text → just background
    chrome.action.setBadgeBackgroundColor({ color: "#1c6d72" }); // green dot
  } else {
    chrome.action.setBadgeText({ text: "" }); // clear badge
  }
}
