import { useState } from 'react'

interface MapPageProps {
  onNavigate: (page: string) => void
}

const provinces = [
  'Tất cả', 'TP. Hồ Chí Minh', 'Hà Nội', 'Bình Dương', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Đồng Nai'
]

const locations = [
  {
    id: 1,
    name: 'CÔNG TY TNHH THIẾT BỊ ĐIỆN VIỄN ĐÔNG',
    type: 'Văn phòng đại diện',
    province: 'TP. Hồ Chí Minh',
    address: '187A Bến Vân Đồn, Phường 02, Quận 4, TP. Hồ Chí Minh',
    phone: '(028) 39435276',
    email: 'info@viendongelectric.vn',
    hours: 'Thứ 2–6: 8:00–17:30 | Thứ 7: 8:00–12:00',
    lat: 10.7769,
    lng: 106.6680,
    isHQ: true,
  },
  {
    id: 2,
    name: 'Viễn Đông Electric — Chi nhánh Bình Dương',
    type: 'Chi nhánh',
    province: 'Bình Dương',
    address: '34 Nguyễn Hữu Cảnh, P. Phú Thọ, TP. Thủ Dầu Một, Tỉnh Bình Dương',
    phone: '(028) 39435276 (Nhánh 2)',
    email: 'binhduong@viendongelectric.vn',
    hours: 'Thứ 2–6: 8:00–17:30',
    lat: 10.9804,
    lng: 106.6519,
    isHQ: false,
  },
  {
    id: 3,
    name: 'Viễn Đông Electric — Chi nhánh Cần Thơ',
    type: 'Chi nhánh',
    province: 'Cần Thơ',
    address: '81 Đường Phan Huy Chú, KVDCC Hưng Phú 1, P. Hưng Phú, Q. Cái Răng, TP. Cần Thơ',
    phone: '(028) 39435276 (Nhánh 3)',
    email: 'cantho@viendongelectric.vn',
    hours: 'Thứ 2–6: 8:00–17:30',
    lat: 10.0452,
    lng: 105.7469,
    isHQ: false,
  },
  {
    id: 4,
    name: 'Viễn Đông Electric — Chi nhánh Đà Nẵng',
    type: 'Chi nhánh',
    province: 'Đà Nẵng',
    address: '105 Đường Nguyễn Tất Thành, P. Hòa Cường Nam, Q. Hải Châu, TP. Đà Nẵng',
    phone: '(028) 39435276 (Nhánh 4)',
    email: 'danang@viendongelectric.vn',
    hours: 'Thứ 2–6: 8:00–17:30',
    lat: 16.0544,
    lng: 108.2022,
    isHQ: false,
  },
  {
    id: 5,
    name: 'Viễn Đông Electric — Chi nhánh Hà Nội',
    type: 'Chi nhánh',
    province: 'Hà Nội',
    address: '48 Phố Minh Khai, Phường Minh Khai, Quận Hai Bà Trưng, Hà Nội',
    phone: '(028) 39435276 (Nhánh 5)',
    email: 'hanoi@viendongelectric.vn',
    hours: 'Thứ 2–6: 8:00–17:30',
    lat: 21.0285,
    lng: 105.8542,
    isHQ: false,
  },
  {
    id: 6,
    name: 'Đại lý Điện Minh Phát',
    type: 'Đại lý cấp 2',
    province: 'Đồng Nai',
    address: '12 Đường 30/4, Phường Thanh Bình, TP. Biên Hòa, Đồng Nai',
    phone: '0251 378 9012',
    email: 'minhphat@gmail.com',
    hours: 'Thứ 2–7: 7:30–18:00',
    lat: 10.9574,
    lng: 106.8426,
    isHQ: false,
  },
  {
    id: 7,
    name: 'Đại lý Thiết bị điện Phú Gia',
    type: 'Đại lý cấp 2',
    province: 'TP. Hồ Chí Minh',
    address: '234 Đường Âu Cơ, Phường 9, Quận Tân Bình, TP. Hồ Chí Minh',
    phone: '028 3812 4567',
    email: 'phugia.electric@gmail.com',
    hours: 'Thứ 2–7: 7:00–18:30',
    lat: 10.7989,
    lng: 106.6486,
    isHQ: false,
  },
]

const stats = [
  { value: '50+', label: 'Cửa hàng', icon: '🏪' },
  { value: '30+', label: 'Tỉnh thành', icon: '📍' },
  { value: '3', label: 'Văn phòng đại diện', icon: '🏢' },
  { value: '500+', label: 'Nhân sự', icon: '👥' },
]

const typeColors: Record<string, { bg: string; text: string }> = {
  'Văn phòng đại diện': { bg: 'rgba(227,6,19,0.1)', text: 'var(--red)' },
  'Chi nhánh': { bg: 'rgba(27,42,74,0.1)', text: 'var(--navy)' },
  'Đại lý cấp 2': { bg: 'rgba(22,163,74,0.1)', text: '#15803d' },
}

