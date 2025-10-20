
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';



const reviews = [
  {
    id: '1',
    name: 'Aisha',
    time: '2 weeks ago',
    rating: 5,
    review: "Absolutely love this sofa! It's even more beautiful in person and incredibly comfortable. The delivery was smooth, and the seller was very responsive.",
    likes: 20,
    comments: 2,
    avatar: require('../../assets/images/woman2.jpg'),
  },
  {
    id: '2',
    name: 'Kamau',
    time: '1 month ago',
    rating: 4,
    review: "Great sofa for the price. It's stylish and fits perfectly in my apartment. One of the cushions is a bit firm, but overall, I'm happy with my purchase.",
    likes: 15,
    comments: 3,
    avatar: require('../../assets/images/woman.jpg'),
  },
];

interface SellerReviewsFromBuyersProps {
  onClose?: () => void;
}

const SellerReviewsFromBuyers: React.FC<SellerReviewsFromBuyersProps> = ({ onClose }) => {
  const navigation = useNavigation();
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  };
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleClose}>
          <Ionicons name="close" size={26} color="#1B1B1B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>products reviews</Text>
        <View style={{ width: 26 }} />
      </View>
      {/* Product Image */}
      <View style={styles.productImageWrap}>
        <Image source={require('../../assets/images/7.png')} style={styles.productImageXLarge} />
      </View>
      {/* Product Title & Description */}
      <Text style={styles.productTitle}>Modern Sofa</Text>
      <Text style={styles.productDesc}>
        This stylish sofa is perfect for any living room. It features a sleek design and comfortable cushions, making it ideal for relaxing or entertaining guests.
      </Text>
      {/* Seller Info */}
      <Text style={styles.sectionLabel}>Seller</Text>
      <View style={styles.sellerRow}>
        <Image source={require('../../assets/images/woman2.jpg')} style={styles.sellerAvatar} />
        <View>
          <Text style={styles.sellerName}>Furniture Haven</Text>
          <Text style={styles.sellerLocation}>Nairobi</Text>
        </View>
      </View>
      {/* Reviews Summary */}
      <Text style={styles.sectionLabel}>Reviews</Text>
      <View style={styles.summaryRow}>
        <View style={{ alignItems: 'center', marginRight: 18 }}>
          <Text style={styles.ratingValue}>4.5</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="star" size={18} color="#38E472" />
            <Ionicons name="star" size={18} color="#38E472" />
            <Ionicons name="star" size={18} color="#38E472" />
            <Ionicons name="star" size={18} color="#38E472" />
            <Ionicons name="star-half" size={18} color="#38E472" />
          </View>
          <Text style={styles.reviewCount}>120 reviews</Text>
        </View>
        <View style={{ flex: 1 }}>
          {[5, 4, 3, 2, 1].map((star, idx) => (
            <View key={star} style={styles.barRow}>
              <Text style={styles.starLabel}>{star}</Text>
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: `${[40,30,15,11,5][idx]}%` }]} />
              </View>
              <Text style={styles.percentLabel}>{[40,30,15,11,5][idx]}%</Text>
            </View>
          ))}
        </View>
      </View>
      {/* Reviews List */}
      <FlatList
        data={reviews}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.reviewCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={item.avatar} style={styles.reviewAvatar} />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.reviewerName}>{item.name}</Text>
                <Text style={styles.reviewTime}>{item.time}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
              {[...Array(item.rating)].map((_, i) => (
                <Ionicons key={i} name="star" size={16} color="#38E472" />
              ))}
              {[...Array(5 - item.rating)].map((_, i) => (
                <Ionicons key={i} name="star-outline" size={16} color="#38E472" />
              ))}
            </View>
            <Text style={styles.reviewText}>{item.review}</Text>
            <View style={styles.reviewActions}>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="thumbs-up-outline" size={16} color="#7CB798" />
                <Text style={styles.actionText}>{item.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="chatbubble-ellipses-outline" size={16} color="#7CB798" />
                <Text style={styles.actionText}>{item.comments}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        style={{ marginTop: 10 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FCF9',
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 18,
    marginHorizontal: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1B1B1B',
  },
  productImageWrap: {
    alignItems: 'flex-start',
    marginTop: 0,
    marginBottom: 18,
  },
  productImageXLarge: {
    width: 320,
    height: 180,
    borderRadius: 18,
    backgroundColor: '#eee',
    resizeMode: 'cover',
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B1B1B',
    marginTop: 4,
  },
  productDesc: {
    fontSize: 14,
    color: '#4A6548',
    marginVertical: 6,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7CB798',
    marginTop: 10,
    marginBottom: 4,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sellerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  sellerName: {
    fontWeight: '700',
    color: '#1B1B1B',
    fontSize: 15,
  },
  sellerLocation: {
    color: '#7CB798',
    fontSize: 13,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ratingValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#38E472',
    marginBottom: 2,
  },
  reviewCount: {
    fontSize: 12,
    color: '#7CB798',
    marginTop: 2,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  starLabel: {
    width: 14,
    fontSize: 12,
    color: '#1B1B1B',
    marginRight: 2,
  },
  barBg: {
    flex: 1,
    height: 7,
    backgroundColor: '#E7F3EC',
    borderRadius: 4,
    marginHorizontal: 4,
  },
  barFill: {
    height: 7,
    backgroundColor: '#38E472',
    borderRadius: 4,
  },
  percentLabel: {
    width: 28,
    fontSize: 11,
    color: '#7CB798',
    textAlign: 'right',
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  reviewerName: {
    fontWeight: '700',
    color: '#1B1B1B',
    fontSize: 14,
  },
  reviewTime: {
    color: '#7CB798',
    fontSize: 12,
  },
  reviewText: {
    fontSize: 14,
    color: '#1B1B1B',
    marginVertical: 4,
  },
  reviewActions: {
    flexDirection: 'row',
    marginTop: 6,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
  },
  actionText: {
    color: '#7CB798',
    fontSize: 13,
    marginLeft: 4,
  },
});

export default SellerReviewsFromBuyers;
