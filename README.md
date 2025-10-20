
# FurnitureApp

FurnitureApp is a cross-platform application designed to facilitate buying and selling furniture. It provides interfaces for buyers and sellers, allowing users to register, log in, manage profiles, list products, add items to cart, checkout, and review transactions.

## Features

- **Buyer Interface**: Browse products, manage cart, checkout, view receipts, and leave reviews.
- **Seller Interface**: Register as a seller, manage listings, upload products, view profile, and receive reviews from buyers.
- **Authentication**: User registration and login functionality.
- **Profile Management**: Separate profile management for buyers and sellers.
- **Cart & Checkout**: Add items to cart and complete purchases with a checkout flow.
- **Review System**: Buyers can review products and sellers; sellers can view feedback.

## Project Structure

```
app.json
eslint.config.js
expo-env.d.ts
package.json
README.md
... 
app/
   _layout.tsx
   index.tsx
   register.tsx
assets/
   images/
components/
   buyer-interface/
      buyer-interface.tsx
   buyerprofile/
      profile.tsx
   cart/
      cart.tsx
      index.ts
   checkout/
      checkout.tsx
      index.ts
   login/
      login.tsx
   receipt/
      index.ts
      receipt.tsx
   register/
      register.tsx
   review-interface/
      review-interface.tsx
   seller-interface/
      seller-interface.tsx
   sellerManageListing/
      SellerManageListing.tsx
   sellerproducts/
      upload.tsx
   sellerprofile/
      SellerProfile.tsx
   sellerReviewsFromBuyers/
      SellerReviewsFromBuyers.tsx
```

## Getting Started

1. **Install dependencies**:
    ```sh
    npm install
    ```
2. **Start the development server**:
    ```sh
    npm start
    ```
3. **Run on device/emulator**:
    Follow Expo instructions to run on iOS, Android, or web.

## Technologies Used

- React Native
- Expo
- TypeScript
- ESLint

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License.

---
Thanks for checking out FurnitureApp!

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
# furnitureApp
