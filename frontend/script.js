// script.js
document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const welcome = document.getElementById("welcomeUser");

  // 🔐 Redirect if not logged in
  if (!user) {
    window.location.href = "login.html";
  } else {
    welcome.innerText = `👤 Logged in as: ${user.name}`;
    await loadHistory(user._id);
  }

  // 💰 Calculate EMI (handles both months & years)
  document.getElementById("calcBtn").addEventListener("click", async () => {
    const amount = parseFloat(document.getElementById("amount").value);
    const rate = parseFloat(document.getElementById("rate").value);
    let months = parseFloat(document.getElementById("months").value);
    const resultDiv = document.getElementById("result");

    if (!amount || !rate || !months) {
      resultDiv.innerHTML = "<p class='error'>⚠️ Please fill all fields.</p>";
      return;
    }

    if (months <= 50) {
      months = months * 12; // convert years → months
    }

    const monthlyRate = rate / 12 / 100;
    const emi =
      (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    const totalPayment = emi * months;
    const totalInterest = totalPayment - amount;

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    resultDiv.innerHTML = `
      <div class="card">
        <p>📅 Tenure: ${
          years > 0
            ? `${years} years ${remainingMonths} months`
            : `${months} months`
        }</p>
        <p>💰 Monthly EMI: ₹${emi.toFixed(2)}</p>
        <p>💸 Total Interest: ₹${totalInterest.toFixed(2)}</p>
        <p>🏦 Total Payment: ₹${totalPayment.toFixed(2)}</p>
      </div>
    `;

    // 🔗 Save calculation record via backend API
    await fetch(`${BASE_URL}/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        rate,
        years: months / 12,
        userId: user._id,
      }),
    });

    await loadHistory(user._id);
  });
});

// 📜 Fetch and display calculation history
async function loadHistory(userId) {
  const res = await fetch(`${BASE_URL}/history/${userId}`);
  const data = await res.json();

  const historyDiv = document.getElementById("history");

  if (!data.length) {
    historyDiv.innerHTML = "<p>No previous records found.</p>";
    return;
  }

  historyDiv.innerHTML = data
    .map(
      (r) => `
      <div class="history-item">
        ₹${r.amount} at ${r.rate}% for ${Math.round(r.years * 12)} months → 
        EMI: ₹${r.emi.toFixed(2)}
      </div>
    `
    )
    .join("");
}
