import { useState } from 'react'

interface Product {
  id: string
  name: string
  sku: string
  cat: string
  subcat?: string
  specs: string
  badge?: string
  inStock: boolean
  colors?: string[]
}

interface ProductsPageProps {
  onNavigate: (page: string, productId?: string) => void
  onAddToCart: (product: { id: string; name: string; sku: string }) => void
}

// ── Category tree ──────────────────────────────────────────────────────────────
const categoryTree = [
  {
    id: 'afdd',
    label: 'Thiết bị bảo vệ chống hồ quang',
    short: 'AFDD',
    count: 5,
    sub: [],
  },
  {
    id: 'framia',
    label: 'Công tắc & Ổ cắm Framia',
    short: 'Framia',
    count: 30,
    sub: [
      { id: 'framia-switch', label: 'Công tắc Framia', count: 13 },
      { id: 'framia-outlet', label: 'Ổ cắm Framia', count: 10 },
    ],
  },
  {
    id: 'inora',
    label: 'Công tắc & Ổ cắm Inora',
    short: 'Inora',
    count: 19,
    sub: [
      { id: 'inora-switch', label: 'Công tắc Inora', count: 12 },
      { id: 'inora-outlet', label: 'Ổ cắm Inora', count: 7 },
    ],
  },
  {
    id: 'basice',
    label: 'Thiết bị tủ điện Basic E',
    short: 'Basic E',
    count: 7,
    sub: [],
  },
  {
    id: 'mcb',
    label: 'MCB, RCCB, RCBO dòng SH/GSH',
    short: 'MCB / RCCB',
    count: 111,
    sub: [],
  },
  {
    id: 'isolator',
    label: 'Ngắt điện phòng thấm nước – Isolator',
    short: 'Isolator',
    count: 8,
    sub: [],
  },
  {
    id: 'timer',
    label: 'Timer – Rơ le thời gian',
    short: 'Timer',
    count: 1,
    sub: [],
  },
  {
    id: 'surge',
    label: 'Chống sét lan truyền',
    short: 'SPD',
    count: 4,
    sub: [],
  },
  {
    id: 'contactor-ict',
    label: 'Contactor ICT (ESB..N)',
    short: 'Contactor ICT',
    count: 20,
    sub: [],
  },
  {
    id: 'mccb',
    label: 'MCCB – Cầu dao tự động khối',
    short: 'MCCB',
    count: 200,
    sub: [],
  },
  {
    id: 'contactor-ax',
    label: 'Khởi động từ dạng khối AX',
    short: 'Khởi động từ AX',
    count: 30,
    sub: [],
  },
  {
    id: 'thermal',
    label: 'Rờ le nhiệt cho khởi động từ',
    short: 'Rờ le nhiệt',
    count: 35,
    sub: [],
  },
  {
    id: 'acb',
    label: 'Máy cắt không khí – ACB',
    short: 'ACB',
    count: 50,
    sub: [],
  },
]

