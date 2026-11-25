import type {
  Product, Category, Order, Customer, Review, InventoryItem,
  StockMovement, StoreSettings, DashboardStats, SalesDataPoint,
  OrderStatusData, Notification, AdminProfile,
} from '@/types';

import { avatarPresets, logoPresets } from './profilePresets';

// ==================== ADMIN ====================
export const adminProfile: AdminProfile = {
  name: 'Admin',
  email: 'admin@animestore.com',
  role: 'Administrator',
  avatar: avatarPresets[0].svgDataUri,
  phone: '+1 (555) 123-9876',
  bio: 'Lead Administrator & Anime Merchandise Curator',
};

// ==================== CATEGORIES ====================
export const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Figures & Statues', slug: 'figures-statues', description: 'High-quality anime figures and collectible statues from popular series.', image: '', productCount: 5, status: 'active', createdAt: '2024-01-15' },
  { id: 'cat-2', name: 'Manga & Light Novels', slug: 'manga-light-novels', description: 'Latest manga volumes and light novel releases from Japan.', image: '', productCount: 3, status: 'active', createdAt: '2024-01-15' },
  { id: 'cat-3', name: 'Posters & Wall Art', slug: 'posters-wall-art', description: 'Premium anime posters, wall scrolls, and canvas prints.', image: '', productCount: 2, status: 'active', createdAt: '2024-02-01' },
  { id: 'cat-4', name: 'Accessories', slug: 'accessories', description: 'Anime keychains, pins, bags, and phone cases.', image: '', productCount: 2, status: 'active', createdAt: '2024-02-01' },
  { id: 'cat-5', name: 'Clothing & Apparel', slug: 'clothing-apparel', description: 'Anime-themed hoodies, t-shirts, and fashion items.', image: '', productCount: 2, status: 'active', createdAt: '2024-02-15' },
  { id: 'cat-6', name: 'Collectibles', slug: 'collectibles', description: 'Rare and limited-edition anime collectibles and memorabilia.', image: '', productCount: 1, status: 'active', createdAt: '2024-03-01' },
  { id: 'cat-7', name: 'Stationery', slug: 'stationery', description: 'Anime notebooks, pens, stickers, and school supplies.', image: '', productCount: 1, status: 'active', createdAt: '2024-03-01' },
  { id: 'cat-8', name: 'Home & Living', slug: 'home-living', description: 'Anime mugs, blankets, pillows, and home decor.', image: '', productCount: 1, status: 'inactive', createdAt: '2024-03-15' },
];

