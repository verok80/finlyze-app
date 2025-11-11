import { doc, updateDoc, deleteDoc} from "firebase/firestore";
import { db } from "../firebase";

export async function updateTransaction(userId, transactionId, updatedData) {
  console.log("Updating transaction:", { userId, transactionId, updatedData });
  if (!userId) throw new Error("userId is required");

  const docRef = doc(db, `users/${userId}/transactions`, transactionId);
  try {
    await updateDoc(docRef, updatedData);
    console.log("Update successful!");
  } catch (error) {
    console.error("Firestore update failed:", error);
    throw error;
  }
}

export async function deleteTransaction(userId, transactionId) {
  if (!userId || !transactionId) throw new Error("Missing userId or transactionId");

  try {
    const docRef = doc(db, `users/${userId}/transactions`, transactionId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting transaction:", error);
    throw error;
  }
}

