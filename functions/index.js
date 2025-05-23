const admin = require('firebase-admin');
const functions = require('firebase-functions');
const geoip = require('geoip-lite');

admin.initializeApp();

exports.addUserToFirestore = functions.https.onCall(async (data, context) => {
  try {
    const uid = data.uid;
    const email = data.email;

    // Get current timestamp
    const timestamp = new Date().toISOString();

    // Get user's IP address (This might require specific configurations
    // depending on your hosting environment)
    // const ipAddress = request.ip; // Example for HTTP functions
    // For auth triggers, you might need to rely on other methods to
    // obtain the IP address, such as storing it during user signup.
    const ipAddress = null; // Replace with your actual IP address retrieval method

    let country = null;
    if (ipAddress) {
      const geo = geoip.lookup(ipAddress);
      country = geo ? geo.country : null;
    }

    // Get device type (This might require storing the device type
    // during user signup or sign-in)
    const deviceType = null; // Replace with your actual device type retrieval method

    // Create user document in Firestore
    const db = admin.firestore();
    const userRef = db.collection('users').doc(uid);

    await userRef.set({
      uid,
      email,
      timestamp,
      country,
      deviceType
    });

    console.log(`User document created for UID: ${uid}`);
    return { result: "User added successfully" };
  } catch (error) {
    console.error("Error adding user to Firestore:", error);
    return { error: error.message };
  }
});
