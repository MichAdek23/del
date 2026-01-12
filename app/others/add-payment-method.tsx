import React, { useState } from 'react';
import {  StyleSheet,  View,  Text,  ScrollView,  TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { Button, Input } from '@/components';
import { colors } from '@/constants';
import { ArrowLeft } from 'lucide-react-native';




// ==================== ADD PAYMENT METHOD PAGE ====================
export default function AddPaymentMethodPage({ onBack }: any) {
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });

  const handleAdd = () => {
    if (
      formData.cardNumber &&
      formData.expiryDate &&
      formData.cardholderName
    ) {
      Alert.alert('Success', 'Payment method added successfully');
      onBack();
    } else {
      Alert.alert('Error', 'Please fill all fields');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Payment Method</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Input
          label="Cardholder Name"
          value={formData.cardholderName}
          onChangeText={(text) =>
            setFormData({ ...formData, cardholderName: text })
          }
          placeholder="John Doe"
        />

        <Input
          label="Card Number"
          value={formData.cardNumber}
          onChangeText={(text) =>
            setFormData({ ...formData, cardNumber: text })
          }
          placeholder="1234 5678 9012 3456"
          keyboardType="numeric"
        />

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Input
              label="Expiry Date"
              value={formData.expiryDate}
              onChangeText={(text) =>
                setFormData({ ...formData, expiryDate: text })
              }
              placeholder="MM/YY"
                />
          </View>
          <View style={styles.halfInput}>
            <Input
              label="CVV"
              value={formData.cvv}
              onChangeText={(text) =>
                setFormData({ ...formData, cvv: text })
              }
              placeholder="123"
              keyboardType="numeric"
                />
          </View>
        </View>

        <Button
          title="Add Payment Method"
          onPress={handleAdd}
          style={styles.submitButton}
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
  submitButton: {
    marginTop: 20,
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  defaultAddressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginVertical: 16,
  },
  defaultAddressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  MessageSquare: {
    // for the chat icon
  },
});

 