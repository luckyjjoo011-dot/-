export interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  image_url: string;
  created_at: string;
}

export interface Settings {
  primary_color: string;
  site_name: string;
  hero_title: string;
  [key: string]: string;
}

export interface Booking {
  id: number;
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  message: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}
