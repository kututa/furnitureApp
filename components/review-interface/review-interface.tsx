import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ratings = [
  { value: 5, percent: 40 },
  { value: 4, percent: 30 },
  { value: 3, percent: 15 },
  { value: 2, percent: 10 },
  { value: 1, percent: 5 },
];

const ReviewInterface = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const [review, setReview] = useState('');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={28} color="#222" />
          </Pressable>
          <Text style={styles.title}>Rate Product</Text>
          <Text style={styles.subtitle}>How would you rate this product?</Text>
          <View style={styles.row}>
            <Text style={styles.ratingNum}>4.5</Text>
            <View style={{ marginLeft: 8 }}>
              <View style={styles.starsRow}>
                {[1,2,3,4,5].map(i => (
                  <Ionicons key={i} name={i <= 4 ? 'star' : 'star-outline'} size={20} color="#38E472" />
                ))}
              </View>
              <Text style={styles.reviewsText}>23 reviews</Text>
            </View>
          </View>
          <View style={{ marginBottom: 12 }}>
            {ratings.map(r => (
              <View key={r.value} style={styles.ratingBarRow}>
                <Text style={styles.ratingBarLabel}>{r.value}</Text>
                <View style={styles.ratingBarBg}>
                  <View style={[styles.ratingBarFill, { width: `${r.percent}%` }]} />
                </View>
                <Text style={styles.ratingBarPercent}>{r.percent}%</Text>
              </View>
            ))}
          </View>
          <TextInput
            style={styles.input}
            placeholder="Write your review..."
            placeholderTextColor="#7CB798"
            value={review}
            onChangeText={setReview}
            multiline
          />
          <TouchableOpacity style={styles.submitBtn}>
            <Text style={styles.submitBtnText}>Submit Review</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '92%',
    backgroundColor: '#F8FCF9',
    borderRadius: 12,
    padding: 18,
    alignItems: 'flex-start',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 2,
  },
  title: {
    alignSelf: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
    width: '100%',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#222',
    marginBottom: 10,
    width: '100%',
    textAlign: 'left',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingNum: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#38E472',
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  reviewsText: {
    color: '#7CB798',
    fontSize: 13,
  },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingBarLabel: {
    width: 16,
    fontSize: 14,
    color: '#222',
  },
  ratingBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#E7F3EC',
    borderRadius: 4,
    marginHorizontal: 6,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: 8,
    backgroundColor: '#38E472',
    borderRadius: 4,
  },
  ratingBarPercent: {
    width: 32,
    fontSize: 13,
    color: '#7CB798',
    textAlign: 'right',
  },
  input: {
    width: '100%',
    minHeight: 60,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E7F3EC',
    padding: 10,
    fontSize: 15,
    color: '#222',
    marginBottom: 18,
    marginTop: 8,
  },
  submitBtn: {
    alignSelf: 'flex-end',
    backgroundColor: '#38E472',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 22,
  },
  submitBtnText: {
    color: '#111',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ReviewInterface;
