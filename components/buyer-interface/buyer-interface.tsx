import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, FlatList, Image, Modal, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Profile from '../buyerprofile/profile';
import Cart, { CartItem } from '../cart/cart';
import Checkout from '../checkout/checkout';
import Receipt from '../receipt/receipt';
import ReviewInterface from '../review-interface/review-interface';

const products = [
  {
    id: '1',
    name: 'Handcrafted Coffee Table',
    price: 'Ksh 8,500',
    image: require('../../assets/images/0.jpg'),
    category: 'Tables',
    location: 'Nairobi',
  },
  {
    id: '2',
    name: 'Modern Dining Set',
    price: 'Ksh 25,000',
    image: require('../../assets/images/1.jpg'),
    category: 'Tables',
    location: 'Mombasa',
  },
  {
    id: '3',
    name: 'Rustic Bookshelf',
    price: 'Ksh 12,000',
    image: require('../../assets/images/2.jpg'),
    category: 'Cabinets',
    location: 'Nairobi',
  },
  {
    id: '4',
    name: 'Elegant Sofa',
    price: 'Ksh 35,000',
    image: require('../../assets/images/3.jpg'),
    category: 'Sofas',
    location: 'Mombasa',
  },
  {
    id: '5',
    name: 'Minimalist Desk',
    price: 'Ksh 15,000',
    image: require('../../assets/images/4.jpg'),
    category: 'Desks',
    location: 'Nairobi',
  },
  {
    id: '6',
    name: 'Cozy Armchair',
    price: 'Ksh 7,000',
    image: require('../../assets/images/5.jpg'),
    category: 'Chairs',
    location: 'Mombasa',
  },
];

