import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { ethers } from "ethers";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Dummy user database
let users = {
  admin: { password: "1234", wallet: "", nonce: "" },
};

// ✅ Step 1: Login with username + password → generate nonce
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (users[username] && users[username].password === password) {
    // Generate random nonce and store it
    const nonce = Math.random().toString(36).substring(2, 8);
    users[username].nonce = nonce;

    res.json({
      success: true,
      nonce,
      message: "Login successful! Proceed to wallet verification.",
    });
  } else {
    res.json({ success: false, message: "Invalid credentials" });
  }
});

// ✅ Step 2: Verify wallet signature
app.post("/verify-signature", (req, res) => {
  const { username, signature, walletAddress } = req.body;

  const user = users[username];
  if (!user || !user.nonce) {
    return res.json({ success: false, message: "User or nonce not found" });
  }

  try {
    const recoveredAddress = ethers.verifyMessage(user.nonce, signature);

    if (recoveredAddress.toLowerCase() === walletAddress.toLowerCase()) {
      // Success ✅
      users[username].wallet = walletAddress;
      users[username].nonce = Math.random().toString(36).substring(2, 8); // refresh nonce

      res.json({
        success: true,
        message: "✅ 2FA verified successfully!",
        redirect: "/dashboard.html",
      });
    } else {
      res.json({ success: false, message: "❌ Invalid signature" });
    }
  } catch (error) {
    console.error("Verification error:", error);
    res.json({ success: false, message: "Verification failed" });
  }
});

// ✅ Optional: Serve frontend files locally (for testing dashboard)
app.use(express.static("./public")); // assumes your HTML, CSS, JS inside `public/`

app.listen(3000, () =>
  console.log("🚀 Backend running on http://localhost:3000")
);