// ==================== PRODUCTS ====================
export const initialProducts: Product[] = [
  { id: 'prod-1', name: 'Goku Super Saiyan Figure', description: 'Premium Dragon Ball Z Goku Super Saiyan transformation figure. Highly detailed with dynamic pose and energy effects base.', price: 49.99, compareAtPrice: 69.99, category: 'Figures & Statues', categoryId: 'cat-1', sku: 'FIG-001', stock: 45, status: 'active', images: ['/images/products/prod_warrior_figure_1795162308415.jpg'], rating: 4.8, reviewCount: 124, unitsSold: 458, tags: ['dragon ball', 'goku', 'figure'], createdAt: '2024-03-15', updatedAt: '2024-11-01' },
  { id: 'prod-2', name: 'Nezuko Kamado Figure', description: 'Demon Slayer Nezuko Kamado collectible figure with bamboo muzzle and pink kimono details.', price: 39.99, category: 'Figures & Statues', categoryId: 'cat-1', sku: 'FIG-002', stock: 32, status: 'active', images: ['/images/products/prod_kimono_figure_1795162305963.jpg'], rating: 4.9, reviewCount: 98, unitsSold: 392, tags: ['demon slayer', 'nezuko', 'figure'], createdAt: '2024-04-01', updatedAt: '2024-10-28' },
  { id: 'prod-3', name: 'Naruto Uzumaki Figure', description: 'Naruto Shippuden Naruto Uzumaki sage mode figure with detailed painting and accessories.', price: 44.99, compareAtPrice: 59.99, category: 'Figures & Statues', categoryId: 'cat-1', sku: 'FIG-003', stock: 28, status: 'active', images: ['/images/products/prod_ninja_figure_1795162308489.jpg'], rating: 4.7, reviewCount: 86, unitsSold: 370, tags: ['naruto', 'figure', 'sage mode'], createdAt: '2024-04-15', updatedAt: '2024-10-25' },
  { id: 'prod-4', name: 'Luffy Gear 5 Figure', description: 'One Piece Monkey D. Luffy Gear 5 Nika transformation figure with cloud effects.', price: 54.99, category: 'Figures & Statues', categoryId: 'cat-1', sku: 'FIG-004', stock: 15, status: 'active', images: ['/images/products/prod_captain_figure_1795162307219.jpg'], rating: 4.9, reviewCount: 112, unitsSold: 341, tags: ['one piece', 'luffy', 'gear 5'], createdAt: '2024-05-01', updatedAt: '2024-11-05' },
  { id: 'prod-5', name: 'Eren Yeager Figure', description: 'Attack on Titan Eren Yeager with 3D Maneuver Gear. Detailed sculpt and dynamic action pose.', price: 42.99, category: 'Figures & Statues', categoryId: 'cat-1', sku: 'FIG-005', stock: 8, status: 'active', images: ['/images/products/prod_figure_swordsman_1795178548045.jpg'], rating: 4.6, reviewCount: 67, unitsSold: 285, tags: ['attack on titan', 'eren', 'figure'], createdAt: '2024-05-15', updatedAt: '2024-10-20' },
  { id: 'prod-6', name: 'One Piece Box Set Vol 1-23', description: 'Complete One Piece manga box set volumes 1 through 23 with exclusive poster and mini comic.', price: 149.99, compareAtPrice: 189.99, category: 'Manga & Light Novels', categoryId: 'cat-2', sku: 'MNG-001', stock: 20, status: 'active', images: ['/images/products/prod_manga_collection_1795162321332.jpg'], rating: 4.9, reviewCount: 156, unitsSold: 234, tags: ['one piece', 'manga', 'box set'], createdAt: '2024-03-01', updatedAt: '2024-11-01' },
  { id: 'prod-7', name: 'Jujutsu Kaisen Vol 25', description: 'Jujutsu Kaisen manga volume 25. Latest release with exclusive cover art variant.', price: 9.99, category: 'Manga & Light Novels', categoryId: 'cat-2', sku: 'MNG-002', stock: 65, status: 'active', images: ['/images/products/prod_manga_collection_1795162321332.jpg'], rating: 4.8, reviewCount: 45, unitsSold: 189, tags: ['jujutsu kaisen', 'manga'], createdAt: '2024-06-01', updatedAt: '2024-10-15' },
  { id: 'prod-8', name: 'Demon Slayer Art Book', description: 'Official Demon Slayer Kimetsu no Yaiba art book with illustrations, sketches, and interviews.', price: 34.99, category: 'Manga & Light Novels', categoryId: 'cat-2', sku: 'MNG-003', stock: 40, status: 'active', images: ['/images/products/prod_manga_collection_1795162321332.jpg'], rating: 4.7, reviewCount: 38, unitsSold: 156, tags: ['demon slayer', 'art book'], createdAt: '2024-06-15', updatedAt: '2024-10-10' },
  { id: 'prod-9', name: 'My Hero Academia Poster Set', description: 'Set of 5 premium My Hero Academia posters featuring Class 1-A heroes. High-quality print on thick cardstock.', price: 24.99, category: 'Posters & Wall Art', categoryId: 'cat-3', sku: 'PST-001', stock: 55, status: 'active', images: ['/images/products/prod_wall_scroll_1795162312280.jpg'], rating: 4.5, reviewCount: 32, unitsSold: 198, tags: ['my hero academia', 'poster'], createdAt: '2024-04-01', updatedAt: '2024-10-01' },
  { id: 'prod-10', name: 'Dragon Ball Wall Scroll', description: 'Premium Dragon Ball Z fabric wall scroll with Goku, Vegeta, and the Z-Fighters. High-quality print.', price: 19.99, category: 'Posters & Wall Art', categoryId: 'cat-3', sku: 'PST-002', stock: 0, status: 'active', images: ['/images/products/prod_wall_scroll_1795162312280.jpg'], rating: 4.4, reviewCount: 28, unitsSold: 145, tags: ['dragon ball', 'wall scroll'], createdAt: '2024-04-15', updatedAt: '2024-09-15' },
  { id: 'prod-11', name: 'Naruto Headband', description: 'Authentic Konoha Village metal plate headband with adjustable black fabric band.', price: 14.99, category: 'Accessories', categoryId: 'cat-4', sku: 'ACC-001', stock: 80, status: 'active', images: ['/images/products/prod_accessories_pack_1795162343404.jpg'], rating: 4.6, reviewCount: 89, unitsSold: 312, tags: ['naruto', 'headband', 'cosplay'], createdAt: '2024-03-01', updatedAt: '2024-11-01' },
  { id: 'prod-12', name: 'Anime Keychain Collection', description: 'Set of 6 premium metal anime keychains featuring popular characters from Dragon Ball, Naruto, and One Piece.', price: 12.99, category: 'Accessories', categoryId: 'cat-4', sku: 'ACC-002', stock: 95, status: 'active', images: ['/images/products/prod_keychain_charm_1795178526696.jpg'], rating: 4.3, reviewCount: 56, unitsSold: 267, tags: ['keychain', 'accessories'], createdAt: '2024-05-01', updatedAt: '2024-10-15' },
  { id: 'prod-13', name: 'Anime Cat Hoodie', description: 'Cozy black hoodie with cute anime cat design. Premium cotton blend, available in all sizes.', price: 39.99, compareAtPrice: 49.99, category: 'Clothing & Apparel', categoryId: 'cat-5', sku: 'CLT-001', stock: 35, status: 'active', images: ['/images/products/prod_hoodie_streetwear_1795178529403.jpg'], rating: 4.7, reviewCount: 73, unitsSold: 198, tags: ['hoodie', 'clothing', 'cat'], createdAt: '2024-04-01', updatedAt: '2024-10-28' },
  { id: 'prod-14', name: 'Attack on Titan T-Shirt', description: 'Survey Corps logo premium t-shirt. 100% cotton with high-quality screen print.', price: 24.99, category: 'Clothing & Apparel', categoryId: 'cat-5', sku: 'CLT-002', stock: 50, status: 'active', images: ['/images/products/prod_cloud_haori_1795162308256.jpg'], rating: 4.5, reviewCount: 41, unitsSold: 176, tags: ['attack on titan', 't-shirt', 'clothing'], createdAt: '2024-05-15', updatedAt: '2024-10-20' },
  { id: 'prod-15', name: 'Limited Edition Pokémon Card Set', description: 'Sealed limited edition holographic Pokémon card collection featuring rare characters.', price: 89.99, compareAtPrice: 119.99, category: 'Collectibles', categoryId: 'cat-6', sku: 'COL-001', stock: 5, status: 'active', images: ['/images/products/prod_enamel_pins_1795178526698.jpg'], rating: 4.9, reviewCount: 23, unitsSold: 89, tags: ['pokemon', 'cards', 'limited edition'], createdAt: '2024-06-01', updatedAt: '2024-11-01' },
  { id: 'prod-16', name: 'Jujutsu Kaisen Notebook Set', description: 'Set of 3 premium A5 notebooks with Jujutsu Kaisen character designs. Lined pages, 120 sheets each.', price: 16.99, category: 'Stationery', categoryId: 'cat-7', sku: 'STN-001', stock: 60, status: 'active', images: ['/images/products/prod_plush_cat_1795178554650.jpg'], rating: 4.4, reviewCount: 34, unitsSold: 145, tags: ['jujutsu kaisen', 'notebook', 'stationery'], createdAt: '2024-05-01', updatedAt: '2024-10-15' },
  { id: 'prod-17', name: 'Sailor Moon Ceramic Mug', description: 'Beautiful Sailor Moon transformation brooch design ceramic mug. Microwave and dishwasher safe.', price: 18.99, category: 'Home & Living', categoryId: 'cat-8', sku: 'HOM-001', stock: 42, status: 'active', images: ['/images/products/prod_collectible_lamp_1795178524570.jpg'], rating: 4.6, reviewCount: 29, unitsSold: 134, tags: ['sailor moon', 'mug', 'home'], createdAt: '2024-06-15', updatedAt: '2024-10-10' },
  { id: 'prod-18', name: 'Vegeta Prince Figure', description: 'Dragon Ball Z Vegeta Final Flash pose premium figure with energy beam effect piece.', price: 47.99, category: 'Figures & Statues', categoryId: 'cat-1', sku: 'FIG-006', stock: 0, status: 'draft', images: ['/images/products/prod_warrior_figure_1795162308415.jpg'], rating: 0, reviewCount: 0, unitsSold: 0, tags: ['dragon ball', 'vegeta', 'figure'], createdAt: '2024-10-01', updatedAt: '2024-10-01' },
];

