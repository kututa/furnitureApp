import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type SellerProductsProps = {
  onClose?: () => void;
};

const SellerProducts: React.FC<SellerProductsProps> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [imageModal, setImageModal] = useState(false);
  const [images, setImages] = useState([]);

  const categories = ['sofa', 'chair', 'wwe superstars', 'tables', 'ladders'];
  
  const pickImages = async () => {
    // Image picking logic here
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={{ padding: 4 }} onPress={onClose}>
          <Ionicons name="close" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Listing</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Product Name */}
      <TextInput
        style={styles.input}
        placeholder="Product Name"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#7CB798"
      />
      {/* Price */}
      <TextInput
        style={styles.input}
        placeholder="Price (KES)"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        placeholderTextColor="#7CB798"
      />
      {/* Description */}
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        placeholderTextColor="#7CB798"
      />
      {/* Category Dropdown */}
      <TouchableOpacity style={styles.input} onPress={() => setDropdownOpen(!dropdownOpen)}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: category ? '#222' : '#7CB798', fontSize: 15 }}>{category || 'Category'}</Text>
          <Ionicons name={dropdownOpen ? 'chevron-up' : 'chevron-down'} size={22} color="#7CB798" />
        </View>
      </TouchableOpacity>
      {dropdownOpen && (
        <View style={styles.dropdownMenu}>
          {categories.map(cat => (
            <TouchableOpacity key={cat} style={styles.dropdownItem} onPress={() => { setCategory(cat); setDropdownOpen(false); }}>
              <Text style={{ color: '#222', fontSize: 15 }}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Upload Images */}
      <Text style={styles.sectionTitle}>Upload Images</Text>
      <View style={styles.uploadBox}>
        {images.length === 0 ? (
          <View style={styles.uploadEmpty}>
            <Text style={styles.uploadAdd}>Add Images</Text>
            <Text style={styles.uploadDesc}>Upload up to 5 images of your product</Text>
            <TouchableOpacity style={styles.uploadBtn} onPress={pickImages}>
              <Text style={styles.uploadBtnText}>Upload</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.uploadImagesWrap}>
            {images.map((img, idx) => (
              <TouchableOpacity key={idx} onPress={() => { setImageModal(true); }}>
                <Image source={{ uri: img }} style={styles.uploadImage} />
              </TouchableOpacity>
            ))}
            {images.length < 5 && (
              <TouchableOpacity style={styles.uploadBtnSmall} onPress={pickImages}>
                <Ionicons name="add" size={22} color="#7CB798" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Post Listing Button */}
      <TouchableOpacity style={styles.postBtn}>
        <Text style={styles.postBtnText}>Post Listing</Text>
      </TouchableOpacity>

      {/* Image Modal (for preview, optional) */}
      <Modal visible={imageModal} transparent animationType="fade" onRequestClose={() => setImageModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Image Preview</Text>
            {/* ...could show selected image here... */}
            <TouchableOpacity style={styles.modalClose} onPress={() => setImageModal(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FCF9',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 32,
    backgroundColor: '#F8FCF9',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    marginTop: 58,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#E7F3EC',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#222',
    marginBottom: 12,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E7F3EC',
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E7F3EC',
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 8,
    color: '#222',
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: '#CFE9DD',
    borderRadius: 12,
    padding: 18,
    marginBottom: 18,
    backgroundColor: '#F8FCF9',
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  uploadEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadAdd: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    marginBottom: 6,
  },
  uploadDesc: {
    color: '#7CB798',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  uploadBtn: {
    backgroundColor: '#E7F3EC',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  uploadBtnText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 15,
  },
  uploadImagesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    margin: 4,
    backgroundColor: '#eee',
  },
  uploadBtnSmall: {
    backgroundColor: '#E7F3EC',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
  postBtn: {
    backgroundColor: '#38E472',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  postBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
    alignItems: 'center',
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 12,
    alignSelf: 'center',
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
});

export default SellerProducts;
