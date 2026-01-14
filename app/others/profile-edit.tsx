import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button, Input } from '@/components';
import { colors } from '@/constants';
import { router } from 'expo-router';
import { Edit2, ArrowLeft, Camera, X } from 'lucide-react-native';

// ==================== PROFILE EDIT PAGE ====================
export default function ProfileEditPage() {
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    photo: null as string | null,
  });

  const [loading, setLoading] = useState(false);

  const getInitials = () => {
    return (formData.firstName[0] + formData.lastName[0]).toUpperCase();
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to select a photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setFormData({ ...formData, photo: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera permissions to take a photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setFormData({ ...formData, photo: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleRemovePhoto = () => {
    Alert.alert('Remove Photo', 'Are you sure you want to remove your profile photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => setFormData({ ...formData, photo: null }),
      },
    ]);
  };

  const handlePhotoOptions = () => {
    Alert.alert('Profile Photo', 'Choose an option', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Take Photo', onPress: handleTakePhoto },
      { text: 'Choose from Gallery', onPress: handlePickImage },
      ...(formData.photo ? [{ text: 'Remove Photo', style: 'destructive' as const, onPress: handleRemovePhoto }] : []),
    ]);
  };

  const handleSave = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert('Error', 'Please fill in your name');
      return;
    }

    if (!formData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {formData.photo ? (
              <Image source={{ uri: formData.photo }} style={styles.avatarImage} />
            ) : (
              <View style={styles.largeAvatar}>
                <Text style={styles.avatarInitials}>{getInitials()}</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={handlePhotoOptions}
            >
              <Camera size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.photoHint}>Tap the camera icon to update your photo</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Personal Information</Text>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="First Name"
                value={formData.firstName}
                onChangeText={(text) =>
                  setFormData({ ...formData, firstName: text })
                }
                placeholder="John"
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="Last Name"
                value={formData.lastName}
                onChangeText={(text) =>
                  setFormData({ ...formData, lastName: text })
                }
                placeholder="Doe"
              />
            </View>
          </View>

          <Input
            label="Email Address"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="john@example.com"
            keyboardType="email-address"
          />

          <Input
            label="Phone Number"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder="+1 (555) 000-0000"
            keyboardType="phone-pad"
          />
        </View>

        <Button
          title={loading ? 'Saving...' : 'Save Changes'}
          onPress={handleSave}
          style={styles.submitButton}
          disabled={loading}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  largeAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarInitials: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  photoHint: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  formSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  halfInput: {
    flex: 1,
  },
  submitButton: {
    marginTop: 12,
    marginBottom: 30,
  },
});