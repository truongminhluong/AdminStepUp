import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  writeBatch,
  query,
  where,
  setDoc,
} from "firebase/firestore";
import { db, storage } from "../firebase/firebaseConfig";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

export const getProductsFromFireBase = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    const products = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

export const getProductDetail = async (productId) => {
  try {
    const productRef = doc(db, "products", productId);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      console.log("Không tìm thấy sản phẩm!");
      return null;
    }

    const product = {
      id: productSnap.id,
      ...productSnap.data(),
    };

    const variantsQuerySnapshot = await getDocs(
      query(
        collection(db, "product_variants"),
        where("product_id", "==", productId)
      )
    );

    const variants = variantsQuerySnapshot.docs.map((variantDoc) => ({
      id: variantDoc.id,
      ...variantDoc.data(),
    }));

    product.variants = variants;

    return product;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    throw error;
  }
};
export const storeProductFromFireBase = async (product) => {
  try {
    const batch = writeBatch(db);

    const variants = product.variants || [];
    const productToStore = { ...product };
    
    delete productToStore.variants;
    delete productToStore.attributes;

    const productRef = await addDoc(collection(db, "products"), productToStore);
    const productId = productRef.id;

    for (const variant of variants) {
      const variantToStore = {
        product_id: productId,
        sku: variant.sku,
        price: variant.price,
        quantity: variant.quantity,
        is_active: variant.isActive || true,
        image_url: variant.imageUrl || "",
        size: variant.size || "",
        color: variant.color || "",
        colorCode: variant.colorCode || ""
      };

      await addDoc(collection(db, "product_variants"), variantToStore);
    }

    return productId;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};


export const deleteProductFromFireBase = async (id) => {
  try {
    const batch = writeBatch(db);

    const variantsQuerySnapshot = await getDocs(
      query(collection(db, "product_variants"), where("product_id", "==", id))
    );

    for (const variantDoc of variantsQuerySnapshot.docs) {
      const variantId = variantDoc.id;

      const variantAttrQuerySnapshot = await getDocs(
        query(
          collection(db, "product_variant_attributes"),
          where("product_variant_id", "==", variantId)
        )
      );

      variantAttrQuerySnapshot.docs.forEach((attrDoc) => {
        batch.delete(attrDoc.ref);
      });

      batch.delete(variantDoc.ref);
    }

    const productRef = doc(db, "products", id);
    batch.delete(productRef);

    await batch.commit();
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

export const updateProductInFireBase = async (id, product) => {
  try {
    const batch = writeBatch(db);

    const variants = product.variants || [];

    const cleanProduct = Object.entries(product).reduce((acc, [key, value]) => {
      if (value !== undefined && key !== "variants") {
        acc[key] = value;
      }
      return acc;
    }, {});

    const productRef = doc(db, "products", id);
    batch.update(productRef, cleanProduct);

    const variantsQuerySnapshot = await getDocs(
      query(collection(db, "product_variants"), where("product_id", "==", id))
    );

    const existingVariantIds = variantsQuerySnapshot.docs.map((doc) => doc.id);

    for (const variant of variants) {
      if (variant.id && existingVariantIds.includes(variant.id)) {
        const variantRef = doc(db, "product_variants", variant.id);

        const variantToUpdate = {
          sku: variant.sku,
          price: variant.price,
          quantity: variant.quantity,
          is_active: variant.is_active !== false,
          image_url: variant.imageUrl || "",
          size: variant.size || "",
          color: variant.color || "",
          colorCode: variant.colorCode || "",
        };

        batch.update(variantRef, variantToUpdate);
      } else {
        const variantToStore = {
          product_id: id,
          sku: variant.sku,
          price: variant.price,
          quantity: variant.quantity,
          is_active: variant.is_active !== false,
          image_url: variant.imageUrl || "",
          size: variant.size || "",
          color: variant.color || "",
          colorCode: variant.colorCode || "",
        };

        await addDoc(collection(db, "product_variants"), variantToStore);
      }
    }

    const variantIdsToKeep = variants
      .filter((v) => v.id)
      .map((v) => v.id);

    for (const existingVariantId of existingVariantIds) {
      if (!variantIdsToKeep.includes(existingVariantId)) {
        batch.delete(doc(db, "product_variants", existingVariantId));
      }
    }

    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const getAllAttributes = async () => {
  try {
    const attributesSnapshot = await getDocs(collection(db, "attributes"));
    const attributes = {};

    for (const attrDoc of attributesSnapshot.docs) {
      const attrId = attrDoc.id;
      const attrData = attrDoc.data();

      const valuesSnapshot = await getDocs(
        query(
          collection(db, "attribute_values"),
          where("attribute_id", "==", attrId)
        )
      );

      const values = valuesSnapshot.docs.map((valueDoc) => ({
        id: valueDoc.id,
        ...valueDoc.data(),
      }));

      attributes[attrData.type] = {
        id: attrId,
        name: attrData.name,
        values: values,
      };
    }

    return attributes;
  } catch (error) {
    console.error("Error fetching attributes:", error);
    return {};
  }
};

export const getProductsWithVariants = async () => {
  try {
    const productsSnapshot = await getDocs(collection(db, "products"));
    const products = [];

    for (const productDoc of productsSnapshot.docs) {
      const product = {
        id: productDoc.id,
        ...productDoc.data(),
      };

      const variantsSnapshot = await getDocs(
        query(
          collection(db, "product_variants"),
          where("product_id", "==", product.id)
        )
      );

      const variants = [];

      for (const variantDoc of variantsSnapshot.docs) {
        const variant = {
          id: variantDoc.id,
          ...variantDoc.data(),
        };

        const attrRelationsSnapshot = await getDocs(
          query(
            collection(db, "product_variant_attributes"),
            where("product_variant_id", "==", variant.id)
          )
        );

        for (const relDoc of attrRelationsSnapshot.docs) {
          const relation = relDoc.data();

          const attrDoc = await getDoc(
            doc(db, "attributes", relation.attribute_id)
          );
          if (attrDoc.exists()) {
            const attrType = attrDoc.data().type;

            const valueDoc = await getDoc(
              doc(db, "attribute_values", relation.attribute_value_id)
            );
            if (valueDoc.exists()) {
              const valueData = valueDoc.data();

              if (attrType === "size") {
                variant.size = valueData.value;
              } else if (attrType === "color") {
                variant.color = valueData.value;
                variant.colorCode = valueData.colorCode || "";
              }
            }
          }
        }

        variants.push(variant);
      }

      product.variants = variants;
      products.push(product);
    }

    return products;
  } catch (error) {
    console.error("Error fetching products with variants:", error);
    return [];
  }
};

export const setupInitialAttributes = async () => {
  try {
    const attributesSnapshot = await getDocs(collection(db, "attributes"));
    if (attributesSnapshot.empty) {
      await addDoc(collection(db, "attributes"), {
        name: "Size",
        type: "size",
      });

      await addDoc(collection(db, "attributes"), {
        name: "Color",
        type: "color",
      });

      console.log("Initial attributes created successfully");
    }
  } catch (error) {
    console.error("Error setting up initial attributes:", error);
  }
};