// ==================== CUSTOMERS ====================
export const initialCustomers: Customer[] = [
  { id: 'cust-1', name: 'John Doe', email: 'john.doe@email.com', phone: '+1 (555) 123-4567', avatar: '', address: '123 Maple Street', city: 'New York', country: 'USA', totalOrders: 12, totalSpent: 589.88, joinedAt: '2024-01-20', lastOrderAt: '2024-11-10', status: 'active' },
  { id: 'cust-2', name: 'Alice Smith', email: 'alice.smith@email.com', phone: '+1 (555) 234-5678', avatar: '', address: '456 Oak Avenue', city: 'Los Angeles', country: 'USA', totalOrders: 8, totalSpent: 342.50, joinedAt: '2024-02-15', lastOrderAt: '2024-11-09', status: 'active' },
  { id: 'cust-3', name: 'David Kim', email: 'david.kim@email.com', phone: '+1 (555) 345-6789', avatar: '', address: '789 Pine Road', city: 'Chicago', country: 'USA', totalOrders: 5, totalSpent: 219.95, joinedAt: '2024-03-10', lastOrderAt: '2024-11-08', status: 'active' },
  { id: 'cust-4', name: 'Sarah Chen', email: 'sarah.chen@email.com', phone: '+1 (555) 456-7890', avatar: '', address: '321 Cedar Lane', city: 'San Francisco', country: 'USA', totalOrders: 15, totalSpent: 892.45, joinedAt: '2024-01-05', lastOrderAt: '2024-11-07', status: 'active' },
  { id: 'cust-5', name: 'Mike Wilson', email: 'mike.wilson@email.com', phone: '+1 (555) 567-8901', avatar: '', address: '654 Birch Drive', city: 'Seattle', country: 'USA', totalOrders: 3, totalSpent: 142.00, joinedAt: '2024-04-20', lastOrderAt: '2024-11-06', status: 'active' },
  { id: 'cust-6', name: 'Emma Johnson', email: 'emma.j@email.com', phone: '+1 (555) 678-9012', avatar: '', address: '987 Elm Court', city: 'Boston', country: 'USA', totalOrders: 7, totalSpent: 456.93, joinedAt: '2024-02-28', lastOrderAt: '2024-10-30', status: 'active' },
  { id: 'cust-7', name: 'Takeshi Yamada', email: 'takeshi.y@email.com', phone: '+81 90-1234-5678', avatar: '', address: '12-3 Shibuya', city: 'Tokyo', country: 'Japan', totalOrders: 20, totalSpent: 1245.80, joinedAt: '2024-01-10', lastOrderAt: '2024-11-05', status: 'active' },
  { id: 'cust-8', name: 'Lisa Park', email: 'lisa.park@email.com', phone: '+1 (555) 789-0123', avatar: '', address: '741 Willow Way', city: 'Miami', country: 'USA', totalOrders: 2, totalSpent: 89.98, joinedAt: '2024-06-15', lastOrderAt: '2024-09-20', status: 'inactive' },
  { id: 'cust-9', name: 'Carlos Rivera', email: 'carlos.r@email.com', phone: '+1 (555) 890-1234', avatar: '', address: '852 Spruce Street', city: 'Austin', country: 'USA', totalOrders: 6, totalSpent: 378.94, joinedAt: '2024-03-05', lastOrderAt: '2024-11-02', status: 'active' },
  { id: 'cust-10', name: 'Yuki Tanaka', email: 'yuki.t@email.com', phone: '+81 80-9876-5432', avatar: '', address: '45-6 Akihabara', city: 'Tokyo', country: 'Japan', totalOrders: 11, totalSpent: 756.89, joinedAt: '2024-02-01', lastOrderAt: '2024-11-04', status: 'active' },
];

