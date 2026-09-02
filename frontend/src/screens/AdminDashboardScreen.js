import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, FlatList } from 'react-native';
import { COLORS } from '../config/constants';
import { getAllProfilesAdmin, getAllPredictionsAdmin, getDatasetRowsAdmin, updateUserRoleAdmin, toggleUserActiveAdmin } from '../services/api';

export default function AdminDashboardScreen() {
  const [activeTab, setActiveTab] = useState('Overview'); // 'Overview', 'Users', 'Predictions', 'Dataset'
  const [profiles, setProfiles] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [dataset, setDataset] = useState([]);
  const [datasetTotal, setDatasetTotal] = useState(0);
  const [datasetPage, setDatasetPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [profs, preds, ds] = await Promise.all([
        getAllProfilesAdmin(),
        getAllPredictionsAdmin(),
        getDatasetRowsAdmin(1, 20),
      ]);
      setProfiles(profs);
      setPredictions(preds);
      setDataset(ds.data);
      setDatasetTotal(ds.total);
    } catch (err) {
      console.error("[AdminDashboard] Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadDatasetPage = async (page) => {
    setDatasetPage(page);
    const ds = await getDatasetRowsAdmin(page, 20);
    setDataset(ds.data);
  };

  const handleRoleToggle = async (profileId, currentRole) => {
    const newRole = currentRole === 'super_admin' ? 'user' : 'super_admin';
    try {
      await updateUserRoleAdmin(profileId, newRole);
      setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, role: newRole } : p));
    } catch (e) {
      alert(`Failed to update role: ${e.message}`);
    }
  };

  const handleActiveToggle = async (profileId, currentActive) => {
    try {
      await toggleUserActiveAdmin(profileId, !currentActive);
      setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, is_active: !currentActive } : p));
    } catch (e) {
      alert(`Failed to toggle user state: ${e.message}`);
    }
  };

  // Stats Calculations
  const totalUsers = profiles.length;
  const totalPredictions = predictions.length;
  const desPositiveCount = predictions.filter(p => p.prediction === 'DES').length;
  const desPositivePercent = totalPredictions > 0 ? Math.round((desPositiveCount / totalPredictions) * 100) : 0;

  // Filtered Predictions
  const filteredPredictions = predictions.filter(p => {
    const q = filterQuery.toLowerCase();
    const email = p.profiles?.email?.toLowerCase() || '';
    const pred = p.prediction?.toLowerCase() || '';
    const band = p.risk_band?.toLowerCase() || '';
    return email.includes(q) || pred.includes(q) || band.includes(q);
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.adminHeader}>
        <View>
          <Text style={styles.adminBadge}>👑 Super Admin Dashboard</Text>
          <Text style={styles.adminTitle}>System Administration & Research Dataset</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={loadAdminData}>
          <Text style={styles.refreshText}>🔄 Refresh Data</Text>
        </TouchableOpacity>
      </View>

      {/* Sub-Nav Tabs */}
      <View style={styles.tabNav}>
        {['Overview', 'Users', 'Predictions', 'Dataset'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 30 }} />
      ) : (
        <>
          {/* TAB 1: OVERVIEW STATS CARDS */}
          {activeTab === 'Overview' && (
            <View>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statIcon}>👥</Text>
                  <Text style={styles.statNumber}>{totalUsers}</Text>
                  <Text style={styles.statLabel}>Total Registered Users</Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statIcon}>📋</Text>
                  <Text style={styles.statNumber}>{totalPredictions}</Text>
                  <Text style={styles.statLabel}>Total Screening Submissions</Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statIcon}>⚠️</Text>
                  <Text style={styles.statNumber}>{desPositivePercent}%</Text>
                  <Text style={styles.statLabel}>DES Positive Rate ({desPositiveCount}/{totalPredictions})</Text>
                </View>
              </View>

              {/* Quick Summary Tables */}
              <Text style={styles.sectionHeader}>Recent Submissions Log</Text>
              <View style={styles.tableCard}>
                {predictions.slice(0, 5).map((p, idx) => (
                  <View key={p.id || idx} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 2 }]}>{p.profiles?.email || 'Student User'}</Text>
                    <Text style={[styles.tableCell, { flex: 1 }]}>{p.prediction}</Text>
                    <Text style={[styles.tableCell, { flex: 1 }]}>{p.risk_band} ({Math.round(p.probability * 100)}%)</Text>
                    <Text style={[styles.tableCell, { flex: 1.5 }]}>{new Date(p.created_at).toLocaleDateString()}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TAB 2: USERS MANAGEMENT TABLE */}
          {activeTab === 'Users' && (
            <View>
              <Text style={styles.sectionHeader}>Registered Profiles ({profiles.length})</Text>
              <View style={styles.tableCard}>
                <View style={[styles.tableRow, styles.tableHeaderRow]}>
                  <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Email</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Role</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Status</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Joined Date</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Actions</Text>
                </View>

                {profiles.map((prof) => (
                  <View key={prof.id} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 2 }]}>{prof.email}</Text>
                    <Text style={[styles.tableCell, { flex: 1, fontWeight: '700' }]}>{prof.role}</Text>
                    <Text style={[styles.tableCell, { flex: 1, color: prof.is_active !== false ? '#16a34a' : '#dc2626' }]}>
                      {prof.is_active !== false ? 'Active' : 'Deactivated'}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1.5 }]}>
                      {new Date(prof.created_at).toLocaleDateString()}
                    </Text>
                    <View style={{ flex: 1.5, flexDirection: 'row', gap: 6 }}>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleRoleToggle(prof.id, prof.role)}
                      >
                        <Text style={styles.actionBtnText}>
                          {prof.role === 'super_admin' ? 'Make User' : 'Make Admin'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#fee2e2' }]}
                        onPress={() => handleActiveToggle(prof.id, prof.is_active !== false)}
                      >
                        <Text style={[styles.actionBtnText, { color: '#dc2626' }]}>
                          {prof.is_active !== false ? 'Deactivate' : 'Activate'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TAB 3: ALL PREDICTIONS TABLE */}
          {activeTab === 'Predictions' && (
            <View>
              <View style={styles.searchRow}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Filter by email, prediction (DES/No DES), or risk band..."
                  placeholderTextColor={COLORS.textMuted}
                  value={filterQuery}
                  onChangeText={setFilterQuery}
                />
              </View>

              <Text style={styles.sectionHeader}>All Student Predictions ({filteredPredictions.length})</Text>
              <View style={styles.tableCard}>
                <View style={[styles.tableRow, styles.tableHeaderRow]}>
                  <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Student Email</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Result</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Score / Prob</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Risk Band</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Date & Time</Text>
                </View>

                {filteredPredictions.map((p) => (
                  <View key={p.id} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 2 }]}>{p.profiles?.email || p.user_id}</Text>
                    <Text style={[styles.tableCell, { flex: 1, fontWeight: '700' }]}>{p.prediction}</Text>
                    <Text style={[styles.tableCell, { flex: 1 }]}>{p.des_score?.toFixed(1)} ({Math.round(p.probability * 100)}%)</Text>
                    <Text style={[styles.tableCell, { flex: 1 }]}>{p.risk_band}</Text>
                    <Text style={[styles.tableCell, { flex: 1.5 }]}>{new Date(p.created_at).toLocaleString()}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TAB 4: ORIGINAL RESEARCH DATASET VIEWER */}
          {activeTab === 'Dataset' && (
            <View>
              <View style={styles.datasetHeader}>
                <Text style={styles.sectionHeader}>982-Row Training Dataset Viewer</Text>
                <Text style={styles.datasetMeta}>
                  Showing page {datasetPage} of {Math.ceil(datasetTotal / 20) || 1} (Total: {datasetTotal} rows)
                </Text>
              </View>

              <ScrollView horizontal style={styles.tableScroll}>
                <View style={styles.tableCard}>
                  <View style={[styles.tableRow, styles.tableHeaderRow]}>
                    <Text style={styles.dsHeaderCol}>ID</Text>
                    <Text style={styles.dsHeaderCol}>Gender</Text>
                    <Text style={styles.dsHeaderCol}>Age</Text>
                    <Text style={styles.dsHeaderCol}>Year</Text>
                    <Text style={styles.dsHeaderCol}>Screen Time</Text>
                    <Text style={styles.dsHeaderCol}>Device</Text>
                    <Text style={styles.dsHeaderCol}>Blue Light</Text>
                    <Text style={styles.dsHeaderCol}>Distance</Text>
                    <Text style={styles.dsHeaderCol}>20-20-20</Text>
                    <Text style={styles.dsHeaderCol}>Dark Room</Text>
                    <Text style={styles.dsHeaderCol}>Posture</Text>
                    <Text style={styles.dsHeaderCol}>Glasses</Text>
                    <Text style={styles.dsHeaderCol}>Continuous</Text>
                  </View>

                  {dataset.map((row) => (
                    <View key={row.id} style={styles.tableRow}>
                      <Text style={styles.dsCol}>{row.id}</Text>
                      <Text style={styles.dsCol}>{row.gender}</Text>
                      <Text style={styles.dsCol}>{row.age}</Text>
                      <Text style={styles.dsCol}>{row.study_year}</Text>
                      <Text style={styles.dsCol}>{row.screen_time}</Text>
                      <Text style={styles.dsCol}>{row.device}</Text>
                      <Text style={styles.dsCol}>{row.blue_light}</Text>
                      <Text style={styles.dsCol}>{row.screen_distance}</Text>
                      <Text style={styles.dsCol}>{row.rule_20_20_20}</Text>
                      <Text style={styles.dsCol}>{row.dark_room}</Text>
                      <Text style={styles.dsCol}>{row.poor_posture}</Text>
                      <Text style={styles.dsCol}>{row.glasses}</Text>
                      <Text style={styles.dsCol}>{row.continuous_use}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>

              {/* Pagination Controls */}
              <View style={styles.paginationRow}>
                <TouchableOpacity
                  style={[styles.pageBtn, datasetPage <= 1 && styles.pageBtnDisabled]}
                  disabled={datasetPage <= 1}
                  onPress={() => loadDatasetPage(datasetPage - 1)}
                >
                  <Text style={styles.pageBtnText}>◀ Previous</Text>
                </TouchableOpacity>

                <Text style={styles.pageIndicator}>Page {datasetPage}</Text>

                <TouchableOpacity
                  style={[styles.pageBtn, datasetPage * 20 >= datasetTotal && styles.pageBtnDisabled]}
                  disabled={datasetPage * 20 >= datasetTotal}
                  onPress={() => loadDatasetPage(datasetPage + 1)}
                >
                  <Text style={styles.pageBtnText}>Next ▶</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </>
      )}
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
    maxWidth: 1100,
    alignSelf: 'center',
    width: '100%',
  },
  adminHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  adminBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#b45309',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  adminTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  refreshButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  refreshText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  tabNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primaryDark,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabBtnTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: 220,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIcon: {
    fontSize: 26,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  tableCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  tableHeaderCell: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  tableCell: {
    fontSize: 13,
    color: COLORS.text,
  },
  actionBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  searchRow: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  datasetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  datasetMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  tableScroll: {
    marginBottom: 16,
  },
  dsHeaderCol: {
    width: 100,
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  dsCol: {
    width: 100,
    fontSize: 12,
    color: COLORS.text,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  pageBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  pageBtnDisabled: {
    opacity: 0.4,
  },
  pageBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  pageIndicator: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