// ── Sample product list (representative, not exhaustive) ─────────────────────
const allProducts: Product[] = [
  // AFDD
  { id: 'afdd-1', name: 'AFDD 1P+N 10A DS-ARC1', sku: '2CSA275901R1104', cat: 'afdd', specs: '1P+N | 10A | 230V | B-char', badge: 'Mới', inStock: true },
  { id: 'afdd-2', name: 'AFDD 1P+N 16A DS-ARC1', sku: '2CSA275901R1164', cat: 'afdd', specs: '1P+N | 16A | 230V | B-char', inStock: true },
  { id: 'afdd-3', name: 'AFDD 1P+N 20A DS-ARC1', sku: '2CSA275901R1204', cat: 'afdd', specs: '1P+N | 20A | 230V | C-char', inStock: true },
  { id: 'afdd-4', name: 'AFDD 1P+N 25A DS-ARC1', sku: '2CSA275901R1254', cat: 'afdd', specs: '1P+N | 25A | 230V | C-char', inStock: false },
  { id: 'afdd-5', name: 'AFDD 1P+N 32A DS-ARC1', sku: '2CSA275901R1324', cat: 'afdd', specs: '1P+N | 32A | 230V | C-char', inStock: true },

  // Framia – Công tắc
  { id: 'fr-sw-1', name: 'Công tắc 1 chiều 10A Framia', sku: 'FR101', cat: 'framia', subcat: 'framia-switch', specs: '1 chiều | 10A | 250V', inStock: true, colors: ['Trắng', 'Xám', 'Vàng'] },
  { id: 'fr-sw-2', name: 'Công tắc 2 chiều 10A Framia', sku: 'FR102', cat: 'framia', subcat: 'framia-switch', specs: '2 chiều | 10A | 250V', inStock: true, colors: ['Trắng', 'Xám', 'Vàng'] },
  { id: 'fr-sw-3', name: 'Công tắc trung gian Framia', sku: 'FR103', cat: 'framia', subcat: 'framia-switch', specs: 'Trung gian | 10A | 250V', inStock: true, colors: ['Trắng', 'Xám', 'Vàng'] },
  { id: 'fr-sw-4', name: 'Công tắc có đèn LED Framia', sku: 'FR104', cat: 'framia', subcat: 'framia-switch', specs: '1 chiều + LED | 10A', badge: 'Bán chạy', inStock: true, colors: ['Trắng', 'Xám', 'Vàng'] },
  { id: 'fr-sw-5', name: 'Công tắc chuông cửa Framia', sku: 'FR105', cat: 'framia', subcat: 'framia-switch', specs: 'Chuông | 10A | 250V', inStock: true, colors: ['Trắng', 'Xám', 'Vàng'] },
  { id: 'fr-sw-6', name: 'Công tắc điều chỉnh ánh sáng Framia', sku: 'FR106', cat: 'framia', subcat: 'framia-switch', specs: 'Dimmer | 100–600W | 250V', inStock: true, colors: ['Trắng', 'Xám', 'Vàng'] },
  { id: 'fr-sw-7', name: 'Công tắc quạt điều tốc Framia', sku: 'FR107', cat: 'framia', subcat: 'framia-switch', specs: 'Điều tốc quạt | 250V', inStock: true, colors: ['Trắng', 'Xám', 'Vàng'] },
  { id: 'fr-sw-8', name: 'Công tắc cảm ứng chạm Framia', sku: 'FR108', cat: 'framia', subcat: 'framia-switch', specs: 'Cảm ứng | 10A | 250V', badge: 'Mới', inStock: true, colors: ['Trắng', 'Xám', 'Vàng'] },
  // Framia – Ổ cắm
  { id: 'fr-out-1', name: 'Ổ cắm đơn 2 chấu Framia', sku: 'FR201', cat: 'framia', subcat: 'framia-outlet', specs: '2 chấu | 16A | 250V', inStock: true, colors: ['Trắng', 'Xám', 'Vàng'] },
  { id: 'fr-out-2', name: 'Ổ cắm đơn 3 chấu Framia', sku: 'FR202', cat: 'framia', subcat: 'framia-outlet', specs: '3 chấu | 16A | 250V', badge: 'Bán chạy', inStock: true, colors: ['Trắng', 'Xám', 'Vàng'] },
  { id: 'fr-out-3', name: 'Ổ cắm đôi Framia', sku: 'FR203', cat: 'framia', subcat: 'framia-outlet', specs: '2×2 chấu | 16A | 250V', inStock: true, colors: ['Trắng', 'Xám', 'Vàng'] },
  { id: 'fr-out-4', name: 'Ổ cắm có nắp che Framia', sku: 'FR204', cat: 'framia', subcat: 'framia-outlet', specs: 'Nắp bảo vệ | 16A | IP44', inStock: true, colors: ['Trắng', 'Xám', 'Vàng'] },
  { id: 'fr-out-5', name: 'Ổ cắm USB Type-A Framia', sku: 'FR205', cat: 'framia', subcat: 'framia-outlet', specs: 'USB-A 2.4A | 250V', badge: 'Hot', inStock: true, colors: ['Trắng', 'Xám', 'Vàng'] },

  // Inora – Công tắc
  { id: 'in-sw-1', name: 'Công tắc 1 chiều 10A Inora', sku: 'INR101', cat: 'inora', subcat: 'inora-switch', specs: '1 chiều | 10A | 250V', inStock: true },
  { id: 'in-sw-2', name: 'Công tắc 2 chiều 10A Inora', sku: 'INR102', cat: 'inora', subcat: 'inora-switch', specs: '2 chiều | 10A | 250V', inStock: true },
  { id: 'in-sw-3', name: 'Công tắc có đèn LED Inora', sku: 'INR103', cat: 'inora', subcat: 'inora-switch', specs: '1 chiều + LED | 10A', badge: 'Bán chạy', inStock: true },
  { id: 'in-sw-4', name: 'Công tắc điều chỉnh ánh sáng Inora', sku: 'INR104', cat: 'inora', subcat: 'inora-switch', specs: 'Dimmer | 40–500W', inStock: true },
  { id: 'in-sw-5', name: 'Công tắc chuông cửa Inora', sku: 'INR105', cat: 'inora', subcat: 'inora-switch', specs: 'Chuông | 10A | 250V', inStock: false },
  // Inora – Ổ cắm
  { id: 'in-out-1', name: 'Ổ cắm 2 chấu Inora', sku: 'INR201', cat: 'inora', subcat: 'inora-outlet', specs: '2 chấu | 16A | 250V', inStock: true },
  { id: 'in-out-2', name: 'Ổ cắm 3 chấu Inora', sku: 'INR202', cat: 'inora', subcat: 'inora-outlet', specs: '3 chấu | 16A | 250V', badge: 'Bán chạy', inStock: true },
  { id: 'in-out-3', name: 'Ổ cắm USB Inora', sku: 'INR203', cat: 'inora', subcat: 'inora-outlet', specs: 'USB | 16A | 250V', badge: 'Mới', inStock: true },

  // Basic E
  { id: 'be-1', name: 'Tủ điện treo tường 1 cửa Basic E', sku: 'BE101', cat: 'basice', specs: 'IP40 | 250×300×120mm', inStock: true },
  { id: 'be-2', name: 'Tủ điện âm tường 12 module Basic E', sku: 'BE102', cat: 'basice', specs: '12 module | IP30 | 1 hàng', badge: 'Bán chạy', inStock: true },
  { id: 'be-3', name: 'Tủ điện âm tường 24 module Basic E', sku: 'BE103', cat: 'basice', specs: '24 module | IP30 | 2 hàng', inStock: true },
  { id: 'be-4', name: 'Tủ điện âm tường 36 module Basic E', sku: 'BE104', cat: 'basice', specs: '36 module | IP30 | 3 hàng', inStock: true },
  { id: 'be-5', name: 'Nắp che thanh dẫn Basic E', sku: 'BE105', cat: 'basice', specs: 'Phụ kiện | 1 module', inStock: true },

  // MCB / RCCB / RCBO – SH, GSH
  { id: 'mcb-1', name: 'MCB 1P 6A SH200L-C6', sku: '2CSS215101R0064', cat: 'mcb', specs: '1P | 6A | 6kA | C', badge: 'Bán chạy', inStock: true },
  { id: 'mcb-2', name: 'MCB 1P 10A SH200L-C10', sku: '2CSS215101R0104', cat: 'mcb', specs: '1P | 10A | 6kA | C', inStock: true },
  { id: 'mcb-3', name: 'MCB 1P 16A SH200L-C16', sku: '2CSS215101R0164', cat: 'mcb', specs: '1P | 16A | 6kA | C', badge: 'Bán chạy', inStock: true },
  { id: 'mcb-4', name: 'MCB 2P 20A SH200L-C20', sku: '2CSS215201R0204', cat: 'mcb', specs: '2P | 20A | 6kA | C', inStock: true },
  { id: 'mcb-5', name: 'MCB 3P 25A SH200L-C25', sku: '2CSS215301R0254', cat: 'mcb', specs: '3P | 25A | 6kA | C', inStock: true },
  { id: 'mcb-6', name: 'MCB 1P 32A GSH201-C32', sku: '2CDS211001R0324', cat: 'mcb', specs: '1P | 32A | 10kA | C', badge: 'Hot', inStock: true },
  { id: 'mcb-7', name: 'RCCB 2P 25A 30mA F202', sku: '2CSF202001R1250', cat: 'mcb', specs: '2P | 25A | 30mA | AC', inStock: true },
  { id: 'mcb-8', name: 'RCCB 4P 40A 30mA F204', sku: '2CSF204001R1400', cat: 'mcb', specs: '4P | 40A | 30mA | AC', badge: 'Bán chạy', inStock: true },
  { id: 'mcb-9', name: 'RCBO 1P+N 16A 30mA DS201', sku: '2CSR245040R1164', cat: 'mcb', specs: '1P+N | 16A | 30mA | C', inStock: true },
  { id: 'mcb-10', name: 'RCBO 1P+N 25A 30mA DS201', sku: '2CSR245040R1254', cat: 'mcb', specs: '1P+N | 25A | 30mA | C', inStock: true },

  // Isolator
  { id: 'iso-1', name: 'Isolator 1P 16A OT16F3', sku: 'OT16F3', cat: 'isolator', specs: '1P | 16A | IP65 | 250V', inStock: true },
  { id: 'iso-2', name: 'Isolator 2P 25A OT25F3', sku: 'OT25F3', cat: 'isolator', specs: '2P | 25A | IP65 | 250V', badge: 'Bán chạy', inStock: true },
  { id: 'iso-3', name: 'Isolator 4P 40A OT40F3', sku: 'OT40F3', cat: 'isolator', specs: '4P | 40A | IP65 | 415V', inStock: true },
  { id: 'iso-4', name: 'Isolator 4P 63A OT63F3', sku: 'OT63F3', cat: 'isolator', specs: '4P | 63A | IP65 | 415V', inStock: true },

  // Timer
  { id: 'timer-1', name: 'Timer kỹ thuật số AT2E-16QA', sku: 'AT2E-16QA', cat: 'timer', specs: '12-240V AC/DC | 0.1s–100h | DIN', badge: 'Mới', inStock: true },

  // Chống sét
  { id: 'spd-1', name: 'SPD 1P 25kA OVR T2 1L', sku: '2CTB803811R3600', cat: 'surge', specs: '1P | Uc 275V | Iimp 25kA | T2', inStock: true },
  { id: 'spd-2', name: 'SPD 3P+N 40kA OVR T1', sku: '2CTB803821R3600', cat: 'surge', specs: '3P+N | Uc 385V | T1', badge: 'Hot', inStock: true },
  { id: 'spd-3', name: 'SPD 1P+N 10kA OVR T3', sku: '2CTB803831R3600', cat: 'surge', specs: '1P+N | Uc 275V | T3', inStock: true },
  { id: 'spd-4', name: 'SPD 3P 20kA OVR T2-3L', sku: '2CTB803841R3600', cat: 'surge', specs: '3P | Uc 385V | 20kA | T2', inStock: true },

  // Contactor ICT
  { id: 'ict-1', name: 'Contactor ESB20-20N-06 20A', sku: 'GHE3211302R0006', cat: 'contactor-ict', specs: '20A | 2NO | 230VAC | 2P', badge: 'Bán chạy', inStock: true },
  { id: 'ict-2', name: 'Contactor ESB25-22N-06 25A', sku: 'GHE3211302R0206', cat: 'contactor-ict', specs: '25A | 2NO+2NC | 230VAC', inStock: true },
  { id: 'ict-3', name: 'Contactor ESB40-40N-06 40A', sku: 'GHE3211302R0406', cat: 'contactor-ict', specs: '40A | 4NO | 230VAC | 4P', inStock: true },
  { id: 'ict-4', name: 'Contactor ESB63-40N-06 63A', sku: 'GHE3211302R0606', cat: 'contactor-ict', specs: '63A | 4NO | 230VAC | 4P', badge: 'Hot', inStock: true },

  // MCCB
  { id: 'mccb-1', name: 'MCCB 3P 16A T1B 16', sku: '1SDA066820R1', cat: 'mccb', specs: '3P | 16A | 18kA @ 415V', inStock: true },
  { id: 'mccb-2', name: 'MCCB 3P 63A T1N 63', sku: '1SDA051338R1', cat: 'mccb', specs: '3P | 63A | 36kA @ 415V', badge: 'Bán chạy', inStock: true },
  { id: 'mccb-3', name: 'MCCB 3P 100A T2N 100', sku: '1SDA051006R1', cat: 'mccb', specs: '3P | 100A | 36kA @ 415V', inStock: true },
  { id: 'mccb-4', name: 'MCCB 3P 160A T3N 160', sku: '1SDA051517R1', cat: 'mccb', specs: '3P | 160A | 50kA @ 415V', badge: 'Hot', inStock: true },
  { id: 'mccb-5', name: 'MCCB 4P 250A T4N 250', sku: '1SDA054104R1', cat: 'mccb', specs: '4P | 250A | 36kA @ 415V', inStock: true },
  { id: 'mccb-6', name: 'MCCB 4P 400A T5N 400', sku: '1SDA054388R1', cat: 'mccb', specs: '4P | 400A | 36kA @ 415V', inStock: true },
  { id: 'mccb-7', name: 'MCCB 3P 630A T6N 630', sku: '1SDA060260R1', cat: 'mccb', specs: '3P | 630A | 36kA @ 415V', inStock: false },

  // Khởi động từ AX
  { id: 'ax-1', name: 'Khởi động từ AX09-30-10 9A', sku: '1SBL901074R8210', cat: 'contactor-ax', specs: '9A | 3NO | 230VAC coil', badge: 'Bán chạy', inStock: true },
  { id: 'ax-2', name: 'Khởi động từ AX12-30-10 12A', sku: '1SBL141001R8210', cat: 'contactor-ax', specs: '12A | 3NO | 230VAC coil', inStock: true },
  { id: 'ax-3', name: 'Khởi động từ AX25-30-10 25A', sku: '1SBL251001R8210', cat: 'contactor-ax', specs: '25A | 3NO | 230VAC coil', badge: 'Hot', inStock: true },
  { id: 'ax-4', name: 'Khởi động từ AX40-30-10 40A', sku: '1SBL341001R8210', cat: 'contactor-ax', specs: '40A | 3NO | 230VAC coil', inStock: true },
  { id: 'ax-5', name: 'Khởi động từ AX50-30-00 50A', sku: '1SBL351001R8000', cat: 'contactor-ax', specs: '50A | 3NO | 230VAC coil', inStock: true },
  { id: 'ax-6', name: 'Khởi động từ AX65-30-00 65A', sku: '1SBL371001R8000', cat: 'contactor-ax', specs: '65A | 3NO | 230VAC coil', inStock: true },
  { id: 'ax-7', name: 'Khởi động từ AX80-30-00 80A', sku: '1SBL381001R8000', cat: 'contactor-ax', specs: '80A | 3NO | 230VAC coil', inStock: false },

  // Rờ le nhiệt
  { id: 'th-1', name: 'Rờ le nhiệt TA25DU-0.1 0.07–0.1A', sku: '1SAZ211201R1001', cat: 'thermal', specs: '0.07–0.1A | cho AX9–AX25', inStock: true },
  { id: 'th-2', name: 'Rờ le nhiệt TA25DU-4 2.8–4A', sku: '1SAZ211201R1040', cat: 'thermal', specs: '2.8–4A | cho AX9–AX25', badge: 'Bán chạy', inStock: true },
  { id: 'th-3', name: 'Rờ le nhiệt TA25DU-11 7.5–11A', sku: '1SAZ211201R1110', cat: 'thermal', specs: '7.5–11A | cho AX9–AX25', badge: 'Bán chạy', inStock: true },
  { id: 'th-4', name: 'Rờ le nhiệt TA75DU-25 18–25A', sku: '1SAZ311201R1025', cat: 'thermal', specs: '18–25A | cho AX40–AX65', inStock: true },
  { id: 'th-5', name: 'Rờ le nhiệt TA75DU-52 37–52A', sku: '1SAZ311201R1052', cat: 'thermal', specs: '37–52A | cho AX50–AX65', inStock: true },

  // ACB
  { id: 'acb-1', name: 'ACB 3P 800A Emax2 E1.2N', sku: '1SDA070753R1', cat: 'acb', specs: '3P | 800A | 66kA | Fixed', badge: 'Mới', inStock: true },
  { id: 'acb-2', name: 'ACB 4P 1000A Emax2 E1.2N', sku: '1SDA070763R1', cat: 'acb', specs: '4P | 1000A | 66kA | Fixed', inStock: true },
  { id: 'acb-3', name: 'ACB 3P 1600A Emax2 E2.2N', sku: '1SDA070795R1', cat: 'acb', specs: '3P | 1600A | 65kA | Withdrawable', badge: 'Hot', inStock: true },
  { id: 'acb-4', name: 'ACB 4P 2000A Emax2 E3.2N', sku: '1SDA070860R1', cat: 'acb', specs: '4P | 2000A | 65kA | Fixed', inStock: false },
  { id: 'acb-5', name: 'ACB 3P 3200A Emax2 E4.2N', sku: '1SDA070916R1', cat: 'acb', specs: '3P | 3200A | 65kA | Fixed', inStock: true },
]