// ==================== ORDERS ====================
export const initialOrders: Order[] = [
  { id: 'ord-1', orderNumber: '#ORD-1001', customer: { id: 'cust-1', name: 'John Doe', email: 'john.doe@email.com', avatar: '' }, items: [{ productId: 'prod-1', productName: 'Goku Super Saiyan Figure', productImage: '', quantity: 1, price: 49.99, total: 49.99 }], subtotal: 49.99, shipping: 0, tax: 4.50, totalAmount: 54.49, status: 'completed', paymentStatus: 'paid', shippingAddress: '123 Maple Street, New York, USA', notes: '', createdAt: '2024-11-10', updatedAt: '2024-11-10' },
  { id: 'ord-2', orderNumber: '#ORD-1000', customer: { id: 'cust-2', name: 'Alice Smith', email: 'alice.smith@email.com', avatar: '' }, items: [{ productId: 'prod-2', productName: 'Nezuko Kamado Figure', productImage: '', quantity: 1, price: 39.99, total: 39.99 }], subtotal: 39.99, shipping: 5.99, tax: 3.60, totalAmount: 49.58, status: 'processing', paymentStatus: 'paid', shippingAddress: '456 Oak Avenue, Los Angeles, USA', notes: 'Gift wrapping requested', createdAt: '2024-11-09', updatedAt: '2024-11-09' },
  { id: 'ord-3', orderNumber: '#ORD-0999', customer: { id: 'cust-3', name: 'David Kim', email: 'david.kim@email.com', avatar: '' }, items: [{ productId: 'prod-7', productName: 'Jujutsu Kaisen Vol 25', productImage: '', quantity: 2, price: 9.99, total: 19.98 }, { productId: 'prod-11', productName: 'Naruto Headband', productImage: '', quantity: 1, price: 14.99, total: 14.99 }], subtotal: 34.97, shipping: 5.99, tax: 3.15, totalAmount: 44.11, status: 'pending', paymentStatus: 'pending', shippingAddress: '789 Pine Road, Chicago, USA', notes: '', createdAt: '2024-11-08', updatedAt: '2024-11-08' },
  { id: 'ord-4', orderNumber: '#ORD-0998', customer: { id: 'cust-4', name: 'Sarah Chen', email: 'sarah.chen@email.com', avatar: '' }, items: [{ productId: 'prod-4', productName: 'Luffy Gear 5 Figure', productImage: '', quantity: 1, price: 54.99, total: 54.99 }], subtotal: 54.99, shipping: 0, tax: 4.95, totalAmount: 59.94, status: 'completed', paymentStatus: 'paid', shippingAddress: '321 Cedar Lane, San Francisco, USA', notes: '', createdAt: '2024-11-07', updatedAt: '2024-11-08' },
  { id: 'ord-5', orderNumber: '#ORD-0997', customer: { id: 'cust-5', name: 'Mike Wilson', email: 'mike.wilson@email.com', avatar: '' }, items: [{ productId: 'prod-13', productName: 'Anime Cat Hoodie', productImage: '', quantity: 1, price: 39.99, total: 39.99 }], subtotal: 39.99, shipping: 5.99, tax: 3.60, totalAmount: 49.58, status: 'cancelled', paymentStatus: 'refunded', shippingAddress: '654 Birch Drive, Seattle, USA', notes: 'Customer requested cancellation', createdAt: '2024-11-06', updatedAt: '2024-11-06' },
  { id: 'ord-6', orderNumber: '#ORD-0996', customer: { id: 'cust-6', name: 'Emma Johnson', email: 'emma.j@email.com', avatar: '' }, items: [{ productId: 'prod-6', productName: 'One Piece Box Set Vol 1-23', productImage: '', quantity: 1, price: 149.99, total: 149.99 }], subtotal: 149.99, shipping: 0, tax: 13.50, totalAmount: 163.49, status: 'completed', paymentStatus: 'paid', shippingAddress: '987 Elm Court, Boston, USA', notes: '', createdAt: '2024-11-05', updatedAt: '2024-11-06' },
  { id: 'ord-7', orderNumber: '#ORD-0995', customer: { id: 'cust-7', name: 'Takeshi Yamada', email: 'takeshi.y@email.com', avatar: '' }, items: [{ productId: 'prod-3', productName: 'Naruto Uzumaki Figure', productImage: '', quantity: 1, price: 44.99, total: 44.99 }, { productId: 'prod-11', productName: 'Naruto Headband', productImage: '', quantity: 2, price: 14.99, total: 29.98 }], subtotal: 74.97, shipping: 12.99, tax: 6.75, totalAmount: 94.71, status: 'processing', paymentStatus: 'paid', shippingAddress: '12-3 Shibuya, Tokyo, Japan', notes: 'International shipping', createdAt: '2024-11-04', updatedAt: '2024-11-04' },
  { id: 'ord-8', orderNumber: '#ORD-0994', customer: { id: 'cust-9', name: 'Carlos Rivera', email: 'carlos.r@email.com', avatar: '' }, items: [{ productId: 'prod-9', productName: 'My Hero Academia Poster Set', productImage: '', quantity: 1, price: 24.99, total: 24.99 }, { productId: 'prod-12', productName: 'Anime Keychain Collection', productImage: '', quantity: 1, price: 12.99, total: 12.99 }], subtotal: 37.98, shipping: 5.99, tax: 3.42, totalAmount: 47.39, status: 'completed', paymentStatus: 'paid', shippingAddress: '852 Spruce Street, Austin, USA', notes: '', createdAt: '2024-11-02', updatedAt: '2024-11-03' },
  { id: 'ord-9', orderNumber: '#ORD-0993', customer: { id: 'cust-10', name: 'Yuki Tanaka', email: 'yuki.t@email.com', avatar: '' }, items: [{ productId: 'prod-15', productName: 'Limited Edition Pokémon Card Set', productImage: '', quantity: 1, price: 89.99, total: 89.99 }], subtotal: 89.99, shipping: 12.99, tax: 8.10, totalAmount: 111.08, status: 'pending', paymentStatus: 'pending', shippingAddress: '45-6 Akihabara, Tokyo, Japan', notes: 'Handle with care', createdAt: '2024-11-01', updatedAt: '2024-11-01' },
  { id: 'ord-10', orderNumber: '#ORD-0992', customer: { id: 'cust-1', name: 'John Doe', email: 'john.doe@email.com', avatar: '' }, items: [{ productId: 'prod-14', productName: 'Attack on Titan T-Shirt', productImage: '', quantity: 2, price: 24.99, total: 49.98 }, { productId: 'prod-17', productName: 'Sailor Moon Ceramic Mug', productImage: '', quantity: 1, price: 18.99, total: 18.99 }], subtotal: 68.97, shipping: 0, tax: 6.21, totalAmount: 75.18, status: 'completed', paymentStatus: 'paid', shippingAddress: '123 Maple Street, New York, USA', notes: '', createdAt: '2024-10-28', updatedAt: '2024-10-30' },
];

