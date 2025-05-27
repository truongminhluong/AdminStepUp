import {db} from "../firebase/firebaseConfig";
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    Timestamp
} from "firebase/firestore";

const COLLECTION_NAME = "giftCards";

export const subscribeToGiftCards = (callback) => {
    const unsubscribe = onSnapshot(collection(db, COLLECTION_NAME), (snapshot) => {
        const cards = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                expiry: data.expiry ? data.expiry.toDate() : null
            };
        });
        callback(cards);
    });

    return unsubscribe;
}

export const addGiftCard = async (cardData) => {
    try {
        const formattedData = {
            ...cardData,
            value: cardData.value,
            expiry: cardData.expiry ? Timestamp.fromDate(new Date(cardData.expiry)) : null,
            status: "active",
            createdAt: Timestamp.now()
        };

        const docRef = await addDoc(collection(db, COLLECTION_NAME), formattedData);
        return docRef.id;
    } catch (error) {
        console.error("Error adding gift card:", error);
        throw error;
    }
}

export const updateGiftCard = async (id, cardData) => {
    try {
        const formattedData = {
            ...cardData,
            value: cardData.value,
            expiry: cardData.expiry ? Timestamp.fromDate(new Date(cardData.expiry)) : null,
            updatedAt: Timestamp.now()
        };

        await updateDoc(doc(db, COLLECTION_NAME, id), formattedData);
    } catch (error) {
        console.error("Error updating gift card:", error);
        throw error;
    }
}

export const updateCardStatus = async (id, status) => {
    try {
        await updateDoc(doc(db, COLLECTION_NAME, id), {
            status,
            updatedAt: Timestamp.now()
        });
    } catch (error) {
        console.error("Error updating card status:", error);
        throw error;
    }
}

export const deleteGiftCard = async (id) => {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
        console.error("Error deleting gift card:", error);
        throw error;
    }
}

