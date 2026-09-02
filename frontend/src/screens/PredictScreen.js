import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { COLORS, QUESTIONS } from '../config/constants';
import { getPredictionFromBackend } from '../services/api';

export default function PredictScreen({ onPredictionComplete }) {
  const [answers, setAnswers] = useState({
    gender: 'Male',
    age: '22',
    study_year: '3rd year',
    screen_time: '4 to 7 hours',
    device: 'Laptop',
    blue_light: 'Sometimes',
    screen_distance: 'Sometimes',
    rule_20_20_20: 'Sometimes',
    dark_room: 'Sometimes',
    poor_posture: 'Sometimes',
    glasses: 'No',
    continuous_use: '30–60 min',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleOptionSelect = (id, option) => {
    setAnswers(prev => ({ ...prev, [id]: option }));
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    if (!answers.age || isNaN(answers.age) || parseInt(answers.age) <= 0) {
      setErrorMsg('Please enter a valid age (e.g. 21).');
      return;
    }

    setLoading(true);
    try {
      const result = await getPredictionFromBackend(answers);
      onPredictionComplete(result, answers);
    } catch (err) {
      console.error("[PredictScreen] Submission error:", err);
      setErrorMsg('Failed to process prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>👁️ Digital Eye Strain Risk Assessment</Text>
        <Text style={styles.headerSubtitle}>
          Answer the 12 behavioral and ergonomic questions below to calculate your risk likelihood.
        </Text>
      </View>

      {errorMsg ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
        </View>
      ) : null}

      {QUESTIONS.map((q) => (
        <View key={q.id} style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionNumber}>Q{q.questionNumber}</Text>
            <Text style={styles.questionTitle}>{q.title}</Text>
          </View>
          {q.helpText ? <Text style={styles.helpText}>{q.helpText}</Text> : null}

          {q.type === 'number' ? (
            <TextInput
              style={styles.numberInput}
              keyboardType="numeric"
              placeholder={q.placeholder}
              placeholderTextColor={COLORS.textMuted}
              value={answers[q.id]}
              onChangeText={(text) => handleOptionSelect(q.id, text)}
            />
          ) : (
            <View style={styles.optionsRow}>
              {q.options.map((opt) => {
                const isSelected = answers[q.id] === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.optionBtn, isSelected && styles.optionBtnSelected]}
                    onPress={() => handleOptionSelect(q.id, opt)}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      ))}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.submitButtonText}>Submit 12 Answers & Calculate Risk</Text>
        )}
      </TouchableOpacity>
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
  headerBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: '#b91c1c',
  },
  questionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  questionNumber: {
    backgroundColor: COLORS.primaryLight,
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  questionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  helpText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  numberInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.text,
    maxWidth: 200,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  optionBtn: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  optionBtnSelected: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  optionTextSelected: {
    color: '#ffffff',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
