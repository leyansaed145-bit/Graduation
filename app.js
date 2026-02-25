const SUPABASE_URL = "https://ehqxujvebnalfzyadfbi.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_YE1IiNo6x4MpTPNhvIsICQ_gQWCTWHu";

const headers = {
  "apikey": SUPABASE_ANON_KEY,
  "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json"
};

const grid = document.getElementById("grid");
const statusEl = document.getElementById("status");

async function fetchGifts() {
  statusEl.textContent = "Loading gifts…";
  const url = `${SUPABASE_URL}/rest/v1/gifts?select=id,title,image_path,reserved&order=id.asc`;
  const res = await fetch(url, { headers });

  if (!res.ok) {
    statusEl.textContent = "Could not load gifts (check Supabase keys/policies).";
    return [];
  }
  const data = await res.json();
  const avail = data.filter(x => !x.reserved).length;
  statusEl.textContent = `Available: ${avail} • Reserved: ${data.length - avail}`;
  return data;
}

function renderGifts(gifts) {
  grid.innerHTML = "";
  for (const g of gifts) {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${g.image_path}" alt="${g.title}"/>
      <div class="body">
        <p class="title">${g.title}</p>
        <div class="badge ${g.reserved ? "reserved" : ""}">
          <span class="dot"></span>
          <span>${g.reserved ? "Reserved" : "Available"}</span>
        </div>
        <button class="reserveBtn" ${g.reserved ? "disabled" : ""}>
          ${g.reserved ? "Already reserved" : "Reserve this gift"}
        </button>
      </div>
    `;

    card.querySelector(".reserveBtn").addEventListener("click", () => reserveGift(g.id));
    grid.appendChild(card);
  }
}

async function reserveGift(giftId) {
  const name = prompt("Write your name:");
  if (!name || !name.trim()) return;

  const url = `${SUPABASE_URL}/rest/v1/gifts?id=eq.${giftId}&reserved=is.false`;
const body = {
  reserved: true,
  reserved_by: name.trim(),
  reserved_at: new Date().toISOString()
};
  const res = await fetch(url, {
    method: "PATCH",
    headers: { ...headers, "Prefer": "return=representation" },
    body: JSON.stringify(body)
  });

  if (res.ok) {
    const updated = await res.json();
    if (!updated || updated.length === 0) alert("Someone reserved it just now 😅");
    else alert("Reserved! 🎓🎁");
  } else {
    alert("Could not reserve (check Supabase policies).");
  }

  const gifts = await fetchGifts();
  renderGifts(gifts);
}

(async function init() {
  const gifts = await fetchGifts();
  renderGifts(gifts);
  setInterval(async () => {
    const gifts = await fetchGifts();
    renderGifts(gifts);
  }, 8000);
})();