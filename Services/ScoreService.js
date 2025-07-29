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
      listEl.innerHTML = ""; // Clear "Loading scores..."
      data.forEach((entry, index) => {
        const div = document.createElement("div");
        div.textContent = `${index + 1}. ${entry.name} - ${entry.score}`;
        listEl.appendChild(div);
      });
    }
  }
}
