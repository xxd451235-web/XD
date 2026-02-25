const express = require('express');
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("65 WPM Hızlı İnsansı Mod Aktif!");
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda aktif.`);
});

const TOKEN = process.env.TOKEN; 
const CHANNEL_IDS = process.env.CHANNEL_IDS;
const MESSAGE = process.env.MESSAGE;

if (!TOKEN || !CHANNEL_IDS || !MESSAGE) {
    console.error("HATA: Değişkenler eksik! Render panelini kontrol et.");
} else {
    const channelList = CHANNEL_IDS.split(",").map(c => c.trim());
    
    async function startProcess() {
        while (true) { 
            for (const channelId of channelList) {
                try {
                    // 1. "Yazıyor..." animasyonunu gönder
                    await axios.post(
                        `https://discord.com/api/v9/channels/${channelId}/typing`,
                        {},
                        { headers: { "Authorization": TOKEN } }
                    );

                    // 2. 65 WPM HESABI: Harf başına 185ms bekleme
                    // (60.000ms / (65 kelime * 5 harf)) = ~185ms
                    const typingTime = MESSAGE.length * 185;
                    console.log(`[${channelId}] 65 WPM hızında yazılıyor... (${Math.round(typingTime)}ms)`);
                    
                    await new Promise(resolve => setTimeout(resolve, typingTime));

                    // 3. Mesajı Gönder
                    await axios.post(
                        `https://discord.com/api/v9/channels/${channelId}/messages`,
                        { content: MESSAGE },
                        { headers: { "Authorization": TOKEN } }
                    );
                    console.log(`[${channelId}] ✅ Mesaj gönderildi.`);

                    // 4. Kanal geçiş aralığı (0.5 saniye dinlenme)
                    await new Promise(resolve => setTimeout(resolve, 500));

                } catch (err) {
                    console.error(`[${channelId}] Hata: ${err.response?.status}. 5sn sonra devam...`);
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }
        }
    }
    startProcess();
}
