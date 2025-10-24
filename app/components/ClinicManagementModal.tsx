/**
 * Clinic Management Modal Component
 * Full-featured clinic management interface with therapist invitations
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

interface Props {
  visible: boolean;
  onClose: () => void;
  clinicId: string;
  userId: string;
}

interface Therapist {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'therapist';
  patientCount: number;
}

export const ClinicManagementModal: React.FC<Props> = ({
  visible,
  onClose,
  clinicId,
  userId,
}) => {
  const [clinicName, setClinicName] = useState('');
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && clinicId) {
      loadClinicData();
    }
  }, [visible, clinicId]);

  const loadClinicData = async () => {
    setLoading(true);
    try {
      // Load clinic info
      const clinicDoc = await getDoc(doc(db, 'clinics', clinicId));
      if (clinicDoc.exists()) {
        const data = clinicDoc.data();
        setClinicName(data.name || '');
        
        // Load therapists
        if (data.therapists && Array.isArray(data.therapists)) {
          const therapistList: Therapist[] = [];
          
          for (const therapistId of data.therapists) {
            const userDoc = await getDoc(doc(db, 'users', therapistId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              
              // Count patients for this therapist
              const patientsQuery = query(
                collection(db, 'users'),
                where('therapistId', '==', therapistId),
                where('role', '==', 'patient')
              );
              const patientsSnapshot = await getDocs(patientsQuery);
              
              therapistList.push({
                id: therapistId,
                name: userData.name || 'Unknown',
                email: userData.email || '',
                role: therapistId === data.ownerId ? 'owner' : 'therapist',
                patientCount: patientsSnapshot.size,
              });
            }
          }
          
          setTherapists(therapistList);
        }
      }
    } catch (error) {
      console.error('[CLINIC] Error loading clinic data:', error);
      Alert.alert('Error', 'Failed to load clinic information');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClinicName = async () => {
    if (!clinicName.trim()) {
      Alert.alert('Error', 'Clinic name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, 'clinics', clinicId), {
        name: clinicName.trim(),
        updatedAt: Timestamp.now(),
      });
      Alert.alert('Success', 'Clinic name updated successfully');
    } catch (error) {
      console.error('[CLINIC] Error updating clinic name:', error);
      Alert.alert('Error', 'Failed to update clinic name');
    } finally {
      setSaving(false);
    }
  };

  const handleInviteTherapist = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setSaving(true);
    try {
      // Check if user exists
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', inviteEmail.toLowerCase().trim())
      );
      const usersSnapshot = await getDocs(usersQuery);

      if (usersSnapshot.empty) {
        Alert.alert(
          'User Not Found',
          'No user found with this email address. They need to register first.'
        );
        setSaving(false);
        return;
      }

      const targetUser = usersSnapshot.docs[0];
      const targetUserData = targetUser.data();

      if (targetUserData.role !== 'therapist') {
        Alert.alert('Error', 'User is not registered as a therapist');
        setSaving(false);
        return;
      }

      // Send invitation via notifications collection
      await addDoc(collection(db, 'notifications'), {
        userId: targetUser.id,
        type: 'clinic_invitation',
        title: 'Clinic Invitation',
        message: `You've been invited to join ${clinicName}`,
        clinicId: clinicId,
        clinicName: clinicName,
        invitedBy: userId,
        read: false,
        createdAt: Timestamp.now(),
      });

      Alert.alert('Success', 'Invitation sent successfully');
      setInviteEmail('');
    } catch (error) {
      console.error('[CLINIC] Error inviting therapist:', error);
      Alert.alert('Error', 'Failed to send invitation');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Clinic Management</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
            </View>
          ) : (
            <ScrollView style={styles.content}>
              {/* Clinic Name Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Clinic Name</Text>
                <TextInput
                  style={styles.input}
                  value={clinicName}
                  onChangeText={setClinicName}
                  placeholder="Enter clinic name"
                  placeholderTextColor="#6B7280"
                />
                <TouchableOpacity
                  style={[styles.button, saving && styles.buttonDisabled]}
                  onPress={handleUpdateClinicName}
                  disabled={saving}
                >
                  <Text style={styles.buttonText}>
                    {saving ? 'Updating...' : 'Update Name'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Therapists Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Therapists ({therapists.length})
                </Text>
                {therapists.map((therapist) => (
                  <View key={therapist.id} style={styles.therapistCard}>
                    <View style={styles.therapistInfo}>
                      <View style={styles.therapistHeader}>
                        <Text style={styles.therapistName}>{therapist.name}</Text>
                        <View
                          style={[
                            styles.roleBadge,
                            therapist.role === 'owner' && styles.ownerBadge,
                          ]}
                        >
                          <Text style={styles.roleBadgeText}>
                            {therapist.role === 'owner' ? 'Owner' : 'Therapist'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.therapistEmail}>{therapist.email}</Text>
                      <Text style={styles.therapistStats}>
                        {therapist.patientCount} patient{therapist.patientCount !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Invite Therapist Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Invite Therapist</Text>
                <TextInput
                  style={styles.input}
                  value={inviteEmail}
                  onChangeText={setInviteEmail}
                  placeholder="Enter therapist email"
                  placeholderTextColor="#6B7280"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton, saving && styles.buttonDisabled]}
                  onPress={handleInviteTherapist}
                  disabled={saving}
                >
                  <Ionicons name="mail-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.buttonText}>
                    {saving ? 'Sending...' : 'Send Invitation'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#1F2937',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 12,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#6B7280',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  therapistCard: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  therapistInfo: {
    flex: 1,
  },
  therapistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  therapistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  roleBadge: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  ownerBadge: {
    backgroundColor: '#3B82F6',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  therapistEmail: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  therapistStats: {
    fontSize: 12,
    color: '#6B7280',
  },
});

