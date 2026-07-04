import { useState } from 'react'
import { useStore } from '../state/store'
import { Sheet } from '../components/Sheet'
import { IconPicker, ColorPicker, CATEGORY_ICONS } from '../components/Pickers'
import type { Category, TxType } from '../types'

export function CategoriesScreen({ onBack }: { onBack: () => void }) {
  const store = useStore()
  const [tab, setTab] = useState<TxType>('expense')
  const [editing, setEditing] = useState<Category | 'new' | null>(null)

  const list = store.categories.filter((c) => c.type === tab)

  return (
    <div className="screen-pad pt-12 pb-10">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-2xl text-brand-500" aria-label="Quay lại">‹</button>
        <h1 className="text-2xl font-extrabold">Danh mục</h1>
      </div>

      <div className="grid grid-cols-2 gap-2 bg-brand-50 p-1 rounded-2xl mb-4">
        <button
          onClick={() => setTab('expense')}
          className={`py-2.5 rounded-xl font-semibold transition-colors ${tab === 'expense' ? 'bg-pinkish-500 text-white shadow-soft' : 'text-muted'}`}
        >
          Chi tiêu
        </button>
        <button
          onClick={() => setTab('income')}
          className={`py-2.5 rounded-xl font-semibold transition-colors ${tab === 'income' ? 'bg-green-500 text-white shadow-soft' : 'text-muted'}`}
        >
          Thu nhập
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {list.map((c) => (
          <button
            key={c.id}
            onClick={() => setEditing(c)}
            className="card p-3 flex flex-col items-center gap-2 active:scale-95 transition-transform"
          >
            <span className="h-12 w-12 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: c.color + '22' }}>
              {c.icon}
            </span>
            <span className="text-xs font-medium text-center leading-tight">{c.name}</span>
          </button>
        ))}
        <button
          onClick={() => setEditing('new')}
          className="rounded-3xl p-3 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-brand-200 text-brand-400 min-h-[104px]"
        >
          <span className="text-2xl">＋</span>
          <span className="text-xs font-medium">Thêm</span>
        </button>
      </div>

      {editing && (
        <CategoryEditor
          category={editing === 'new' ? null : editing}
          type={tab}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

function CategoryEditor({ category, type, onClose }: { category: Category | null; type: TxType; onClose: () => void }) {
  const store = useStore()
  const [name, setName] = useState(category?.name ?? '')
  const [icon, setIcon] = useState(category?.icon ?? CATEGORY_ICONS[0])
  const [color, setColor] = useState(category?.color ?? '#a855f7')
  const [error, setError] = useState('')

  const save = async () => {
    if (!name.trim()) return setError('Nhập tên danh mục')
    await store.saveCategory({ id: category?.id, name: name.trim(), icon, color, type: category?.type ?? type })
    onClose()
  }
  const remove = async () => {
    if (!category) return
    const used = store.transactions.some((t) => t.categoryId === category.id)
    if (used && !confirm('Danh mục này đang được dùng. Vẫn xoá?')) return
    await store.removeCategory(category.id)
    onClose()
  }

  return (
    <Sheet open onClose={onClose} title={category ? 'Sửa danh mục' : 'Thêm danh mục'}>
      <label className="block text-sm font-medium text-muted mb-1.5">Tên</label>
      <input className="field mb-4" value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Cà phê" />

      <label className="block text-sm font-medium text-muted mb-2">Biểu tượng</label>
      <div className="mb-4"><IconPicker icons={CATEGORY_ICONS} value={icon} onChange={setIcon} /></div>

      <label className="block text-sm font-medium text-muted mb-2">Màu</label>
      <div className="mb-5"><ColorPicker value={color} onChange={setColor} /></div>

      {error && <div className="text-pinkish-500 text-sm mb-3 text-center">{error}</div>}
      <button className="btn-primary mb-2" onClick={save}>Lưu</button>
      {category && <button className="w-full py-3 text-pinkish-500 font-medium" onClick={remove}>Xoá danh mục</button>}
    </Sheet>
  )
}
