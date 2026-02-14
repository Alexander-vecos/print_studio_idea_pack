# 📱 Android OAuth 2.0 Setup Guide

Complete guide for configuring Google OAuth 2.0 authentication for Android applications in PrintStudio.

---

## 📋 Overview

When your application is going to be installed on a device or computer (such as a system running Android, iOS, Universal Windows Platform, Chrome, or any desktop OS), you can use Google's OAuth 2.0 Mobile and desktop apps flow. If your application runs on devices with limited input capabilities, such as smart TVs, you can use Google's OAuth 2.0 TV and limited-input device flow.

---

## 🤖 Android OAuth 2.0 Configuration

### Prerequisites

Before you begin, ensure you have:
- Android Studio installed
- Your Android app's package name
- Access to your keystore file (debug or production)
- Firebase project set up
- Google Cloud Console access

---

## 📦 Step 1: Get Your Android Package Name

Your Android package name is typically defined in your `AndroidManifest.xml` file:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.printstudio.app">
    ...
</manifest>
```

Or in your `build.gradle` file:

```gradle
android {
    defaultConfig {
        applicationId "com.printstudio.app"
    }
}
```

**Example Package Name**: `com.printstudio.app`

---

## 🔐 Step 2: Generate SHA1 Fingerprint

### For Android Ice Cream Sandwich (4.0) and Newer

**Note**: Currently, obtaining OAuth 2.0 access tokens via AccountManager works for Android Ice Cream Sandwich (4.0) and newer versions.

### Using Keytool

You need to specify your Android app's package name and SHA1 fingerprint in the Firebase Console.

Run the `keytool` utility to get the SHA1 fingerprint for your digitally signed `.apk` file's public certificate:

```bash
keytool -list -v -keystore path-to-debug-or-production-keystore -alias androiddebugkey
```

### Debug Keystore

**Note**: For the `debug.keystore`, the password is `android`.

For Android Studio, the debug keystore is typically located at:
- **macOS/Linux**: `~/.android/debug.keystore`
- **Windows**: `C:\Users\YourUsername\.android\debug.keystore`

#### Example Command (Debug):

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey
```

When prompted for a password, type: `android`

#### Example Output:

```
$ keytool -list -v -keystore ~/.android/debug.keystore
Enter keystore password: Type "android" if using debug.keystore
Keystore type: JKS
Keystore provider: SUN

Your keystore contains 1 entry

Alias name: androiddebugkey
Creation date: Mar 13, 2020
Entry type: PrivateKeyEntry
Certificate chain length: 1
Certificate[1]:
Owner: C=US, O=Android, CN=Android Debug
Issuer: C=US, O=Android, CN=Android Debug
Serial number: 1
Valid from: Fri Mar 13 09:59:25 PDT 2020 until: Sun Mar 06 08:59:25 PST 2050
Certificate fingerprints:
	 SHA1: D9:E9:59:FA:7A:46:72:4E:69:1F:96:18:8C:F9:AE:82:3A:5D:2F:03
	 SHA256: 92:59:1E:F4:C9:BC:72:43:1C:59:57:24:AD:78:CA:A2:DB:C7:C5:AC:B1:A3:E8:52:04:B2:00:37:53:04:0B:8E
Signature algorithm name: SHA1withRSA
Subject Public Key Algorithm: 2048-bit RSA key
Version: 1
```

**Copy the SHA1 fingerprint from the results that appear in your terminal.**

In the example above, the SHA1 fingerprint is:
```
D9:E9:59:FA:7A:46:72:4E:69:1F:96:18:8C:F9:AE:82:3A:5D:2F:03
```

### Production Keystore

For production releases, use your production keystore:

```bash
keytool -list -v -keystore /path/to/your/production.keystore -alias your-key-alias
```

You'll need to enter your production keystore password (not "android").

---

## 🔧 Step 3: Configure Firebase Console

### Add Android App to Firebase Project

1. **Open Firebase Console**
   - Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Select your project

2. **Add Android App**
   - Click on "Add app" or the Android icon
   - Click "Register app"

3. **Enter Package Name**
   - In the **Package name** field, enter your Android app's package name
   - Example: `com.printstudio.app`

4. **Enter SHA1 Fingerprint**
   - Paste the SHA1 fingerprint you obtained from the keytool command
   - Example: `D9:E9:59:FA:7A:46:72:4E:69:1F:96:18:8C:F9:AE:82:3A:5D:2F:03`

