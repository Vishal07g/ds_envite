// Isolated, Partitioned Firebase Service for DS Envite
// Guarantees:
// 1. One wish = one independent node (/saas_data/wishes/{invitationId}/{wishId}). Append-only.
// 2. Wishes are never wiped when an invitation is saved.
// 3. One RSVP = one node (/saas_data/rsvps/{invitationId}/{rsvpId}).
// 4. One invitation = one node (/saas_data/invitations/{invitationId}).
// 5. Unique 10-char code per invitation (/saas_data/invitation_codes/{code}).

import { ref, set, get, push, update, onValue, query, orderByChild } from "firebase/database";
import { database } from "./firebase.js";
import { generateInvitationCode, isValidInvitationCode } from "./invitationCode.js";

/**
 * Submit a guest blessing (wish).
 * Uses Firebase push() to guarantee an atomic, chronological append that can NEVER overwrite past wishes.
 */
export async function submitBlessingToFirebase(invitationId, { sender, message }) {
  if (!invitationId) throw new Error("Missing invitationId");
  const cleanSender = String(sender || "Guest").trim().slice(0, 80);
  const cleanMessage = String(message || "").trim().slice(0, 1000);
  if (!cleanMessage) throw new Error("Blessing message cannot be empty");

  const wishRef = push(ref(database, `saas_data/wishes/${invitationId}`));
  const wishId = wishRef.key;
  const createdAt = new Date().toISOString();
  const dateFormatted = new Date().toLocaleDateString('en-GB') + " " + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const wishRecord = {
    id: wishId,
    sender: cleanSender,
    message: cleanMessage,
    date: dateFormatted,
    createdAt: createdAt,
    status: "visible"
  };

  await set(wishRef, wishRecord);
  return wishRecord;
}

/**
 * Fetch all blessings for an invitation, ordered chronologically.
 */
export async function fetchBlessingsFromFirebase(invitationId) {
  if (!invitationId) return [];
  try {
    const wishesRef = ref(database, `saas_data/wishes/${invitationId}`);
    const snapshot = await get(wishesRef);
    if (!snapshot.exists()) return [];
    const val = snapshot.val();
    const list = Object.values(val);
    // Sort oldest first (or newest first) by createdAt
    return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  } catch (err) {
    console.warn("Could not fetch blessings from Firebase:", err);
    return [];
  }
}

/**
 * Real-time listener for blessings.
 */
export function subscribeToBlessings(invitationId, onUpdate) {
  if (!invitationId || typeof onUpdate !== "function") return () => {};
  const wishesRef = ref(database, `saas_data/wishes/${invitationId}`);
  return onValue(wishesRef, (snapshot) => {
    if (snapshot.exists()) {
      const list = Object.values(snapshot.val());
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      onUpdate(list);
    } else {
      onUpdate([]);
    }
  });
}

/**
 * Ensure an invitation has a permanent, unique 10-character code.
 * If not present, generates and atomically reserves one in /saas_data/invitation_codes/{code}.
 */
export async function ensureInvitationCode(invitation) {
  if (!invitation || !invitation.id) return null;
  if (invitation.code && isValidInvitationCode(invitation.code)) {
    return invitation.code;
  }

  // Attempt to generate and claim a unique code
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidateCode = generateInvitationCode(10);
    const codeRef = ref(database, `saas_data/invitation_codes/${candidateCode}`);
    const existingSnap = await get(codeRef);
    if (!existingSnap.exists()) {
      // Claim code
      await set(codeRef, invitation.id);
      invitation.code = candidateCode;
      return candidateCode;
    }
  }

  // Fallback: use first candidate
  const fallback = generateInvitationCode(10);
  await set(ref(database, `saas_data/invitation_codes/${fallback}`), invitation.id);
  invitation.code = fallback;
  return fallback;
}

/**
 * Resolve an invitation ID from a 10-char invitation code.
 */
export async function resolveInvitationIdByCode(code) {
  if (!code) return null;
  const clean = String(code).trim().toUpperCase();
  const codeRef = ref(database, `saas_data/invitation_codes/${clean}`);
  const snap = await get(codeRef);
  return snap.exists() ? snap.val() : null;
}

