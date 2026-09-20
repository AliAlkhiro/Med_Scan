import { getSupabaseClient } from '../../../lib/supabase';

export type AdminProductListItem = {
  genericName: string | null;
  id: string;
  isPublished: boolean;
  lastReviewedAt: string | null;
  tradeName: string;
  updatedAt: string;
};

type ProductRow = {
  generic_name: string | null;
  id: string;
  is_published: boolean;
  last_reviewed_at: string | null;
  trade_name: string;
  updated_at: string;
};

export async function listAdminProducts(): Promise<AdminProductListItem[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('products')
    .select('id, trade_name, generic_name, is_published, last_reviewed_at, updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as ProductRow[]).map((product) => ({
    genericName: product.generic_name,
    id: product.id,
    isPublished: product.is_published,
    lastReviewedAt: product.last_reviewed_at,
    tradeName: product.trade_name,
    updatedAt: product.updated_at,
  }));
}
