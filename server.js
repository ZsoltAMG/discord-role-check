import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = "https://discord-role-check.onrender.com/callback";

app.get("/", (req, res) => {
    res.send(`<a href="https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds">Login with Discord</a>`);
});

app.get("/callback", async (req, res) => {
    const code = req.query.code;
    if (!code) return res.send("No code provided");

    try {
        // Token kérése
        const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: "authorization_code",
                code,
                redirect_uri: REDIRECT_URI
            })
        });

        const tokenData = await tokenResponse.json();
        if (tokenData.error) return res.send(`Token error: ${tokenData.error_description || tokenData.error}`);

        // Felhasználó lekérése
        const userResponse = await fetch("https://discord.com/api/users/@me", {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });
        const userData = await userResponse.json();

        res.send(`<h1>Szia, ${userData.username}!</h1><p>ID: ${userData.id}</p>`);
    } catch (err) {
        console.error(err);
        res.send("Hiba történt az autentikáció során.");
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Szerver fut a ${PORT} porton`));
