import { BACKEND_API_URL } from '../config/constants';
import { supabase } from './supabase';

/**
 * Sends the 12 survey responses to FastAPI /predict
 */
export async function getPredictionFromBackend(answers) {
  try {
    const response = await fetch(`${BACKEND_API_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(answers),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API Error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[getPredictionFromBackend] Error:", error);
    // Local fallback prediction if backend endpoint is unreachable during testing
    return computeFallbackPrediction(answers);
  }
}

/**
 * Saves a completed prediction to Supabase `predictions` table
 */
export async function savePredictionToSupabase(userId, answers, predictionResult) {
  try {
    const { data, error } = await supabase
      .from('predictions')
      .insert({
        user_id: userId,
        answers: answers,
        prediction: predictionResult.prediction,
        probability: predictionResult.probability,
        risk_band: predictionResult.risk_band,
        des_score: predictionResult.des_score,
      })
      .select()
      .single();

    if (error) {
      console.error("[savePredictionToSupabase] Supabase error:", error);
      throw error;
    }
    return data;
  } catch (err) {
    console.error("[savePredictionToSupabase] Error saving prediction:", err);
    return null;
  }
}

/**
 * Fetches user's prediction history from Supabase
 */
export async function getUserPredictions(userId) {
  try {
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("[getUserPredictions] Error fetching history:", err);
    return [];
  }
}

/**
 * Super Admin: Fetch all predictions across all users
 */
export async function getAllPredictionsAdmin() {
  try {
    const { data, error } = await supabase
      .from('predictions')
      .select('*, profiles:user_id(email)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("[getAllPredictionsAdmin] Error:", err);
    return [];
  }
}

/**
 * Super Admin: Fetch all profiles (users)
 */
export async function getAllProfilesAdmin() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("[getAllProfilesAdmin] Error:", err);
    return [];
  }
}

/**
 * Super Admin: Toggle user role (user <-> super_admin) or active state
 */
export async function updateUserRoleAdmin(profileId, newRole) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', profileId)
      .select();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("[updateUserRoleAdmin] Error:", err);
    throw err;
  }
}

export async function toggleUserActiveAdmin(profileId, isActive) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_active: isActive })
      .eq('id', profileId)
      .select();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("[toggleUserActiveAdmin] Error:", err);
    throw err;
  }
}

/**
 * Super Admin: Fetch original 982-row dataset for dataset viewer
 */
export async function getDatasetRowsAdmin(page = 1, pageSize = 50) {
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('dataset_rows')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order('id', { ascending: true });

    if (error) throw error;
    return { data: data || [], total: count || 0 };
  } catch (err) {
    console.error("[getDatasetRowsAdmin] Error:", err);
    return { data: [], total: 0 };
  }
}

/**
 * Safe local fallback predictor in case backend API is offline during client dev
 */
function computeFallbackPrediction(answers) {
  let score = 3.0;
  if (answers.screen_time === 'More than 7 hours') score += 2.5;
  if (answers.continuous_use === '2+ hrs' || answers.continuous_use === 'More than 60 minutes') score += 2.0;
  if (answers.rule_20_20_20 === 'Never') score += 1.5;
  if (answers.dark_room === 'Always') score += 1.5;
  if (answers.poor_posture === 'Always' || answers.poor_posture === 'Sometimes') score += 1.2;
  if (answers.glasses === 'No') score += 1.0;

  const des_score = Math.min(14.0, Math.max(0.0, score));
  const probability = Math.round((des_score / 14.0) * 100) / 100;
  const prob_percent = Math.round(probability * 100);

  let prediction = "No DES";
  let risk_band = "Low";

  if (des_score > 9.0) {
    prediction = "DES";
    risk_band = "High";
  } else if (des_score >= 5.0) {
    prediction = "DES";
    risk_band = "Moderate";
  }

  const feedback = [];
  if (answers.glasses === 'No' && risk_band === 'High') {
    feedback.append("You do not wear medical glasses, but your high risk score indicates an eye exam is recommended.");
  }
  if (answers.poor_posture === 'Sometimes' || answers.poor_posture === 'Always') {
    feedback.push("Posture Tip: Avoid using screens while lying down or slouching. Sit upright with screen at eye level.");
  }
  if (answers.rule_20_20_20 === 'Never') {
    feedback.push("20-20-20 Rule: Every 20 minutes, take a 20-second break looking at something 20 feet away.");
  }
  if (answers.screen_distance === 'Never') {
    feedback.push("Screen Distance: Keep screens at least 20 inches (one arm's length) from your eyes.");
  }
  if (answers.dark_room === 'Always') {
    feedback.push("Ambient Lighting: Avoid using devices in dark rooms. Ensure soft background lighting.");
  }

  return {
    prediction,
    probability,
    probability_percentage: prob_percent,
    risk_band,
    des_score,
    personalized_feedback: feedback,
    research_note: "Gender and glasses/contacts use were identified as the two strongest risk factors in the underlying research study (982 university students). This screening result is an informative indicator, not a clinical medical diagnosis.",
    raw_answers: answers
  };
}
