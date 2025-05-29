import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { toast } from "react-toastify";

export const getAttributeValues = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "attribute_values"));
    const attributeValues = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return attributeValues;
  } catch (error) {
    toast.error(error);
  }
};

export const getAttributeValuesByAttribute = async (attributeId) => {
  try {
    const q = query(
      collection(db, "attribute_values"),
      where("attributeId", "==", attributeId)
    );

    const querySnapshot = await getDocs(q);
    const attributeValues = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return attributeValues;
  } catch (error) {
    toast.error(error);
  }
};

export const storeAttributeValue = async (data) => {
  try {
    const docRef = await addDoc(collection(db, "attribute_values"), data);

    if (docRef.id) {
      toast.success("Thao tác thành công");
    }

    return;
  } catch (error) {
    toast.error(error);
  }
};

export const updateAttributeValue = async (id, data) => {
  try {
    const attributeRef = doc(db, "attribute_values", id);
    await updateDoc(attributeRef, data);
    toast.success("Thao tác thành công");
  } catch (error) {
    throw error;
  }
};

export const deleteAttributeValue = async (id) => {
  try {
    await deleteDoc(doc(db, "attribute_values", id));
    toast.success("Thao tác thành công");
  } catch (error) {
    throw error;
  }
};
