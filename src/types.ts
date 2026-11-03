export interface Item {
  id: string;
  title: string;
  price: number;
  era: string;
  category: string;
  size: string;
  image: string;
  description: string;
  storyId: string;
}

export interface Story {
  id: string;
  title: string;
  kicker: string;
  image: string;
  summary: string;
  body: string[];
}

export interface CollectionProps {
  items: Item[];
  savedIds: string[];
  onToggleSave: (id: string) => void;
}
