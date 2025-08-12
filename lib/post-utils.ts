/**
 * Utility functions for post navigation and interactions
 */

export const getPostUrl = (post: { _id: string; category: string }): string => {
  switch (post.category) {
    case 'jobs':
      return `/jobs/${post._id}`;
    case 'accommodation':
      return `/accommodation/${post._id}`;
    case 'buy-sell':
    case 'marketplace':
      return `/marketplace/${post._id}`;
    case 'currency-exchange':
      return `/currency/${post._id}`;
    case 'pick-drop':
    case 'ridesharing':
      // Ridesharing doesn't have individual pages, will handle contact modal
      return '#';
    default:
      return `/posts/${post._id}`;
  }
};

export const isClickablePost = (category: string): boolean => {
  return ['jobs', 'accommodation', 'buy-sell', 'marketplace', 'currency-exchange'].includes(category);
};

export const shouldShowContactButton = (category: string): boolean => {
  return ['pick-drop', 'ridesharing'].includes(category);
};

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'pick-drop':
    case 'ridesharing':
      return 'Car';
    case 'accommodation':
      return 'Home';
    case 'jobs':
      return 'Briefcase';
    case 'buy-sell':
    case 'marketplace':
      return 'ShoppingBag';
    case 'currency-exchange':
      return 'DollarSign';
    default:
      return 'MessageCircle';
  }
};

export const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'pick-drop':
    case 'ridesharing':
      return 'bg-blue-500';
    case 'accommodation':
      return 'bg-green-500';
    case 'jobs':
      return 'bg-purple-500';
    case 'buy-sell':
    case 'marketplace':
      return 'bg-pink-500';
    case 'currency-exchange':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
};
