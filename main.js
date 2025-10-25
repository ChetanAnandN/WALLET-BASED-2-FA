const form = document.getElementById("loginForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Step 1: Send username & password to backend
  const res = await fetch("http://localhost:3000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (!data.success) {
    message.textContent = data.message;
    message.style.color = "red";
    return;
  }

  // Step 2: Connect MetaMask
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const walletAddress = accounts[0];

      // Step 3: Sign nonce
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [data.nonce, walletAddress],
      });

      // Step 4: Verify with backend
      const verifyRes = await fetch("http://localhost:3000/verify-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, signature, walletAddress }),
      });

      const verifyData = await verifyRes.json();
      message.textContent = verifyData.message;
      message.style.color = verifyData.success ? "lightgreen" : "red";

      // Step 5: Redirect to dashboard on success
      if (verifyData.success) {
        setTimeout(() => {
          window.location.href = "./dashboard.html";
        }, 1500);
      }
    } catch (err) {
      message.textContent = "⚠️ MetaMask not connected.";
      console.error(err);
    }
  } else {
    message.textContent = "⚠️ MetaMask not detected!";
  }
});

