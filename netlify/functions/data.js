const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const getDB = () => {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      })
    });
  }
  return getFirestore();
};

exports.handler = async (event) => {
  const db = getDB();
  const docRef = db.collection('app').doc('data');

  if (event.httpMethod === 'GET') {
    const doc = await docRef.get();
    if (!doc.exists) {
      return { statusCode: 404, body: JSON.stringify({ error: 'No data' }) };
    }
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc.data().payload)
    };
  }

  if (event.httpMethod === 'POST') {
    const payload = JSON.parse(event.body);
    await docRef.set({ payload });
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  }
};