// ==================== REVIEWS ====================
export const initialReviews: Review[] = [
  { id: 'rev-1', productId: 'prod-1', productName: 'Goku Super Saiyan Figure', productImage: '', customerId: 'cust-1', customerName: 'John Doe', customerAvatar: '', rating: 5, title: 'Amazing quality!', comment: 'The detail on this figure is incredible. The paint job is flawless and it looks perfect on my shelf.', status: 'approved', helpful: 24, createdAt: '2024-11-08' },
  { id: 'rev-2', productId: 'prod-2', productName: 'Nezuko Kamado Figure', productImage: '', customerId: 'cust-2', customerName: 'Alice Smith', customerAvatar: '', rating: 5, title: 'Beautiful figure', comment: 'Nezuko looks absolutely stunning. The kimono pattern details are beautiful. Worth every penny!', status: 'approved', helpful: 18, createdAt: '2024-11-07' },
  { id: 'rev-3', productId: 'prod-6', productName: 'One Piece Box Set Vol 1-23', productImage: '', customerId: 'cust-6', customerName: 'Emma Johnson', customerAvatar: '', rating: 5, title: 'Best manga purchase ever', comment: 'Complete collection in perfect condition. The box is beautiful and the bonus poster is a nice touch.', status: 'approved', helpful: 32, createdAt: '2024-11-05' },
  { id: 'rev-4', productId: 'prod-3', productName: 'Naruto Uzumaki Figure', productImage: '', customerId: 'cust-7', customerName: 'Takeshi Yamada', customerAvatar: '', rating: 4, title: 'Good but could be better', comment: 'Nice figure overall. The base could be sturdier, but the character sculpt is excellent.', status: 'approved', helpful: 8, createdAt: '2024-11-04' },
  { id: 'rev-5', productId: 'prod-11', productName: 'Naruto Headband', productImage: '', customerId: 'cust-3', customerName: 'David Kim', customerAvatar: '', rating: 4, title: 'Great for cosplay', comment: 'Metal plate feels authentic. The fabric could be thicker but overall a great accessory.', status: 'approved', helpful: 12, createdAt: '2024-11-03' },
  { id: 'rev-6', productId: 'prod-13', productName: 'Anime Cat Hoodie', productImage: '', customerId: 'cust-4', customerName: 'Sarah Chen', customerAvatar: '', rating: 5, title: 'Super comfy!', comment: 'Love the design and the quality is excellent. Very warm and comfortable. Ordering another color!', status: 'approved', helpful: 15, createdAt: '2024-11-02' },
  { id: 'rev-7', productId: 'prod-4', productName: 'Luffy Gear 5 Figure', productImage: '', customerId: 'cust-9', customerName: 'Carlos Rivera', customerAvatar: '', rating: 5, title: 'Absolutely epic', comment: 'The Gear 5 transformation looks incredible. Cloud effects are a nice detail.', status: 'pending', helpful: 0, createdAt: '2024-11-01' },
  { id: 'rev-8', productId: 'prod-10', productName: 'Dragon Ball Wall Scroll', productImage: '', customerId: 'cust-5', customerName: 'Mike Wilson', customerAvatar: '', rating: 3, title: 'Decent quality', comment: 'Print quality is okay but the fabric feels a bit cheap. Colors are nice though.', status: 'pending', helpful: 0, createdAt: '2024-10-30' },
  { id: 'rev-9', productId: 'prod-9', productName: 'My Hero Academia Poster Set', productImage: '', customerId: 'cust-8', customerName: 'Lisa Park', customerAvatar: '', rating: 4, title: 'Great poster set', comment: 'All 5 posters look fantastic. The cardstock is thick and the colors are vibrant.', status: 'approved', helpful: 6, createdAt: '2024-10-28' },
  { id: 'rev-10', productId: 'prod-15', productName: 'Limited Edition Pokémon Card Set', productImage: '', customerId: 'cust-10', customerName: 'Yuki Tanaka', customerAvatar: '', rating: 5, title: 'Rare find!', comment: 'Hard to find these cards elsewhere. Condition is mint and the holographic cards are beautiful.', status: 'approved', helpful: 20, createdAt: '2024-10-25' },
];

