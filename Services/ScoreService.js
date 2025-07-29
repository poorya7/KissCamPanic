import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ccwqodjxxyzdpotpavbd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjd3FvZGp4eHl6ZHBvdHBhdmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzkxNjMsImV4cCI6MjA2OTMxNTE2M30.B1_fEPuMTvftVFQ5GgjJRDzzcbvRwvEfgM_NA7M158o';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
      listEl.innerHTML = ""; // Clear old content

      data.forEach((entry, index) => {

const row = document.createElement("div");
row.style.fontFamily = '"C64", monospace';
row.style.fontSize = "14px";
row.style.lineHeight = "1.8em";
row.style.textShadow = "0 0 4px rgba(255,255,255,0.3)";
row.style.color = getUserColor(entry.name);
row.style.display = "block";

let rawName = `${index + 1}. ${entry.name}`;
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

// Helper: consistent Twitch-style name color
function getUserColor(name) {
  const colors = [
    "#FFD700", // Gold
    "#1E90FF", // Dodger Blue
    "#FF1493", // Deep Pink
    "#00FA9A", // Medium Spring Green
    "#FF4500", // Orange Red
    "#ADFF2F", // Green Yellow
    "#00CED1", // Dark Turquoise
    "#DA70D6", // Orchid
    "#7FFF00", // Chartreuse
    "#FF69B4", // Hot Pink
    "#40E0D0", // Turquoise
    "#FFA500", // Orange
    "#8A2BE2", // Blue Violet
    "#00FF7F", // Spring Green
    "#DC143C", // Crimson
    "#00BFFF", // Deep Sky Blue
    "#FF6347", // Tomato
    "#00FFFF", // Aqua
    "#FF00FF", // Magenta
    "#7CFC00"  // Lawn Green
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