const colorDot: Record<string, string> = {
  'Trắng': '#f3f4f6',
  'Xám': '#9ca3af',
  'Vàng': '#eab308',
}

const font = "'Roboto Condensed', 'Roboto', sans-serif"

export default function ProductsPage({ onNavigate, onAddToCart }: ProductsPageProps) {
  const [selectedCat, setSelectedCat] = useState('all')
  const [selectedSubcat, setSelectedSubcat] = useState('all')
  const [expandedCats, setExpandedCats] = useState<string[]>(['mcb', 'mccb'])
  const [search, setSearch] = useState('')
  const [stockOnly, setStockOnly] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const toggleExpand = (id: string) => {
    setExpandedCats((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id])
  }

  const handleCatSelect = (catId: string) => {
    setSelectedCat(catId)
    setSelectedSubcat('all')
  }

  const filtered = allProducts.filter((p) => {
    const matchCat = selectedCat === 'all' || p.cat === selectedCat
    const matchSubcat = selectedSubcat === 'all' || p.subcat === selectedSubcat
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
    const matchStock = !stockOnly || p.inStock
    return matchCat && matchSubcat && matchSearch && matchStock
  })

  const selectedCatData = categoryTree.find((c) => c.id === selectedCat)
  const totalProducts = selectedCat === 'all'
    ? categoryTree.reduce((s, c) => s + c.count, 0)
    : (selectedCatData?.count ?? filtered.length)

  return (
    <div className="bg-white min-h-screen">
      {/* Page header */}
      <div style={{ background: 'linear-gradient(135deg, #003d7a 0%, #0055A4 100%)' }} className="py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <nav className="text-sm text-blue-200 mb-3 flex items-center gap-2">
            <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">Trang chủ</button>
            <span>›</span>
            <span className="text-white font-medium">Sản phẩm ABB</span>
          </nav>
          <h1 style={{ fontFamily: font, fontWeight: 700, fontSize: '2.4rem', color: 'white', lineHeight: 1.1 }}>
            Danh mục sản phẩm ABB
          </h1>
          <p className="text-blue-200 mt-1 text-sm">
            {categoryTree.length} danh mục · {categoryTree.reduce((s, c) => s + c.count, 0)}+ sản phẩm chính hãng
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">

        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl p-4 sticky top-20" style={{ border: '1px solid #c8daf4' }}>

            {/* Search */}
            <div className="relative mb-4">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tên / Mã sản phẩm..."
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
              />
            </div>

            {/* In stock toggle */}
            <label className="flex items-center gap-2 mb-4 cursor-pointer">
              <input type="checkbox" checked={stockOnly} onChange={(e) => setStockOnly(e.target.checked)} className="w-4 h-4 accent-blue-600 rounded" />
              <span className="text-xs font-semibold text-gray-600">Chỉ hàng có sẵn</span>
            </label>

            <div className="border-t border-gray-100 pt-3">
              {/* All categories */}
              <button
                onClick={() => { handleCatSelect('all'); setExpandedCats([]) }}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-bold transition-all mb-1 flex items-center justify-between"
                style={{
                  backgroundColor: selectedCat === 'all' ? '#0055A4' : 'transparent',
                  color: selectedCat === 'all' ? 'white' : 'var(--navy)',
                }}
              >
                <span>Tất cả danh mục</span>
                <span className="text-[10px] font-normal opacity-70">{categoryTree.reduce((s, c) => s + c.count, 0)}+</span>
              </button>

              {/* Category list */}
              {categoryTree.map((cat) => (
                <div key={cat.id}>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { handleCatSelect(cat.id); if (cat.sub.length) toggleExpand(cat.id) }}
                      className="flex-1 text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between"
                      style={{
                        backgroundColor: selectedCat === cat.id ? 'rgba(0,85,164,0.12)' : 'transparent',
                        color: selectedCat === cat.id ? 'var(--navy)' : '#374151',
                      }}
                    >
                      <span className="leading-snug">{cat.label}</span>
                      <span className="text-[10px] font-normal text-gray-400 ml-1 flex-shrink-0">{cat.count}</span>
                    </button>
                    {cat.sub.length > 0 && (
                      <button onClick={() => toggleExpand(cat.id)} className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          {expandedCats.includes(cat.id)
                            ? <path d="M7 14l5-5 5 5z"/>
                            : <path d="M7 10l5 5 5-5z"/>}
                        </svg>
                      </button>
                    )}
                  </div>
                  {/* Subcategories */}
                  {cat.sub.length > 0 && expandedCats.includes(cat.id) && (
                    <div className="ml-3 border-l border-blue-100 pl-2 mb-1 space-y-0.5">
                      {cat.sub.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => { setSelectedCat(cat.id); setSelectedSubcat(sub.id) }}
                          className="w-full text-left px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all flex items-center justify-between"
                          style={{
                            backgroundColor: selectedSubcat === sub.id ? 'rgba(227,6,19,0.08)' : 'transparent',
                            color: selectedSubcat === sub.id ? 'var(--red)' : '#6b7280',
                          }}
                        >
                          <span>{sub.label}</span>
                          <span className="text-[10px] text-gray-400">{sub.count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Product area ─────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <h2 style={{ fontFamily: font, fontWeight: 700, fontSize: '1.25rem', color: 'var(--navy)' }}>
                {selectedCat === 'all' ? 'Tất cả sản phẩm' : selectedCatData?.label ?? ''}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Hiển thị {filtered.length} / {totalProducts} sản phẩm
              </p>
            </div>
            <div className="flex items-center gap-2">
              {[
                { m: 'grid' as const, icon: <path d="M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z"/> },
                { m: 'list' as const, icon: <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/> },
              ].map(({ m, icon }) => (
                <button key={m} onClick={() => setViewMode(m)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ backgroundColor: viewMode === m ? 'var(--navy)' : '#f0f5fb', color: viewMode === m ? 'white' : '#6b7280' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">{icon}</svg>
                </button>
              ))}
            </div>
          </div>

          {/* Color filter for Framia / Inora */}
          {(selectedCat === 'framia' || selectedCat === 'inora') && (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-xl" style={{ backgroundColor: '#f0f5fb' }}>
              <span className="text-xs font-semibold text-gray-600">Màu sắc:</span>
              {['Trắng', 'Xám', 'Vàng'].map((c) => (
                <button key={c} className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium border-gray-300 bg-white hover:border-blue-400 transition-colors">
                  <span className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: colorDot[c] }} />
                  {c}
                </button>
              ))}
            </div>
          )}

          {/* Grid view */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 group"
                  style={{ border: '1px solid #c8daf4' }}
                >
                  <div className="relative aspect-square bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-6">
                    {p.badge && (
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 text-[10px] font-bold text-white rounded-full"
                        style={{ backgroundColor: p.badge === 'Mới' ? '#2563eb' : p.badge === 'Hot' ? '#ea580c' : 'var(--red)' }}>
                        {p.badge}
                      </span>
                    )}
                    {!p.inStock && (
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-bold text-white rounded-full bg-gray-400">
                        Hết hàng
                      </span>
                    )}
                    {/* Color swatches for Framia/Inora */}
                    {p.colors && (
                      <div className="absolute bottom-2 right-2 flex gap-1">
                        {p.colors.map((c) => (
                          <span key={c} className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: colorDot[c] }} />
                        ))}
                      </div>
                    )}
                    <svg width="52" height="52" viewBox="0 0 64 64" fill="none" className="opacity-15 group-hover:opacity-25 transition-opacity">
                      <rect x="8" y="12" width="48" height="40" rx="4" stroke="#0055A4" strokeWidth="2.5"/>
                      <rect x="14" y="18" width="10" height="10" rx="2" fill="#FF000F"/>
                      <rect x="27" y="18" width="10" height="10" rx="2" fill="#FF000F"/>
                      <rect x="40" y="18" width="10" height="10" rx="2" fill="#FF000F"/>
                      <rect x="14" y="32" width="36" height="3" rx="1" fill="#0055A4"/>
                      <rect x="14" y="38" width="26" height="3" rx="1" fill="#0055A4"/>
                    </svg>
                  </div>
                  <div className="p-3">
                    <p className="text-[9px] text-blue-500 font-bold uppercase tracking-wider mb-0.5">
                      {categoryTree.find((c) => c.id === p.cat)?.short ?? p.cat}
                    </p>
                    <h4 className="text-[12px] font-bold text-gray-900 leading-tight mb-1">{p.name}</h4>
                    <p className="text-[9px] text-gray-400 mb-1 font-mono">{p.sku}</p>
                    <p className="text-[10px] text-gray-500 mb-3">{p.specs}</p>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => onNavigate('productDetail', p.id)}
                        className="flex-1 py-1.5 text-[11px] font-semibold border rounded-lg transition-colors hover:bg-blue-50"
                        style={{ borderColor: 'var(--navy)', color: 'var(--navy)' }}
                      >Chi tiết</button>
                      <button
                        onClick={() => p.inStock && onAddToCart({ id: p.id, name: p.name, sku: p.sku })}
                        disabled={!p.inStock}
                        className="flex-1 py-1.5 text-[11px] font-bold text-white rounded-lg transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ backgroundColor: p.inStock ? 'var(--red)' : '#9ca3af' }}
                      >{p.inStock ? '+ Giỏ' : 'Hết'}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List view */}
          {viewMode === 'list' && (
            <div className="space-y-2">
              {filtered.map((p) => (
                <div key={p.id}
                  className="bg-white rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-all"
                  style={{ border: '1px solid #c8daf4' }}
                >
                  <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg width="28" height="28" viewBox="0 0 64 64" fill="none" className="opacity-20">
                      <rect x="8" y="12" width="48" height="40" rx="4" stroke="#0055A4" strokeWidth="2.5"/>
                      <rect x="14" y="18" width="10" height="10" rx="2" fill="#FF000F"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wide">
                        {categoryTree.find((c) => c.id === p.cat)?.short ?? p.cat}
                      </p>
                      {p.badge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold text-white rounded-full"
                          style={{ backgroundColor: p.badge === 'Mới' ? '#2563eb' : 'var(--red)' }}>
                          {p.badge}
                        </span>
                      )}
                      {p.colors && (
                        <div className="flex gap-1 ml-1">
                          {p.colors.map((c) => (
                            <span key={c} className="w-2.5 h-2.5 rounded-full border border-gray-300" style={{ backgroundColor: colorDot[c] }} />
                          ))}
                        </div>
                      )}
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm">{p.name}</h4>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <p className="text-[10px] font-mono text-gray-400">{p.sku}</p>
                      <p className="text-[10px] text-gray-500">{p.specs}</p>
                      <span className={`text-[10px] font-semibold ${p.inStock ? 'text-green-600' : 'text-gray-400'}`}>
                        {p.inStock ? '● Có hàng' : '○ Hết hàng'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => onNavigate('productDetail', p.id)}
                      className="px-3 py-2 text-xs font-semibold border rounded-lg hover:bg-blue-50 transition-colors"
                      style={{ borderColor: 'var(--navy)', color: 'var(--navy)' }}>Chi tiết</button>
                    <button
                      onClick={() => p.inStock && onAddToCart({ id: p.id, name: p.name, sku: p.sku })}
                      disabled={!p.inStock}
                      className="px-4 py-2 text-xs font-bold text-white rounded-lg transition-all hover:opacity-90 disabled:opacity-40"
                      style={{ backgroundColor: p.inStock ? 'var(--red)' : '#9ca3af' }}>
                      + Thêm vào giỏ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="mx-auto mb-3 opacity-30">
                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              <p className="text-sm">Không tìm thấy sản phẩm phù hợp.</p>
              <button onClick={() => { setSelectedCat('all'); setSearch('') }} className="mt-2 text-sm text-blue-600 underline">Xóa bộ lọc</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
