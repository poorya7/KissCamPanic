import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ccwqodjxxyzdpotpavbd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjd3FvZGp4eHl6ZHBvdHBhdmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzkxNjMsImV4cCI6MjA2OTMxNTE2M30.B1_fEPuMTvftVFQ5GgjJRDzzcbvRwvEfgM_NA7M158o';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 🎨 Rank-based color palette
const colorList = [
  "#FFD700", "#1E90FF", "#FF1493", "#00FA9A", "#FF4500",
  "#ADFF2F", "#00CED1", "#DA70D6", "#7FFF00", "#FF69B4",
  "#40E0D0", "#FFA500", "#8A2BE2", "#00FF7F", "#DC143C",
  "#00BFFF", "#FF6347", "#00FFFF", "#FF00FF", "#7CFC00"
];

export default class ScoreService {
  static async saveScore(name, score) {
    const { error } = await supabase
      .from('highscores')
      .insert([{ name, score }]);

    if (error) {
      console.error('❌ Failed to save score:', error.message);
    } else {
      console.log('✅ Score saved:', { name, score });
    }
  }

  static async getTopScores(limit = 20) {
    const { data, error } = await supabase
      .from('highscores')
      .select('name, score')
      .order('score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Failed to fetch scores:', error.message);
      return;
    }

    console.log('📋 Top scores:', data);

    const listEl = document.getElementById("highscore-list");
    if (listEl) {
      listEl.innerHTML = ""; // Clear "Loading scores..."

      data.forEach((entry, index) => {
        const row = document.createElement("div");
        const color = colorList[index % colorList.length];

        row.style.fontFamily = '"C64", monospace';
        row.style.fontSize = "14px";
        row.style.lineHeight = "1.8em";
        row.style.textShadow = "0 0 4px rgba(255,255,255,0.3)";
        row.style.color = color;
        row.style.display = "block";

        const rank = (index + 1).toString().padStart(2, "0");
        let rawName = `${rank}. ${entry.name}`;
        if (rawName.length > 20) {
          rawName = rawName.slice(0, 17) + '…';
        }

        const score = (entry.score ?? 0).toString().padStart(6, "0");

        row.textContent = `${rawName.padEnd(20, ' ')} ${score}`;
        listEl.appendChild(row);
      });
    }
  }
}
