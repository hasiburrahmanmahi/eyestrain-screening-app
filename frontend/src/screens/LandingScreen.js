import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '../config/constants';
import { useAuth } from '../context/AuthContext';

export default function LandingScreen({ setActiveTab }) {
  const { user } = useAuth();

  const handleStart = () => {
    if (user) {
      setActiveTab('Predict');
    } else {
      setActiveTab('Auth');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Hero Section */}
      <View style={styles.heroCard}>
        <Text style={styles.heroBadge}>🔬 Research-Backed Machine Learning</Text>
        <Text style={styles.heroTitle}>Digital Eye Strain (DES) Risk Screening Tool</Text>
        <Text style={styles.heroDescription}>
          Screen your risk of computer vision syndrome and digital eye strain based on Daffodil International University's cross-sectional research on university students.
        </Text>

        <View style={styles.heroButtonRow}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleStart}>
            <Text style={styles.primaryButtonText}>
              {user ? '⚡ Start Eye Strain Check' : '🚀 Start Assessment Now'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => setActiveTab('About')}>
            <Text style={styles.secondaryButtonText}>📖 About the Research</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Feature Cards Grid */}
      <Text style={styles.sectionHeader}>Key Screening Capabilities</Text>

      <View style={styles.gridContainer}>
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>🤖</Text>
          <Text style={styles.featureTitle}>Pre-Trained Random Forest AI</Text>
          <Text style={styles.featureText}>
            Replicates the published research model trained on 982 student behavioral and ergonomic survey profiles.
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>📋</Text>
          <Text style={styles.featureTitle}>12 Ergonomic Questions</Text>
          <Text style={styles.featureText}>
            Evaluates daily screen hours, 20-20-20 rule adherence, viewing distance, posture, dark room usage, and eyewear.
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>📊</Text>
          <Text style={styles.featureTitle}>Instant Risk Probability</Text>
          <Text style={styles.featureText}>
            Receive immediate likelihood scores, risk level bands (Low, Moderate, High), and personalized health tips.
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>🔒</Text>
          <Text style={styles.featureTitle}>Secure Student Portal</Text>
          <Text style={styles.featureText}>
            Track your eye strain assessment history over time with Supabase encrypted authentication and security.
          </Text>
        </View>
      </View>

      {/* Scientific Predictors Section */}
      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>Key Research Finding</Text>
        <Text style={styles.infoCardText}>
          The underlying 982-student study revealed that <Text style={styles.boldText}>Gender</Text> and <Text style={styles.boldText}>Prescription Glasses/Contacts Use</Text> are the two strongest predictors of Digital Eye Strain severity.
        </Text>
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>
            ⚠️ <Text style={styles.boldText}>Disclaimer:</Text> This platform is an educational screening tool and does not provide clinical medical diagnosis.
          </Text>
        </View>
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
  heroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryLight,
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 34,
    marginBottom: 12,
  },
  heroDescription: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  heroButtonRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 28,
  },
  featureCard: {
    flex: 1,
    minWidth: 240,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  featureText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: COLORS.secondaryLight,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 6,
  },
  infoCardText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 14,
  },
  boldText: {
    fontWeight: '700',
  },
  disclaimerBox: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  disclaimerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
