import { useProductStore } from "@/stores/productStore";
import { Product } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState, useEffect } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface ProductEditProps {
    product: Product;
    onClose: () => void;
    onSave?: (updatedProduct: Product) => void;
}

const categories = [
    "Living Room",
    "Bedroom",
    "Dining Room",
    "Office",
    "Outdoor",
    "Storage",
    "Lighting",
    "Decor",
];

const ProductEdit: React.FC<ProductEditProps> = ({
    product,
    onClose,
    onSave,
}) => {
    const { updateProductWithImage, update_product, isLoading } = useProductStore();
    
    // Form state
    const [name, setName] = useState(product.name || "");
    const [description, setDescription] = useState(product.description || "");
    const [price, setPrice] = useState(product.price?.toString() || "");
    const [stock, setStock] = useState(product.stock?.toString() || "");
    const [category, setCategory] = useState(product.category || "");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!name.trim()) newErrors.name = "Product name is required";
        if (!description.trim()) newErrors.description = "Description is required";
        if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) {
            newErrors.price = "Valid price is required";
        }
        if (!stock.trim() || isNaN(Number(stock)) || Number(stock) < 0) {
            newErrors.stock = "Valid stock quantity is required";
        }
        if (!category) newErrors.category = "Category is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permission needed", "Please grant camera roll permissions to upload images.");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setSelectedImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error("Error picking image:", error);
            Alert.alert("Error", "Failed to pick image. Please try again.");
        }
    };

    const handleSave = async () => {
        if (!validateForm()) {
            Alert.alert("Validation Error", "Please fix the errors before saving.");
            return;
        }

        try {
            const updatedProductData: Product = {
                ...product,
                name: name.trim(),
                description: description.trim(),
                price: Number(price),
                stock: Number(stock),
                category,
            };

            if (selectedImage) {
                // Create FormData for multipart upload with new image
                const formData = new FormData();
                formData.append("name", name.trim());
                formData.append("description", description.trim());
                formData.append("price", price);
                formData.append("stock", stock);
                formData.append("category", category);

                // Add image file
                const filename = selectedImage.split("/").pop() || "image.jpg";
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : "image/jpeg";

                formData.append("image", {
                    uri: selectedImage,
                    name: filename,
                    type,
                } as any);

                await updateProductWithImage(product.id, formData);
            } else {
                // Update without changing image
                await update_product(product.id, updatedProductData);
            }

            onSave?.(updatedProductData);
            Alert.alert("Success", "Product updated successfully!", [
                { text: "OK", onPress: onClose },
            ]);
        } catch (error: any) {
            console.error("Failed to update product:", error);
            Alert.alert("Error", error?.message || "Failed to update product. Please try again.");
        }
    };

    const currentImage = selectedImage || product.image;

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.headerButton}>
                    <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Product</Text>
                <TouchableOpacity 
                    onPress={handleSave} 
                    style={[styles.headerButton, { opacity: isLoading ? 0.6 : 1 }]}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Ionicons name="checkmark" size={24} color="#fff" />
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView 
                style={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Product Image */}
                <View style={styles.imageSection}>
                    <Text style={styles.sectionTitle}>Product Image</Text>
                    <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
                        {currentImage ? (
                            <Image source={{ uri: currentImage }} style={styles.productImage} />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Ionicons name="camera" size={32} color="#7CB798" />
                                <Text style={styles.placeholderText}>Tap to add image</Text>
                            </View>
                        )}
                        <View style={styles.imageOverlay}>
                            <Ionicons name="camera" size={20} color="#fff" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Product Details */}
                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>Product Details</Text>

                    {/* Product Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Product Name *</Text>
                        <TextInput
                            style={[styles.input, errors.name && styles.inputError]}
                            value={name}
                            onChangeText={(text) => {
                                setName(text);
                                if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
                            }}
                            placeholder="Enter product name"
                            placeholderTextColor="#9DB8A5"
                        />
                        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                    </View>

                    {/* Description */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Description *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea, errors.description && styles.inputError]}
                            value={description}
                            onChangeText={(text) => {
                                setDescription(text);
                                if (errors.description) setErrors(prev => ({ ...prev, description: "" }));
                            }}
                            placeholder="Describe your product..."
                            placeholderTextColor="#9DB8A5"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                        {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
                    </View>

                    {/* Price and Stock Row */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.inputLabel}>Price (KES) *</Text>
                            <TextInput
                                style={[styles.input, errors.price && styles.inputError]}
                                value={price}
                                onChangeText={(text) => {
                                    setPrice(text);
                                    if (errors.price) setErrors(prev => ({ ...prev, price: "" }));
                                }}
                                placeholder="0"
                                placeholderTextColor="#9DB8A5"
                                keyboardType="numeric"
                            />
                            {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
                        </View>

                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.inputLabel}>Stock Quantity *</Text>
                            <TextInput
                                style={[styles.input, errors.stock && styles.inputError]}
                                value={stock}
                                onChangeText={(text) => {
                                    setStock(text);
                                    if (errors.stock) setErrors(prev => ({ ...prev, stock: "" }));
                                }}
                                placeholder="0"
                                placeholderTextColor="#9DB8A5"
                                keyboardType="numeric"
                            />
                            {errors.stock && <Text style={styles.errorText}>{errors.stock}</Text>}
                        </View>
                    </View>

                    {/* Category */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Category *</Text>
                        <TouchableOpacity
                            style={[styles.input, styles.categoryButton, errors.category && styles.inputError]}
                            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                        >
                            <Text style={[styles.categoryText, !category && { color: "#9DB8A5" }]}>
                                {category || "Select category"}
                            </Text>
                            <Ionicons 
                                name={showCategoryPicker ? "chevron-up" : "chevron-down"} 
                                size={20} 
                                color="#7CB798" 
                            />
                        </TouchableOpacity>
                        {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

                        {/* Category Picker */}
                        {showCategoryPicker && (
                            <View style={styles.categoryPicker}>
                                {categories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[
                                            styles.categoryOption,
                                            category === cat && styles.categoryOptionSelected,
                                        ]}
                                        onPress={() => {
                                            setCategory(cat);
                                            setShowCategoryPicker(false);
                                            if (errors.category) setErrors(prev => ({ ...prev, category: "" }));
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.categoryOptionText,
                                                category === cat && styles.categoryOptionTextSelected,
                                            ]}
                                        >
                                            {cat}
                                        </Text>
                                        {category === cat && (
                                            <Ionicons name="checkmark" size={16} color="#fff" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                </View>

                {/* Save Button */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <>
                                <Ionicons name="save" size={20} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#18271B",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 58,
        paddingBottom: 16,
        backgroundColor: "#18271B",
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#B6E2C6",
        marginBottom: 16,
    },
    imageSection: {
        marginBottom: 24,
    },
    imageContainer: {
        alignSelf: "center",
        position: "relative",
    },
    productImage: {
        width: 200,
        height: 200,
        borderRadius: 12,
        backgroundColor: "#223324",
    },
    imagePlaceholder: {
        width: 200,
        height: 200,
        borderRadius: 12,
        backgroundColor: "#223324",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#7CB798",
        borderStyle: "dashed",
    },
    placeholderText: {
        color: "#7CB798",
        fontSize: 14,
        marginTop: 8,
    },
    imageOverlay: {
        position: "absolute",
        bottom: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(0,0,0,0.6)",
        alignItems: "center",
        justifyContent: "center",
    },
    formSection: {
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#B6E2C6",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#223324",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: "#fff",
        borderWidth: 1,
        borderColor: "transparent",
    },
    inputError: {
        borderColor: "#FF5722",
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },
    row: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    categoryButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    categoryText: {
        fontSize: 16,
        color: "#fff",
        flex: 1,
    },
    categoryPicker: {
        backgroundColor: "#223324",
        borderRadius: 8,
        marginTop: 8,
        maxHeight: 200,
    },
    categoryOption: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#2B4B34",
    },
    categoryOptionSelected: {
        backgroundColor: "#7CB798",
    },
    categoryOptionText: {
        fontSize: 16,
        color: "#B6E2C6",
    },
    categoryOptionTextSelected: {
        color: "#fff",
        fontWeight: "600",
    },
    errorText: {
        fontSize: 12,
        color: "#FF5722",
        marginTop: 4,
    },
    buttonContainer: {
        paddingBottom: 40,
    },
    saveButton: {
        backgroundColor: "#38E472",
        borderRadius: 8,
        paddingVertical: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
    cancelButton: {
        backgroundColor: "transparent",
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#7CB798",
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#7CB798",
    },
});

export default ProductEdit;