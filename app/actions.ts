'use server'
 
import webpush from 'web-push'
 
webpush.setVapidDetails(
  'mailto:test@example.com', // DOTHIS: don't have medimate mail, so just placeholding here
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)
 
let subscription: PushSubscription | null = null
 
export async function subscribeUser(sub: PushSubscription) {
  subscription = sub
  // DOTHIS: store sub in db
  return { success: true }
}
 
export async function unsubscribeUser() {
  subscription = null
  // DOTHIS: remove sub from db
  return { success: true }
}
 
export async function sendNotification(message: string) {
  if (!subscription) {
    throw new Error('No subscription available')
  }
 
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: 'Test Notification',
        body: message,
        icon: '/icon.png',
      })
    )
    return { success: true }
  } catch (error) {
    console.error('Error sending push notification:', error)
    return { success: false, error: 'Failed to send notification' }
  }
}