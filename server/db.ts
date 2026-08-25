import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export type Role = 'ADMIN' | 'USER';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

export interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  phone: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRecord {
  id: string;
  name: string;
  description: string;
  image: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRecord {
  id: string;
  code: string;
  name: string;
  description: string;
  categoryId: string;
  image: string;
  unit: string;
  price: number;
  stock: number;
  minimumStock: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemRecord {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  unit: string;
  subtotal: number;
}

export interface OrderStatusHistoryRecord {
  id: string;
  orderId: string;
  status: OrderStatus;
  note?: string;
  changedById?: string;
  changedByName?: string;
  createdAt: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  total: number;
  note?: string;
  pickupDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  userId?: string;
  userName?: string;
  action: string;
  entity: string;
  entityId?: string;
  description: string;
  createdAt: string;
}

export interface StoreSettingRecord {
  id: string;
  storeName: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  orderPrefix: string;
  timezone: string;
  updatedAt: string;
}

interface DatabaseSchema {
  users: UserRecord[];
  categories: CategoryRecord[];
  products: ProductRecord[];
  orders: OrderRecord[];
  orderItems: OrderItemRecord[];
  orderStatusHistories: OrderStatusHistoryRecord[];
  notifications: NotificationRecord[];
  auditLogs: AuditLogRecord[];
  storeSettings: StoreSettingRecord;
  orderCounter: number;
}

const DB_FILE = path.join(process.cwd(), 'factfruit-db.json');

// Initialize in-memory or persisted DB
class Database {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.data = this.load();
    if (!this.data || this.data.users.length === 0) {
      this.seed();
    }
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to read db file, initializing fresh store', e);
    }
    return this.getInitialState();
  }

  private getInitialState(): DatabaseSchema {
    return {
      users: [],
      categories: [],
      products: [],
      orders: [],
      orderItems: [],
      orderStatusHistories: [],
      notifications: [],
      auditLogs: [],
      storeSettings: {
        id: 'setting-1',
        storeName: 'FactFruit',
        logo: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=150&auto=format&fit=crop&q=80',
        address: '123 ตลาดผลไม้พรีเมียม ถ.สุขุมวิท กรุงเทพมหานคร 10110',
        phone: '02-888-9999, 081-234-5678',
        email: 'contact@factfruit.com',
        currency: 'THB',
        orderPrefix: 'ORD-',
        timezone: 'Asia/Bangkok',
        updatedAt: new Date().toISOString(),
      },
      orderCounter: 10,
    };
  }

  public save() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
      } catch (err) {
        console.error('Error saving DB to disk:', err);
      }
    }, 100);
  }

  public seed() {
    console.log('Seeding FactFruit database...');
    const adminPasswordHash = bcrypt.hashSync('Admin12345', 10);
    const userPasswordHash = bcrypt.hashSync('User12345', 10);

    const now = new Date();
    const isoNow = now.toISOString();

    const users: UserRecord[] = [
      {
        id: 'user-admin-1',
        firstName: 'ผู้ดูแลระบบ',
        lastName: 'แอดมินฟรุต',
        email: 'admin@factfruit.com',
        passwordHash: adminPasswordHash,
        phone: '0812345678',
        role: 'ADMIN',
        isActive: true,
        createdAt: new Date(now.getTime() - 30 * 86400000).toISOString(),
        updatedAt: isoNow,
      },
      {
        id: 'user-customer-1',
        firstName: 'สมชาย',
        lastName: 'ใจดี',
        email: 'user@factfruit.com',
        passwordHash: userPasswordHash,
        phone: '0899998888',
        role: 'USER',
        isActive: true,
        createdAt: new Date(now.getTime() - 25 * 86400000).toISOString(),
        updatedAt: isoNow,
      },
      {
        id: 'user-customer-2',
        firstName: 'วิภาดา',
        lastName: 'รักผลไม้',
        email: 'wipada@factfruit.com',
        passwordHash: userPasswordHash,
        phone: '0865554444',
        role: 'USER',
        isActive: true,
        createdAt: new Date(now.getTime() - 15 * 86400000).toISOString(),
        updatedAt: isoNow,
      },
    ];

    const categories: CategoryRecord[] = [
      {
        id: 'cat-thai',
        name: 'ผลไม้ไทย',
        description: 'ผลไม้สดส่งตรงจากสวนไทย รสชาติหวานฉ่ำคัดพิเศษ',
        image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&auto=format&fit=crop&q=80',
        isActive: true,
        createdAt: isoNow,
        updatedAt: isoNow,
      },
      {
        id: 'cat-import',
        name: 'ผลไม้ต่างประเทศ',
        description: 'ผลไม้นำเข้าเกรดพรีเมียมจากญี่ปุ่น นิวซีแลนด์ สหรัฐอเมริกา',
        image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop&q=80',
        isActive: true,
        createdAt: isoNow,
        updatedAt: isoNow,
      },
      {
        id: 'cat-seasonal',
        name: 'ผลไม้ตามฤดูกาล',
        description: 'สดใหม่ตามฤดูกาล หวานอร่อยที่สุดในรอบปี',
        image: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=400&auto=format&fit=crop&q=80',
        isActive: true,
        createdAt: isoNow,
        updatedAt: isoNow,
      },
      {
        id: 'cat-premium',
        name: 'ผลไม้พรีเมียม',
        description: 'ผลไม้คัดเกรด Super Premium กล่องของขวัญและกระเช้าพิเศษ',
        image: 'https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?w=400&auto=format&fit=crop&q=80',
        isActive: true,
        createdAt: isoNow,
        updatedAt: isoNow,
      },
      {
        id: 'cat-budget',
        name: 'ผลไม้ราคาประหยัด',
        description: 'ผลไม้สดคุณภาพดี คุ้มค่า คุ้มราคา ทานได้ทุกวัน',
        image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&auto=format&fit=crop&q=80',
        isActive: true,
        createdAt: isoNow,
        updatedAt: isoNow,
      },
    ];

    const products: ProductRecord[] = [
      {
        id: 'prod-apple-fuji',
        code: 'APPLE001',
        name: 'แอปเปิลฟูจิ พรีเมียม (Fuji Apple)',
        description: 'แอปเปิลฟูจิเนื้อกรอบ หวานฉ่ำ กลิ่นหอมละมุน นำเข้าเกรดคัดพิเศษ',
        categoryId: 'cat-import',
        image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80',
        unit: 'กิโลกรัม',
        price: 135,
        stock: 45.5,
        minimumStock: 10,
        isAvailable: true,
        createdAt: isoNow,
        updatedAt: isoNow,
      },
      {
        id: 'prod-orange-sai-nam-phung',
        code: 'ORANGE001',
        name: 'ส้มสายน้ำผึ้ง เชียงใหม่',
        description: 'ส้มสายน้ำผึ้งสวนฝาง เชียงใหม่ เปลือกบาง รสชาติหวานอมเปรี้ยวกลมกล่อม',
        categoryId: 'cat-thai',
        image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=600&auto=format&fit=crop&q=80',
        unit: 'กิโลกรัม',
        price: 95,
        stock: 32.0,
        minimumStock: 8,
        isAvailable: true,
        createdAt: isoNow,
        updatedAt: isoNow,
      },
      {
        id: 'prod-banana-hom',
        code: 'BANANA001',
        name: 'กล้วยหอมทอง ปลอดสารพิษ',
        description: 'กล้วยหอมทองหวีสวย เนื้อแน่น หวานนุ่ม อุดมไปด้วยวิตามินและโพแทสเซียม',
        categoryId: 'cat-budget',
        image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80',
        unit: 'ลูก',
        price: 15,
        stock: 80,
        minimumStock: 15,
        isAvailable: true,
        createdAt: isoNow,
        updatedAt: isoNow,
      },
      {
        id: 'prod-mango-nam-dok-mai',
        code: 'MANGO001',
        name: 'มะม่วงน้ำดอกไม้สีทอง สุกพร้อมทาน',
        description: 'มะม่วงน้ำดอกไม้สีทองเกรดส่งออก ผิวเนียน เนื้อละเอียด หวานหอมชื่นใจ',
        categoryId: 'cat-seasonal',
        image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80',
        unit: 'กิโลกรัม',
        price: 120,
        stock: 28.5,
        minimumStock: 10,
        isAvailable: true,
        createdAt: isoNow,
        updatedAt: isoNow,
      },
      {
        id: 'prod-watermelon-jindara',
        code: 'WATERMELON001',
        name: 'แตงโมจินตหรา หวานกรอบ',
        description: 'แตงโมเนื้อแดงจัด เมล็ดน้อย หวานชื่นใจ ดับกระหายคลายร้อน',
        categoryId: 'cat-budget',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80',
        unit: 'กิโลกรัม',
        price: 45,
        stock: 60.0,
        minimumStock: 15,
        isAvailable: true,
        createdAt: isoNow,
        updatedAt: isoNow,
      },
      {
        id: 'prod-grape-shine-muscat',
        code: 'GRAPE001',
        name: 'องุ่นไซน์มัสแคท พรีเมียม (Shine Muscat)',
        description: 'องุ่นเขียวไร้เมล็ด กลิ่นหอมมัสก์ เนื้อเจลลี่กรอบ หวานละมุนลิ้น',
        categoryId: 'cat-premium',
        image: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600&auto=format&fit=crop&q=80',
        unit: 'กล่อง',
        price: 490,
        stock: 18,
        minimumStock: 5,
        isAvailable: true,
        createdAt: isoNow,
        updatedAt: isoNow,
      },
      {
        id: 'prod-durian-monthong',
        code: 'DURIAN001',
        name: 'ทุเรียนหมอนทองระยอง แกะเนื้อพร้อมทาน',
        description: 'ทุเรียนหมอนทองคัดเกรด A กรอบนอกนุ่มใน หวานมันกำลังดี แกะเนื้อซีลสูญญากาศ',
        categoryId: 'cat-premium',
        image: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=600&auto=format&fit=crop&q=80',
        unit: 'กล่อง',
        price: 590,
        stock: 12,
        minimumStock: 5,
        isAvailable: true,
        createdAt: isoNow,
        updatedAt: isoNow,
      },
      {
        id: 'prod-mangosteen',
        code: 'MANGOSTEEN001',
        name: 'มังคุดคัดพิเศษ ราชินีผลไม้',
        description: 'มังคุดผิวมัน เปลือกบาง เนื้อขาวฟูเป็นกลีบ หวานอมเปรี้ยวสดชื่น',
        categoryId: 'cat-seasonal',
        image: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=600&auto=format&fit=crop&q=80',
        unit: 'กิโลกรัม',
        price: 110,
        stock: 35.0,
        minimumStock: 10,
        isAvailable: true,
        createdAt: isoNow,
        updatedAt: isoNow,
      },
      {
        id: 'prod-pineapple-phulae',
        code: 'PINEAPPLE001',
        name: 'สับปะรดภูแล เชียงราย',
        description: 'สับปะรดลูกเล็กน่ารัก ปอกพร้อมทาน หวานกรอบ ไม่กัดลิ้น กลิ่นหอมสดชื่น',
        categoryId: 'cat-thai',
        image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&auto=format&fit=crop&q=80',
        unit: 'ถุง',
        price: 65,
        stock: 25,
        minimumStock: 8,
        isAvailable: true,
        createdAt: isoNow,
        updatedAt: isoNow,
      },
      {
        id: 'prod-rambutan-rongrien',
        code: 'RAMBUTAN001',
        name: 'เงาะโรงเรียน นาสาร สุราษฎร์ธานี',
        description: 'เงาะโรงเรียนแท้ ขนเขียวปลายแดง เนื้อแน่นล่อน ไม่ติดเมล็ด หวานกรอบ',
        categoryId: 'cat-seasonal',
        image: 'https://images.unsplash.com/photo-1596547610010-449108b5eb54?w=600&auto=format&fit=crop&q=80',
        unit: 'กิโลกรัม',
        price: 75,
        stock: 40.0,
        minimumStock: 10,
        isAvailable: true,
        createdAt: isoNow,
        updatedAt: isoNow,
      },
      {
        id: 'prod-longan-edaw',
        code: 'LONGAN001',
        name: 'ลำไยอีดอ ลำพูน คัดเกรดพรีเมียม',
        description: 'ลำไยพันธุ์อีดอ เนื้อหนา เมล็ดเล็ก กรอบแห้ง หวานชื่นใจ คัดพิเศษช่อโต',
        categoryId: 'cat-thai',
        image: 'https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?w=600&auto=format&fit=crop&q=80',
        unit: 'กิโลกรัม',
        price: 85,
        stock: 30.0,
        minimumStock: 8,
        isAvailable: true,
        createdAt: isoNow,
        updatedAt: isoNow,
      },
      {
        id: 'prod-dragonfruit-red',
        code: 'DRAGON001',
        name: 'แก้วมังกรเนื้อแดง ปลอดสาร',
        description: 'แก้วมังกรพันธุ์เนื้อแดง หวานฉ่ำ อุดมไปด้วยสารต้านอนุมูลอิสระและไฟเบอร์',
        categoryId: 'cat-thai',
        image: 'https://images.unsplash.com/photo-1527325678964-54921661f888?w=600&auto=format&fit=crop&q=80',
        unit: 'กิโลกรัม',
        price: 70,
        stock: 22.5,
        minimumStock: 5,
        isAvailable: true,
        createdAt: isoNow,
        updatedAt: isoNow,
      },
      {
        id: 'prod-strawberry-korea',
        code: 'STRAW001',
        name: 'สตรอว์เบอร์รีเกาหลี คิงส์เบอร์รี (King’s Berry)',
        description: 'สตรอว์เบอร์รีเกาหลีผลโต สีแดงสดฉ่ำ กลิ่นหอมหวานอันเป็นเอกลักษณ์',
        categoryId: 'cat-premium',
        image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&auto=format&fit=crop&q=80',
        unit: 'แพ็ค',
        price: 390,
        stock: 14,
        minimumStock: 4,
        isAvailable: true,
        createdAt: isoNow,
        updatedAt: isoNow,
      },
      {
        id: 'prod-blueberry-chile',
        code: 'BLUE001',
        name: 'บลูเบอร์รีสด ชิลี (Fresh Blueberries)',
        description: 'บลูเบอร์รีเม็ดกลมเต่ง ผิวเคลือบนวลขาว รสเปรี้ยวอมหวาน ฉ่ำน้ำ',
        categoryId: 'cat-import',
        image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=600&auto=format&fit=crop&q=80',
        unit: 'แพ็ค',
        price: 180,
        stock: 20,
        minimumStock: 5,
        isAvailable: true,
        createdAt: isoNow,
        updatedAt: isoNow,
      },
      {
        id: 'prod-kiwi-gold',
        code: 'KIWI001',
        name: 'กีวีสีทอง นิวซีแลนด์ (Zespri SunGold Kiwi)',
        description: 'กีวีทองเนื้อเนียน ละมุนลิ้น วิตามินซีสูงกว่าส้ม 3 เท่า รสหวานฉ่ำ',
        categoryId: 'cat-import',
        image: 'https://images.unsplash.com/photo-1585059895524-72359e06133a?w=600&auto=format&fit=crop&q=80',
        unit: 'แพ็ค',
        price: 165,
        stock: 25,
        minimumStock: 6,
        isAvailable: true,
        createdAt: isoNow,
        updatedAt: isoNow,
      },
      {
        id: 'prod-pear-century',
        code: 'PEAR001',
        name: 'ลูกแพร์หิมะ เซ็นจูรี่ (Snow Pear)',
        description: 'สาลี่หิมะลูกใหญ่ ผิวบาง เนื้อสีขาวนวล กรอบฉ่ำน้ำ ชุ่มคอชื่นใจ',
        categoryId: 'cat-import',
        image: 'https://images.unsplash.com/photo-1514756331096-242fdeb70d4a?w=600&auto=format&fit=crop&q=80',
        unit: 'ลูก',
        price: 45,
        stock: 35,
        minimumStock: 8,
        isAvailable: true,
        createdAt: isoNow,
        updatedAt: isoNow,
      },
      {
        id: 'prod-papaya-holland',
        code: 'PAPAYA001',
        name: 'มะละกอสุกฮอลแลนด์ ปลอดสาร',
        description: 'มะละกอฮอลแลนด์เนื้อสีส้มอมแดง เนื้อแน่น ไม่เละ หวานกลมกล่อม',
        categoryId: 'cat-budget',
        image: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=600&auto=format&fit=crop&q=80',
        unit: 'กิโลกรัม',
        price: 55,
        stock: 30.0,
        minimumStock: 5,
        isAvailable: true,
        createdAt: isoNow,
        updatedAt: isoNow,
      },
      {
        id: 'prod-guava-kimju',
        code: 'GUAVA001',
        name: 'ฝรั่งกิมจู กรอบไร้เมล็ด',
        description: 'ฝรั่งกิมจูเนื้อฟูกรอบ ผิวสวย เมล็ดน้อยมาก อุดมด้วยวิตามินซีสูง',
        categoryId: 'cat-budget',
        image: 'https://images.unsplash.com/photo-1536511135890-50b28e67a030?w=600&auto=format&fit=crop&q=80',
        unit: 'กิโลกรัม',
        price: 50,
        stock: 40.0,
        minimumStock: 10,
        isAvailable: true,
        createdAt: isoNow,
        updatedAt: isoNow,
      },
      {
        id: 'prod-passionfruit',
        code: 'PASSION001',
        name: 'เสาวรสหวาน เชียงราย',
        description: 'เสาวรสพันธุ์หวาน กลิ่นหอมเย้ายวน รสเปรี้ยวอมหวานสดชื่น ทานสดหรือทำน้ำผลไม้',
        categoryId: 'cat-thai',
        image: 'https://images.unsplash.com/photo-1589533610925-1cffc309ebaa?w=600&auto=format&fit=crop&q=80',
        unit: 'กิโลกรัม',
        price: 90,
        stock: 18.0,
        minimumStock: 5,
        isAvailable: true,
        createdAt: isoNow,
        updatedAt: isoNow,
      },
      {
        id: 'prod-coconut-nam-hom',
        code: 'COCONUT001',
        name: 'มะพร้าวน้ำหอมบ้านแพ้ว แท้ 100%',
        description: 'มะพร้าวน้ำหอมแท้จากสมุทรสาคร น้ำหวานชื่นใจ กลิ่นใบเตย เนื้อนุ่มกำลังดี',
        categoryId: 'cat-thai',
        image: 'https://images.unsplash.com/photo-1544376798-89aa6b82c6cd?w=600&auto=format&fit=crop&q=80',
        unit: 'ลูก',
        price: 35,
        stock: 50,
        minimumStock: 10,
        isAvailable: true,
        createdAt: isoNow,
        updatedAt: isoNow,
      },
    ];

    // Create 10 realistic seed orders spanning the last 14 days
    const orders: OrderRecord[] = [];
    const orderItems: OrderItemRecord[] = [];
    const orderStatusHistories: OrderStatusHistoryRecord[] = [];
    const notifications: NotificationRecord[] = [];
    const auditLogs: AuditLogRecord[] = [];

    const orderSeeds = [
      {
        orderNumber: 'ORD-2026-000001',
        userId: 'user-customer-1',
        status: 'COMPLETED' as OrderStatus,
        daysAgo: 12,
        items: [
          { prodId: 'prod-apple-fuji', qty: 2.5 },
          { prodId: 'prod-orange-sai-nam-phung', qty: 3.0 },
        ],
      },
      {
        orderNumber: 'ORD-2026-000002',
        userId: 'user-customer-2',
        status: 'COMPLETED' as OrderStatus,
        daysAgo: 10,
        items: [
          { prodId: 'prod-grape-shine-muscat', qty: 1 },
          { prodId: 'prod-mango-nam-dok-mai', qty: 2.0 },
        ],
      },
      {
        orderNumber: 'ORD-2026-000003',
        userId: 'user-customer-1',
        status: 'COMPLETED' as OrderStatus,
        daysAgo: 8,
        items: [
          { prodId: 'prod-durian-monthong', qty: 2 },
          { prodId: 'prod-mangosteen', qty: 3.0 },
        ],
      },
      {
        orderNumber: 'ORD-2026-000004',
        userId: 'user-customer-2',
        status: 'COMPLETED' as OrderStatus,
        daysAgo: 6,
        items: [
          { prodId: 'prod-strawberry-korea', qty: 2 },
          { prodId: 'prod-kiwi-gold', qty: 1 },
        ],
      },
      {
        orderNumber: 'ORD-2026-000005',
        userId: 'user-customer-1',
        status: 'READY' as OrderStatus,
        daysAgo: 4,
        items: [
          { prodId: 'prod-watermelon-jindara', qty: 4.5 },
          { prodId: 'prod-coconut-nam-hom', qty: 4 },
        ],
      },
      {
        orderNumber: 'ORD-2026-000006',
        userId: 'user-customer-2',
        status: 'PREPARING' as OrderStatus,
        daysAgo: 2,
        items: [
          { prodId: 'prod-apple-fuji', qty: 1.5 },
          { prodId: 'prod-pineapple-phulae', qty: 2 },
        ],
      },
      {
        orderNumber: 'ORD-2026-000007',
        userId: 'user-customer-1',
        status: 'CONFIRMED' as OrderStatus,
        daysAgo: 1,
        items: [
          { prodId: 'prod-grape-shine-muscat', qty: 2 },
          { prodId: 'prod-longan-edaw', qty: 2.0 },
        ],
      },
      {
        orderNumber: 'ORD-2026-000008',
        userId: 'user-customer-2',
        status: 'PENDING' as OrderStatus,
        daysAgo: 0.5,
        items: [
          { prodId: 'prod-mango-nam-dok-mai', qty: 2.5 },
          { prodId: 'prod-dragonfruit-red', qty: 2.0 },
        ],
      },
      {
        orderNumber: 'ORD-2026-000009',
        userId: 'user-customer-1',
        status: 'PENDING' as OrderStatus,
        daysAgo: 0.2,
        items: [
          { prodId: 'prod-blueberry-chile', qty: 2 },
          { prodId: 'prod-kiwi-gold', qty: 2 },
        ],
      },
      {
        orderNumber: 'ORD-2026-000010',
        userId: 'user-customer-2',
        status: 'CANCELLED' as OrderStatus,
        daysAgo: 5,
        items: [
          { prodId: 'prod-banana-hom', qty: 10 },
        ],
      },
    ];

    orderSeeds.forEach((s, idx) => {
      const orderId = `order-seed-${idx + 1}`;
      const orderDate = new Date(now.getTime() - s.daysAgo * 86400000).toISOString();
      let subtotal = 0;

      s.items.forEach((item, itemIdx) => {
        const prod = products.find((p) => p.id === item.prodId)!;
        const itemSubtotal = Math.round(prod.price * item.qty * 100) / 100;
        subtotal += itemSubtotal;

        orderItems.push({
          id: `item-seed-${idx + 1}-${itemIdx + 1}`,
          orderId,
          productId: prod.id,
          productName: prod.name,
          unitPrice: prod.price,
          quantity: item.qty,
          unit: prod.unit,
          subtotal: itemSubtotal,
        });
      });

      subtotal = Math.round(subtotal * 100) / 100;

      orders.push({
        id: orderId,
        orderNumber: s.orderNumber,
        userId: s.userId,
        status: s.status,
        subtotal,
        discount: 0,
        total: subtotal,
        note: 'สั่งจองล่วงหน้าเพื่อรับที่หน้าร้าน',
        pickupDate: new Date(now.getTime() + 1 * 86400000).toISOString(),
        createdAt: orderDate,
        updatedAt: orderDate,
      });

      // Build status history
      orderStatusHistories.push({
        id: `hist-${idx + 1}-1`,
        orderId,
        status: 'PENDING',
        note: 'ลูกค้าสั่งจองสินค้าผ่านระบบ',
        changedById: s.userId,
        changedByName: s.userId === 'user-customer-1' ? 'สมชาย ใจดี' : 'วิภาดา รักผลไม้',
        createdAt: orderDate,
      });

      if (s.status !== 'PENDING') {
        const confDate = new Date(new Date(orderDate).getTime() + 3600000).toISOString();
        if (s.status === 'CANCELLED') {
          orderStatusHistories.push({
            id: `hist-${idx + 1}-cancel`,
            orderId,
            status: 'CANCELLED',
            note: 'ลูกค้ายกเลิกคำสั่งซื้อในสถานะรอดำเนินการ',
            changedById: s.userId,
            changedByName: 'วิภาดา รักผลไม้',
            createdAt: confDate,
          });
        } else {
          orderStatusHistories.push({
            id: `hist-${idx + 1}-conf`,
            orderId,
            status: 'CONFIRMED',
            note: 'แอดมินยืนยันคำสั่งซื้อและตรวจเช็คสต็อกเรียบร้อย',
            changedById: 'user-admin-1',
            changedByName: 'ผู้ดูแลระบบ',
            createdAt: confDate,
          });

          if (s.status === 'PREPARING' || s.status === 'READY' || s.status === 'COMPLETED') {
            const prepDate = new Date(new Date(confDate).getTime() + 3600000).toISOString();
            orderStatusHistories.push({
              id: `hist-${idx + 1}-prep`,
              orderId,
              status: 'PREPARING',
              note: 'กำลังคัดสรรผลไม้สดและบรรจุกล่อง',
              changedById: 'user-admin-1',
              changedByName: 'ผู้ดูแลระบบ',
              createdAt: prepDate,
            });
          }

          if (s.status === 'READY' || s.status === 'COMPLETED') {
            const readyDate = new Date(new Date(confDate).getTime() + 7200000).toISOString();
            orderStatusHistories.push({
              id: `hist-${idx + 1}-ready`,
              orderId,
              status: 'READY',
              note: 'สินค้าเตรียมเสร็จเรียบร้อย พร้อมให้มารับที่ร้าน',
              changedById: 'user-admin-1',
              changedByName: 'ผู้ดูแลระบบ',
              createdAt: readyDate,
            });
          }

          if (s.status === 'COMPLETED') {
            const compDate = new Date(new Date(confDate).getTime() + 10800000).toISOString();
            orderStatusHistories.push({
              id: `hist-${idx + 1}-comp`,
              orderId,
              status: 'COMPLETED',
              note: 'ลูกค้าเข้ามารับผลไม้เรียบร้อยแล้ว ขอบคุณที่ใช้บริการ',
              changedById: 'user-admin-1',
              changedByName: 'ผู้ดูแลระบบ',
              createdAt: compDate,
            });
          }
        }
      }
    });

    // Seed initial notifications
    notifications.push(
      {
        id: 'notif-1',
        userId: 'user-admin-1',
        title: 'คำสั่งซื้อใหม่เข้าระบบ',
        message: 'มีคำสั่งซื้อใหม่ ORD-2026-000009 รอดำเนินการตรวจสอบ',
        link: '/admin/orders/order-seed-9',
        isRead: false,
        createdAt: new Date(now.getTime() - 15 * 60000).toISOString(),
      },
      {
        id: 'notif-2',
        userId: 'user-customer-1',
        title: 'สินค้าของคุณพร้อมรับแล้ว!',
        message: 'คำสั่งซื้อ ORD-2026-000005 เตรียมเสร็จเรียบร้อย สามารถเดินทางมารับได้',
        link: '/my-orders/order-seed-5',
        isRead: false,
        createdAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
      }
    );

    // Seed initial Audit logs
    auditLogs.push(
      {
        id: 'audit-1',
        userId: 'user-admin-1',
        userName: 'ผู้ดูแลระบบ',
        action: 'System Seed Initialized',
        entity: 'System',
        entityId: 'init',
        description: 'ระบบ FactFruit เริ่มต้นฐานข้อมูลพร้อมข้อมูลตัวอย่างผลไม้และออเดอร์',
        createdAt: isoNow,
      },
      {
        id: 'audit-2',
        userId: 'user-admin-1',
        userName: 'ผู้ดูแลระบบ',
        action: 'Change Order Status',
        entity: 'Order',
        entityId: 'order-seed-5',
        description: 'เปลี่ยนสถานะออเดอร์ ORD-2026-000005 เป็น READY',
        createdAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
      }
    );

    this.data = {
      users,
      categories,
      products,
      orders,
      orderItems,
      orderStatusHistories,
      notifications,
      auditLogs,
      storeSettings: this.data.storeSettings || this.getInitialState().storeSettings,
      orderCounter: 10,
    };

    this.save();
    console.log('FactFruit database seeded successfully.');
  }

  // Transaction helper simulating prisma.$transaction with full atomic rollback
  public async transaction<T>(callback: (tx: Database) => Promise<T>): Promise<T> {
    // Snapshot state for atomic rollback on failure
    const backup = JSON.stringify(this.data);
    try {
      const result = await callback(this);
      this.save();
      return result;
    } catch (error) {
      this.data = JSON.parse(backup);
      throw error;
    }
  }

  // Getters & Collections
  public getUsers() {
    return this.data.users;
  }

  public getCategories() {
    return this.data.categories;
  }

  public getProducts() {
    return this.data.products;
  }

  public getOrders() {
    return this.data.orders;
  }

  public getOrderItems() {
    return this.data.orderItems;
  }

  public getOrderStatusHistories() {
    return this.data.orderStatusHistories;
  }

  public getNotifications() {
    return this.data.notifications;
  }

  public getAuditLogs() {
    return this.data.auditLogs;
  }

  public getStoreSettings() {
    return this.data.storeSettings;
  }

  public updateStoreSettings(settings: Partial<StoreSettingRecord>) {
    this.data.storeSettings = {
      ...this.data.storeSettings,
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.storeSettings;
  }

  // Atomic Order Number generator: ORD-2026-000001
  public getNextOrderNumber(): string {
    this.data.orderCounter = (this.data.orderCounter || 0) + 1;
    const year = new Date().getFullYear();
    const countStr = String(this.data.orderCounter).padStart(6, '0');
    const prefix = this.data.storeSettings.orderPrefix || 'ORD-';
    return `${prefix}${year}-${countStr}`;
  }

  public addAuditLog(log: Omit<AuditLogRecord, 'id' | 'createdAt'>) {
    const item: AuditLogRecord = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      ...log,
    };
    this.data.auditLogs.unshift(item);
    this.save();
    return item;
  }

  public addNotification(notif: Omit<NotificationRecord, 'id' | 'isRead' | 'createdAt'>) {
    const item: NotificationRecord = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      isRead: false,
      createdAt: new Date().toISOString(),
      ...notif,
    };
    this.data.notifications.unshift(item);
    this.save();
    return item;
  }
}

export const db = new Database();
