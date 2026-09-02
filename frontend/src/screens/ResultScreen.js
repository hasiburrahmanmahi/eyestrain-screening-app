import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS } from '../config/constants';
import { useAuth } from '../context/AuthContext';
import { savePredictionToSupabase } from '../services/api';

export default function ResultScreen({ predictionResult, answers, setActiveTab }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && predictionResult && !saved) {
      saveResult();
    }
  }, [user, predictionResult]);

  const saveResult = async () => {
    setSaving(true);
    await savePredictionToSupabase(user.id, answers, predictionResult);
    setSaved(true);
    setSaving(false);
  };

  if (!predictionResult) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No screening result found.</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => setActiveTab('Predict')}>
          <Text style={styles.primaryButtonText}>Take Assessment</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { prediction, probability, probability_percentage, risk_band, des_score, personalized_feedback, research_note } = predictionResult;

  const getRiskColors = () => {
    if (risk_band === 'High') {
      return { bg: COLORS.riskHighBg, border: '#fca5a5', text: COLORS.riskHigh, title: 'High Risk' };
    } else if (risk_band === 'Moderate') {
      return { bg: COLORS.riskModerateBg, border: '#fcd34d', text: COLORS.riskModerate, title: 'Moderate Risk' };
    } else {
      return { bg: COLORS.riskLowBg, border: '#86efac', text: COLORS.riskLow, title: 'Low Risk' };
    }
  };

  const colors = getRiskColors();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Result Overview Header Card */}
      <View style={[styles.resultCard, { backgroundColor: colors.bg, borderColor: colors.border }]}>
        <View style={styles.badgeRow}>
          <View style={[styles.riskBadge, { backgroundColor: colors.text }]}>
            <Text style={styles.riskBadgeText}>{colors.title}</Text>
          </View>
          {saving ? (
            <Text style={styles.savingText}>Saving to Supabase...</Text>
          ) : saved ? (
            <Text style={styles.savedText}>✅ Saved to Profile</Text>
          ) : null}
        </View>

        <Text style={styles.resultTitle}>Classification: {prediction}</Text>
        <Text style={[styles.probabilityText, { color: colors.text }]}>
          {probability_percentage || Math.round(probability * 100)}% Likelihood Score
        </Text>
        <Text style={styles.scoreDetail}>
          Model Score: <Text style={{ fontWeight: '800' }}>{des_score?.toFixed(1)}</Text> / 14.0
        </Text>
      </View>

      {/* Personalized Recommendations */}
      <Text style={styles.sectionHeader}>Personalized Ergonomic Advice</Text>
      <View style={styles.feedbackCard}>
        {personalized_feedback && personalized_feedback.length > 0 ? (
          personalized_feedback.map((tip, idx) => (
            <View key={idx} style={styles.tipRow}>
              <Text style={styles.tipIcon}>💡</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.tipText}>Maintain your current healthy posture and screen habits!</Text>
        )}
      </View>

      {/* Research Predictor Note */}
      <View style={styles.researchCard}>
        <Text style={styles.researchTitle}>🔬 Research Study Context</Text>
        <Text style={styles.researchText}>{research_note}</Text>
      </View>

      {/* Navigation Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => setActiveTab('Dashboard')}>
          <Text style={styles.primaryButtonText}>Go to Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => setActiveTab('Predict')}>
          <Text style={styles.secondaryButtonText}>🔄 Retake Screening</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: 20,
    maxWidth: 750,
    alignSelf: 'center',
    width: '100%',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    marginBottom: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  riskBadgeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  savedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803d',
  },
  savingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  probabilityText: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  scoreDetail: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  feedbackCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    gap: 14,
  },
  tipRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  tipIcon: {
    fontSize: 18,
  },
  tipText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    flex: 1,
  },
  researchCard: {
    backgroundColor: COLORS.secondaryLight,
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#bae6fd',
    marginBottom: 24,
  },
  researchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 6,
  },
  researchText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
});
