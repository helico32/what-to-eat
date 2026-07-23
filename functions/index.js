const { setGlobalOptions }    = require('firebase-functions')
const { onSchedule }          = require('firebase-functions/v2/scheduler')
const { initializeApp }       = require('firebase-admin/app')
const { getFirestore }        = require('firebase-admin/firestore')
const { getMessaging }        = require('firebase-admin/messaging')

initializeApp()
setGlobalOptions({ maxInstances: 1, region: 'europe-west1' })

// Tourne tous les jours à 9h (heure de Paris).
// Lit tous les documents /users/{uid} qui ont un fcmToken,
// vérifie leurs produits dans /users/{uid}/products,
// et envoie une notification si un produit expire dans 2 jours ou moins.
exports.checkExpirations = onSchedule('every day 09:00', async () => {
  const firestore  = getFirestore()
  const messaging  = getMessaging()
  const today      = new Date()
  today.setHours(0, 0, 0, 0)

  // Filtre : seuls les users dont nextExpiry <= dans 2 jours sont lus.
  // Les users sans produits avec date (nextExpiry absent ou null) sont exclus.
  const twoDaysFromNow = new Date(today)
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2)
  const twoDaysStr = twoDaysFromNow.toISOString().split('T')[0]

  const usersSnap = await firestore.collection('users')
    .where('nextExpiry', '<=', twoDaysStr)
    .get()

  const sends = usersSnap.docs.map(async (userDoc) => {
    const { fcmToken } = userDoc.data()
    if (!fcmToken) return

    const productsSnap = await firestore
      .collection('users').doc(userDoc.id)
      .collection('products').get()

    const expiring = []
    for (const p of productsSnap.docs) {
      const { name, expiryDate } = p.data()
      if (!expiryDate) continue
      const expiry   = new Date(expiryDate)
      expiry.setHours(0, 0, 0, 0)
      const daysLeft = Math.round((expiry - today) / 86_400_000)
      if (daysLeft >= 0 && daysLeft <= 2) expiring.push({ name, daysLeft })
    }

    if (expiring.length === 0) return

    const lines = expiring.map(({ name, daysLeft }) =>
      daysLeft === 0 ? `${name} expire aujourd'hui`
      : daysLeft === 1 ? `${name} expire demain`
      : `${name} expire dans 2 jours`
    )

    await messaging.send({
      token: fcmToken,
      notification: {
        title: '🧊 What to eat — produits à utiliser',
        body:  lines.join(' · '),
      },
    }).catch(() => {
      // Token expiré ou révoqué — on ignore silencieusement.
    })
  })

  await Promise.allSettled(sends)
})