// ==================== INVENTORY ====================
export const initialInventory: InventoryItem[] = initialProducts.map(p => ({
  id: `inv-${p.id}`,
  productId: p.id,
  productName: p.name,
  productImage: p.images[0] || '',
  sku: p.sku,
  category: p.category,
  currentStock: p.stock,
  minStock: 10,
  maxStock: 100,
  status: p.stock === 0 ? 'out_of_stock' as const : p.stock <= 10 ? 'low_stock' as const : 'in_stock' as const,
  lastRestocked: p.updatedAt,
  updatedAt: p.updatedAt,
}));

export const initialStockMovements: StockMovement[] = [
  { id: 'sm-1', productId: 'prod-1', productName: 'Goku Super Saiyan Figure', type: 'in', quantity: 50, previousStock: 20, newStock: 70, reason: 'Restock from supplier', date: '2024-10-15', createdBy: 'Admin' },
  { id: 'sm-2', productId: 'prod-1', productName: 'Goku Super Saiyan Figure', type: 'out', quantity: 25, previousStock: 70, newStock: 45, reason: 'Sales orders', date: '2024-11-01', createdBy: 'System' },
  { id: 'sm-3', productId: 'prod-4', productName: 'Luffy Gear 5 Figure', type: 'in', quantity: 30, previousStock: 5, newStock: 35, reason: 'Restock from supplier', date: '2024-10-20', createdBy: 'Admin' },
  { id: 'sm-4', productId: 'prod-4', productName: 'Luffy Gear 5 Figure', type: 'out', quantity: 20, previousStock: 35, newStock: 15, reason: 'Sales orders', date: '2024-11-05', createdBy: 'System' },
  { id: 'sm-5', productId: 'prod-5', productName: 'Eren Yeager Figure', type: 'out', quantity: 12, previousStock: 20, newStock: 8, reason: 'Sales orders', date: '2024-10-28', createdBy: 'System' },
  { id: 'sm-6', productId: 'prod-10', productName: 'Dragon Ball Wall Scroll', type: 'out', quantity: 15, previousStock: 15, newStock: 0, reason: 'Sales orders', date: '2024-09-15', createdBy: 'System' },
  { id: 'sm-7', productId: 'prod-15', productName: 'Limited Edition Pokémon Card Set', type: 'in', quantity: 10, previousStock: 2, newStock: 12, reason: 'Limited restock', date: '2024-10-01', createdBy: 'Admin' },
  { id: 'sm-8', productId: 'prod-15', productName: 'Limited Edition Pokémon Card Set', type: 'out', quantity: 7, previousStock: 12, newStock: 5, reason: 'Sales orders', date: '2024-11-01', createdBy: 'System' },
];

