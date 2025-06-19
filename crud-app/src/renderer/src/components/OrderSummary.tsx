import React from 'react'
import { Item } from '../../../types/item'
import SummaryItem from './SummaryItem'
import PaymentSummary from './PaymentSummary'

type CustomerSection = 'Ordering' | 'Summary' | 'Payment' | 'Favorite' | 'History'

export default function OrderSummary({
  cartMap,
  onIncrease,
  onDecrease,
  onRemove,
  onChangeSection
}: {
  cartMap: Map<string, {item: Item, amount: number}>
  onIncrease: (id: string) => void
  onDecrease: (id: string) => void
  onRemove: (id: string) => void
  onChangeSection: (section: CustomerSection) => void
}): React.JSX.Element {
  return (
    <>
      <div className="flex flex-col p-6 gap-4 w-395">
        <h3 className="mb-2 font-bold">Order Summary</h3>
        {Array.from(cartMap.values()).map((cart, idx) => (
            <SummaryItem
              key={cart.item.id || idx}
              cart={cart}
              onIncrease={onIncrease}
              onDecrease={onDecrease}
              onRemove={onRemove}
            />

        ))}
    </div>
      <PaymentSummary onChangeSection={onChangeSection} cartMap={cartMap}/>
    </>
  )
}