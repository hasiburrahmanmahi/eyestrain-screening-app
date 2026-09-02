import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS } from '../config/constants';
import { useAuth } from '../context/AuthContext';
import { getUserPredictions } from '../services/api';

export default function DashboardScreen({ setActiveTab }) {
  const { user, profile, isSuperAdmin } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    setLoading(true);
    const data = await getUserPredictions(user.id);
    setHistory(data);
    setLoading(false);
  };

  const latest = history.length > 0 ? history[0] : null;

  const getRiskBandStyle = (band) => {
    switch (band) {
      case 'High':
        return { bg: COLORS.riskHighBg, text: COLORS.riskHigh, label: 'High Risk' };
      case 'Moderate':
        return { bg: COLORS.riskModerateBg, text: COLORS.riskModerate, label: 'Moderate Risk' };
      default:
        return { bg: COLORS.riskLowBg, text: COLORS.riskLow, label: 'Low Risk' };
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Welcome Banner */}
      <View style={styles.welcomeCard}>
        <View>
          <Text style={styles.welcomeSub}>Student Screening Portal</Text>
          <Text style={styles.welcomeTitle}>Welcome back, {user?.email?.split('@')[0]} 👋</Text>
          <Text style={styles.roleTag}>
            Account Role: <Text style={styles.roleTagValue}>{profile?.role || 'user'}</Text>
          </Text>
        </View>

        <TouchableOpacity style={styles.ctaButton} onPress={() => setActiveTab('Predict')}>
          <Text style={styles.ctaButtonText}>⚡ Check Your Eye Strain</Text>
        </TouchableOpacity>
      </View>

      {/* Latest Prediction Summary Card */}
      <Text style={styles.sectionTitle}>Latest Screening Overview</Text>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 20 }} />
      ) : latest ? (
        <View style={styles.latestCard}>
          <View style={styles.latestHeader}>
            <View>
              <Text style={styles.latestDate}>
                Assessed on {new Date(latest.created_at).toLocaleDateString()} at {new Date(latest.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Text style={styles.latestPredictionText}>
                Result: <Text style={{ fontWeight: '800' }}>{latest.prediction}</Text>
              </Text>
            </View>

            <View style={[styles.badge, { backgroundColor: getRiskBandStyle(latest.risk_band).bg }]}>
              <Text style={[styles.badgeText, { color: getRiskBandStyle(latest.risk_band).text }]}>
                {getRiskBandStyle(latest.risk_band).label} ({Math.round(latest.probability * 100)}%)
              </Text>
            </View>
          </View>

          <View style={styles.scoreRow}>
            <View style={styles.scoreMetric}>
              <Text style={styles.metricValue}>{latest.des_score.toFixed(1)} / 14</Text>
              <Text style={styles.metricLabel}>DES Risk Score</Text>
            </View>

            <View style={styles.scoreMetric}>
              <Text style={styles.metricValue}>{Math.round(latest.probability * 100)}%</Text>
              <Text style={styles.metricLabel}>Likelihood Score</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>👁️</Text>
          <Text style={styles.emptyTitle}>No Assessments Completed Yet</Text>
          <Text style={styles.emptySubtitle}>
            Complete your first 12-question screening to evaluate your Digital Eye Strain risk level.
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => setActiveTab('Predict')}>
            <Text style={styles.emptyButtonText}>Take 12-Question Screening</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Previous Screening History */}
      {history.length > 1 && (
        <>
          <Text style={styles.sectionTitle}>Screening History ({history.length})</Text>
          <View style={styles.historyCard}>
            {history.map((item, idx) => (
              <View key={item.id || idx} style={[styles.historyRow, idx === history.length - 1 && { borderBottomWidth: 0 }]}>
                <View>
                  <Text style={styles.historyDate}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                  <Text style={styles.historyPrediction}>
                    {item.prediction} (Score: {item.des_score?.toFixed(1)})
                  </Text>
                </View>
                <View style={[styles.miniBadge, { backgroundColor: getRiskBandStyle(item.risk_band).bg }]}>
                  <Text style={[styles.miniBadgeText, { color: getRiskBandStyle(item.risk_band).text }]}>
                    {item.risk_band} ({Math.round(item.probability * 100)}%)
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Health & Ergonomics Tips Card */}
      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Quick Daily Eye Care Checklist</Text>
        <Text style={styles.tipItem}>• <Text style={styles.bold}>20-20-20 Rule:</Text> Look at something 20 ft away for 20 sec every 20 min.</Text>
        <Text style={styles.tipItem}>• <Text style={styles.bold}>Viewing Distance:</Text> Keep screens at least 20 inches away.</Text>
        <Text style={styles.tipItem}>• <Text style={styles.bold}>Room Lighting:</Text> Never use devices in Pitch-black rooms.</Text>
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
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  welcomeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  welcomeSub: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginVertical: 4,
  },
  roleTag: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  roleTagValue: {
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  ctaButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 14,
  },
  latestCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  latestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 10,
  },
  latestDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  latestPredictionText: {
    fontSize: 18,
    color: COLORS.text,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 14,
  },
  scoreMetric: {
    flex: 1,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 400,
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontWeight: '700',
  },
  historyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  historyDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  historyPrediction: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  miniBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  miniBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tipsCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 10,
  },
  tipItem: {
    fontSize: 13,
    color: '#14532d',
    marginBottom: 6,
    lineHeight: 18,
  },
  bold: {
    fontWeight: '700',
  },
});