// ==================== NOTIFICATIONS ====================
export const initialNotifications: Notification[] = [
  { id: 'notif-1', title: 'New Order Received', message: 'Order #ORD-1001 from John Doe - $54.49', type: 'order', read: false, createdAt: '2024-11-10T14:30:00' },
  { id: 'notif-2', title: 'New Review', message: 'Carlos Rivera left a 5-star review on Luffy Gear 5 Figure', type: 'review', read: false, createdAt: '2024-11-10T12:00:00' },
  { id: 'notif-3', title: 'Low Stock Alert', message: 'Eren Yeager Figure is running low (8 units remaining)', type: 'inventory', read: false, createdAt: '2024-11-09T09:15:00' },
  { id: 'notif-4', title: 'Out of Stock', message: 'Dragon Ball Wall Scroll is now out of stock', type: 'inventory', read: true, createdAt: '2024-11-08T16:45:00' },
  { id: 'notif-5', title: 'System Update', message: 'Dashboard analytics have been updated for November', type: 'system', read: true, createdAt: '2024-11-08T08:00:00' },
];

// ==================== DASHBOARD ====================
export const dashboardStats: DashboardStats = {
  totalOrders: 1248,
  totalProducts: 320,
  totalCustomers: 2560,
  totalRevenue: 24850,
  orderGrowth: 12.5,
  productGrowth: 8.2,
  customerGrowth: 14.7,
  revenueGrowth: 18.3,
};

