import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../config/constants';

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.card}>
        <Text style={styles.badge}>Daffodil International University</Text>
        <Text style={styles.title}>About the Digital Eye Strain Research Project</Text>
        
        <Text style={styles.paragraph}>
          This screening application is built directly upon the findings of the research paper titled:
        </Text>
        <Text style={styles.paperTitle}>
          "Predicting Digital Eye Strain Factors: A Cross-Sectional Study based on Behavioral and Ergonomic Data"
        </Text>

        <Text style={styles.sectionHeader}>Objective & Methodology</Text>
        <Text style={styles.paragraph}>
          Digital Eye Strain (DES) or Computer Vision Syndrome (CVS) affects up to 70% of university students who engage in extended screen viewing for online learning, coding, and digital leisure. This study gathered comprehensive behavioral, ergonomic, and symptom data across 982 students to construct and evaluate predictive machine learning classifiers.
        </Text>

        <Text style={styles.sectionHeader}>Machine Learning Architecture</Text>
        <Text style={styles.paragraph}>
          Our platform embeds the pre-trained <Text style={styles.boldText}>Random Forest Regressor</Text> model. The preprocessor transforms 12 key non-invasive survey indicators (gender, age, year of study, screen distance, 20-20-20 rule practice, dark room usage, posture, blue-light filter, continuous session length, and corrective eyewear) into standardized feature vectors to predict risk likelihood scores.
        </Text>

        <Text style={styles.sectionHeader}>Research Team & Institutional Credits</Text>
        <View style={styles.creditsBox}>
          <Text style={styles.creditItem}>• <Text style={styles.boldText}>Department:</Text> Department of Computer Science & Engineering</Text>
          <Text style={styles.creditItem}>• <Text style={styles.boldText}>Institution:</Text> Daffodil International University (DIU)</Text>
          <Text style={styles.creditItem}>• <Text style={styles.boldText}>Support Contact:</Text> help.eyestrain@gmail.com</Text>
        </View>

        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>⚠️ Important Medical Disclaimer</Text>
          <Text style={styles.disclaimerText}>
            This application provides a screening risk assessment based on statistical machine learning models trained on university student survey data. It is intended strictly for educational awareness and self-evaluation. It does NOT constitute medical advice, diagnosis, or treatment. Users experiencing persistent visual discomfort, severe eye pain, or blurred vision should consult a licensed optometrist or ophthalmologist.
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
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  badge: {
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
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
  },
  paperTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryDark,
    fontStyle: 'italic',
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 14,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  boldText: {
    fontWeight: '700',
    color: COLORS.text,
  },
  creditsBox: {
    backgroundColor: COLORS.background,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    gap: 6,
  },
  creditItem: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  disclaimerCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 10,
    padding: 18,
    borderWidth: 1,
    borderColor: '#fcd34d',
    marginTop: 10,
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#b45309',
    marginBottom: 6,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 19,
  },
});
