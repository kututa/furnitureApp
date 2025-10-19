import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const SellerProducts = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seller Product Upload</Text>
      {/* Add product upload form and product list here */}
    </View>
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
});

export default SellerProducts;
