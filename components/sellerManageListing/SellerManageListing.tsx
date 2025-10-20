import { Feather, Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const listings = [
  {
    id: 1,
    name: 'Handmade Wooden Stool',
    price: '1,500',
    image: require('../../assets/images/0.jpg'),
  },
  {
    id: 2,
    name: 'Woven Basket Set',
    price: '2,500',
    image: require('../../assets/images/1.jpg'),
  },
  {
    id: 3,
    name: 'Recycled Tire Ottoman',
    price: '3,000',
    image: require('../../assets/images/3.jpg'),
  },
  {
    id: 4,
    name: 'Beaded Coasters',
    price: '1,200',
    image: require('../../assets/images/5.jpg'),
  },
];

type SellerManageListingProps = {
  onClose: () => void;
};

const SellerManageListing = ({ onClose }: SellerManageListingProps) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={{ padding: 4 }} onPress={onClose}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Listings</Text>
        <View style={{ width: 28 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {listings.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.status}>Available</Text>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>Ksh {item.price}</Text>
              <TouchableOpacity style={styles.editBtn}>
                <Feather name="edit-2" size={16} color="#fff" />
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <Image source={item.image} style={styles.image} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18271B',
    padding: 16,
    paddingTop: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    justifyContent: 'space-between',
         marginTop: 30,

  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#223324',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    alignItems: 'center',
  },
  status: {
    color: '#B6E2C6',
    fontSize: 13,
    marginBottom: 2,
  },
  name: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  price: {
    color: '#fff',
    fontSize: 15,
    marginBottom: 8,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2B4B34',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  editText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 6,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginLeft: 16,
    backgroundColor: '#fff',
  },
});

export default SellerManageListing;
