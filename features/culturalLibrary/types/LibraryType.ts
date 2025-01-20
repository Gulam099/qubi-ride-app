export type LibraryCardProps = {
  title: string;
  category: string;
  type: string;
  recorded: number;
  rating: number;
  image: string;
  link: string; // Route to navigate to
  onJoin: () => void; // Custom handler for "Join"
  onLike: () => void;
};
