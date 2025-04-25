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

    const variants = [];

    for (const variantDoc of variantsQuerySnapshot.docs) {
      const variant = {
        id: variantDoc.id,
        ...variantDoc.data(),
      };

      const attrQuerySnapshot = await getDocs(
        query(
          collection(db, "product_variant_attributes"),
          where("product_variant_id", "==", variant.id)
        )
      );

      const attributes = {};
      for (const attrDoc of attrQuerySnapshot.docs) {
        const attrData = attrDoc.data();

        const attributeRef = doc(db, "attributes", attrData.attribute_id);
        const attributeSnap = await getDoc(attributeRef);

        if (attributeSnap.exists()) {
          const attributeInfo = attributeSnap.data();

          const valueRef = doc(
            db,
            "attribute_values",
            attrData.attribute_value_id
          );
          const valueSnap = await getDoc(valueRef);

          if (valueSnap.exists()) {
            const valueInfo = valueSnap.data();

            attributes[attributeInfo.type] = {
              id: attrData.attribute_value_id,
              value: valueInfo.value,
              ...valueInfo,
            };
          }
        }
      }

      variant.attributes = attributes;

      if (attributes.size) variant.size = attributes.size.value;
      if (attributes.color) {
        variant.color = attributes.color.value;
        variant.colorCode = attributes.color.colorCode || "";
      }

      variants.push(variant);
    }

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

    const productAttributes = product.attributes || {};

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
        image_url: variant.imageUrl  || "",
      };

      const variantRef = await addDoc(
        collection(db, "product_variants"),
        variantToStore
      );
      const variantId = variantRef.id;

      if (variant.size) {
        const sizeAttrQuerySnapshot = await getDocs(
          query(collection(db, "attributes"), where("type", "==", "size"))
        );

        let sizeAttrId;
        if (sizeAttrQuerySnapshot.empty) {
          const sizeAttrRef = await addDoc(collection(db, "attributes"), {
            name: "Size",
            type: "size",
          });
          sizeAttrId = sizeAttrRef.id;
        } else {
          sizeAttrId = sizeAttrQuerySnapshot.docs[0].id;
        }

        const sizeValueQuerySnapshot = await getDocs(
          query(
            collection(db, "attribute_values"),
            where("attribute_id", "==", sizeAttrId),
            where("value", "==", variant.size)
          )
        );

        let sizeValueId;
        if (sizeValueQuerySnapshot.empty) {
          const sizeValueRef = await addDoc(
            collection(db, "attribute_values"),
            {
              attribute_id: sizeAttrId,
              value: variant.size,
            }
          );
          sizeValueId = sizeValueRef.id;
        } else {
          sizeValueId = sizeValueQuerySnapshot.docs[0].id;
        }

        await addDoc(collection(db, "product_variant_attributes"), {
          product_variant_id: variantId,
          attribute_id: sizeAttrId,
          attribute_value_id: sizeValueId,
        });
      }

      if (variant.color) {
        const colorAttrQuerySnapshot = await getDocs(
          query(collection(db, "attributes"), where("type", "==", "color"))
        );

        let colorAttrId;
        if (colorAttrQuerySnapshot.empty) {
          const colorAttrRef = await addDoc(collection(db, "attributes"), {
            name: "Color",
            type: "color",
          });
          colorAttrId = colorAttrRef.id;
        } else {
          colorAttrId = colorAttrQuerySnapshot.docs[0].id;
        }

        const colorValueQuerySnapshot = await getDocs(
          query(
            collection(db, "attribute_values"),
            where("attribute_id", "==", colorAttrId),
            where("value", "==", variant.color)
          )
        );

        let colorValueId;
        if (colorValueQuerySnapshot.empty) {
          const colorValueRef = await addDoc(
            collection(db, "attribute_values"),
            {
              attribute_id: colorAttrId,
              value: variant.color,
              colorCode: variant.colorCode || "",
            }
          );
          colorValueId = colorValueRef.id;
        } else {
          colorValueId = colorValueQuerySnapshot.docs[0].id;

          if (variant.colorCode) {
            await updateDoc(doc(db, "attribute_values", colorValueId), {
              colorCode: variant.colorCode,
            });
          }
        }

        await addDoc(collection(db, "product_variant_attributes"), {
          product_variant_id: variantId,
          attribute_id: colorAttrId,
          attribute_value_id: colorValueId,
        });
      }
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
      if (value !== undefined && key !== "variants" && key !== "attributes") {
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
          is_active: variant.isActive || true,
          image_url: variant.imageUrl 
        };

        batch.update(variantRef, variantToUpdate);

        if (variant.size || variant.color) {
          const variantAttrQuerySnapshot = await getDocs(
            query(
              collection(db, "product_variant_attributes"),
              where("product_variant_id", "==", variant.id)
            )
          );

          const existingAttrs = {};
          for (const attrDoc of variantAttrQuerySnapshot.docs) {
            const attrData = attrDoc.data();

            const attributeRef = doc(db, "attributes", attrData.attribute_id);
            const attributeSnap = await getDoc(attributeRef);

            if (attributeSnap.exists()) {
              const attrType = attributeSnap.data().type;
              existingAttrs[attrType] = {
                relationshipId: attrDoc.id,
                ...attrData,
              };
            }
          }

          if (variant.size && existingAttrs.size) {
            const sizeValueQuerySnapshot = await getDocs(
              query(
                collection(db, "attribute_values"),
                where("attribute_id", "==", existingAttrs.size.attribute_id),
                where("value", "==", variant.size)
              )
            );

            let sizeValueId;
            if (sizeValueQuerySnapshot.empty) {
              const sizeValueRef = await addDoc(
                collection(db, "attribute_values"),
                {
                  attribute_id: existingAttrs.size.attribute_id,
                  value: variant.size,
                }
              );
              sizeValueId = sizeValueRef.id;
            } else {
              sizeValueId = sizeValueQuerySnapshot.docs[0].id;
            }

            if (sizeValueId !== existingAttrs.size.attribute_value_id) {
              batch.update(
                doc(
                  db,
                  "product_variant_attributes",
                  existingAttrs.size.relationshipId
                ),
                {
                  attribute_value_id: sizeValueId,
                }
              );
            }
          } else if (variant.size) {
            const sizeAttrQuerySnapshot = await getDocs(
              query(collection(db, "attributes"), where("type", "==", "size"))
            );

            let sizeAttrId;
            if (sizeAttrQuerySnapshot.empty) {
              const sizeAttrRef = await addDoc(collection(db, "attributes"), {
                name: "Size",
                type: "size",
              });
              sizeAttrId = sizeAttrRef.id;
            } else {
              sizeAttrId = sizeAttrQuerySnapshot.docs[0].id;
            }

            const sizeValueQuerySnapshot = await getDocs(
              query(
                collection(db, "attribute_values"),
                where("attribute_id", "==", sizeAttrId),
                where("value", "==", variant.size)
              )
            );

            let sizeValueId;
            if (sizeValueQuerySnapshot.empty) {
              const sizeValueRef = await addDoc(
                collection(db, "attribute_values"),
                {
                  attribute_id: sizeAttrId,
                  value: variant.size,
                }
              );
              sizeValueId = sizeValueRef.id;
            } else {
              sizeValueId = sizeValueQuerySnapshot.docs[0].id;
            }

            await addDoc(collection(db, "product_variant_attributes"), {
              product_variant_id: variant.id,
              attribute_id: sizeAttrId,
              attribute_value_id: sizeValueId,
            });
          }

          if (variant.color && existingAttrs.color) {
            const colorValueQuerySnapshot = await getDocs(
              query(
                collection(db, "attribute_values"),
                where("attribute_id", "==", existingAttrs.color.attribute_id),
                where("value", "==", variant.color)
              )
            );

            let colorValueId;
            if (colorValueQuerySnapshot.empty) {
              const colorValueRef = await addDoc(
                collection(db, "attribute_values"),
                {
                  attribute_id: existingAttrs.color.attribute_id,
                  value: variant.color,
                  colorCode: variant.colorCode || "",
                }
              );
              colorValueId = colorValueRef.id;
            } else {
              colorValueId = colorValueQuerySnapshot.docs[0].id;

              if (variant.colorCode) {
                await updateDoc(doc(db, "attribute_values", colorValueId), {
                  colorCode: variant.colorCode,
                });
              }
            }

            if (colorValueId !== existingAttrs.color.attribute_value_id) {
              batch.update(
                doc(
                  db,
                  "product_variant_attributes",
                  existingAttrs.color.relationshipId
                ),
                {
                  attribute_value_id: colorValueId,
                }
              );
            }
          } else if (variant.color) {
            const colorAttrQuerySnapshot = await getDocs(
              query(collection(db, "attributes"), where("type", "==", "color"))
            );

            let colorAttrId;
            if (colorAttrQuerySnapshot.empty) {
              const colorAttrRef = await addDoc(collection(db, "attributes"), {
                name: "Color",
                type: "color",
              });
              colorAttrId = colorAttrRef.id;
            } else {
              colorAttrId = colorAttrQuerySnapshot.docs[0].id;
            }

            const colorValueQuerySnapshot = await getDocs(
              query(
                collection(db, "attribute_values"),
                where("attribute_id", "==", colorAttrId),
                where("value", "==", variant.color)
              )
            );

            let colorValueId;
            if (colorValueQuerySnapshot.empty) {
              const colorValueRef = await addDoc(
                collection(db, "attribute_values"),
                {
                  attribute_id: colorAttrId,
                  value: variant.color,
                  colorCode: variant.colorCode || "",
                }
              );
              colorValueId = colorValueRef.id;
            } else {
              colorValueId = colorValueQuerySnapshot.docs[0].id;
            }

            await addDoc(collection(db, "product_variant_attributes"), {
              product_variant_id: variant.id,
              attribute_id: colorAttrId,
              attribute_value_id: colorValueId,
            });
          }
        }
      } else if (!variant.id || (variant.id && variant.id.includes("-"))) {
        const variantToStore = {
          product_id: id,
          sku: variant.sku,
          price: variant.price,
          quantity: variant.quantity,
          is_active: variant.isActive || true,
        };

        const variantRef = await addDoc(
          collection(db, "product_variants"),
          variantToStore
        );
        const variantId = variantRef.id;

        if (variant.size) {
          const sizeAttrQuerySnapshot = await getDocs(
            query(collection(db, "attributes"), where("type", "==", "size"))
          );

          let sizeAttrId;
          if (sizeAttrQuerySnapshot.empty) {
            const sizeAttrRef = await addDoc(collection(db, "attributes"), {
              name: "Size",
              type: "size",
            });
            sizeAttrId = sizeAttrRef.id;
          } else {
            sizeAttrId = sizeAttrQuerySnapshot.docs[0].id;
          }

          const sizeValueQuerySnapshot = await getDocs(
            query(
              collection(db, "attribute_values"),
              where("attribute_id", "==", sizeAttrId),
              where("value", "==", variant.size)
            )
          );

          let sizeValueId;
          if (sizeValueQuerySnapshot.empty) {
            const sizeValueRef = await addDoc(
              collection(db, "attribute_values"),
              {
                attribute_id: sizeAttrId,
                value: variant.size,
              }
            );
            sizeValueId = sizeValueRef.id;
          } else {
            sizeValueId = sizeValueQuerySnapshot.docs[0].id;
          }

          await addDoc(collection(db, "product_variant_attributes"), {
            product_variant_id: variantId,
            attribute_id: sizeAttrId,
            attribute_value_id: sizeValueId,
          });
        }

        if (variant.color) {
          const colorAttrQuerySnapshot = await getDocs(
            query(collection(db, "attributes"), where("type", "==", "color"))
          );

          let colorAttrId;
          if (colorAttrQuerySnapshot.empty) {
            const colorAttrRef = await addDoc(collection(db, "attributes"), {
              name: "Color",
              type: "color",
            });
            colorAttrId = colorAttrRef.id;
          } else {
            colorAttrId = colorAttrQuerySnapshot.docs[0].id;
          }

          const colorValueQuerySnapshot = await getDocs(
            query(
              collection(db, "attribute_values"),
              where("attribute_id", "==", colorAttrId),
              where("value", "==", variant.color)
            )
          );

          let colorValueId;
          if (colorValueQuerySnapshot.empty) {
            const colorValueRef = await addDoc(
              collection(db, "attribute_values"),
              {
                attribute_id: colorAttrId,
                value: variant.color,
                colorCode: variant.colorCode || "",
              }
            );
            colorValueId = colorValueRef.id;
          } else {
            colorValueId = colorValueQuerySnapshot.docs[0].id;
          }

          await addDoc(collection(db, "product_variant_attributes"), {
            product_variant_id: variantId,
            attribute_id: colorAttrId,
            attribute_value_id: colorValueId,
          });
        }
      }
    }

    const variantIdsToKeep = variants
      .filter((v) => v.id && !v.id.includes("-"))
      .map((v) => v.id);

    for (const existingVariantId of existingVariantIds) {
      if (!variantIdsToKeep.includes(existingVariantId)) {
        const variantAttrQuerySnapshot = await getDocs(
          query(
            collection(db, "product_variant_attributes"),
            where("product_variant_id", "==", existingVariantId)
          )
        );

        variantAttrQuerySnapshot.docs.forEach((attrDoc) => {
          batch.delete(attrDoc.ref);
        });

        batch.delete(doc(db, "product_variants", existingVariantId));
      }
    }

    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error updating document: ", error);
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
