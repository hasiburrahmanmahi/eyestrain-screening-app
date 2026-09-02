import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../config/constants';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab, navigation }) {
  const { user, isSuperAdmin, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.brandSection}>
        <Text style={styles.logoIcon}>👁️</Text>
        <TouchableOpacity onPress={() => setActiveTab('Dashboard')}>
          <Text style={styles.brandTitle}>EyeStrain Risk AI</Text>
          <Text style={styles.brandSubtitle}>DIU Research Prototype</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.navItems}>
        {user ? (
          <>
            <TouchableOpacity
              style={[styles.navButton, activeTab === 'Dashboard' && styles.navButtonActive]}
              onPress={() => setActiveTab('Dashboard')}
            >
              <Text style={[styles.navText, activeTab === 'Dashboard' && styles.navTextActive]}>
                Dashboard
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navButton, activeTab === 'Predict' && styles.navButtonActive]}
              onPress={() => setActiveTab('Predict')}
            >
              <Text style={[styles.navText, activeTab === 'Predict' && styles.navTextActive]}>
                Screening
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navButton, activeTab === 'About' && styles.navButtonActive]}
              onPress={() => setActiveTab('About')}
            >
              <Text style={[styles.navText, activeTab === 'About' && styles.navTextActive]}>
                About
              </Text>
            </TouchableOpacity>

            {isSuperAdmin && (
              <TouchableOpacity
                style={[styles.adminButton, activeTab === 'Admin' && styles.adminButtonActive]}
                onPress={() => setActiveTab('Admin')}
              >
                <Text style={styles.adminButtonText}>👑 Admin Panel</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.navButton, activeTab === 'Landing' && styles.navButtonActive]}
              onPress={() => setActiveTab('Landing')}
            >
              <Text style={[styles.navText, activeTab === 'Landing' && styles.navTextActive]}>
                Home
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navButton, activeTab === 'About' && styles.navButtonActive]}
              onPress={() => setActiveTab('About')}
            >
              <Text style={[styles.navText, activeTab === 'About' && styles.navTextActive]}>
                About
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryAuthButton}
              onPress={() => setActiveTab('Auth')}
            >
              <Text style={styles.primaryAuthText}>Sign In / Register</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  brandSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  navItems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: Platform.OS === 'web' ? 0 : 4,
  },
  navButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  navButtonActive: {
    backgroundColor: COLORS.primaryLight,
  },
  navText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  navTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  adminButton: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#f59e0b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  adminButtonActive: {
    backgroundColor: '#fde68a',
  },
  adminButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#b45309',
  },
  signOutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  signOutText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  primaryAuthButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  primaryAuthText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});
