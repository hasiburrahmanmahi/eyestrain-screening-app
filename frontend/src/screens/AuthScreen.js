import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../config/constants';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen({ setActiveTab }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { signIn, signUp } = useAuth();

  const handleAuth = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!email.trim() || !password) {
      setErrorMsg('Please provide both email address and password.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email.trim(), password);
        setSuccessMsg('Account created successfully! Redirecting to Dashboard...');
        setTimeout(() => setActiveTab('Dashboard'), 1200);
      } else {
        await signIn(email.trim(), password);
        setActiveTab('Dashboard');
      }
    } catch (err) {
      console.error("[Auth] Error:", err);
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdminFill = () => {
    setEmail('help.eyestrain@gmail.com');
    setPassword('EyeStrain123#');
    setIsSignUp(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.logoText}>👁️</Text>
        <Text style={styles.title}>{isSignUp ? 'Create Student Account' : 'Welcome Back'}</Text>
        <Text style={styles.subtitle}>
          {isSignUp ? 'Register to save your eye strain risk evaluations.' : 'Sign in to access your eye strain screening portal.'}
        </Text>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, !isSignUp && styles.activeTab]}
            onPress={() => { setIsSignUp(false); setErrorMsg(''); setSuccessMsg(''); }}
          >
            <Text style={[styles.tabText, !isSignUp && styles.activeTabText]}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, isSignUp && styles.activeTab]}
            onPress={() => { setIsSignUp(true); setErrorMsg(''); setSuccessMsg(''); }}
          >
            <Text style={[styles.tabText, isSignUp && styles.activeTabText]}>Register</Text>
          </TouchableOpacity>
        </View>

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
          </View>
        ) : null}

        {successMsg ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>✅ {successMsg}</Text>
          </View>
        ) : null}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="student@university.edu"
            placeholderTextColor={COLORS.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••••••"
            placeholderTextColor={COLORS.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleAuth} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Demo Super Admin quick autofill link */}
        {!isSignUp && (
          <TouchableOpacity style={styles.adminQuickLink} onPress={handleQuickAdminFill}>
            <Text style={styles.adminQuickText}>⚡ Auto-fill Fixed Super Admin Credentials</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 28,
    width: '100%',
    maxWidth: 440,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  logoText: {
    fontSize: 36,
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.primaryDark,
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    padding: 10,
    borderRadius: 6,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: '#b91c1c',
  },
  successBox: {
    backgroundColor: '#dcfce7',
    padding: 10,
    borderRadius: 6,
    marginBottom: 16,
  },
  successText: {
    fontSize: 13,
    color: '#15803d',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  adminQuickLink: {
    marginTop: 18,
    paddingVertical: 8,
    alignItems: 'center',
  },
  adminQuickText: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '600',
  },
});