export default function MapPage({ onNavigate }: MapPageProps) {
  const [selectedProvince, setSelectedProvince] = useState('Tất cả')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(1)
  const [selectedType, setSelectedType] = useState('Tất cả')

  const types = ['Tất cả', 'Văn phòng đại diện', 'Chi nhánh', 'Đại lý cấp 2']

  const filtered = locations.filter((l) => {
    const matchProvince = selectedProvince === 'Tất cả' || l.province === selectedProvince
    const matchSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.address.toLowerCase().includes(search.toLowerCase())
    const matchType = selectedType === 'Tất cả' || l.type === selectedType
    return matchProvince && matchSearch && matchType
  })

  const selected = locations.find((l) => l.id === selectedId)

  return (
    <div>
      {/* Hero */}
      <div
        className="relative"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=1600&h=400&fit=crop&auto=format')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '240px',
        }}
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,61,122,0.93) 0%, rgba(0,85,164,0.78) 55%, rgba(30,116,212,0.5) 100%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 py-14 text-white">
          <nav className="text-sm text-gray-300 mb-3 flex items-center gap-2">
            <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">Trang chủ</button>
            <span>›</span>
            <span>Hệ thống phân phối</span>
          </nav>
          <h1 className="text-5xl font-bold mb-2" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Hệ thống phân phối
          </h1>
          <p className="text-gray-300 text-lg max-w-xl">
            Mạng lưới cửa hàng, chi nhánh và đại lý Viễn Đông trên toàn quốc. Tìm điểm phân phối gần bạn nhất.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl mb-0.5">{s.icon}</div>
              <div className="text-2xl font-black" style={{ fontFamily: 'Barlow Condensed, sans-serif', color: 'var(--red)' }}>{s.value}</div>
              <div className="text-xs text-gray-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm cửa hàng, địa chỉ..."
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-red-400"
            />
          </div>
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-red-400 bg-white"
          >
            {provinces.map((p) => <option key={p}>{p}</option>)}
          </select>
          <div className="flex gap-1.5 flex-wrap">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className="px-3 py-2 text-xs font-semibold rounded-lg border transition-all"
                style={{
                  borderColor: selectedType === t ? 'var(--red)' : '#d1d5db',
                  backgroundColor: selectedType === t ? 'rgba(227,6,19,0.08)' : 'white',
                  color: selectedType === t ? 'var(--red)' : '#374151',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Location list */}
          <div className="lg:col-span-1 space-y-3 max-h-[680px] overflow-y-auto pr-1">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">
              {filtered.length} điểm phân phối
            </p>
            {filtered.map((loc) => {
              const tc = typeColors[loc.type] || typeColors['Chi nhánh']
              return (
                <button
                  key={loc.id}
                  onClick={() => setSelectedId(loc.id)}
                  className="w-full text-left bg-white border rounded-lg p-4 transition-all hover:shadow-md"
                  style={{
                    borderColor: selectedId === loc.id ? 'var(--red)' : '#e5e7eb',
                    borderWidth: selectedId === loc.id ? '2px' : '1px',
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 text-sm leading-tight">{loc.name}</h4>
                    {loc.isHQ && (
                      <span className="flex-shrink-0 px-1.5 py-0.5 text-[9px] font-bold text-white rounded" style={{ backgroundColor: 'var(--red)' }}>
                        HQ
                      </span>
                    )}
                  </div>
                  <span
                    className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold mb-2"
                    style={{ backgroundColor: tc.bg, color: tc.text }}
                  >
                    {loc.type}
                  </span>
                  <p className="text-xs text-gray-500 leading-relaxed">{loc.address}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                    {loc.phone}
                  </div>
                </button>
              )
            })}

            {filtered.length === 0 && (
              <div className="text-center py-10 text-gray-400 text-sm">
                Không tìm thấy kết quả.
              </div>
            )}
          </div>

          {/* Map + detail */}
          <div className="lg:col-span-2 space-y-4">
            {/* Map embed */}
            <div className="relative rounded-lg overflow-hidden border border-gray-200" style={{ height: '420px' }}>
              <iframe
                title="Viễn Đông Electric - Hệ thống phân phối"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                src={
                  selected
                    ? `https://www.google.com/maps?q=${encodeURIComponent(selected.address)}&output=embed`
                    : `https://www.google.com/maps?q=Vi%E1%BB%85n+%C4%90%C3%B4ng+Electric+Vi%E1%BB%87t+Nam&output=embed`
                }
                allowFullScreen
              />
              {/* Map pins overlay visual (decorative) */}
              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur shadow rounded-lg p-2 border border-gray-200 text-xs space-y-1.5">
                {Object.entries(typeColors).map(([type, colors]) => (
                  <div key={type} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.text }} />
                    <span className="text-gray-600">{type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected location detail */}
            {selected && (
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="px-2 py-0.5 rounded text-[11px] font-semibold"
                        style={{ backgroundColor: typeColors[selected.type]?.bg, color: typeColors[selected.type]?.text }}
                      >
                        {selected.type}
                      </span>
                      {selected.isHQ && (
                        <span className="px-2 py-0.5 text-[11px] font-bold text-white rounded" style={{ backgroundColor: 'var(--red)' }}>
                          Hội sở chính
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '1.15rem' }}>
                      {selected.name}
                    </h3>
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selected.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white rounded transition-all hover:opacity-90"
                    style={{ backgroundColor: 'var(--red)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    Chỉ đường
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2 text-gray-600">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mt-0.5 flex-shrink-0 text-gray-400"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    <span>{selected.address}</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                      {selected.phone}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                      {selected.email}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>
                      {selected.hours}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Become a distributor CTA */}
        <div
          className="mt-10 rounded-lg p-8 flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ background: 'linear-gradient(135deg, #003d7a 0%, #0055A4 60%, #1e74d4 100%)' }}
        >
          <div className="text-white">
            <h3 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Trở thành đại lý phân phối Viễn Đông
            </h3>
            <p className="text-gray-300 text-sm">
              Mở rộng mạng lưới phân phối thiết bị điện ABB chính hãng tại khu vực của bạn.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <button
              className="px-6 py-3 text-sm font-bold text-white rounded transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--red)' }}
            >
              Đăng ký ngay
            </button>
            <a
              href="tel:02839435276"
              className="px-6 py-3 text-sm font-semibold text-white rounded border border-white/30 hover:bg-white/10 transition-all"
            >
              Gọi (028) 39435276
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