export const salesData: SalesDataPoint[] = [
  { day: 'Mon', thisMonth: 850, lastMonth: 620 },
  { day: 'Tue', thisMonth: 920, lastMonth: 700 },
  { day: 'Wed', thisMonth: 780, lastMonth: 680 },
  { day: 'Thu', thisMonth: 1100, lastMonth: 850 },
  { day: 'Fri', thisMonth: 950, lastMonth: 780 },
  { day: 'Sat', thisMonth: 1350, lastMonth: 920 },
  { day: 'Sun', thisMonth: 1200, lastMonth: 880 },
];

export const orderStatusData: OrderStatusData[] = [
  { status: 'Completed', count: 774, percentage: 62, color: '#16A34A' },
  { status: 'Processing', count: 262, percentage: 21, color: '#3B82F6' },
  { status: 'Pending', count: 125, percentage: 10, color: '#F59E0B' },
  { status: 'Cancelled', count: 87, percentage: 7, color: '#A855F7' },
];

// ==================== SETTINGS ====================
export const initialSettings: StoreSettings = {
  storeName: 'Anime Store',
  storeDescription: 'Your one-stop shop for premium anime merchandise, figures, manga, and collectibles.',
  storeLogo: logoPresets[0].svgDataUri,
  storeTagline: 'Dream • Collect • Enjoy',
  email: 'contact@animestore.com',
  phone: '+1 (555) 000-1234',
  address: '100 Otaku Boulevard',
  city: 'Los Angeles, CA 90001',
  country: 'United States',
  socialMedia: {
    facebook: 'https://facebook.com/animestore',
    instagram: 'https://instagram.com/animestore',
    twitter: 'https://twitter.com/animestore',
    youtube: 'https://youtube.com/animestore',
  },
  shipping: {
    freeShippingThreshold: 50,
    standardRate: 5.99,
    expressRate: 12.99,
    estimatedDays: { standard: '5-7 business days', express: '1-3 business days' },
  },
  currency: 'USD',
  currencySymbol: '$',
  taxRate: 9,
};