5. **Download google-services.json**
   - Download the `google-services.json` file
   - Place it in your Android app's `app/` directory

---

## 🔑 Step 4: Configure OAuth 2.0 Client

### Google Cloud Console

1. **Navigate to Google Cloud Console**
   - Go to [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - Select your project

2. **Enable Google+ API** (if required)
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" or "Google Sign-In API"
   - Click "Enable"

3. **Create OAuth 2.0 Client ID**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Android" as the application type

4. **Configure OAuth Consent Screen** (if not already done)
   - Fill in the required information
   - Add test users if needed
   - Save the configuration

5. **Configure Android OAuth Client**
   - **Package name**: Enter your Android package name
   - **SHA-1 certificate fingerprint**: Paste your SHA1 fingerprint
   - Click "Create"

---

## 📲 Step 5: Update Android App

### Add Dependencies

In your `build.gradle` (app level):

```gradle
dependencies {
    // Firebase Authentication
    implementation 'com.google.firebase:firebase-auth:22.3.1'
    
    // Google Sign-In
    implementation 'com.google.android.gms:play-services-auth:20.7.0'
}
```

### Add Internet Permission

In your `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

### Initialize Firebase

In your main `Application` class or `MainActivity`:

```kotlin
import com.google.firebase.FirebaseApp

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        FirebaseApp.initializeApp(this)
    }
}
```

---

## 🔄 Step 6: Implement Google Sign-In

### Configure Google Sign-In

```kotlin
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider

class AuthActivity : AppCompatActivity() {
    
    private lateinit var auth: FirebaseAuth
    private lateinit var googleSignInClient: GoogleSignInClient
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize Firebase Auth
        auth = FirebaseAuth.getInstance()
        
        // Configure Google Sign-In
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(getString(R.string.default_web_client_id))
            .requestEmail()
            .build()
            
