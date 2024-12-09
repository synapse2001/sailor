# Welcome to Sailor

<div align="center" style="display: flex; align-items: center; justify-content: center;">
<!--   <h1 style="margin-right: 20px;">Sailor</h1> -->
  <img src="src/assets/images/sailor.png" alt="Sailor Logo" width="100" height="100">
</div>

Sailor is a **React** and **Firebase-based** application designed to streamline your e-commerce sales portal. Its a friction less gateway to online sales/Inventory Management and more.
This guide covers the steps to set up, configure Firebase, build, deploy via Vercel, and create environment variables for a smooth start.

---
## ⚒️ **Sales is All you Need**
**Admin**  
- Email:
-     admin.demo@sailor.com      
- Password:
-     admin@sailor
  
**User**  
- Email:
-     user.demo@sailor.com      
- Password:
-     user@sailor


### User Perspective Demo
https://github.com/user-attachments/assets/ea87bd93-2240-4f6e-8f84-87f4a1dcbeef

### Admin Perspective Demo
https://github.com/user-attachments/assets/6c4f967e-f806-4423-9d03-72fb343be1dc


## 🚀 **Setting Up Sailor**

### Life is easy with less requiremnets
- Node.js (v14.0 or later)
- npm (v6.0 or later)
- Firebase Account


Follow these steps to set up and run the Sailor app locally:

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/your-username/sailor.git
   cd sailor
   ```

2. **Install Dependencies:**

   ```bash
   npm install --legacy-peer-deps
   ```

3. **Run the App:**

   ```bash
   npm start
   ```

   The app should now be running at `http://localhost:3000`.

---

## 🔥 **Initializing a Firebase Project**

1. **Go to the Firebase Console:** [Firebase Console](https://console.firebase.google.com/)

2. **Create a New Project:**
   - Click **"Add Project"** and follow the setup steps.
   - Once created, go to **Project Settings** to get your configuration details.

3. **Enable Firebase Services:**
   - **Authentication** (for phone/email login).
   - **Realtime Database** or **Firestore** (for data storage).
   - **Storage** (for storing images or files).

4. **Register the App:**
   - Add a new web app in the project settings.
   - Copy the Firebase configuration details.

---

## 🔑 **Creating the `.env` File**

Create a `.env` file in the root of your project and add the following keys. **Do not share these values publicly.**

```env
# Firebase Configuration
REACT_APP_API_KEY=
REACT_APP_AUTHDOMAIN=
REACT_APP_PROJECTID=
REACT_APP_STORAGEBUCKET=
REACT_APP_MESSAGINGSENDERID=
REACT_APP_APPID=
REACT_APP_MEASUREMENTID=
REACT_APP_DATABASEURL=
REACT_APP_GSTORAGEURL=
```

### ⚠️ **Important:**
- Insert values with your own Firebase project configuration.
- Restart the development server after creating the `.env` file.

---

## 🛠️ **Building for Production**

To create an optimized production build:

```bash
npm run build
```

This command will generate a `build` folder containing the optimized static assets.

---

## 🚀 **Deploying to Vercel**

Follow these steps to deploy Sailor on **Vercel**:

1. **Install Vercel CLI (if not already installed):**

   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**

   ```bash
   vercel login
   ```

3. **Deploy to Vercel:**

   In the project root, run:

   ```bash
   vercel
   ```

   Follow the prompts to:

   - Link to an existing Vercel project or create a new one.
   - Specify `build` as the output directory for the production build.

4. **Deploy Production Build:**

   To deploy your latest production build:

   ```bash
   vercel --prod
   ```

### 💡 **Vercel Dashboard:**
- Visit the [Vercel Dashboard](https://vercel.com/dashboard) to manage your deployments.
- Your deployed app URL will be provided after deployment.

---

## 🤝 **Contributing**

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`.
3. Commit your changes: `git commit -m "Add your feature description"`.
4. Push the branch: `git push origin feature/your-feature-name`.
5. Submit a pull request.

---

## 📜 **License**

Sailor is licensed under the **MIT License**. Feel free to use, modify, and distribute this project. See the [LICENSE](LICENSE) file for more details.

---

## ✅ **You're Ready to Sail!**

Now that you’ve configured Sailor, built the project, and deployed to Vercel, you’re ready to explore your sales portal. Happy coding! 🚢
````
