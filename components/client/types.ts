import type { PriceTable } from "@/lib/supabase/database.types";
import type { NamedPriceTable } from "@/lib/price-tables";
import type { KanbanColumn } from "@/lib/kanban";

export type PublicArtist = {
  artist_name: string;
  availability_status: string;
  availability_message: string | null;
  tos_markdown: string | null;
  contact_email: string | null;
  price_table: PriceTable | unknown;
  additionals_table?: PriceTable | unknown;
  price_tables?: NamedPriceTable[] | unknown;
  prices_description?: string | null;
  kanban_columns?: KanbanColumn[] | unknown;
  available_slots?: number | null;
  limited_threshold?: number | null;
  waitlist_capacity?: number | null;
  availability_override?: string | null;
};

export type PublicGalleryItem = {
  id: string;
  storage_path: string;
  caption: string | null;
};

export type PublicSocial = {
  id: string;
  platform: string;
  url: string;
};

export type PublicQueueItem = {
  client_name: string;
  is_current: boolean;
  progress_percentage: number;
  stage_name: string | null;
  queue_position: number | null;
  status: string;
  deadline: string | null;
};
