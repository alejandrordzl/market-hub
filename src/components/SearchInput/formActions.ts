'use server';
import { getProductByBarcode } from "@/clients";
import { Product } from "@/utils/types";

interface productSearchFormData {
  product?: Product;
  status: "do_nothing" | "found" | "not_found" | "use_callback";
  callbackActions?: "start_sale"
}

export async function searchProduct(
  previousState: productSearchFormData | undefined,
  formData: FormData
): Promise<productSearchFormData> {
  try {
    const barCode = formData.get("barCode") as string;
    if (barCode === "" || !barCode) {
      return { status: "use_callback", callbackActions: "start_sale" };
    }
    const product = await getProductByBarcode(barCode);
    if (product) {
      return { product, status: "found" };
    } else {
      return { status: "not_found" };
    }
  } catch (error) {
    console.error("Error searching product:", error);
    return { status: "not_found" };
  }
}