        googleSignInClient = GoogleSignIn.getClient(this, gso)
    }
    
    private fun signIn() {
        val signInIntent = googleSignInClient.signInIntent
        startActivityForResult(signInIntent, RC_SIGN_IN)
    }
    
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        
        if (requestCode == RC_SIGN_IN) {
            val task = GoogleSignIn.getSignedInAccountFromIntent(data)
            try {
                val account = task.getResult(ApiException::class.java)!!
                firebaseAuthWithGoogle(account.idToken!!)
            } catch (e: ApiException) {
                Log.w(TAG, "Google sign in failed", e)
            }
        }
    }
    
    private fun firebaseAuthWithGoogle(idToken: String) {
        val credential = GoogleAuthProvider.getCredential(idToken, null)
        auth.signInWithCredential(credential)
            .addOnCompleteListener(this) { task ->
                if (task.isSuccessful) {
                    // Sign in success
                    val user = auth.currentUser
                    // Navigate to main app
                } else {
                    // Sign in failed
                    Log.w(TAG, "signInWithCredential:failure", task.exception)
                }
            }
    }
    
    companion object {
        private const val RC_SIGN_IN = 9001
        private const val TAG = "AuthActivity"
    }
}
```

---

## 🧪 Testing

### Test on Debug Build

1. **Build debug APK**
   ```bash
   ./gradlew assembleDebug
   ```

2. **Install on device/emulator**
   ```bash
   adb install app/build/outputs/apk/debug/app-debug.apk
   ```

3. **Test Google Sign-In**
   - Launch the app
   - Tap "Sign in with Google"
   - Select Google account
   - Verify successful authentication

### Test on Release Build

1. **Generate signed APK/AAB**
   - Use your production keystore
   - Build > Generate Signed Bundle / APK

2. **Get release SHA1**
   ```bash
   keytool -list -v -keystore /path/to/production.keystore -alias your-alias
   ```

3. **Add release SHA1 to Firebase**
   - Firebase Console > Project Settings > Your Android app
   - Add the release SHA1 fingerprint

4. **Test release build**
   - Install release APK on device
   - Test Google Sign-In flow

---

## 🛠️ Common Keystore Locations

### Android Studio Default Locations

| OS | Debug Keystore Path |
|---|---|
| **macOS/Linux** | `~/.android/debug.keystore` |
| **Windows** | `C:\Users\{username}\.android\debug.keystore` |

### Finding Custom Keystore

Check your `build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            storeFile file('/path/to/your.keystore')
            storePassword 'your-password'
            keyAlias 'your-alias'
            keyPassword 'your-key-password'
        }
    }
}
```

---

## ⚠️ Troubleshooting

### Issue: "Developer Error" when signing in

**Cause**: SHA1 fingerprint mismatch

**Solution**:
1. Double-check SHA1 in Firebase Console matches your keystore
2. Ensure you're using the correct keystore (debug vs. release)
3. Wait 5-10 minutes after adding SHA1 to Firebase (propagation delay)

### Issue: "API not enabled"

**Cause**: Google Sign-In API not enabled

**Solution**:
1. Go to Google Cloud Console
2. Enable "Google+ API" or "Google Sign-In API"
3. Wait a few minutes for changes to propagate

### Issue: Can't find debug.keystore

**Solution**:
```bash
# Create new debug keystore
keytool -genkey -v -keystore ~/.android/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000
```

### Issue: "The package name does not match"

**Cause**: Package name in Firebase doesn't match your app

**Solution**:
1. Check `AndroidManifest.xml` package attribute
2. Check `build.gradle` applicationId
3. Update Firebase Console with correct package name

### Issue: Multiple SHA1 fingerprints needed

**Scenario**: You need both debug and release SHA1s

**Solution**:
1. Get debug SHA1: `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey`
2. Get release SHA1: `keytool -list -v -keystore your-release.keystore -alias your-alias`
3. Add BOTH to Firebase Console (you can have multiple SHA1s per app)

---

## 📱 Platform-Specific Notes

### Android Versions

- **Minimum SDK**: API 21 (Android 5.0 Lollipop) recommended
- **Target SDK**: Latest stable version
- **OAuth Support**: Android 4.0 (Ice Cream Sandwich) and newer

### Device Compatibility

- **Google Play Services Required**: Ensure device has Google Play Services installed
- **Test on real devices**: Emulators may have issues with Google Sign-In
- **Multiple Google accounts**: Test with users who have multiple Google accounts

---

## 🔒 Security Best Practices

1. **Never commit keystore files to version control**
   - Add to `.gitignore`:
     ```
     *.keystore
     *.jks
     keystore.properties
     ```

2. **Store passwords securely**
   - Use environment variables
   - Use keystore.properties file (gitignored)
   - Example `keystore.properties`:
     ```properties
     storePassword=your-store-password
     keyPassword=your-key-password
     keyAlias=your-key-alias
     storeFile=/path/to/keystore
     ```

3. **Use different keystores for debug and release**
   - Debug: Use Android Studio default
   - Release: Create secure production keystore

4. **Keep release keystore backup**
   - Store in secure location
   - You cannot update an app without the original keystore

---

## 📚 Additional Resources

### Official Documentation

- [Google OAuth 2.0 for Mobile & Desktop Apps](https://developers.google.com/identity/protocols/oauth2/native-app)
- [Firebase Authentication for Android](https://firebase.google.com/docs/auth/android/google-signin)
- [Android Keystore System](https://developer.android.com/training/articles/keystore)
- [Google Sign-In for Android](https://developers.google.com/identity/sign-in/android/start-integrating)

### Related Guides

- [AUTH_FLOW.md](./AUTH_FLOW.md) - Phone authentication flow
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - General troubleshooting

---

## ✅ Checklist

Before going to production, ensure:

- [ ] Package name configured in Firebase
- [ ] Debug SHA1 fingerprint added to Firebase
- [ ] Release SHA1 fingerprint added to Firebase
- [ ] `google-services.json` downloaded and placed in `app/` directory
- [ ] OAuth Client ID created in Google Cloud Console
- [ ] Google Sign-In API enabled
- [ ] Dependencies added to `build.gradle`
- [ ] Code implementation tested on debug build
- [ ] Code implementation tested on release build
- [ ] Error handling implemented
- [ ] Keystore securely backed up
- [ ] All keystores excluded from version control

---

## 🎯 Quick Start Summary

```bash
# 1. Get SHA1 for debug
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey
# Password: android

# 2. Get SHA1 for release
keytool -list -v -keystore /path/to/release.keystore -alias your-alias
# Password: your-password

# 3. Add to Firebase Console
# - Project Settings > Add Android App
# - Enter package name
# - Add SHA1 fingerprints (both debug and release)

# 4. Download google-services.json
# - Place in app/ directory

# 5. Configure OAuth Client in Google Cloud Console
# - Create OAuth 2.0 Client ID (Android)
# - Enter package name and SHA1

# 6. Test
./gradlew assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

**Last Updated**: February 14, 2026  
**Status**: ✅ Complete Android OAuth 2.0 Setup Guide
