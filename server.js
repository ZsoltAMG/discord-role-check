import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.get("/", (req, res) => {
  res.send(`<h1>Discord Role Check</h1>
    <a href="/login">Bejelentkezés Discorddal</a>`);
});

app.get("/login", (req, res) => {
  const authorizeURL = `https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&response_type=code&scope=identify%20guilds.members.read`;
  res.redirect(authorizeURL);
});

app.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send("Nincs kód!");

  // Token kérése
  const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.REDIRECT_URI
    })
  });

  const tokenData = await tokenResponse.json();
  if (!tokenData.access_token) return res.send("Hiba a token kérésnél!");

  // Felhasználó adatai
  const userResponse = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });
  const userData = await userResponse.json();

  // Szerver tagság lekérése
  const memberResponse = await fetch(`https://discord.com/api/users/@me/guilds/${process.env.GUILD_ID}/member`, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });
  const memberData = await memberResponse.json();

  if (memberData.roles && memberData.roles.includes(process.env.ROLE_ID)) {
    res.send(`<h1>Szia, ${userData.username}!</h1><p>Van megfelelő rangod ✅</p>`);
  } else {
    res.send(`<h1>Szia, ${userData.username}!</h1><p>Nincs megfelelő rangod ❌</p>`);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Szerver fut a ${PORT} porton`));

if (!response.ok) {
    console.error(await response.text());
    throw new Error(`HTTP error! status: ${response.status}`);
