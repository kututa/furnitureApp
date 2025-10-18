import { Feather, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, FlatList, Image, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';
type Address = { id: string; name: string; location: string };
type Order = { id: string; status: string; summary: string; date: string };

const initialAddresses = [
  { id: '1', name: 'Home', location: 'Nairobi, Kenya' },
  { id: '2', name: 'Office', location: 'Mombasa, Kenya' },
];

const initialOrders = [
  { id: '101', status: 'Pending', summary: 'Table x1, Chair x2', date: '2025-10-10' },
  { id: '102', status: 'Received', summary: 'Sofa x1', date: '2025-09-20' },
  { id: '103', status: 'Pending', summary: 'Desk x1', date: '2025-10-15' },
];

interface ProfileProps {
  onBack?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onBack }) => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [name, setName] = useState('Amani Hassan');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addresses, setAddresses] = useState(initialAddresses);
  const [addressModal, setAddressModal] = useState<{ visible: boolean; address: Address | null }>({ visible: false, address: null });
  const [editAddress, setEditAddress] = useState({ id: '', name: '', location: '' });
  const [addAddressModal, setAddAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({ name: '', location: '' });
  const [orderHistoryModal, setOrderHistoryModal] = useState(false);
  const [orders] = useState(initialOrders);

  // Profile image picker
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets[0].uri) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // Edit address
  const openEditAddress = (address: Address) => {
    setEditAddress(address);
    setAddressModal({ visible: true, address });
  };
  const saveEditAddress = () => {
    setAddresses(prev => prev.map(a => a.id === editAddress.id ? { ...editAddress } : a));
    setAddressModal({ visible: false, address: null });
  };
  const deleteAddress = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setAddresses(prev => prev.filter(a => a.id !== id)) },
    ]);
    setAddressModal({ visible: false, address: null });
  };

  // Add new address
  const saveNewAddress = () => {
    if (!newAddress.name || !newAddress.location) return;
    setAddresses(prev => [...prev, { id: Date.now().toString(), ...newAddress }]);
    setNewAddress({ name: '', location: '' });
    setAddAddressModal(false);
  };

  // Save profile
  const saveProfile = () => {
    if (Platform.OS === 'android') {
      ToastAndroid.show('Profile updated successfully.', ToastAndroid.SHORT);
    } else {
      // iOS: use a custom toast or alert
      Alert.alert('Success', 'Profile updated successfully.');
    }
  };

  // Order history modal
  const renderOrderCard = ({ item }: { item: Order }) => (
    <View style={[styles.orderCard, item.status === 'Pending' ? styles.pending : styles.received]}>
      <Text style={styles.orderStatus}>{item.status}</Text>
      <Text style={styles.orderSummary}>{item.summary}</Text>
      <Text style={styles.orderDate}>{item.date}</Text>
    </View>
  );

  return (
    <View style={styles.safeArea}>
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {onBack && (
            <TouchableOpacity style={styles.backArrow} onPress={onBack}>
              <Feather name="arrow-left" size={24} color="#222" />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.profileTitle}>Profile</Text>
          </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={pickImage} style={styles.profileImageWrap}>
          <Image
            source={profileImage ? { uri: profileImage } : require('../../assets/images/avata.jpg')}
            style={styles.profileImage}
          />
          <View style={styles.editIcon}><Feather name="edit-2" size={16} color="#fff" /></View>
        </TouchableOpacity>
        <Text style={styles.profileName}>{name}</Text>
        <Text style={styles.profileRole}>Buyer</Text>

        <Text style={styles.sectionTitle}>Personal Information</Text>
        <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

        <Text style={styles.sectionTitle}>Shipping Addresses</Text>
        {addresses.map(addr => (
          <TouchableOpacity key={addr.id} style={styles.addressRow} onPress={() => openEditAddress(addr)}>
            <View style={styles.addressIcon}><Ionicons name="home-outline" size={20} color="#7CB798" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.addressName}>{addr.name}</Text>
              <Text style={styles.addressLocation}>{addr.location}</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#222" />
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.addressRow} onPress={() => setAddAddressModal(true)}>
          <View style={styles.addressIcon}><Ionicons name="add" size={20} color="#7CB798" /></View>
          <Text style={styles.addAddressText}>Add New Address</Text>
          <Feather name="chevron-right" size={20} color="#222" />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Order History</Text>
        <TouchableOpacity style={styles.orderHistoryRow} onPress={() => setOrderHistoryModal(true)}>
          <View style={styles.orderHistoryIcon}><Ionicons name="time-outline" size={20} color="#7CB798" /></View>
          <Text style={styles.orderHistoryText}>View Order History</Text>
          <Feather name="chevron-right" size={20} color="#222" />
        </TouchableOpacity>

        <View style={styles.saveBtnWrap}>
          <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Address Modal */}
      <Modal visible={addressModal.visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Address</Text>
            <TextInput style={styles.input} placeholder="Name" value={editAddress.name} onChangeText={v => setEditAddress(e => ({ ...e, name: v }))} />
            <TextInput style={styles.input} placeholder="Location" value={editAddress.location} onChangeText={v => setEditAddress(e => ({ ...e, location: v }))} />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalBtn} onPress={saveEditAddress}><Text style={styles.modalBtnText}>Save</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#F66' }]} onPress={() => deleteAddress(editAddress.id)}><Text style={styles.modalBtnText}>Delete</Text></TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.modalClose} onPress={() => setAddressModal({ visible: false, address: null })}><Text style={styles.modalCloseText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Address Modal */}
      <Modal visible={addAddressModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Address</Text>
            <TextInput style={styles.input} placeholder="Name" value={newAddress.name} onChangeText={v => setNewAddress(e => ({ ...e, name: v }))} />
            <TextInput style={styles.input} placeholder="Location" value={newAddress.location} onChangeText={v => setNewAddress(e => ({ ...e, location: v }))} />
            <TouchableOpacity style={styles.modalBtn} onPress={saveNewAddress}><Text style={styles.modalBtnText}>Save</Text></TouchableOpacity>
            <TouchableOpacity style={styles.modalClose} onPress={() => setAddAddressModal(false)}><Text style={styles.modalCloseText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Order History Modal */}
      <Modal visible={orderHistoryModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: 400 }]}> 
            <Text style={styles.modalTitle}>Order History</Text>
            <FlatList
              data={orders}
              renderItem={renderOrderCard}
              keyExtractor={item => item.id}
              contentContainerStyle={{ paddingBottom: 16 }}
            />
            <TouchableOpacity style={styles.modalClose} onPress={() => setOrderHistoryModal(false)}><Text style={styles.modalCloseText}>Close</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  backArrow: {
    marginRight: 8,
    padding: 4,
    borderRadius: 8,
    marginTop: 16, // Move arrow down a bit for better alignment
  },
  saveBtnWrap: {
    paddingBottom: 24,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  profileImageWrap: {
    alignSelf: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E7F3EC',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#7CB798',
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileName: {
    fontSize: 17,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 2,
  },
  profileRole: {
    fontSize: 14,
    color: '#7CB798',
    alignSelf: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F2F8F4',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    fontSize: 15,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FCF9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  addressIcon: {
    marginRight: 10,
    backgroundColor: '#E7F3EC',
    borderRadius: 8,
    padding: 6,
  },
  addressName: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  addressLocation: {
    color: '#7CB798',
    fontSize: 13,
  },
  addAddressText: {
    color: '#7CB798',
    fontWeight: 'bold',
    fontSize: 15,
    flex: 1,
  },
  orderHistoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FCF9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  orderHistoryIcon: {
    marginRight: 10,
    backgroundColor: '#E7F3EC',
    borderRadius: 8,
    padding: 6,
  },
  orderHistoryText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 15,
    flex: 1,
  },
  saveBtn: {
    backgroundColor: '#38E472',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 18,
    marginBottom: 24,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    width: 320,
    maxWidth: '90%',
    alignItems: 'stretch',
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 12,
    alignSelf: 'center',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalBtn: {
    backgroundColor: '#7CB798',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 22,
    marginHorizontal: 4,
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  modalClose: {
    marginTop: 16,
    alignSelf: 'center',
  },
  modalCloseText: {
    color: '#7CB798',
    fontWeight: 'bold',
    fontSize: 15,
  },
  orderCard: {
    backgroundColor: '#F8FCF9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  orderStatus: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  orderSummary: {
    fontSize: 14,
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 13,
    color: '#7CB798',
  },
  pending: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFD600',
  },
  received: {
    borderLeftWidth: 4,
    borderLeftColor: '#38E472',
  },
});

export default Profile;
