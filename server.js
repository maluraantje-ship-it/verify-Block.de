const express = require('express');
const axios = require('axios');
require('dotenv').config();
const path = require('path');

const app = express();

// 👉 KOMMT AUS .env (nicht hier eintragen!)
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const BOT_TOKEN = process.env.BOT_TOKEN;

// 👉 HIER DEINE DISCORD SERVER ID EINTRAGEN
const GUILD_ID = "1484233139080527902";

// 👉 DAS HAST DU SCHON (Whitelist Rolle)
const ROLE_ID = "1484257344488603728";

// Frontend anzeigen
app.use(express.static(path.join(__dirname, 'public')));

// Discord Callback
app.get('/callback', async (req, res) => {
  const code = req.query.code;

  try {
    // Token holen
    const tokenResponse = await axios.post(
      'https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: CLIENT_ID,           // kommt aus .env
        client_secret: CLIENT_SECRET,   // kommt aus .env
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI      // kommt aus .env
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const accessToken = tokenResponse.data.access_token;

    // User holen
    const userResponse = await axios.get(
      'https://discord.com/api/users/@me',
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    const userId = userResponse.data.id;

    // User zum Server hinzufügen
    await axios.put(
      `https://discord.com/api/guilds/${GUILD_ID}/members/${userId}`,
      { access_token: accessToken },
      {
        headers: {
          Authorization: `Bot ${BOT_TOKEN}`, // kommt aus .env
          'Content-Type': 'application/json'
        }
      }
    );

    // Rolle geben
    await axios.put(
      `https://discord.com/api/guilds/${GUILD_ID}/members/${userId}/roles/${ROLE_ID}`,
      {},
      {
        headers: {
          Authorization: `Bot ${BOT_TOKEN}` // kommt aus .env
        }
      }
    );

    res.send("✅ Verifiziert! Du hast die Whitelist Rolle.");
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.send("❌ Fehler bei der Verifizierung.");
  }
});

app.listen(3000, () => console.log("Server läuft auf http://localhost:3000"));
