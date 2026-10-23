// ==================== 静态数据（价格为估算，可被 data/prices.json 与用户改价覆盖） ====================
const PRICE_META = { updated: '2026-10', source: '人工估算（主流电商入门款新品价 / 二手平台常见挂牌价）' };

const HABIT_OPTIONS = [
  { id: 'cooking', label: '做饭', icon: '🍳' }, { id: 'fitness', label: '健身', icon: '💪' },
  { id: 'office', label: '居家办公', icon: '💻' }, { id: 'streaming', label: '追剧', icon: '📺' },
  { id: 'gaming', label: '游戏', icon: '🎮' }, { id: 'social', label: '朋友聚会', icon: '🥂' },
  { id: 'reading', label: '阅读', icon: '📖' }, { id: 'plants', label: '养植物', icon: '🌿' },
];

const ROOM_GROUPS = [
  { title: '租赁方式', single: true, tags: ['合租', '整租'] },
  { title: '卫生间', single: true, tags: ['独卫', '公共卫生间'] },
  { title: '朝向 / 采光', tags: ['朝南', '朝北', '朝东', '朝西'] },
  { title: '房间数', single: true, tags: ['单间', '一居室', '两居室+'] },
];

// 每搬一次的额外成本（估算：搬运/打包/损耗）
const MOVE_COST = { '轻': 0, '中': 40, '重': 150 };

// weight: 轻/中/重；resale: 用满一年后的转卖比例；base: 基础必要度(0-100)
const goodsDatabase = [
  { id: 1, name: "乳胶枕", emoji: "🛏️", price: 200, weight: '轻', resale: 0.1, base: 75, habits: [], rooms: [], reason: "睡眠质量直接影响状态，体积小、搬家塞进被子里就走" },
  { id: 2, name: "遮光窗帘", emoji: "🪟", price: 150, weight: '轻', resale: 0.2, base: 45, habits: [], rooms: ['朝南', '朝东'], reason: "房东窗帘多数不遮光；量好尺寸，下次搬家大概率还能用" },
  { id: 3, name: "电饭煲", emoji: "🍚", price: 300, weight: '中', resale: 0.4, base: 20, habits: ['cooking'], rooms: [], reason: "自己做饭的基本盘，二手好出" },
  { id: 4, name: "折叠收纳箱", emoji: "📦", price: 120, weight: '轻', resale: 0.2, base: 70, habits: [], rooms: ['单间', '合租'], reason: "平时收纳、搬家当打包箱，一物两用" },
  { id: 5, name: "电热水壶", emoji: "🫖", price: 100, weight: '轻', resale: 0.3, base: 55, habits: ['cooking'], rooms: [], reason: "便宜、轻、天天用" },
  { id: 6, name: "门挂全身镜", emoji: "🪞", price: 80, weight: '轻', resale: 0.2, base: 35, habits: [], rooms: [], reason: "挂门上不占地、不打孔，不影响退押金" },
  { id: 7, name: "吹风机", emoji: "💨", price: 150, weight: '轻', resale: 0.3, base: 40, habits: [], rooms: ['公共卫生间'], reason: "公卫高峰期不用排队等别人的" },
  { id: 8, name: "插线板", emoji: "🔌", price: 60, weight: '轻', resale: 0, base: 65, habits: ['office', 'gaming'], rooms: [], reason: "老房子插座永远不够，选带USB的" },
  { id: 9, name: "洗漱收纳篮", emoji: "🧺", price: 40, weight: '轻', resale: 0, base: 20, habits: [], rooms: ['公共卫生间', '合租'], reason: "公卫拎进拎出，个人用品不混放" },
  { id: 10, name: "降噪耳塞/眼罩", emoji: "😴", price: 50, weight: '轻', resale: 0, base: 20, habits: [], rooms: ['合租'], reason: "合租作息不同步时最便宜的解决方案" },
  { id: 11, name: "投影仪", emoji: "📽️", price: 2000, weight: '中', resale: 0.5, base: 5, habits: ['streaming', 'social'], rooms: [], reason: "代替电视，搬家装包就走；保值率不错" },
  { id: 12, name: "人体工学椅", emoji: "💺", price: 800, weight: '重', resale: 0.4, base: 5, habits: ['office', 'gaming'], rooms: [], reason: "每天坐 6 小时以上才值，体积大搬家费劲" },
  { id: 13, name: "空气净化器", emoji: "🌬️", price: 600, weight: '中', resale: 0.4, base: 15, habits: [], rooms: ['整租'], reason: "新装修房源甲醛风险高，二手需求稳定" },
  { id: 14, name: "挂烫机", emoji: "👔", price: 200, weight: '轻', resale: 0.3, base: 15, habits: ['office'], rooms: [], reason: "通勤上班族衬衫刚需" },
  { id: 15, name: "空气炸锅", emoji: "🍗", price: 300, weight: '中', resale: 0.4, base: 10, habits: ['cooking'], rooms: [], reason: "比烤箱小，懒人做饭利器" },
  { id: 16, name: "瑜伽垫", emoji: "🧘", price: 100, weight: '轻', resale: 0.1, base: 5, habits: ['fitness'], rooms: [], reason: "卷起来就能带走的居家健身" },
  { id: 17, name: "蓝牙音箱", emoji: "🔊", price: 300, weight: '轻', resale: 0.4, base: 5, habits: ['streaming', 'social', 'cooking'], rooms: [], reason: "做饭听歌、睡前白噪音" },
  { id: 18, name: "落地灯/台灯", emoji: "💡", price: 200, weight: '中', resale: 0.3, base: 20, habits: ['reading', 'office'], rooms: ['朝北', '朝西'], reason: "采光差的房间补光，暖光更有家的感觉" },
  { id: 19, name: "微波炉", emoji: "📟", price: 400, weight: '中', resale: 0.3, base: 5, habits: ['cooking'], rooms: [], reason: "带饭党热饭神器（先看房东有没有配）" },
  { id: 20, name: "除螨仪", emoji: "🛡️", price: 300, weight: '轻', resale: 0.3, base: 15, habits: [], rooms: [], reason: "租房床垫来历不明，入住先除螨" },
  { id: 21, name: "折叠桌", emoji: "🪑", price: 150, weight: '中', resale: 0.2, base: 10, habits: ['social', 'office', 'reading'], rooms: [], reason: "吃饭、办公、聚会都能用，搬家一折就走" },
  { id: 22, name: "大电视", emoji: "📺", price: 3000, weight: '重', resale: 0.3, base: 0, habits: ['streaming', 'gaming'], rooms: [], reason: "易碎笨重，搬家风险高；投影仪更灵活" },
  { id: 23, name: "大沙发", emoji: "🛋️", price: 2000, weight: '重', resale: 0.15, base: 0, habits: ['social'], rooms: ['整租'], reason: "小房间放不下，下次搬家大概率带不走" },
  { id: 24, name: "大型书架", emoji: "📚", price: 500, weight: '重', resale: 0.15, base: 0, habits: ['reading'], rooms: [], reason: "书用收纳箱装，搬家轻松很多" },
  { id: 25, name: "跑步机", emoji: "🏃", price: 2000, weight: '重', resale: 0.3, base: 0, habits: ['fitness'], rooms: [], reason: "占地、扰邻，短租不划算；健身房月卡更灵活" },
  { id: 26, name: "烤箱", emoji: "🔥", price: 500, weight: '中', resale: 0.3, base: 0, habits: ['cooking'], rooms: [], reason: "不常烘焙的话空气炸锅足够" },
  { id: 27, name: "大型绿植", emoji: "🌳", price: 200, weight: '重', resale: 0, base: 0, habits: ['plants'], rooms: [], reason: "搬家最容易养死，小盆栽更合适" },
  { id: 28, name: "按摩椅", emoji: "💆", price: 5000, weight: '重', resale: 0.25, base: 0, habits: [], rooms: [], reason: "贵、重、占地，商场共享按摩更划算" },
];