const BuyerInterface = () => {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [priceFilter, setPriceFilter] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<'category' | 'price' | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);

  const handleImagePress = (img: any) => {
    setSelectedImage(img);
    setModalVisible(true);
  };

  const renderProduct = ({ item }: any) => {
    return (
      <View style={styles.card}>
        <TouchableOpacity onPress={() => handleImagePress(item.image)}>
          <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
        </TouchableOpacity>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <View style={styles.cardRow}>
          <Text style={styles.cardPrice}>{item.price}</Text>
          <TouchableOpacity onPress={() => {
            setCart(prev => {
              const existing = prev.find(ci => ci.id === item.id);
              if (existing) {
                return prev.map(ci => ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci);
              } else {
                return [...prev, { ...item, quantity: 1 }];
              }
            });
          }}>
            <Text style={styles.addToCart}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Cart quantity update handler
  const handleUpdateQuantity = (id: string, quantity: number) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item));
  };


  // Calculate summary values
  const SHIPPING_COST = 100;
  const subtotal = cart.reduce((sum, item) => sum + parseInt(item.price.replace(/[^\d]/g, '')) * item.quantity, 0);
  const total = subtotal + SHIPPING_COST;

  // Remove item from cart
  const handleRemoveItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Handle payment confirmation

  const handleConfirmPayment = (form: any) => {
    // Generate order number and delivery date
    const orderNumber = Math.floor(10000000 + Math.random() * 90000000).toString();
    const deliveryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' });
    setLastOrder({
      items: cart,
      subtotal,
      shipping: SHIPPING_COST,
      total,
      orderNumber,
      deliveryDate,
      paymentMethod: 'M-pesa',
    });
    setShowCheckout(false);
    setShowReceipt(true);
    setCart([]);
  };


  if (showProfile) {
    return <Profile onBack={() => setShowProfile(false)} />;
  }

  if (showReceipt && lastOrder) {
    return (
      <Receipt
        items={lastOrder.items}
        subtotal={lastOrder.subtotal}
        shipping={lastOrder.shipping}
        total={lastOrder.total}
        orderNumber={lastOrder.orderNumber}
        deliveryDate={lastOrder.deliveryDate}
        paymentMethod={lastOrder.paymentMethod}
        onBackHome={() => {
          setShowReceipt(false);
          setLastOrder(null);
          setShowCart(false);
          setCart([]);
        }}
      />
    );
  }

  if (showCheckout) {
    return (
      <Checkout
        items={cart}
        subtotal={subtotal}
        shipping={SHIPPING_COST}
        total={total}
        onBack={() => setShowCheckout(false)}
        onRemoveItem={handleRemoveItem}
        onConfirmPayment={handleConfirmPayment}
      />
    );
  }

  if (showCart) {
    return (
      <Cart
        items={cart}
        onBack={() => setShowCart(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onCheckout={() => setShowCheckout(true)}
      />
    );
  }



  // Filtering logic
  let filteredProducts = products.filter(p => {
    let priceValue = parseInt(p.price.replace(/[^\d]/g, ''));
    let priceMatch = true;
    if (priceFilter === '1000 to 10000') priceMatch = priceValue >= 1000 && priceValue <= 10000;
    else if (priceFilter === '10000+') priceMatch = priceValue > 10000;
    return (
      (!categoryFilter || p.category === categoryFilter) &&
      priceMatch &&
      (!search || p.name.toLowerCase().includes(search.toLowerCase()))
    );
  });

  // Dropdown overlay rendering
  const renderDropdownOverlay = () => {
    if (!openDropdown) return null;
    let options: string[] = [];
    let onSelect: (option: string) => void = () => {};
    let selected = '';
    if (openDropdown === 'category') {
      options = ['All', 'Tables', 'Chairs', 'Desks', 'Sofas', 'Cabinets'];
      onSelect = (option) => {
        if (option === 'All') setCategoryFilter(null);
        else setCategoryFilter(option);
        setOpenDropdown(null);
      };
      selected = categoryFilter || 'All';
    } else if (openDropdown === 'price') {
      options = ['1000 to 10000', '10000+'];
      onSelect = (option) => { setPriceFilter(option); setOpenDropdown(null); };
      selected = priceFilter || '';
    }
    return (
      <Pressable style={styles.dropdownOverlay} onPress={() => setOpenDropdown(null)}>
        <View style={styles.dropdownMenuOverlay}>
          {options.map(option => (
            <TouchableOpacity
              key={option}
              style={[styles.dropdownItem, selected === option && { backgroundColor: '#E7F3EC' }]}
              onPress={() => onSelect(option)}
            >
              <Text style={styles.dropdownText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Dropdown Overlay */}
      {renderDropdownOverlay()}

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#7CB798" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for furniture"
          placeholderTextColor="#7CB798"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        <View style={{ flex: 1, zIndex: 2 }}>
          <TouchableOpacity style={styles.filterBtn} onPress={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}>
            <Text style={styles.filterBtnText}>{categoryFilter || 'Category'}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, zIndex: 2 }}>
          <TouchableOpacity style={styles.filterBtn} onPress={() => setOpenDropdown(openDropdown === 'price' ? null : 'price')}>
            <Text style={styles.filterBtnText}>{priceFilter || 'Price'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Product Grid */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
  // Ensure last product card is fully visible above the bottom navigation bar
  contentContainerStyle={{ paddingBottom: (styles.bottomNav.height || 56) + insets.bottom + 24 }}
  scrollIndicatorInsets={{ bottom: (styles.bottomNav.height || 56) + insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Image Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Pressable style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtnText}>×</Text>
            </Pressable>
            {selectedImage && (
              <Image source={selectedImage} style={styles.fullImage} resizeMode="contain" />
            )}
            {/* Rate Product Button */}
            <TouchableOpacity style={styles.rateBtn} onPress={() => setReviewVisible(true)}>
              <Text style={styles.rateBtnText}>Rate Product</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Review Modal */}
      <ReviewInterface visible={reviewVisible} onClose={() => setReviewVisible(false)} />

      {/* Bottom Navigation - wrapped in SafeAreaView for adaptive spacing */}
      <SafeAreaView edges={["bottom"]} style={styles.bottomNavSafeArea}>
        <View style={styles.bottomNav}>
          <Ionicons name="home-outline" size={24} color="#7CB798" />
          {/* <Ionicons name="search-outline" size={24} color="#7CB798" /> */}
          <TouchableOpacity onPress={() => setShowCart(true)} style={{ position: 'relative' }}>
            <Feather name="shopping-cart" size={24} color="#7CB798" />
            {cart.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cart.reduce((sum, item) => sum + item.quantity, 0)}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowProfile(true)}>
            <Ionicons name="person-outline" size={24} color="#7CB798" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const cardWidth = (Dimensions.get('window').width - 24 * 2 - 16) / 2;
const cardImageHeight = 190; // Slightly increased for better visual impact
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FCF9',
    padding: 24,
    paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7F3EC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#222',
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterBtn: {
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E7F3EC',
    marginRight: 8,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  filterBtnText: {
    color: '#7CB798',
    fontWeight: 'bold',
    fontSize: 14,
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.08)',
    zIndex: 100,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  dropdownMenuOverlay: {
    marginTop: 110,
    minWidth: 180,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 8,
    paddingVertical: 8,
    zIndex: 101,
    alignSelf: 'center',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  dropdownText: {
    fontSize: 16,
    color: '#222',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 14, // Slightly reduced for tighter grid
    width: cardWidth,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    padding: 8,
    // Ensure content never overflows
    minHeight: cardImageHeight + 60,
    justifyContent: 'flex-start',
  },
  cardImage: {
    width: '100%',
    height: cardImageHeight,
    borderRadius: 8,
    marginBottom: 6, // Slightly reduced for tighter layout
    backgroundColor: '#eee',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    position: 'relative',
  },
  fullImage: {
    width: '100%',
    height: 350,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  closeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  closeBtnText: {
    fontSize: 26,
    color: '#222',
    fontWeight: 'bold',
    lineHeight: 28,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
    flexWrap: 'wrap',
    textAlign: 'left',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
    gap: 4,
  },
  cardPrice: {
    color: '#7CB798',
    fontWeight: 'bold',
    fontSize: 14,
    flexShrink: 1,
    flexWrap: 'wrap',
    textAlign: 'left',
    maxWidth: cardWidth * 0.6,
  },
  addToCart: {
    color: '#7CB798',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  // Bottom navigation bar: Responsive padding to avoid overlap with phone navigation bars/home indicators.
  // Uses SafeAreaView for adaptive spacing on all devices (Android/iOS, small/large screens).
  bottomNavSafeArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    // No height here; inner bar controls height
  },
  bottomNav: {
    height: 56,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E7F3EC',
    // Responsive bottom padding for nav bar/home indicator
    paddingBottom: Platform.OS === 'ios' ? 10 : 16, // iOS: extra for home indicator, Android: for nav bar
    // The SafeAreaView will add more if needed
  },
  rateBtn: {
    marginTop: 18,
    backgroundColor: '#38E472',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 22,
    alignSelf: 'center',
  },
  rateBtnText: {
    color: '#111',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#38E472',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 10,
  },
  cartBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default BuyerInterface;
