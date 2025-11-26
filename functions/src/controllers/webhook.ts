import * as functions from "firebase-functions/v1";
import { db, adaptySecretKey } from "../config";
import { getAdaptyProfile, calculateQuotaFromAdapty } from "../utils/adapty";
import { UserData, AdaptyWebhookResponse } from "../types";

/**
 * 6. ADAPTY WEBHOOK
 */
export const adaptyWebhook = functions
    .runWith({secrets: [adaptySecretKey]})
    .https.onRequest(async (req: functions.https.Request, res: functions.Response) => {
      
      res.set('Content-Type', 'application/json');
      
      if (req.method !== 'POST') {
        console.warn('Webhook: Invalid method:', req.method);
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
      }

      try {
        console.log('Adapty webhook event received');
        
        const event = req.body;
        const eventType = event.event_type;
        const profileId = event.profile_id;

        if (!profileId) {
           console.warn('Webhook: profile_id eksik.', event);
           const response: AdaptyWebhookResponse = { status: 'ignored', reason: 'Missing profile_id' };
           res.status(200).json(response);
           return;
        }

        console.log(`Webhook event type: ${eventType}, profile: ${profileId}`);

        const relevantEvents = [
          'subscription_started',
          'subscription_renewed',
          'subscription_expired',
        ];

        if (!relevantEvents.includes(eventType)) {
          console.log(`Ignoring event type: ${eventType}`);
          const response: AdaptyWebhookResponse = { status: 'ignored', event_type: eventType };
          res.status(200).json(response);
          return;
        }

        const adaptyProfile = await getAdaptyProfile(profileId);
        
        if (!adaptyProfile) {
          console.error(`Profile ${profileId} not found in Adapty`);
          const response: AdaptyWebhookResponse = { status: 'profile_not_found', profile_id: profileId };
          res.status(200).json(response);
          return;
        }

        const newQuotas = calculateQuotaFromAdapty(adaptyProfile);
        
        const userRef = db.collection("users").doc(profileId);
        
        const userDataToSet: Partial<UserData> & { lastSyncedWithAdapty: Date } = {
            ...newQuotas,
            lastSyncedWithAdapty: new Date(),
        };
        
        // set(..., {merge: true}) = Varsa güncelle, yoksa oluştur.
        // Oluşturma sırasında createdAt alanı da eklenmeli
        if (!(await userRef.get()).exists) {
          userDataToSet.createdAt = new Date();
        }

        await userRef.set(userDataToSet, { merge: true });
        
        console.log(`User ${profileId} webhook ile güncellendi, tier: ${newQuotas.tier}`);
        const response: AdaptyWebhookResponse = { status: 'success', tier: newQuotas.tier };
        res.status(200).json(response);

      } catch (error: any) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