const buyOrRentItems = [
  { id: 1, name: "投影仪", icon: "📽️", buyPrice: 2500, rentPrice: 50, maintainCost: 50, storageDiff: "低", resaleValue: 60 },
  { id: 2, name: "电钻", icon: "🔩", buyPrice: 300, rentPrice: 20, maintainCost: 10, storageDiff: "低", resaleValue: 70 },
  { id: 3, name: "帐篷", icon: "⛺", buyPrice: 800, rentPrice: 80, maintainCost: 20, storageDiff: "中", resaleValue: 50 },
  { id: 4, name: "行李箱", icon: "🧳", buyPrice: 600, rentPrice: 30, maintainCost: 0, storageDiff: "低", resaleValue: 40 },
  { id: 5, name: "按摩椅", icon: "💆", buyPrice: 5000, rentPrice: 100, maintainCost: 100, storageDiff: "高", resaleValue: 30 },
  { id: 6, name: "烘干机", icon: "🌀", buyPrice: 1500, rentPrice: 60, maintainCost: 30, storageDiff: "中", resaleValue: 45 },
  { id: 7, name: "相机", icon: "📷", buyPrice: 6000, rentPrice: 150, maintainCost: 100, storageDiff: "低", resaleValue: 65 },
  { id: 8, name: "无人机", icon: "🚁", buyPrice: 4000, rentPrice: 200, maintainCost: 80, storageDiff: "低", resaleValue: 55 },
  { id: 9, name: "露营全套", icon: "🏕️", buyPrice: 2000, rentPrice: 150, maintainCost: 50, storageDiff: "高", resaleValue: 45 },
  { id: 10, name: "Switch游戏机", icon: "🎮", buyPrice: 2000, rentPrice: 80, maintainCost: 0, storageDiff: "低", resaleValue: 70 },
  { id: 11, name: "吉他", icon: "🎸", buyPrice: 1500, rentPrice: 50, maintainCost: 30, storageDiff: "中", resaleValue: 55 },
  { id: 12, name: "西装/礼服", icon: "👔", buyPrice: 2000, rentPrice: 100, maintainCost: 50, storageDiff: "低", resaleValue: 20 },
];

const dailyQuotes = [
  "漂泊不是过渡，而是一种生活方式。",
  "房子是租来的，但生活不是。",
  "一个人也要好好吃饭，好好睡觉。",
  "攒钱是为了有一天能停下来，不是为了永远奔波。",
  "出租屋里的每一盏灯，都是你为自己点亮的。",
];
