export interface Item {
  id: string; // UUID
  name: string;
  created_at: string;
  last_lat: number | null;
  last_lng: number | null;
}

export interface Message {
  id: number;
  item_id: string; // Foreign Key to Item
  text: string;
  is_from_owner: boolean;
  created_at: string;
}
