import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SellerManageListing from '../sellerManageListing/SellerManageListing';
import SellerProducts from '../sellerproducts/upload';
import SellerProfile from '../sellerprofile/SellerProfile';
import SellerReviewsFromBuyers from '../sellerReviewsFromBuyers/SellerReviewsFromBuyers';

type SellerInterfaceProps = {
  onBack?: () => void;
};

const SellerInterface: React.FC<SellerInterfaceProps> = ({ onBack }) => {
  const [showUpload, setShowUpload] = useState(false);
  const [showManageListing, setShowManageListing] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  if (showUpload) {
    return <SellerProducts onClose={() => setShowUpload(false)} />;
  }
  if (showManageListing) {
    return <SellerManageListing onClose={() => setShowManageListing(false)} />;
  }
  if (showProfile) {
    return <SellerProfile onClose={() => setShowProfile(false)} />;
  }
  if (showReviews) {
    return <SellerReviewsFromBuyers onClose={() => setShowReviews(false)} />;
  }
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.header}>Seller Dashboard</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Profile */}
      <View style={styles.profileSection}>
        <Image
          source={require('../../assets/images/avata.jpg')}
          style={styles.avatar}
        />
        <Text style={styles.name}>Nigel Badi</Text>
        <Text style={styles.since}>Seller since 2021</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total Listings</Text>
          <Text style={styles.statValue}>25</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Pending Orders</Text>
          <Text style={styles.statValue}>5</Text>
        </View>
      </View>
      <View style={styles.statBoxFull}>
        <Text style={styles.statLabel}>Recent Reviews</Text>
        <Text style={styles.statValue}>12</Text>
      </View>

      {/* Add New Product */}
      <TouchableOpacity style={styles.addBtn} onPress={() => setShowUpload(true)}>
        <Text style={styles.addBtnText}>+ Add New Product</Text>
      </TouchableOpacity>

      {/* Quick Actions */}
      <Text style={styles.quickActionsTitle}>Quick Actions</Text>
      <View style={styles.quickActionRow}>
        <TouchableOpacity style={styles.quickActionBox} onPress={() => setShowManageListing(true)}>
          <Feather name="list" size={20} color="#7CB798" style={{ marginRight: 8 }} />
          <Text style={styles.quickActionText}>Manage Listings</Text>
        </TouchableOpacity>
        <Ionicons name="chevron-forward" size={20} color="#222" />
      </View>
      <View style={styles.quickActionRow}>
        <TouchableOpacity style={styles.quickActionBox} onPress={() => setShowReviews(true)}>
          <Feather name="bar-chart-2" size={20} color="#7CB798" style={{ marginRight: 8 }} />
          <Text style={styles.quickActionText}>View Product Reviews</Text>
        </TouchableOpacity>
        <Ionicons name="chevron-forward" size={20} color="#222" />
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Ionicons name="home-outline" size={24} color="#7CB798" />
        <TouchableOpacity onPress={() => setShowProfile(true)}>
          <Ionicons name="person-outline" size={24} color="#7CB798" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FCF9',
    padding: 24,
    paddingBottom: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 58,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 18,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  since: {
    color: '#7CB798',
    fontSize: 14,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7F3EC',
  },
  statBoxFull: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7F3EC',
    marginBottom: 10,
  },
  statLabel: {
    color: '#7CB798',
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  addBtn: {
    backgroundColor: '#38E472',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginVertical: 12,
  },
  addBtnText: {
    color: '#111',
    fontWeight: 'bold',
    fontSize: 16,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 8,
    marginBottom: 8,
  },
  quickActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F8F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  quickActionBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionText: {
    color: '#222',
    fontSize: 15,
    fontWeight: '500',
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 56,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E7F3EC',
  },
});

export default SellerInterface;
